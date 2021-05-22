import React, { useMemo, useState }  from 'react';
import { Button, CircularProgress, Tooltip, Typography } from '@material-ui/core';
import { Pause, FiberManualRecord } from '@material-ui/icons'
import { useStyles } from './css';
import { useAppState } from '../../../../providers/AppStateProvider';
import { DefaultDeviceController } from 'amazon-chime-sdk-js';
import { RecorderView } from '../ScreenView/RecorderView';

export const RecorderPanel = () => {
    const classes = useStyles();
    const { recorder, audioInputDeviceSetting } = useAppState()
    const  [recorderCanvas, setRecorderCanvas] = useState<HTMLCanvasElement|null>(null)
    const [ isEncoding, setIsEncoding ] = useState(false)
    const [ isRecording, setIsRecording ] = useState(false)

    const handleOnClickStartRecord = async() =>{
        setIsRecording(true)
        const stream =  new MediaStream();
        const audioElem = document.getElementById("for-speaker") as HTMLAudioElement

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
        const videoStream = recorderCanvas.captureStream() as MediaStream

        [outputNode.stream, videoStream].forEach(s=>{
            s?.getTracks().forEach(t=>{
                console.log("added tracks:", t)
                stream.addTrack(t)
            })
        });
        recorder?.startRecording(stream)
    }

    const handleOnClickStopRecord = async() =>{
        recorder?.stopRecording()
        setIsEncoding(true)
        await recorder?.toMp4()
        console.log("---------------------------------------------------- 1")
        setIsEncoding(false)
        console.log("---------------------------------------------------- 2")
        setIsRecording(false)
        console.log("---------------------------------------------------- 3")
    }

    const startButton = useMemo(()=>{
        return isRecording === false && isEncoding === false ? 
        (
            <Tooltip title={recorder?.isRecording?"stop recording":"start recording"}>
                <Button
                    size="small"
                    variant="outlined"
                    className={recorder?.isRecording ? classes.activatedButton : classes.button}
                    startIcon={<FiberManualRecord />}
                    onClick={handleOnClickStartRecord}
                    id="recorder-start"
                >
                    Rec.
                </Button>
            </Tooltip> 
        )
        :
        (
            <Tooltip title={recorder?.isRecording?"stop recording":"start recording"}>
                <Button
                    size="small"
                    variant="outlined"
                    className={recorder?.isRecording ? classes.activatedButton : classes.button}
                    startIcon={<FiberManualRecord />}
                    id="recorder-start"
                >
                    Rec.
                </Button>
            </Tooltip> 

        )
    },[isRecording, isEncoding, recorderCanvas])

    const stopButton = useMemo(()=>{

        if(isRecording === false && isEncoding === false){
            return <Tooltip title={recorder?.isRecording?"stop recording":"start recording"}>
                <Button
                size="small"
                variant="outlined"
                className={classes.button}
                startIcon={<Pause />}
                disabled
                id="recorder-stop"
                >
                    Stop
                </Button>
            </Tooltip> 
        }else if(isRecording === true && isEncoding === false){
            return <Tooltip title={recorder?.isRecording?"stop recording":"start recording"}>
                <Button
                size="small"
                variant="outlined"
                className={classes.button}
                startIcon={<Pause />}
                onClick={handleOnClickStopRecord}
                id="recorder-stop"
                >
                    Stop
                </Button>
            </Tooltip> 
        }else if(isRecording === true && isEncoding === true){
            return  <CircularProgress />
        }
    },[isRecording, isEncoding, recorderCanvas])

    return (
        <div className={classes.root}>
            <Typography className={classes.title} color="textSecondary">
                Push REC button to start recording. Push STOP button to end recording and download file.
                Note: Please confirm the screen below shows the movie you want to record. 
                Depends on the browser or its version, you should display the screen below in order to update image on the screen below.
            </Typography>

            {startButton}
            {stopButton}

            <RecorderView height={200} width={200} setRecorderCanvas={setRecorderCanvas}/>
        </div>
    );
}