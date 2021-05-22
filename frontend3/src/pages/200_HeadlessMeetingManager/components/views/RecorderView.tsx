import React, { useEffect, useMemo } from "react"
import { Divider, Typography } from '@material-ui/core'
import { useAppState } from "../../../../providers/AppStateProvider";
import { VideoTileState } from "amazon-chime-sdk-js";
import { RendererForRecorder } from "../../../023_meetingRoom/components/ScreenView/helper/RendererForRecorder";
// import { VideoTileState } from "amazon-chime-sdk-js";
// import { useAppState } from "../../../../providers/AppStateProvider";
// import { RendererForRecorder } from "./helper/RendererForRecorder";

export type FocustTarget = "SharedContent" | "Speaker"

type Props = {
    width: number
    height: number
};

export const RecorderView = ({ width, height }: Props) => {

    const { videoTileStates, activeSpeakerId, meetingSession } = useAppState()
    const { sendCommand, recorder, audioInputDeviceSetting } = useAppState()

    const activeRenderer = useMemo(()=>{return new RendererForRecorder(meetingSession!)},[]) // eslint-disable-line
    const allRenderer    = useMemo(()=>{return new RendererForRecorder(meetingSession!)},[]) // eslint-disable-line
    
    /// Active Tiles
    const contentsTiles = Object.values(videoTileStates).filter(tile=>{return tile.isContent})
    const activeSpekerTile = activeSpeakerId && videoTileStates[activeSpeakerId] ? videoTileStates[activeSpeakerId] : null
    console.log("Active speaker--------------------------->", activeSpeakerId)

    const activeTiles = (contentsTiles.length > 0 ? contentsTiles : [activeSpekerTile]).filter(tile=>{return tile!==null}) as VideoTileState[]
    const activeTilesId = activeTiles.reduce<string>((sum,cur)=>{return `${sum}-${cur.boundAttendeeId}`},"")
    console.log("Active--------------------------->", activeTilesId)
    
    /// All Tiles
    const allTiles = Object.values(videoTileStates)
    const allTilesId = allTiles.reduce<string>((sum,cur)=>{return `${sum}-${cur.boundAttendeeId}`},"")


    //// (1) Setup Renderer
    //// (1-1) setup for ActiveRenderer
    useEffect(() => {
        const activeDstCanvas = document.getElementById("ActiveRecorderCanvas") as HTMLCanvasElement
        activeRenderer.init(activeDstCanvas)
        activeRenderer.start()
        return () => {
            console.log("destroy renderer", activeRenderer)
            activeRenderer.destroy()
        }
    }, []) // eslint-disable-line

    //// (1-2) setup for AllRenderer
    useEffect(() => {
        const allDstCanvas = document.getElementById("AllRecorderCanvas") as HTMLCanvasElement
        allRenderer.init(allDstCanvas)
        allRenderer.start()
        return () => {
            console.log("destroy renderer", activeRenderer)
            activeRenderer.destroy()
        }
    }, []) // eslint-disable-line


    //// (2) Set srouce video
    //// (a) bind,  (b) input into renderer
    //// (2-1) for Active Renderer
    useEffect(()=>{
        console.log("Active CHANGE!", activeTilesId)
        const videoElems = [...Array(activeTiles.length)].map((v,i)=>{return document.getElementById(`activeVideo${i}`) as HTMLVideoElement})
        // console.log(videoElems)
        activeTiles.forEach((tile,index)=>{
            if(tile.tileId){
                meetingSession?.audioVideo.bindVideoElement(tile.tileId, videoElems[index])
            }
        })
        activeRenderer.setSrcVideoElements(videoElems)
    },[activeTilesId]) // eslint-disable-line

    //// (2-2) for All Renderer
    useEffect(()=>{
        const videoElems = [...Array(allTiles.length)].map((v,i)=>{return document.getElementById(`video${i}`) as HTMLVideoElement})
        // console.log(videoElems)
        allTiles.forEach((tile,index)=>{
            if(tile.tileId){
                meetingSession?.audioVideo.bindVideoElement(tile.tileId, videoElems[index])
            }
        })
        allRenderer.setSrcVideoElements(videoElems)
    },[allTilesId]) // eslint-disable-line

    return (
        <div style={{ width: width, height: height, position:"relative" }}>

            <div style={{ width: "100%", position:"relative"}}>
                <canvas width="1920" height="1080" id="ActiveRecorderCanvas" style={{ width: "40%", border: "medium solid #ffaaaa"}} />
                <canvas width="1920" height="1080" id="AllRecorderCanvas"    style={{ width: "40%", border: "medium solid #ffaaaa"}} />
            </div>

            <div style={{ width: "100%", display:"flex", flexWrap:"wrap" }}>
                <video id="activeVideo0" style={{ width: "10%", height:"10%"}}/>
                <video id="activeVideo1" style={{ width: "10%", height:"10%"}} />
                <video id="activeVideo2" style={{ width: "10%", height:"10%"}} />

                <video id="video0" style={{ width: "10%", height:"10%"}} />
                <video id="video1" style={{ width: "10%", height:"10%"}} />
                <video id="video2" style={{ width: "10%", height:"10%"}} />
                <video id="video3" style={{ width: "10%", height:"10%"}} />
                <video id="video4" style={{ width: "10%", height:"10%"}} />
                <video id="video5" style={{ width: "10%", height:"10%"}} />
                <video id="video6" style={{ width: "10%", height:"10%"}} />
                <video id="video7" style={{ width: "10%", height:"10%"}} />
                <video id="video8" style={{ width: "10%", height:"10%"}} />
                <video id="video9" style={{ width: "10%", height:"10%"}} />
                <video id="video10" style={{ width: "10%", height:"10%"}} />
                <video id="video11" style={{ width: "10%", height:"10%"}} />
                <video id="video12" style={{ width: "10%", height:"10%"}} />
                <video id="video13" style={{ width: "10%", height:"10%"}} />
                <video id="video14" style={{ width: "10%", height:"10%"}} />
                <video id="video15" style={{ width: "10%", height:"10%"}} />
                <video id="video16" style={{ width: "10%", height:"10%"}} />
                <video id="video17" style={{ width: "10%", height:"10%"}} />
                <video id="video18" style={{ width: "10%", height:"10%"}} />
            </div>
        </div>
    )
}


