import { VideoTileState } from "amazon-chime-sdk-js";
import { useEffect, useMemo, useState } from "react";
import { useAppState } from "../../../../providers/AppStateProvider";
import { DrawingHelper } from "./helper/DrawingHelper";

type DrawableVideoTileProps = {    
    tile: VideoTileState,
    idPrefix: string, // prefix for HTMLVideoElement and HTMLCanvasElement
    idSuffix?: string, // suffix for HTMLVideoElement and HTMLCanvasElement (for feature)
    width:number,
    height:number
}

export const DrawableVideoTile = (props:DrawableVideoTileProps) =>{
    const { meetingSession, addDrawingData, drawingData, lineWidth, drawingStroke, drawingMode } = useAppState()
    const drawingHelper = useMemo(()=>{
        return new DrawingHelper(`${props.idPrefix}-canvas${props.idSuffix?"#"+props.idSuffix:""}`)
    },[]) // eslint-disable-line
    const [drawingNeedUpdate, setDrawaingNeedUpdate] = useState(0)
    drawingHelper.addDrawingData = addDrawingData
    drawingHelper.lineWidth = lineWidth
    drawingHelper.drawingStroke = drawingStroke
    drawingHelper.drawingMode = drawingMode    
    const view = useMemo(()=>{
        const videoElementId = `${props.idPrefix}-video`
        const canvasElementId = `${props.idPrefix}-canvas`
        return(
            <div style={{width:`${props.width}px`, height:`${props.height}px`}}>
                <video id={videoElementId} style={{objectFit:"contain", position:"absolute", height:props.height-2, width:props.width}}/>
                <canvas id={canvasElementId} style={{objectFit:"contain", position:"absolute", height:props.height-2, width:props.width}} />
            </div>
        )
    },[props.idPrefix, props.tile, props.width, props.height])  // eslint-disable-line


    // Bind and Fit Size
    useEffect(()=>{
        const videoElementId = `${props.idPrefix}-video`
        const videoElement = document.getElementById(videoElementId)! as HTMLVideoElement
        // Fit Canvas Size
        videoElement.onloadedmetadata = () =>{
            console.log("loaded video")
            const canvasElementId = `${props.idPrefix}-canvas`
            const canvasElement = document.getElementById(canvasElementId)! as HTMLCanvasElement
            if(!videoElement || !canvasElement){
                console.log("[DrawableVideoTile] no video element or no canvas element")
                return
            }
            canvasElement.width = videoElement.videoWidth
            canvasElement.height = videoElement.videoHeight
            setDrawaingNeedUpdate(drawingNeedUpdate+1) // above resize delete drawing.

        }
        // Bind Video
        console.log("[DrawableVideoTile] bind view")
        if(videoElement &&  props.tile.tileId){
            meetingSession?.audioVideo.bindVideoElement(props.tile.tileId, videoElement)
        }else{
            console.log("BIND FAILED", videoElementId, videoElement)
        }
    },[props.idPrefix, props.tile, props.width, props.height])  // eslint-disable-line

    // Set Drawing Listeners
    useEffect(()=>{
        console.log("[DrawableVideoTile] add listeners")
        const canvasElementId = `${props.idPrefix}-canvas`
        const canvasElement = document.getElementById(canvasElementId)! as HTMLCanvasElement
        canvasElement.addEventListener("mousedown",  drawingHelper.drawingStart, { passive: false })
        canvasElement.addEventListener("mouseup",    drawingHelper.drawingEnd,   { passive: false })
        canvasElement.addEventListener("mouseleave", drawingHelper.drawingEnd,   { passive: false })
        canvasElement.addEventListener("mousemove",  drawingHelper.drawing,      { passive: false })

        canvasElement.addEventListener("touchstart", drawingHelper.touchStart,   { passive: false })
        canvasElement.addEventListener("touchend",   drawingHelper.touchEnd,     { passive: false })
        canvasElement.addEventListener("touchmove",  drawingHelper.touchMove,    { passive: false })
    },[])  // eslint-disable-line

    // Apply Drawing Data
    useEffect(()=>{
        console.log("[DrawableVideoTile] apply DrawingData")
        const canvasElementId = `${props.idPrefix}-canvas`
        const canvasElement = document.getElementById(canvasElementId)! as HTMLCanvasElement
        const ctx = canvasElement.getContext("2d")!
        ctx.strokeStyle = drawingStroke
        ctx.lineWidth   = lineWidth
        ctx.clearRect(0,0, canvasElement.width,  canvasElement.height)
        console.log("[DrawableVideoTile] apply DrawingData----", drawingData)
        drawingData.forEach((data)=>{
            if(data.drawingCmd === "DRAW" && data.canvasId && (data.canvasId.indexOf(canvasElementId) >= 0 || canvasElementId.indexOf(data.canvasId) >= 0 )){
                ctx.beginPath();
                ctx.moveTo(data.startXR * canvasElement.width, data.startYR * canvasElement.height);
                ctx.lineTo(data.endXR   * canvasElement.width, data.endYR   * canvasElement.height);
                ctx.strokeStyle = data.stroke
                ctx.lineWidth   = data.lineWidth
                ctx.stroke();
                ctx.closePath();
            }else if(data.drawingCmd === "ERASE" && data.canvasId && (data.canvasId.indexOf(canvasElementId) >= 0 || canvasElementId.indexOf(data.canvasId) >= 0 )){
                const startX = data.startXR * canvasElement.width - (data.lineWidth/2)
                const startY = data.startYR * canvasElement.height - (data.lineWidth/2)
                ctx.clearRect(startX, startY, data.lineWidth, data.lineWidth)
            }else if(data.drawingCmd === "CLEAR"){
                ctx.clearRect(0,0, canvasElement.width,  canvasElement.height)
            }
        })

    },[props.idPrefix, props.tile, drawingData, drawingNeedUpdate])  // eslint-disable-line

    return(<>{view}</>)
}

