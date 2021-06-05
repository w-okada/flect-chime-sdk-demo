import { Button, CircularProgress, Container, createStyles, CssBaseline, makeStyles } from "@material-ui/core";
import { DefaultDeviceController } from "amazon-chime-sdk-js";
import React, { useEffect, useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { Recorder } from "../../providers/helper/Recorder";
import { HMMCmd, HMMMessage, HMMStatus } from "../../providers/hooks/RealtimeSubscribers/useRealtimeSubscribeHMM";
import { useScheduler } from "../../providers/hooks/useScheduler";
import { getDateString } from "../../utils";
import { LocalLogger } from "../../utils/localLogger";
import { RecorderView } from "./components/views/RecorderView";
import { useRecorder } from "./hooks/useRecorder";
import { useShareTileView } from "./hooks/useShareTileView";
import { useStatusMonitor } from "./hooks/useStatusMonitor";

// const AWS = require('aws-sdk');
// const bucketName = "f-backendstack-dev-bucket"
// const s3 = new AWS.S3({ params: { Bucket: bucketName } });

type InternalStage = "Signining" | "Joining" | "Entering" | "Ready"
type State = {
    internalStage: InternalStage,
    userName: string | null
}
const logger = new LocalLogger("HeadlessMeetingManager")

function sleep(ms:number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
} 


export const HeadlessMeetingManager = () => {
    //// Query Parameters
    const query = new URLSearchParams(window.location.search);
    const meetingName = query.get('meetingName') || null  // meeting name is already encoded
    const attendeeId  = query.get('attendeeId') || null
    const uuid        = query.get('uuid') || null
    const code        = query.get('code') || null // OnetimeCode
    // const decodedMeetingName =  decodeURIComponent(meetingName!)


    const { handleSinginWithOnetimeCode, joinMeeting, enterMeeting, attendees, sendHMMStatus, terminateCounter,
            audioInputDeviceSetting, videoInputDeviceSetting, audioOutputDeviceSetting, audioOutputList,
            updateGameState} = useAppState()
    const [ state, setState] = useState<State>({internalStage:"Signining", userName:null})

    const { meetingActive } = useStatusMonitor()
    const { isRecording, setActiveCanvas, setAllCanvas, stopRecord } = useRecorder({meetingName:meetingName||"unknown"})
    const { isSharingTileView, setTileCanvas, stopSharingTileView} = useShareTileView({meetingName:meetingName||"unknown"})
    const { tenSecondsTaskTrigger } = useScheduler()

    const setTileCanvasExport = (canvas:HTMLCanvasElement) => {
        setAllCanvas(canvas)
        setTileCanvas(canvas)
    }


    const finalizeMeeting = async() =>{
        logger.log("meeting is no active. stop recording...")
        await stopRecord()
        logger.log("meeting is no active. stop recording...done. sleep 20sec")
        await sleep(20)
        logger.log("meeting is no active. stop recording...done. sleep 20sec done.")
        logger.log("terminate event fire")

        const event = new CustomEvent('terminate');
        document.dispatchEvent(event)
        logger.log("terminate event fired")
    }
    useEffect(()=>{
        if(meetingActive===false){
            finalizeMeeting()
            sendHMMStatus(false, isRecording, isSharingTileView)
        }
    },[meetingActive])
    useEffect(()=>{
        if(terminateCounter>0){
            finalizeMeeting()
            sendHMMStatus(false, isRecording, isSharingTileView)
        }
    },[terminateCounter])


    useEffect(()=>{
        sendHMMStatus(true, isRecording, isSharingTileView)
    },[tenSecondsTaskTrigger])




    useEffect(()=>{
        if(state.internalStage === "Signining"){
            logger.log("Singining....")
            if(!meetingName || !attendeeId || !uuid || !code){
                logger.log(`"Exception: Signin error. Information is insufficent meetingName${meetingName}, attendeeId=${attendeeId}, uuid=${uuid}, code=${code}`)
                finalizeMeeting()
                sendHMMStatus(false, isRecording, isSharingTileView)
                return
            }
            handleSinginWithOnetimeCode(meetingName, attendeeId, uuid, code).then((res)=>{
                if(res.result){
                    setState({...state, userName: res.attendeeName||null, internalStage:"Joining"})
                }else{
                    logger.log("Exception: Signin error, can not sigin. please generate code and retry.", res)
                    finalizeMeeting()
                    sendHMMStatus(false, isRecording, isSharingTileView)
                }
            })
        }else if(state.internalStage === "Joining"){
            logger.log("Joining....")
            joinMeeting(meetingName!, `@Manager[${state.userName!}]`).then(()=>{
                setState({...state, internalStage:"Entering"})
            }).catch(e=>{
                logger.log("joining failed",e)
                finalizeMeeting()
                sendHMMStatus(false, isRecording, isSharingTileView)
            })
        }else if(state.internalStage === "Entering"){
            logger.log("entering...")
            const p1 = audioInputDeviceSetting!.setAudioInput("dummy")
            const p2 = videoInputDeviceSetting!.setVideoInput(null)
            videoInputDeviceSetting!.setVirtualForegrounEnable(false)
            videoInputDeviceSetting!.setVirtualBackgrounEnable(false)    
            const audioOutput = (audioOutputList && audioOutputList!.length > 0) ? audioOutputList[0].deviceId:null
            logger.log("Active Speaker::::::audio", audioOutput?audioOutput:"null")
            const p3 = audioOutputDeviceSetting!.setAudioOutput(audioOutput)
            // const p3 = audioOutputDeviceSetting!.setAudioOutput(null)

            enterMeeting().then(()=>{
                Promise.all( [p1, p2, p3] ).then(()=>{
                    setState({...state, internalStage:"Ready"})
                    // setStage("HEADLESS_MEETING_MANAGER2")
                })
            }).catch(e=>{
                logger.log("enter meeting failed",e)
                finalizeMeeting()
                sendHMMStatus(false, isRecording, isSharingTileView)
            })
        }else if(state.internalStage === "Ready"){
            logger.log("ready....")
            const audioElement = document.getElementById("for-speaker")! as HTMLAudioElement
            audioElement.autoplay=false
            audioElement.volume = 0
            audioOutputDeviceSetting!.setOutputAudioElement(audioElement)
        }
    },[state.internalStage])
    
    return (
        <>
            <RecorderView height={200} width={500} setActiveRecorderCanvas={setActiveCanvas} setAllRecorderCanvas={setTileCanvasExport}/>
            <div>recording:{isRecording?"true":"false"}</div>
            <div>ATTTENDEES:{Object.keys(attendees).map(x=>{return `[${x}]`})}</div>

            <a id="activeVideoLink">active speaker</a>
            <a id="allVideoLink">all speaker</a>

            <div>
                <audio id="for-speaker" style={{display:"none"}}/>
            </div>


            <div>
                <input id="io_event"/>
                <input id="io_data"/>
                <button id="io_click" onClick={()=>{
                    const ev = document.getElementById("io_event") as HTMLInputElement
                    const data = document.getElementById("io_data") as HTMLInputElement
                    updateGameState(ev.value, data.value)
                }} />
            </div>
        </>
    )
}
