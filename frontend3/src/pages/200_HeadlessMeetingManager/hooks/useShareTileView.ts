import { useEffect, useState } from "react"
import { useAppState } from "../../../providers/AppStateProvider"

type UseRecorderProps = {
    meetingName : string
}

const framerate = 8
export const useShareTileView = (props:UseRecorderProps) =>{
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
    },[startShareTileViewCounter]) // eslint-disable-line

    
    useEffect(()=>{
        console.log("STOP SHARING:::", startShareTileViewCounter, stopShareTileViewCounter)
        stopSharingTileView()
    },[stopShareTileViewCounter]) // eslint-disable-line


    return {isSharingTileView, setTileCanvas, stopSharingTileView}
}
