import { DefaultDeviceController } from "amazon-chime-sdk-js"
import { useEffect, useMemo, useState } from "react"
import { useAppState } from "../../../providers/AppStateProvider"
import { Recorder } from "../../../providers/helper/Recorder"
import { getDateString } from "../../../utils"



type UseRecorderProps = {
    meetingName      : string
}

const framerate = 8
export const useRecorder = (props:UseRecorderProps) =>{
    const decodedMeetingName =  decodeURIComponent(props.meetingName!)

    const { startRecordingCounter, stopRecordingCounter, audioInputDeviceSetting } = useAppState()
    const [ activeCanvas, setActiveCanvas ] = useState<HTMLCanvasElement>()
    const [ allCanvas, setAllCanvas ] = useState<HTMLCanvasElement>()
    const activeRecorder    = useMemo(()=>{return new Recorder()},[])
    const allRecorder       = useMemo(()=>{return new Recorder()},[])
    const [ isRecording, setIsRecording] = useState(false)


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
        if(!activeCanvas || !allCanvas){
            console.log("START RECORDER::: failed! canvas is null", activeCanvas, allCanvas)
            return 
        }
        if(isRecording){
            console.log("START RECORDER::: failed! already recording")
            return 
        }
        startRecordInternal(activeRecorder, activeCanvas!)
        startRecordInternal(allRecorder, allCanvas!)
        setIsRecording(true)
        return 
    }


    const stopRecord = async () =>{
        if(!isRecording){
            console.log("STOP RECORDER::: failed! recording is not started")
            return 
        }

        
        activeRecorder?.stopRecording()
        allRecorder?.stopRecording()
        const dateString = getDateString()

        await activeRecorder?.toMp4(`${dateString}_${decodedMeetingName}_active.mp4`)
        await allRecorder?.toMp4(`${dateString}_${decodedMeetingName}_all.mp4`)
        setIsRecording(false)

        const event = new CustomEvent('uploadVideo');
        document.dispatchEvent(event)
        console.log("[useRecorder] stopRecording event fired")

        
    }


    useEffect(()=>{
        console.log("START RECORDER:::", startRecordingCounter, stopRecordingCounter)
        startRecord()
    },[startRecordingCounter]) // eslint-disable-line
    useEffect(()=>{
        console.log("STOP RECORDER:FROM COUNTER!::", startRecordingCounter, stopRecordingCounter)
        console.log("STOP RECORDER:::", startRecordingCounter, stopRecordingCounter)
        stopRecord()
    },[stopRecordingCounter]) // eslint-disable-line


    return {isRecording, setActiveCanvas, setAllCanvas, stopRecord}
}
