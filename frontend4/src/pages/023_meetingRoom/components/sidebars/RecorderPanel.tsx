import React, { useState }  from 'react';
import { Button } from '@material-ui/core';
import { useAppState } from '../../../../providers/AppStateProvider';
import { useVideoComposeCanvas, useRecorder } from '@dannadori/flect-chime-lib'


export const RecorderPanel = () => {
    const { chimeClient } = useAppState()

    const [ sourceVideo, setSourceVideo] = useState<HTMLCanvasElement | HTMLVideoElement | MediaStream | null>(null)

    const notifyVideoStream = (ms:MediaStream) =>{ 
        console.log("MediaStream:", ms)
        setSourceVideo(ms)
    }

    const r1 = useVideoComposeCanvas({
        chimeClient:chimeClient!,
        // mode: "ALL",
        mode: "ACTIVE",
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
        sourceLocalAudio: chimeClient!.audioInputDeviceSetting!.audioInputForRecord,
        sourceRemoteAudio: chimeClient!.audioOutputDeviceSetting!.outputAudioElement,
        filename: "testfile.mp4"
    })

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
        </div>
    )
}