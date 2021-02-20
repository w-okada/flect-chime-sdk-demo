import React, { useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {  useMeetingState } from '../providers/MeetingStateProvider';
import { Button, Grid, Slider, TextField, Tooltip, Typography } from '@material-ui/core';
import { useRealitimeSubscribeChatState } from '../providers/realtime/RealtimeSubscribeChatProvider';
import { RadioButtonUnchecked, FiberManualRecord, VolumeDown, VolumeUp } from '@material-ui/icons'
import { DrawingData, useWebSocketWhiteboardState } from '../providers/websocket/WebScoketWhiteboardProvider';
import { RS_SE } from '../resources';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            height: '100%',

        },
        container: {
            maxHeight: `calc(100% - 10px)`,
        },
        paper: {
            width: '100%',
            marginBottom: theme.spacing(2),
            maxHeight: `calc(100% - 10px)`,
            orverflow: 'scroll',

        },
        margin: {
            margin: theme.spacing(1),
        },
        title: {
            fontSize: 14,
        },
        selectedColor:{
            border: "1px solid",
            borderRadius: "4px",
        },
        color:{
        }
    }),
);

export const BGMPanel = () => {
    const classes = useStyles();
    const [ isPlaying, setIsPlaying ] = useState(false)
    const { audioInputDeviceSetting } = useMeetingState()
    const [ volume, setVolume] = React.useState(30);
    const ses = RS_SE.map(s=>{
        return <Button variant="outlined" size="small" color="primary" className={classes.margin}  onClick={() => {
            playBGM(s)
        }}>
            {s}
        </Button>
    })

    const playBGM = (path:string) => {
        const elem = document.getElementById("bgm_panel_audio") as HTMLAudioElement
        elem.pause()
        elem.srcObject = null
        elem.src = path
        elem.onloadeddata = async (e) =>{
            // @ts-ignore
            const mediaStream = elem.captureStream() as MediaStream
            audioInputDeviceSetting?.setBackgroundMusic(mediaStream)
            elem.play()
        }
    }
    const handleVolumeChange = (event: any, newValue: number | number[]) => {
        const elem = document.getElementById("bgm_panel_audio") as HTMLAudioElement
        if(typeof(newValue)==="number"){
            audioInputDeviceSetting?.setBackgroundMusicVolume(newValue)
            elem.volume=newValue
            setVolume(newValue);
        }else if(Array.isArray(newValue)){
            audioInputDeviceSetting?.setBackgroundMusicVolume(newValue[0])
            elem.volume=newValue[0]
            setVolume(newValue[0]);
        }
    };    

    return (
        <div style={{ height: '100%', width: "100%", wordWrap: "break-word", whiteSpace: "normal"}}>
            <div style={{ height: '70%', width: "100%", wordWrap: "break-word", whiteSpace: "normal",  overflow: "auto" }}>
                {ses}
            </div>
            <audio id="bgm_panel_audio" hidden/>
            
            <Typography id="continuous-slider" gutterBottom>
                Volume
            </Typography>
            <Grid container spacing={2}>
                <Grid item>
                    <VolumeDown />
                </Grid>
                <Grid item xs>
                    <Slider value={volume} onChange={handleVolumeChange} min={0} max={1} step={0.01} />
                </Grid>
                <Grid item>
                    <VolumeUp />
                </Grid>
            </Grid>
        </div>
    );
}