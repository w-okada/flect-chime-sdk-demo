import React, { useMemo, useState }  from 'react';
import { Button } from '@material-ui/core';
import { useVideoComposeCanvas, useRecorder } from '@dannadori/flect-chime-lib'
import { useAppState } from '../../../providers/AppStateProvider';


export const RecorderPanel = () => {
    const { chimeClient } = useAppState()

    const [ sourceVideoAll, setSourceVideoAll] = useState<HTMLCanvasElement | HTMLVideoElement | MediaStream | null>(null)
    const [ sourceVideoActive, setSourceVideoActive] = useState<HTMLCanvasElement | HTMLVideoElement | MediaStream | null>(null)

    const notifyVideoStreamAll = (ms:MediaStream) =>{ 
        console.log("MediaStream:", ms)
        setSourceVideoAll(ms)
    }
    const notifyVideoStreamActive = (ms:MediaStream) =>{ 
        console.log("MediaStream:", ms)
        setSourceVideoActive(ms)
    }

    // const all = useVideoComposeCanvas({
    //     chimeClient:chimeClient!,
    //     mode: "ALL",
    //     canvasWidth:640,
    //     canvasHeight:480,
    //     displayWidth:64,
    //     displayHeight:48,
    //     drawTitle:true,
    //     notifyVideoStream:notifyVideoStreamAll,
    //     framerate:15,
    //     autoplay:true
    // })
    const active = useVideoComposeCanvas({
        chimeClient:chimeClient!,
        mode: "ACTIVE",
        canvasWidth:640,
        canvasHeight:480,
        displayWidth:64,
        displayHeight:48,
        drawTitle:true,
        notifyVideoStream:notifyVideoStreamActive,
        framerate:15,
        autoplay:true
    })

    // const all_rec = useRecorder({
    //     sourceVideo: sourceVideoAll,
    //     sourceLocalAudio: chimeClient!.audioInputDeviceSetting!.audioInputForRecord,
    //     sourceRemoteAudio: chimeClient!.audioOutputDeviceSetting!.outputAudioElement,
    //     filename: "testfile_all.mp4"
    // })

    const active_rec = useRecorder({
        sourceVideo: sourceVideoActive,
        sourceLocalAudio: chimeClient!.audioInputDeviceSetting!.audioInputForRecord,
        sourceRemoteAudio: chimeClient!.audioOutputDeviceSetting!.outputAudioElement,
        filename: "testfile_active.mp4"
    })

    // const view = useMemo(()=>{
    //     if(chimeClient){
    //         return(
    //             <>
    //                 <div style={{display:"flex", flexDirection:"column"}}>
    //                     <div>
    //                         a
    //                     {all.videoComposeCanvas}
    //                     </div>
    //                     <div>
    //                         b
    //                     {active.videoComposeCanvas}
    //                     </div>

    //                     <div>
    //                         ALL:{all_rec.started ? "STARTED!!": "STOPPED"}
    //                     </div>
    //                     <div>
    //                         Active:{active_rec.started ? "STARTED!!": "STOPPED"}
    //                     </div>
    //                 </div>
    //             </>
    //         )
    //     }else{
    //         return(
    //             <>
    //             waiting
    //             </>
    //         )

    //     }

    // },[chimeClient])

    const view = (()=>{
        if(chimeClient){
            return(
                <>
                    <div style={{display:"flex", flexDirection:"column"}}>
                        <div>
                            a
                        {/* {all.videoComposeCanvas} */}
                        </div>
                        <div>
                            b
                        {active.videoComposeCanvas}
                        </div>

                        <div>
                            {/* ALL:{all_rec.started ? "STARTED!!": "STOPPED"} */}
                        </div>
                        <div>
                            Active:{active_rec.started ? "STARTED!!": "STOPPED"}
                        </div>
                    </div>
                </>
            )
        }else{
            return(
                <>
                waiting
                </>
            )

        }
    })()

    return(
        <>
        {view}
        </>
    )
}