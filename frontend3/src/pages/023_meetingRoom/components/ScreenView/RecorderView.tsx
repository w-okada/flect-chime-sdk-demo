import React, { memo, useEffect, useMemo, useState } from "react"
import { Divider, GridListTileBar, Typography } from '@material-ui/core'
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { VideoTileState } from "amazon-chime-sdk-js";
import { useAppState } from "../../../../providers/AppStateProvider";
import { RendererForRecorder } from "./helper/RendererForRecorder";

export type FocustTarget = "SharedContent" | "Speaker"

type Props = {
    width: number
    height: number
};


// interface PreviousVideoSize {
//     videoWidth: number,
//     videoHeight: number,
//     localWidth: number,
//     localHeight: number,
//     offsetX: number,
//     offsetY: number,
// }


// const RecorderCanvas = memo(props => {
//     return <canvas width="1920" height="1080" id="recorderCanvas" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
// })

export const RecorderView = ({ width, height }: Props) => {

    const { videoTileStates, activeSpeakerId, meetingSession, recorder, setRecorderCanvas } = useAppState()
    const renderer = useMemo(()=>{return new RendererForRecorder(meetingSession!)},[])
    
    const contentsTiles = Object.values(videoTileStates).filter(tile=>{return tile.isContent})
    const activeSpekerTile = activeSpeakerId && videoTileStates[activeSpeakerId] ? videoTileStates[activeSpeakerId] : null

    const targetTiles = (contentsTiles.length > 0 ? contentsTiles : [activeSpekerTile]).filter(tile=>{return tile!==null}) as VideoTileState[]
    const targetTilesId = targetTiles.reduce<string>((sum,cur)=>{return `${sum}-${cur.boundAttendeeId}`},"")

    //// setup renderer
    useEffect(() => {
        const dstCanvas = document.getElementById("recorderCanvas") as HTMLCanvasElement
        renderer.init(dstCanvas)
        renderer.start()
        return () => {
            console.log("destroy renderer", renderer)
            renderer.destroy()
        }
    }, [])

    //// setTargetTileNum
    useEffect(()=>{
        console.log("TARGET CHANGE!", targetTilesId)
        const videoElems = [...Array(targetTiles.length)].map((v,i)=>{return document.getElementById(`video${i}`) as HTMLVideoElement})        
        console.log(videoElems)
        const promises:Promise<void>[]=[]
        targetTiles.forEach((tile,index)=>{
            if(tile.tileId){
                meetingSession?.audioVideo.bindVideoElement(tile.tileId, videoElems[index])
            }
        })
        renderer.setSrcVideoElements(videoElems)
    },[targetTilesId])

    // notify recorder canvas to parent
    useEffect(() => {
        console.log("set recorder canvas")
        const dstCanvas = document.getElementById("recorderCanvas") as HTMLCanvasElement
        setRecorderCanvas(dstCanvas)
        return () => {
            console.log("remove recorder canvas")
            setRecorderCanvas(null)
        }
    }, [])

    return (
        <div style={{ width: "100%", height: height }}>

            <div style={{ width: "100%", height: "70%", objectFit: "contain", background:"#bbbbbb"}}>
                <canvas width="1920" height="1080" id="recorderCanvas" style={{ width: "100%", height: "100%", border: "medium solid #ffaaaa"}} />
            </div>

            <div style={{ width: "100%", height: "20%", objectFit: "contain" }}>
                <Divider />
                <Typography variant="body2" color="textSecondary">
                    resources
                </Typography>
                <video id="video0" style={{width:50, height:50}}/>
                <video id="video1" style={{width:50, height:50}}/>
                <video id="video2" style={{width:50, height:50}}/>
                <video id="video3" style={{width:50, height:50}}/>
                <video id="video4" style={{width:50, height:50}}/>
                <video id="video5" style={{width:50, height:50}}/>
                <video id="video6" style={{width:50, height:50}}/>
                <video id="video7" style={{width:50, height:50}}/>
                <video id="video8" style={{width:50, height:50}}/>
                <video id="video9" style={{width:50, height:50}}/>
            </div>
        </div>
    )
}


