import React, { useEffect, useMemo, useState } from 'react';
import { useAppState } from '../../../providers/AppStateProvider';
import { useVideoComposeCanvas } from '../../../common/components/useVideoComposeCanvas';
import { useRecorder } from '../../../common/recorder/useRecorder';
import { useStatusMonitor } from './hooks/useStatusMonitor';

const sleep = async(ms:number)=>{
    const p = new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
    await p
}

const getDateString = () => {
    const date = new Date()
    const Y = date.getFullYear()
    const M = ("00" + (date.getMonth()+1)).slice(-2)
    const D = ("00" + date.getDate()).slice(-2)
    const h = ("00" + date.getHours()).slice(-2)
    const m = ("00" + date.getMinutes()).slice(-2)
    const s = ("00" + date.getSeconds()).slice(-2)
  
    return Y + M + D + h + m + s
}


export const RecorderPanel = () => {

    const [sourceVideoAll, setSourceVideoAll] = useState<MediaStream | null>(null)
    const [sourceVideoActive, setSourceVideoActive] = useState<MediaStream | null>(null)
    const { chimeClient,
        startRecordRequestCounter, stopRecordRequestCounter,
        startShareTileviewRequestCounter, stopShareTileviewRequestCounter,
        terminateHMMRequestCounter
    } = useAppState()
    const { meetingActive } = useStatusMonitor()
    const notifyVideoStreamAll = (ms: MediaStream) => {
        console.log("MediaStream:", ms)
        setSourceVideoAll(ms)
    }
    const notifyVideoStreamActive = (ms: MediaStream) => {
        console.log("MediaStream:", ms)
        setSourceVideoActive(ms)
    }


    ////// (A) Resources /////
    const all = useVideoComposeCanvas({
        chimeClient: chimeClient!,
        mode: "EXCLUDE_ME",
        canvasWidth: 640,
        canvasHeight: 480,
        displayWidth: 64,
        displayHeight: 48,
        drawTitle: true,
        notifyVideoStream: notifyVideoStreamAll,
        framerate: 15,
        autoplay: true
    })
    const active = useVideoComposeCanvas({
        chimeClient: chimeClient!,
        mode: "ACTIVE",
        canvasWidth: 640,
        canvasHeight: 480,
        displayWidth: 64,
        displayHeight: 48,
        drawTitle: true,
        notifyVideoStream: notifyVideoStreamActive,
        framerate: 15,
        autoplay: true
    })

    const all_rec = useRecorder({
        sourceVideo: sourceVideoAll,
        chimeClient: chimeClient!,
        filename: `${getDateString()}_${chimeClient?.meetingName}_all.mp4`
    })

    const active_rec = useRecorder({
        sourceVideo: sourceVideoActive,
        chimeClient: chimeClient!,
        filename: `${getDateString()}_${chimeClient?.meetingName}_active.mp4`
    })


    ////// (B) Event Listener /////
    ////// (B-1) recorder
    useEffect(() => {
        all_rec.start()
        active_rec.start()
    }, [startRecordRequestCounter]) // eslint-disable-line
    useEffect(() => {
        all_rec.stop()
        active_rec.stop()
    }, [stopRecordRequestCounter]) // eslint-disable-line

    ////// (B-2) tileview
    useEffect(() => {
        console.log("received start share1")
        if (sourceVideoAll) {
            console.log("received start share2")
            chimeClient?.startShareContent(all.captureStream())
            // chimeClient?.meetingSession?.audioVideo.chooseVideoInputDevice(all.captureStream()).then(()=>{
            //     chimeClient?.meetingSession?.audioVideo.startLocalVideoTile()
            // })
        }
    }, [startShareTileviewRequestCounter]) // eslint-disable-line
    useEffect(() => {
        chimeClient?.stopShareContent()
        // chimeClient?.meetingSession?.audioVideo.chooseVideoInputDevice(null).then(()=>{
        //     chimeClient?.meetingSession?.audioVideo.stopLocalVideoTile()
        // })
    }, [stopShareTileviewRequestCounter]) // eslint-disable-line


    ////// (B-3) finalize
    const finalizeMeeting = async() =>{
        // Stop Recording
        all_rec.stop()
        active_rec.stop()
        const max = 5
        const sleepTime = 1000 * 5
        for(let i = 0; i < max; i++){
            console.log(`[RecorderPanel] finalizing. sleep... for recording ${i}/${max}, interval:${sleepTime}ms`)
            await sleep(sleepTime)
        }
        // Notify puppetier
        const event = new CustomEvent('terminate');
        document.dispatchEvent(event)
        chimeClient!.hmmClient!.sendHMMStatus({
            active:false,
            recording:false,
            shareTileView:false,
        })
    }

    useEffect(()=>{
        if(meetingActive===false){
            finalizeMeeting()
        }
    },[meetingActive]) // eslint-disable-line
    useEffect(()=>{
        if(terminateHMMRequestCounter > 0){
            finalizeMeeting()
        }
    },[terminateHMMRequestCounter]) // eslint-disable-line



    ////// (X) View /////
    const allTileIds = chimeClient!.getTilesWithFilter(false, false, true).reduce((pre, cur) => { return `${pre}_${cur.boundAttendeeId}` }, "")
    const activeSpeakerId = chimeClient!.getActiveSpeakerTile()?.boundAttendeeId

    const view = useMemo(() => {
        active.update()
        all.update()
        if (chimeClient) {
            return (
                <>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <div>
                            all
                        {all.videoComposeCanvas}
                        </div>
                        <div>
                            active
                        {active.videoComposeCanvas}
                        </div>

                        <div>
                            ALL:{all_rec.started ? "STARTED!!" : "STOPPED"}
                        </div>
                        <div>
                            Active:{active_rec.started ? "STARTED!!" : "STOPPED"}
                        </div>
                    </div>
                </>
            )
        } else {
            return (
                <>
                    waiting
                </>
            )

        }

    }, [chimeClient, allTileIds, activeSpeakerId]) // eslint-disable-line


    return (
        <>
            {view}
        </>
    )
}