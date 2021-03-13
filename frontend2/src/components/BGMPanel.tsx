import React, { useMemo, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {  useMeetingState } from '../providers/MeetingStateProvider';
import { Button, IconButton, Slider } from '@material-ui/core';
import { PlayArrow, Stop, VolumeDown, VolumeUp } from '@material-ui/icons'
import { RS_SE } from '../resources';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            height: '100%', 
            width: "100%", 
            wordWrap: "break-word", 
            whiteSpace: "normal"
        },
        seList:{
            height: '70%', 
            width: "100%", 
            wordWrap: "break-word", 
            whiteSpace: "normal",  
            overflow: "auto"             
        },
        control:{
            height: '30%', 
            width: "100%", 
            wordWrap: "break-word", 
            whiteSpace: "normal",  
            overflow: "auto"             
        },
        margin: {
            margin: theme.spacing(1),
        },
    }),
);

export const BGMPanel = () => {
    const classes = useStyles();
    const [ isPlaying, setIsPlaying ] = useState(false)
    const { audioInputDeviceSetting } = useMeetingState()
    const [ volume, setVolume] = React.useState(30);

    const playBGM = (path:string) => {
        const elem = document.getElementById("bgm_panel_audio") as HTMLAudioElement
        elem.pause()
        elem.srcObject = null
        elem.src = path
        elem.onended = () =>{
            setIsPlaying(false)
        }
        elem.onloadeddata = async (e) =>{
            // @ts-ignore
            const mediaStream = elem.captureStream() as MediaStream
            audioInputDeviceSetting?.setBackgroundMusic(mediaStream)
            elem.play()
            setIsPlaying(true)
        }

    }

    const togglePlay = () =>{
        const elem = document.getElementById("bgm_panel_audio") as HTMLAudioElement
        elem.paused ? setIsPlaying(true):setIsPlaying(false)
        elem.paused ? elem.play() : elem.pause()
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

    const fileClicked = () =>{
        const input = document.createElement("input")
        input.type="file"
        input.onchange = () =>{
            if(!input.files){
                return
            }
            if(input.files.length >0){
                const path = URL.createObjectURL(input.files[0]);
                const fileType = input.files[0].type
                if(fileType.startsWith("audio")){
                    const elem = document.getElementById("bgm_panel_audio") as HTMLAudioElement
                    elem.src = path
                    elem.onloadeddata = () => {
                        elem.play()
                    }
                }else{
                    console.log("[App] unknwon file type", fileType)
                }
            }
        }
        input.click()
    }

    const ses = useMemo(()=>{
        return RS_SE.map(s=>{
            return <Button size="small" color="primary" className={classes.margin}  onClick={() => {
                playBGM(s)
            }}>
                {s.substr("resources/se/".length)}
            </Button>
        })
    },[])

    const controle = useMemo(()=>{
        return(
            <div className={classes.control}>
                <div style={{display:"flex"}}>
                    <VolumeDown />
                    <div className={classes.margin} />
                    <Slider value={volume} onChange={handleVolumeChange} min={0} max={1} step={0.01} />
                    <div className={classes.margin} />
                    <VolumeUp />
                </div>
                <div>
                    {isPlaying===false?
                        <IconButton aria-label="play" onClick={togglePlay}>
                            <PlayArrow />
                        </IconButton>
                        :
                        <IconButton aria-label="stop" onClick={togglePlay}>
                            <Stop />
                        </IconButton>
                    }
                </div>
                <Button onClick={fileClicked}>File</Button>
            </div>
        )
    },[volume, isPlaying])
    
    return (
        <div className={classes.root} >
            <div className={classes.seList}>
                {ses}
            </div>
            <audio id="bgm_panel_audio"/>
            <div className={classes.margin} />
            {controle}
        </div>
    );
}