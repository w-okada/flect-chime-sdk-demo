import React  from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {  useMeetingState } from '../providers/MeetingStateProvider';
import { Button, Tooltip, Typography } from '@material-ui/core';
import { Pause, FiberManualRecord } from '@material-ui/icons'

type Props = {
    startRecord: ()=>void
    stopRecord: ()=>void
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        title: {
            fontSize: 14,
        },
        button:{
            margin: theme.spacing(1)
        },
        activatedButton: {
            margin: theme.spacing(1),
            color: "#ee7777"
        }
    }),
);

export const RecorderPanel = ({ startRecord, stopRecord}: Props) => {
    const classes = useStyles();
    const { recorder } = useMeetingState()

    const handleOnClickStartRecord = () => {
        if(!recorder?.isRecording){
            startRecord()
        }
    }
    const handleOnClickStopRecord = () => {
        if(recorder?.isRecording){
            stopRecord()
        }
    }

    return (
        <div style={{ height: '100%', width: "100%", wordWrap: "break-word", whiteSpace: "normal" }}>
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
                >
                    Stop
                </Button>
            </Tooltip> 


        </div>
    );
}