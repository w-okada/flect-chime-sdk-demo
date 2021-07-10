import { ConsoleLogger, VideoTileState } from "amazon-chime-sdk-js";
import { useEffect, useMemo, useState } from "react";
import { FlectChimeClient } from "../../chime/FlectChimeClient";
import { DrawingHelper } from "./DrawingHelper";
import { DrawingData, WebSocketWhiteboardClient } from "./WebSocketWhiteboardClient";

type DrawableVideoTileProps = {    
    chimeClient: FlectChimeClient
    whiteboardClient: WebSocketWhiteboardClient,

    tile: VideoTileState,
    idPrefix: string, // prefix for HTMLVideoElement and HTMLCanvasElement
    idSuffix?: string, // suffix for HTMLVideoElement and HTMLCanvasElement (for feature)
    width:number,
    height:number,
}

export const DrawableVideoTile: React.FC<DrawableVideoTileProps> = (props:DrawableVideoTileProps) =>{
    console.log("DRAWABLE")
    const [ updateCount, setUpdateCount ] = useState(0)
    const drawingHelper = useMemo(()=>{
        return new DrawingHelper(
            `${props.idPrefix}-canvas${props.idSuffix?"#"+props.idSuffix:""}`, // This id is unique in whiteboard app. to idetify one tile from multiple ones.
            props.whiteboardClient,
        )
    },[]) // eslint-disable-line


    const [drawingNeedUpdate, setDrawaingNeedUpdate] = useState(0)
    const videoElementId = `${props.idPrefix}-video`
    const canvasElementId = `${props.idPrefix}-canvas`
    const view = useMemo(()=>{
        return(
            <div style={{width:`${props.width}px`, height:`${props.height}px`}}>
                <video id={videoElementId} style={{objectFit:"contain", position:"absolute", height:props.height-2, width:props.width}}/>
                <canvas id={canvasElementId} style={{objectFit:"contain", position:"absolute", height:props.height-2, width:props.width}} />
            </div>
        )
    },[props.idPrefix, props.tile, props.width, props.height])  // eslint-disable-line


    useEffect(()=>{
        const updateWhiteboardData = (data: DrawingData[]) =>{
            setUpdateCount(updateCount+1)
        }
        props.whiteboardClient.addWhiteboardDataUpdateListener(updateWhiteboardData)
        return ()=>{props.whiteboardClient.removeWhiteboardDataUpdateListener(updateWhiteboardData)}
    })

    // Bind and Fit Size
    useEffect(()=>{
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
            props.chimeClient!.meetingSession?.audioVideo.bindVideoElement(props.tile.tileId, videoElement)
        }else{
            console.log("BIND FAILED", videoElementId, videoElement)
        }
    },[props.idPrefix, props.tile, props.width, props.height])  // eslint-disable-line

    // Set Drawing Listeners
    useEffect(()=>{
        console.log("[DrawableVideoTile] add listeners")
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
        const canvasElement = document.getElementById(canvasElementId)! as HTMLCanvasElement
        const ctx = canvasElement.getContext("2d")!
        // ctx.strokeStyle = drawingStroke
        // ctx.lineWidth   = lineWidth
        ctx.clearRect(0,0, canvasElement.width,  canvasElement.height)
        console.log("[DrawableVideoTile] apply DrawingData----", props.whiteboardClient.drawingData)
        props.whiteboardClient.drawingData.forEach((data)=>{
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

    },[props.idPrefix, props.tile, props.whiteboardClient.drawingData, drawingNeedUpdate])  // eslint-disable-line

    return(<>{view}</>)
}

