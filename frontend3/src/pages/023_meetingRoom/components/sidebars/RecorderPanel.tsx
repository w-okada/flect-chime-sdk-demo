import React  from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Button, Tooltip, Typography } from '@material-ui/core';
import { Pause, FiberManualRecord } from '@material-ui/icons'
import { useStyles } from './css';
import { useAppState } from '../../../../providers/AppStateProvider';
import { DefaultDeviceController } from 'amazon-chime-sdk-js';
import { RecorderView } from '../ScreenView/RecorderView';

export const RecorderPanel = () => {
    const classes = useStyles();
    // const { recorder } = useMeetingState()
    const { recorder, audioInputDeviceSetting, recorderCanvas } = useAppState()

    // const handleOnClickStartRecord = () => {
    //     console.log("CLICK RECORDER !!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    //     if(!recorder?.isRecording){
    //         startRecord()
    //     }else{
    //         console.log("CLICK RECORDER !!!!!!!!!!!!!!!!!!!!!!!!!!!!! NOT instance")
    //     }
    // }
    // const handleOnClickStopRecord = () => {
    //     if(recorder?.isRecording){
    //         stopRecord()
    //     }
    // }

    const handleOnClickStartRecord = async() =>{
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
        const videoStream = recorderCanvas.captureStream() as MediaStream

        [outputNode.stream, videoStream].forEach(s=>{
//        [audioStream, videoStream, localAudioStream].forEach(s=>{
            s?.getTracks().forEach(t=>{
                console.log("added tracks:", t)
                stream.addTrack(t)
            })
        });

        // @ts-ignore
        // const audioStream = audioElem.captureStream()
        recorder?.startRecording(stream)
        // recorder?.startRecording(audioStream)
        // recorder?.startRecording(videoStream)
        
    }

    const handleOnClickStopRecord = async() =>{
        recorder?.stopRecording()
        recorder?.toMp4()
    }


    return (
        <div className={classes.root}>
            <Typography className={classes.title} color="textSecondary">
                This feature is experimental.
            </Typography>
            <Typography className={classes.title} color="textSecondary">
                If you record the screen, change screen to "Recorder View". You can change on toolbar.
            </Typography>
            <Typography className={classes.title} color="textSecondary">
                Note: local audio can not be muted. and can not be dynamically canged.
            </Typography>

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
            <Tooltip title={recorder?.isRecording?"stop recording":"start recording"}>
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

            <RecorderView height={200} width={200} />
        </div>
    );
}