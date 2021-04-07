import React  from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Button, Tooltip, Typography } from '@material-ui/core';
import { Pause, FiberManualRecord } from '@material-ui/icons'
import { useStyles } from './css';

type Props = {
    startRecord: ()=>void
    stopRecord: ()=>void
};

export const RecorderPanel = ({ startRecord, stopRecord}: Props) => {
    const classes = useStyles();
    // const { recorder } = useMeetingState()

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

            {/* <Tooltip title={recorder?.isRecording?"stop recording":"start recording"}>
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
            </Tooltip>  */}
        </div>
    );
}