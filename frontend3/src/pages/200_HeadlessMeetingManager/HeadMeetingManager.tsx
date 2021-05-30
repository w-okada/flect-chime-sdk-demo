import { Button, CircularProgress, Container, createStyles, CssBaseline, makeStyles } from "@material-ui/core";
import { DefaultDeviceController } from "amazon-chime-sdk-js";
import React, { useEffect, useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { Recorder } from "../../providers/helper/Recorder";
import { HMMCmd, HMMMessage } from "../../providers/hooks/RealtimeSubscribers/useRealtimeSubscribeHMM";
import { useScheduler } from "../../providers/hooks/useScheduler";
import { getDateString } from "../../utils";
import { LocalLogger } from "../../utils/localLogger";
import { RecorderView } from "./components/views/RecorderView";
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

const framerate = 15

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
    const decodedMeetingName =  decodeURIComponent(meetingName!)


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
    const { meetingActive } = useStatusMonitor()


    const startRecordInternal = async (recorder:Recorder, srcCanvas:HTMLCanvasElement) => {
        const audioElem = document.getElementById("for-speaker") as HTMLAudioElement
        const stream =  new MediaStream();

        // @ts-ignore
        const audioStream = audioElem.captureStream() as MediaStream
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
        const videoStream = srcCanvas.captureStream(framerate) as MediaStream

        [outputNode.stream, videoStream].forEach(s=>{
            s?.getTracks().forEach(t=>{
                stream.addTrack(t)
            })
        });

        recorder.startRecording(stream)
    }

    const startRecord = async () =>{
        setIsRecording(true)
        startRecordInternal(activeRecorder, activeRecorderCanvas!)
        startRecordInternal(allRecorder, allRecorderCanvas!)
        const event = new CustomEvent('recordStart');
        document.dispatchEvent(event)
    }


    const stopRecord = async () =>{
        activeRecorder?.stopRecording()
        allRecorder?.stopRecording()
        setIsEncoding(true)
        // const activeUrl = await activeRecorder.getMp4URL()
        // const allUrl    = await allRecorder.getMp4URL()
        // const activeUrl = await activeRecorder.getDataURL()
        // const allUrl    = await allRecorder.getDataURL()
        // const activeLink = document.getElementById("activeVideoLink") as HTMLLinkElement
        // const allLink    = document.getElementById("allVideoLink") as HTMLLinkElement
        // activeLink.href = activeUrl
        // allLink.href    = allUrl

        const dateString = getDateString()
        await activeRecorder?.toMp4(`${dateString}_${decodedMeetingName}_active.mp4`)
        await allRecorder?.toMp4(`${dateString}_${decodedMeetingName}_all.mp4`)
        setIsEncoding(false)
        setIsRecording(false)

        const event = new CustomEvent('recordFin');
        document.dispatchEvent(event)
    }

    useEffect(()=>{
        if(meetingActive===false){
            (async()=>{
                if(isRecording){
                    logger.log("stop recording start")
                    await stopRecord()
                    logger.log("stop recording end")
                    await sleep(20)
                    logger.log("stop recording sleep end")

                }
                logger.log("terminate event fire")

                const event = new CustomEvent('terminate');
                document.dispatchEvent(event)
                logger.log("terminate event fired")

            })()

        }
    },[meetingActive])


    useEffect(()=>{
        if(hMMCommandData.length === 0){
            return
        }
        const latestCommand = hMMCommandData.slice(-1)[0]
        const mess = latestCommand.data as HMMMessage
        switch(mess.command){
            case HMMCmd.START_RECORD:
                logger.log("START RECORD")
                startRecord()
                break
            case HMMCmd.STOP_RECORD:
                logger.log("STOP RECORD")
                stopRecord()
                break
            case HMMCmd.START_SHARE_TILEVIEW:
                logger.log("Not Implemented")
                break
            case HMMCmd.STOP_SHARE_TILEVIEW:
                logger.log("Not Implemented")
                break
            case HMMCmd.GET_LOCAL_IP:
                const event = new CustomEvent('get_local_ip');
                document.dispatchEvent(event)
                logger.log("get_local_ip fired!!!!!!!")
                break
            case HMMCmd.TERMINATE:
                (async()=>{
                    if(isRecording){
                        logger.log("stop recording start")
                        await stopRecord()
                        logger.log("stop recording end")
                        await sleep(20)
                        logger.log("stop recording sleep end")

                    }
                    logger.log("terminate event fire")

                    const event = new CustomEvent('terminate');
                    document.dispatchEvent(event)
                    logger.log("terminate event fired")

                })()
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
            handleSinginWithOnetimeCode(meetingName, attendeeId, uuid, code).then((res)=>{
                if(res.result){
                    setState({...state, userName: res.attendeeName||null, internalStage:"Joining"})
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
            logger.log("entering...")
            const p1 = audioInputDeviceSetting!.setAudioInput("dummy")
            const p2 = videoInputDeviceSetting!.setVideoInput(null)
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
            <RecorderView height={200} width={500} setActiveRecorderCanvas={setActiveRecorderCanvas} setAllRecorderCanvas={setAllRecorderCanvas}/>
            <div>recording:{isRecording?"true":"false"}</div>
            <div>encoding:{isEncoding?"true":"false"}</div>
            <div>ATTTENDEES:{Object.keys(attendees).map(x=>{return `[${x}]`})}</div>

            <a id="activeVideoLink">active speaker</a>
            <a id="allVideoLink">all speaker</a>

            <div>
                <audio id="for-speaker" style={{display:"none"}}/>
            </div>


            <div>
                <input id="pup" />
                <button id="pup_click" onClick={()=>{
                    const input = document.getElementById("pup") as HTMLInputElement
                    console.log("INPUT DATA!", input.value)
                }} />
            </div>
        </>
    )
}
