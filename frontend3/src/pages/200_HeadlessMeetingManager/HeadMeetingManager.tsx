import { Button, CircularProgress, Container, createStyles, CssBaseline, makeStyles } from "@material-ui/core";
import { DefaultDeviceController } from "amazon-chime-sdk-js";
import React, { useEffect, useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { HMMCmd } from "../../providers/hooks/RealtimeSubscribers/useRealtimeSubscribeHMM";
import { LocalLogger } from "../../utils/localLogger";
import { RecorderView } from "./components/views/RecorderView";

type InternalStage = "Signining" | "Joining" | "Entering" | "Ready"

type State = {
    internalStage: InternalStage,
    userName: string | null
}


const logger = new LocalLogger("HeadlessMeetingManager")

const framerate = 8

export const HeadlessMeetingManager = () => {
    //// Query Parameters
    const query = new URLSearchParams(window.location.search);
    const meetingName = query.get('meetingName') || null  // meeting name is already encoded
    const attendeeId  = query.get('attendeeId') || null
    const uuid        = query.get('uuid') || null
    const code        = query.get('code') || null // OnetimeCode

    const { handleSinginWithOnetimeCode, joinMeeting, enterMeeting, leaveMeeting, attendees, videoTileStates, setStage,
            audioInputDeviceSetting, videoInputDeviceSetting, audioOutputDeviceSetting,
            sendHMMCommand, hMMCommandData, activeRecorder, allRecorder, audioOutputList
        } = useAppState()
    const [ state, setState] = useState<State>({internalStage:"Signining", userName:null})
    const [ isEncoding, setIsEncoding ] = useState(false)
    const [ isRecording, setIsRecording ] = useState(false)
    const [ attendeeCheckRetry, setAttendeeCheckRetry ] = useState(0)


    const [ activeRecorderCanvas, setActiveRecorderCanvas] = useState<HTMLCanvasElement>()
    const [ allRecorderCanvas, setAllRecorderCanvas]       = useState<HTMLCanvasElement>()

    // const setActiveRecorderCanvas = (canvas:HTMLCanvasElement)=>{        
    //     console.log("AAAAAAAAAAAA setALLRECORADCANVAS")
    //     // @ts-ignore
    //     const videoStream = canvas.captureStream() as MediaStream
    //     console.log("AAAAAAAAAAAAAAAAAAAA", videoStream)
    //     const videoElem = document.getElementById("ActiveRecorderVideo") as HTMLVideoElement
    //     videoElem.srcObject=videoStream

    //     _setActiveRecorderCanvas(canvas)
    // }
    // const setAllRecorderCanvas = (canvas:HTMLCanvasElement)=>{
    //     console.log("AAAAAAAAAAAAaa setALLRECORADCANVAS")
    //     // @ts-ignore
    //     const videoStream = canvas.captureStream() as MediaStream
    //     console.log("AAAAAAAAAAAAAAAAAAAA", videoStream)
    //     const videoElem = document.getElementById("AllRecorderVideo") as HTMLVideoElement
    //     videoElem.srcObject=videoStream
    //     _setAllRecorderCanvas(canvas)
    // }

    const startRecord = async () =>{
        setIsRecording(true)
        const audioElem = document.getElementById("for-speaker") as HTMLAudioElement
        console.log("AUDIO ELEM:::::", audioElem.id, audioElem)

        ///////////////////
        //// For Active Recorder
        ///////////////////
        const activeStream =  new MediaStream();
        // @ts-ignore
        const audioStream = audioElem.captureStream() as MediaStream
        console.log("AUDIO STREAM:::::", audioStream)
        let localAudioStream = audioInputDeviceSetting?.audioInputForRecord
        if(typeof localAudioStream === "string"){
            localAudioStream = await navigator.mediaDevices.getUserMedia({audio:{deviceId:localAudioStream}})
        }

        const audioContext = DefaultDeviceController.getAudioContext();
        const outputNode = audioContext.createMediaStreamDestination();
        const sourceNode1 = audioContext.createMediaStreamSource(audioStream);
        sourceNode1.connect(outputNode)
        if(localAudioStream){
            const sourceNode2 = audioContext.createMediaStreamSource(localAudioStream as MediaStream);
            sourceNode2.connect(outputNode)
        }
        // @ts-ignore
        const videoStream = activeRecorderCanvas.captureStream(framerate) as MediaStream

        [outputNode.stream, videoStream].forEach(s=>{
            s?.getTracks().forEach(t=>{
                console.log("added tracks:", t)
                activeStream.addTrack(t)
            })
        });

        // const activeVideoElem = document.getElementById("ActiveRecorderVideo") as HTMLVideoElement
        // activeVideoElem.srcObject = activeStream
        // activeVideoElem.play()
        // // @ts-ignore
        // const activeVideoStream = activeVideoElem.captureStream() as MediaStream

        activeRecorder?.startRecording(activeStream)
        // activeRecorder?.startRecording(activeVideoStream)
        
        ////////////////////////
        //// For AllRecorder
        ////////////////////////
        const allStream =  new MediaStream();
        // @ts-ignore
        const allSudioStream = audioElem.captureStream() as MediaStream
        const allOutputNode = audioContext.createMediaStreamDestination();
        const allSourceNode1 = audioContext.createMediaStreamSource(audioStream);
        allSourceNode1.connect(allOutputNode)
        if(localAudioStream){
            const allSourceNode2 = audioContext.createMediaStreamSource(localAudioStream as MediaStream);
            allSourceNode2.connect(allOutputNode)
        }
        // @ts-ignore
        const allVideoStream = allRecorderCanvas.captureStream(framerate) as MediaStream

        [allOutputNode.stream, allVideoStream].forEach(s=>{
            s?.getTracks().forEach(t=>{
                console.log("added tracks:", t)
                allStream.addTrack(t)
            })
        });



        // const allVideoElem = document.getElementById("AllRecorderVideo") as HTMLVideoElement
        // allVideoElem.srcObject = allStream
        // allVideoElem.play()
        // // @ts-ignore
        // const allVideoStream2 = allVideoElem.captureStream() as MediaStream
        // console.log("ZSFSDFSDFSDFDSFSDFSDFDSFSDFSDFSDF", allVideoStream2)
        allRecorder?.startRecording(allStream)
        // allRecorder?.startRecording(allVideoStream2)
    }

    const stopRecord = async () =>{
        activeRecorder?.stopRecording()
        allRecorder?.stopRecording()
        setIsEncoding(true)
        const activeUrl = activeRecorder.getDataURL()
        const allUrl = allRecorder.getDataURL()
        const activeLink = document.getElementById("activeLink") as HTMLLinkElement
        const allLink = document.getElementById("allLink") as HTMLLinkElement
        activeLink.href = activeUrl
        allLink.href = allUrl

        // await activeRecorder?.toMp4()
        // await allRecorder?.toMp4()
        setIsEncoding(false)
        setIsRecording(false)

        const event = new CustomEvent('recordeFin1111');
        const dispatcher = document.getElementById("eventDisptcher") as HTMLDivElement
        document.dispatchEvent(event)
    }


    useEffect(()=>{
        if(hMMCommandData.length === 0){
            return
        }
        const latestCommand = hMMCommandData.slice(-1)[0]
        switch(latestCommand.data){
            case HMMCmd.START_RECORD:
                logger.log("START RECORD")
                startRecord()
                break
            case HMMCmd.STOP_RECORD:
                logger.log("STOP RECORD")
                stopRecord()
                break
            default:
                logger.log("NO MATCH COMMAND", latestCommand.data)
                break
        }
    },[hMMCommandData])

    useEffect(()=>{
        if(state.internalStage === "Signining"){
            logger.log("Singining....")
            if(!meetingName || !attendeeId || !uuid || !code){
                logger.log(`"Exception: Signin error. Information is insufficent meetingName${meetingName}, attendeeId=${attendeeId}, uuid=${uuid}, code=${code}`)
                return
            }
            console.log(meetingName)
            handleSinginWithOnetimeCode(meetingName, attendeeId, uuid, code).then((res)=>{
                console.log(res)
                if(res.result){
                    setState({...state, userName: res.userName||null, internalStage:"Joining"})
                }else{
                    logger.log("Exception: Signin error, can not sigin. please generate code and retry.", res)
                }
            })
        }else if(state.internalStage === "Joining"){
            logger.log("Joining....")
            joinMeeting(meetingName!, `@Manager[${state.userName!}]`).then(()=>{
                setState({...state, internalStage:"Entering"})
            }).catch(e=>{
                logger.log("joining failed",e)
            })
        }else if(state.internalStage === "Entering"){
            console.log("entering...")
            const p1 = audioInputDeviceSetting!.setAudioInput("dummy")
            const p2 = videoInputDeviceSetting!.setVideoInput(null)
            // const audioOutput = (audioOutputList && audioOutputList!.length > 0) ? audioOutputList[0].deviceId:null
            // console.log("Active Speaker::::::audio", audioOutput?audioOutput:"null")
            // const p3 = audioOutputDeviceSetting!.setAudioOutput(audioOutput)
            const p3 = audioOutputDeviceSetting!.setAudioOutput(null)

            enterMeeting().then(()=>{
                Promise.all( [p1, p2, p3] ).then(()=>{
                    setState({...state, internalStage:"Ready"})
                    // setStage("HEADLESS_MEETING_MANAGER2")
                })
            }).catch(e=>{
                logger.log("enter meeting failed",e)
            })
        }else if(state.internalStage === "Ready"){
            console.log("entered...")
            const audioElement = document.getElementById("for-speaker")! as HTMLAudioElement
            audioElement.autoplay=false
            audioElement.volume = 0
            audioOutputDeviceSetting!.setOutputAudioElement(audioElement)

            // audioOutputDeviceSetting!.setAudioOutput(audioOutput).then(()=>{
            //     const audioElement = document.getElementById("for-speaker")! as HTMLAudioElement
            //     audioElement.autoplay=false
            //     audioElement.volume = 0
            //     audioOutputDeviceSetting!.setOutputAudioElement(audioElement)
            //     setTimeout(checkAttendees, 1000*5)
            // })
        }
    },[state.internalStage])
    


    // if(state.internalStage === "Ready" && Object.keys(videoTileStates).length > 0 && Object.keys(attendees).length === 0){
    //     console.log("Active Speaker:::::::::::::: something wrong with attendees! 1 ", attendees, videoTileStates, attendeeCheckRetry)
    //     console.log("Active Speaker:::::::::::::: something wrong with attendees! 2 ", ...Object.keys(attendees))
    //     console.log("Active Speaker:::::::::::::: something wrong with attendees! 3 ", ...Object.keys(videoTileStates))

    //     setTimeout( ()=>{setAttendeeCheckRetry(attendeeCheckRetry + 1)},1000*5)
    //     if(attendeeCheckRetry === 5){
    //         console.log("Active Speaker:::::::::::::: leave and rejoin!! ")
    //         leaveMeeting()
    //         setState({...state, internalStage:"Joining"})
    //     }
    // }else if(state.internalStage === "Ready"){
    //     console.log("Active Speaker:::::::::::::: OK attendees fine!", attendees, videoTileStates, attendeeCheckRetry)
    // }


    return (
        <>
            <RecorderView height={200} width={500} setActiveRecorderCanvas={setActiveRecorderCanvas} setAllRecorderCanvas={setAllRecorderCanvas}/>
            <div>recording:{isRecording?"true":"false"}</div>
            <div>encoding:{isEncoding?"true":"false"}</div>
            <div>ATTTENDEES:{Object.keys(attendees)}</div>

            {/* <div>
                <video width="1920" height="1080" id="ActiveRecorderVideo" autoPlay style={{ width: "20%", height: "20%", border: "medium solid #ffaaaa"}} />
                <video width="1920" height="1080" id="AllRecorderVideo"    autoPlay style={{ width: "20%", height: "20%", border: "medium solid #ffaaaa"}} />
            </div> */}

            <a id="activeLink">active speaker</a>
            <a id="allLink">all speaker</a>

            <div>
                <audio id="for-speaker" style={{display:"none"}}/>
            </div>
        </>
    )
}
