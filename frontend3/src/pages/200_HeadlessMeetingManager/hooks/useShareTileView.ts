import { DefaultDeviceController } from "amazon-chime-sdk-js"
import { useEffect, useMemo, useState } from "react"
import { useAppState } from "../../../providers/AppStateProvider"
import { Recorder } from "../../../providers/helper/Recorder"
import { useScheduler } from "../../../providers/hooks/useScheduler"
import { getDateString } from "../../../utils"

type UseRecorderProps = {
    meetingName : string
}

const framerate = 8
export const useShareTileView = (props:UseRecorderProps) =>{
    const decodedMeetingName =  decodeURIComponent(props.meetingName!)

    const { startShareTileViewCounter, stopShareTileViewCounter, videoInputDeviceSetting } = useAppState()
    const [ tileCanvas, setTileCanvas ] = useState<HTMLCanvasElement>()
    const [ isSharingTileView, setIsSharingTileView] = useState(false)


    const startSharingTileView = async () =>{
        if(!tileCanvas){
            console.log("START SHARE TILE VIEW::: failed! canvas is null", tileCanvas)
            return 
        }
        if(isSharingTileView){
            console.log("START SHARE TILE VIEW::: failed! already sharing")
            return 
        }
    　　// @ts-ignore
        const videoStream = tileCanvas.captureStream(framerate) as MediaStream
        await videoInputDeviceSetting!.setVideoInput(videoStream)
        videoInputDeviceSetting!.startLocalVideoTile()
        setIsSharingTileView(true)
        return 
    }


    const stopSharingTileView = async () =>{
        if(!isSharingTileView){
            console.log("STOP SHARING::: failed! sharing is not started")
            return 
        }

        await videoInputDeviceSetting!.setVideoInput(null)
        videoInputDeviceSetting!.stopLocalVideoTile()
        setIsSharingTileView(false)
    }


    useEffect(()=>{
        console.log("START SHARING:::", startShareTileViewCounter, stopShareTileViewCounter)
        startSharingTileView()
    },[startShareTileViewCounter])

    
    useEffect(()=>{
        console.log("STOP SHARING:::", startShareTileViewCounter, stopShareTileViewCounter)
        stopSharingTileView()
    },[stopShareTileViewCounter])


    return {isSharingTileView, setTileCanvas, stopSharingTileView}
}
