import React  from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Button, Tooltip, Typography } from '@material-ui/core';
import { Pause, FiberManualRecord } from '@material-ui/icons'
import { useStyles } from './css';
import { useAppState } from '../../../../providers/AppStateProvider';
import { DefaultDeviceController } from 'amazon-chime-sdk-js';

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
        console.log("RECORDER........................... 1", recorder)
        const audioElem = document.getElementById("for-speaker") as HTMLAudioElement
        const stream =  new MediaStream();
        console.log("RECORDER........................... 2", recorder)

        // @ts-ignore
        const audioStream = audioElem.captureStream() as MediaStream
        let localAudioStream = audioInputDeviceSetting?.audioInputForRecord
        console.log("[Recording] 1")
        if(typeof localAudioStream === "string"){
            console.log("[Recording] 2,", localAudioStream)
            localAudioStream = await navigator.mediaDevices.getUserMedia({audio:{deviceId:localAudioStream}})
        }
        console.log("[Recording] 3", localAudioStream)


        const audioContext = DefaultDeviceController.getAudioContext();
        console.log("RECORDER........................... 31", recorder)
        const outputNode = audioContext.createMediaStreamDestination();
        console.log("RECORDER........................... 32 1", recorder, audioStream)
        console.log(audioStream)
        console.log("RECORDER........................... 32 2", recorder, audioStream)
        const sourceNode1 = audioContext.createMediaStreamSource(audioStream);
        console.log("RECORDER........................... 33", recorder)
        sourceNode1.connect(outputNode)
        console.log("RECORDER........................... 34", recorder)
        if(localAudioStream){
            console.log("RECORDER........................... 35", recorder)
            const sourceNode2 = audioContext.createMediaStreamSource(localAudioStream as MediaStream);
            console.log("RECORDER........................... 36", recorder)
            sourceNode2.connect(outputNode)
            console.log("RECORDER........................... 37", recorder)
        }

        console.log("RECORDER........................... 38", recorder)
        // @ts-ignore
        const videoStream = recorderCanvas.captureStream() as MediaStream

        [outputNode.stream, videoStream].forEach(s=>{
//        [audioStream, videoStream, localAudioStream].forEach(s=>{
            s?.getTracks().forEach(t=>{
                console.log("added tracks:", t)
                stream.addTrack(t)
            })
        });
        console.log("RECORDER........................... 4", recorder)

        // @ts-ignore
        // const audioStream = audioElem.captureStream()
        recorder?.startRecording(stream)
        // recorder?.startRecording(audioStream)
        // recorder?.startRecording(videoStream)
        console.log("RECORDER........................... 5", recorder)
        
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
        </div>
    );
}