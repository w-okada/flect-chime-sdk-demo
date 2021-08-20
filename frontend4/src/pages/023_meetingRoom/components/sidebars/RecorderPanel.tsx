import React, { useState }  from 'react';
import { Button } from '@material-ui/core';
import { useAppState } from '../../../../providers/AppStateProvider';
import { useRecorder, useVideoComposeCanvas } from '@dannadori/flect-amazon-chime-lib';
// import { useRecorder } from '../../../../common___/recorder/useRecorder';



export const RecorderPanel = () => {
    const { chimeClient } = useAppState()

    const [ sourceVideo, setSourceVideo] = useState<HTMLCanvasElement | HTMLVideoElement | MediaStream | null>(null)

    const notifyVideoStream = (ms:MediaStream) =>{ 
        console.log("MediaStream:", ms)
        setSourceVideo(ms)
    }

    const r1 = useVideoComposeCanvas({
        chimeClient:chimeClient!,
        mode: "ALL",
        // mode: "ACTIVE",
        canvasWidth:640,
        canvasHeight:480,
        displayWidth:64,
        displayHeight:48,
        drawTitle:true,
        notifyVideoStream:notifyVideoStream,
        framerate:15,
        autoplay:false
    })

    const { started, start, stop } = useRecorder({
        sourceVideo: sourceVideo,
        chimeClient: chimeClient!,
        filename: "testfile.mp4"
    })

    const setVolume = () =>{
        const au = document.getElementById("for-speaker") as HTMLAudioElement
        console.log("VOLUME:::", au.volume)
        if(au.volume===0){
            au.volume=1
            console.log("NEW VOLUME:::", au.volume)
        }else{
            au.volume=0
            console.log("NEW VOLUME:::", au.volume)
        }
    }

    return(
        <div style={{display:"flex", flexDirection:"column"}}>
            {r1.videoComposeCanvas}
            <Button onClick={r1.toggleEnable}>aaaa</Button>
            <div>
                {started? "STARTED!!": "STOPPED"}
            </div>

            <div>
                <Button onClick={start}>start</Button>
            </div>
            <div>
                <Button onClick={stop}>stop</Button>
            </div>
            <div>
                <Button onClick={setVolume}>volu</Button>
            </div>
        </div>
    )
}