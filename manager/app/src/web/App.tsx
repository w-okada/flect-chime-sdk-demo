import React, { useEffect, useMemo, useState } from 'react';
import { AttendeeState, CognitoClient, DrawingData, FlectChimeClient, GameState, HMMStatus, RealtimeData, RestApiClient, useAmongUsServer, VideoTileState, WebSocketWhiteboardClient } from '@dannadori/flect-amazon-chime-lib'
import { ipcRenderer } from 'electron'

import './App.scss';
import { useWindowSizeChangeListener } from './hooks/useWindowSizeChange';

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
                    setStartRecordRequestCounter(new Date().getTime())
                },
                stopRecordRequestReceived: () => {
                    setStopRecordRequestCounter(new Date().getTime())
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
                chimeClient!.audioInputDeviceSetting?.setAudioInput("dummy").then(()=>{
                    console.log("[MANAGER] DUMMY AUDIO SETTING DONE")
                    chimeClient!.enterMeeting()
                    setChimeClient(chimeClient)

                })
            })
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
        })
    },[])

    /// (2) share window
    //// (2-1) share window
    useEffect(()=>{
        console.log("------------------------------------ 1")
        if(!windowId || !chimeClient){
            return
        }
        console.log("------------------------------------ 2", windowId)
        const c = createScreenCaptureDisplayMediaConstraints(windowId, 15)
        navigator.mediaDevices.getUserMedia(c).then(s=>{
            console.log("------------------------------------ 3", s)
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
    //// (3-1) rendering flag
    const targetTiles = chimeClient?.getTilesWithFilter(false, true, false) || []
    const targetIds = targetTiles.reduce<string>((ids,cur)=>{return `${ids}_${cur.boundAttendeeId}`},"")

    //// (3-2) arrange video elements
    const grid = useMemo(()=>{
        const cols = Math.min(Math.ceil(Math.sqrt(targetTiles.length)), 5)
        const rows = Math.ceil(targetTiles.length / cols)
        const row_cells = []
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
    },[screenWidth, screenHeight, chimeClient, targetIds]) // eslint-disable-line

    //// (3-2) Bind Video
    useEffect(()=>{
        if(!chimeClient){
            return
        }

        targetTiles.forEach((x, index)=>{
            const userViewComp = document.getElementById(`userView${index}`) as HTMLVideoElement
            chimeClient.meetingSession?.audioVideo.bindVideoElement(x.tileId!, userViewComp)
        })

    },[screenWidth, screenHeight, chimeClient, targetIds])


    ///// (x) Finalize
    useEffect(()=>{
        if(terminateHMMRequestCounter===0){
            return
        }
        myAPI.finalize()
    },[terminateHMMRequestCounter])

    return (
        <div className="container" style={{color:"black"}}>
            {grid}
        </div>
    );
};
