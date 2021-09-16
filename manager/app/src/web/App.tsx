import React, { useEffect, useMemo, useState } from 'react';
import { AttendeeState, CognitoClient, DrawingData, FlectChimeClient, GameState, HMMStatus, RealtimeData, RestApiClient, useAmongUsServer, useRecorder, VideoTileState, WebSocketWhiteboardClient } from '@dannadori/flect-amazon-chime-lib'
import { ipcRenderer } from 'electron'

import './App.scss';
import { useWindowSizeChangeListener } from './hooks/useWindowSizeChange';
import { Recorder } from './Recorder';

const { myAPI } = window;

const createScreenCaptureDisplayMediaConstraints = (sourceId: string, frameRate: number): MediaStreamConstraints => {
    return {
        audio: false,
        video: {
            ...(!sourceId && {
                frameRate: {
                    max: frameRate,
                },
            }),
            ...(sourceId && {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: sourceId,
                    maxFrameRate: frameRate,
                },
            }),
        },
    };
}

export const App = (): JSX.Element => {
    const [ windowId, setWindowId] = useState<string|null>(null)
    const [ chimeClient, setChimeClient] = useState<FlectChimeClient|null>(null)

    const [ lastUpdateTime, setLastUpdateTime ] = useState(0) // eslint-disable-line
    const [ startRecordRequestCounter, setStartRecordRequestCounter ] = useState(0)
    const [ stopRecordRequestCounter, setStopRecordRequestCounter ] = useState(0)
    const [ startShareTileviewRequestCounter, setStartShareTileviewRequestCounter ] = useState(0)
    const [ stopShareTileviewRequestCounter, setStopShareTileviewRequestCounter ] = useState(0)
    const [ terminateHMMRequestCounter, setTerminateHMMRequestCounter ] = useState(0)
    const recorderForAll = useMemo(()=>{
        return new Recorder()
    },[])
    const recorderForFocused = useMemo(()=>{
        return new Recorder()
    },[])
    const { updateGameState, setChimeClient:amongUsSetChimeClient } = useAmongUsServer()
    const { screenWidth, screenHeight } = useWindowSizeChangeListener()

    //// (1-1) Initialize Chime Client
    useEffect(()=>{
        const vars = myAPI.getEnvVars()
        console.log("ENV VARS:::", JSON.stringify(vars))
        // const userPoolId = vars['USERPOOL_ID']
        // const userPoolClientId = vars['USERPOOL_CLIENT_ID']
        const code = vars['CODE']
        const uuid = vars['UUID']
        const meetingName = vars['MEETING_NAME']
        const attendeeId = vars['ATTENDEE_ID']
        const restApiEndpoint = vars['RESTAPI_ENDPOINT']
        
        const restClient = new RestApiClient(restApiEndpoint, "", "", "")
        restClient.singinWithOnetimeCode(meetingName, attendeeId, uuid, code).then(res=>{
            console.log("[MANAGER] SIGNIN WITH ONETIME CODE SUCCEEDED", JSON.stringify(res))
            const chimeClient = new FlectChimeClient("MANAGER", res.idToken!, res.accessToken!, "N/A", restApiEndpoint)
            const userName = `Manager(${res.attendeeName!.substr(0,5)})`

            chimeClient.setFlectChimeClientListener({
                meetingStateUpdated: () => {
                    setLastUpdateTime(new Date().getTime())
                },
                activeSpekaerUpdated:(activeSpeakerId:string|null)=>{
                    setLastUpdateTime(new Date().getTime())
                },
                attendeesUpdated: (attendeeList:{[attendeeId: string]: AttendeeState}) =>{
                    setLastUpdateTime(new Date().getTime())
                }, 
                videoTileStateUpdated:(videoTileStateList: {[attendeeId: string]: VideoTileState})=>{
                    setLastUpdateTime(new Date().getTime())
                }
            })

            chimeClient.setRealtimeSubscribeChatClientListener({
                chatDataUpdated: (list:RealtimeData[])=>{
                    setLastUpdateTime(new Date().getTime())
                }
            })

            chimeClient.setRealtimeSubscribeHMMClientListener({
                startRecordRequestReceived: () => {
                    console.log("!!!!!!!!! RECORDER START !!!!!!!!!!")
                    recorderForAll.startRecord()
                    recorderForFocused.startRecord()
                    setStartRecordRequestCounter(new Date().getTime())
                },
                stopRecordRequestReceived: () => {
                    console.log("!!!!!!!!! RECORDER END !!!!!!!!!!")
                    
                    recorderForAll.stopRecord().then((data)=>{
                        myAPI.recorderDataAvailable1("AllTiles.mp4", data)
                        setStopRecordRequestCounter(new Date().getTime())
                    })
                    recorderForFocused.stopRecord().then((data)=>{
                        myAPI.recorderDataAvailable2("FocusedTile.mp4", data)
                        setStopRecordRequestCounter(new Date().getTime())
                    })

                 },
                startShareTileviewRequestReceived: () => {
                    setStartShareTileviewRequestCounter(new Date().getTime())
                },
                stopShareTileviewRequestReceived: () => {
                    setStopShareTileviewRequestCounter(new Date().getTime())
                },
                terminateRequestReceived: () => {
                    setTerminateHMMRequestCounter(new Date().getTime())
                },
                notificationReceived: (status: HMMStatus) => {
                },
                amongusNotificationReceived: (gameState: GameState) => {
                },
                hMMStateUpdated: ()=>{
                    setLastUpdateTime(new Date().getTime())
                },
            })

            //// set Chime Client for Amongus
            amongUsSetChimeClient(chimeClient)
            
            chimeClient.joinMeeting(meetingName, userName).then(()=>{
                console.log("[MANAGER] JOIN MEETING SUCCEEDED", userName)
                chimeClient.meetingSession?.deviceController.listAudioOutputDevices().then((audioOuts)=>{
                    console.log("[MANAGER] AUDIO OUTPUT", JSON.stringify(audioOuts))

                    const p1 = chimeClient.audioOutputDeviceSetting?.setAudioOutput(audioOuts[0].deviceId)
                    const audioElem = document.getElementById('audio-output') as HTMLAudioElement
                    console.log("AUDIO ELEMENT", audioElem)
                    const p2 = chimeClient.audioOutputDeviceSetting?.setOutputAudioElement(audioElem)

                    const p3 = chimeClient!.audioInputDeviceSetting?.setAudioInput("dummy")

                    Promise.all([p1, p2, p3]).then(()=>{
                        console.log("[MANAGER] DUMMY AUDIO SETTING DONE")
                        chimeClient!.enterMeeting()
                        setChimeClient(chimeClient)
                    })
                })
            })

            /// set Chime Client for Recorder
            recorderForAll.chimeClient = chimeClient
            recorderForFocused.chimeClient = chimeClient
        })        
    },[])

    //// (1-2) Initialize EventListener for ContextBridge
    useEffect(()=>{
        if(!chimeClient){
            return
        }
        myAPI.onAmongusUpdateMessage((mess)=>{
            console.log(`MESSAGE FROM MAIN ${mess}` )
            chimeClient.hmmClient!.amongUsServer!.updateGameState("", mess)
        })
    },[chimeClient])

    //// (1-3) Grab windowID
    useEffect(()=>{
        myAPI.getWindowId().then((windowId)=>{
            console.log(`windowId: ${windowId}`)
            setWindowId(windowId)

            if(windowId){
                const c = createScreenCaptureDisplayMediaConstraints(windowId, 15)
                navigator.mediaDevices.getUserMedia(c).then(s=>{
                    recorderForAll.sourceVideo = s
                }) 
            }


            // const focusedVideoElem = document.getElementById("focused-video") as HTMLVideoElement
            // // @ts-ignore
            // const ms = focusedVideoElem.captureStream()
            // recorderForFocused.sourceVideo = ms

            const focusedCanvas = document.getElementById("focused-canvas") as HTMLCanvasElement
            // @ts-ignore
            const ms = focusedCanvas.captureStream()
            recorderForFocused.sourceVideo = ms

        })
    },[])


    /// (2) share window
    //// (2-1) share window
    useEffect(()=>{
        if(!windowId || !chimeClient){
            return
        }
        const c = createScreenCaptureDisplayMediaConstraints(windowId, 15)
        navigator.mediaDevices.getUserMedia(c).then(s=>{
            chimeClient!.startShareContent(s)
        })
    },[windowId, chimeClient, startShareTileviewRequestCounter])

    //// (2-2) share window
    useEffect(()=>{
        if(!chimeClient){
            return
        }
        chimeClient.stopShareContent()
    },[chimeClient, stopShareTileviewRequestCounter])


    //// (3) render video
    //// (3-1) generate rendering flags
    // const targetTiles = chimeClient?.getTilesWithFilter(false, true, false) || []
    const targetTiles = chimeClient?.getTilesForRecorder() || []
    const targetIds = targetTiles.reduce<string>((ids,cur)=>{return `${ids}_${cur.boundAttendeeId}`},"")

    let focusedTileId = -1
    const excludeLocal =true
    const sharedContentTile = chimeClient?.getSharedContentTiles(excludeLocal) || []
    if(sharedContentTile.length > 0){
        focusedTileId = sharedContentTile[0].tileId!
    }else{
        if(chimeClient){
            const activeSpeakerTile = chimeClient.getActiveSpeakerTile()
            if(activeSpeakerTile){
                focusedTileId = activeSpeakerTile.tileId || -1
            }
        }    
    }
    

    //// (3-2) arrange video elements
    const grid = useMemo(()=>{
        const cols = Math.min(Math.ceil(Math.sqrt(targetTiles.length)), 5)
        const rows = Math.ceil(targetTiles.length / cols)
        const row_cells = []
        console.log(`[MANAGER] VIDEO GRID ${cols}x${rows} leng:${targetTiles.length}`)
        for(let i=0;i<rows;i++){
            const cells = []
            for(let j=0;j<cols;j++){
                const index = i*cols + j
                cells.push(
                    <video id={`userView${index}`} key={`userView${index}`} style={{width:`${100/cols}%`,  borderStyle:"solid", borderColor:"gray" }} />
                )
            }
            const row_cell = (
                <div key={`row${i}`} style={{display:"flex", flexDirection:"row"}}>
                    {cells}
                </div>
            )
            row_cells.push(row_cell)
        }
        return (
            <div style={{height:"80%" }}>
                {row_cells}
            </div>
        )
    },[screenWidth, screenHeight, chimeClient, targetIds, focusedTileId]) // eslint-disable-line

    //// (3-3) Bind Video
    useEffect(()=>{
        if(!chimeClient){
            return
        }
        console.log(`[MANAGER] VIDEO GRID foucused:${focusedTileId}`)
        const focusedVideoElem = document.getElementById("focused-video") as HTMLVideoElement

        targetTiles.forEach((x, index)=>{
            try{
                const userViewComp = document.getElementById(`userView${index}`) as HTMLVideoElement
                chimeClient.meetingSession?.audioVideo.bindVideoElement(x.tileId!, userViewComp)

                if(x.tileId === focusedTileId){
                    console.log(`[MANAGER] FOCUSED RECORDER TARGET SET ${focusedTileId}`)
                    console.log(`[MANAGER] FOCUSED RECORDER TARGET SET ${recorderForFocused}`)
                    // ////// NG Media Streamが切り替わると落ちてしまう。
                    // // @ts-ignore
                    // const ms = userViewComp.captureStream()
                    // focusedVideoElem.width=100
                    // focusedVideoElem.height=100
                    // focusedVideoElem.pause()
                    // focusedVideoElem.srcObject = null
                    // focusedVideoElem.srcObject = ms
                    // focusedVideoElem.play()
                }

            }catch(e:any){
                console.log("[MANAGER] VDEIO GRID EXCEPTION!!!!!!!!!!!!!", e)
            }
        })

    },[screenWidth, screenHeight, chimeClient, targetIds, focusedTileId])

    //// (3-4) Rendering for focus recorder
    useEffect(()=>{
        const focusedCanvas = document.getElementById("focused-canvas") as HTMLCanvasElement
        const ctx = focusedCanvas.getContext("2d")!
        let requestId = 0
        const foucusedVideoElem = chimeClient?.meetingSession?.audioVideo.getVideoTile(focusedTileId)?.state().boundVideoElement
        const render = () =>{
            ctx.fillStyle="#ff0000"
            ctx.fillRect(0, 0, 200, 200)
            ctx.fillStyle="#ffff00"
            ctx.fillText(`${performance.now()}`, 100, 100)
            if(foucusedVideoElem){
                ctx.drawImage(foucusedVideoElem, 0, 0, 1280, 960)
            }
            requestId = requestAnimationFrame(render)            
        }
        requestId = requestAnimationFrame(render)
        return ()=>{
            cancelAnimationFrame(requestId)
        }
    },[focusedTileId])

    ///// (x) Finalize
    useEffect(()=>{
        if(terminateHMMRequestCounter===0){
            return
        }
        myAPI.finalize()
    },[terminateHMMRequestCounter])

    return (
        <div className="container" style={{color:"black", cursor:"none"}}>
            {grid}
            <div>
                <audio id="audio-output" hidden />                
                <video id="focused-video"  hidden />
                <canvas id="focused-canvas" width="1280px" height="960px" hidden/>
            </div>
        </div>
    );
};
