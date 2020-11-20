// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useRef, HTMLAttributes, forwardRef, MutableRefObject, useState } from 'react';
import { BaseSdkProps } from 'amazon-chime-sdk-component-library-react/lib/components/sdk/Base';
import { useAudioVideo, useContentShareState, VideoTile } from 'amazon-chime-sdk-component-library-react';
import styled from 'styled-components';
// import CustomVideoTile from './CustomVideoTile';
import { BaseProps } from 'amazon-chime-sdk-component-library-react/lib/components/ui/Base';
import { CustomStyledVideoTile } from './CustomStyledVideoTile';
import { useRealitimeSubscribeState, DrawingData, RealtimeData } from '../../providers/RealtimeSubscribeProvider';

type ObjectFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';


class SharedContentDrawer {

    private static _instance: SharedContentDrawer
    public static getInstance(): SharedContentDrawer {
        if (!this._instance) {
            this._instance = new SharedContentDrawer()
        }
        return this._instance
    }

    private _videoRef: MutableRefObject<HTMLVideoElement | null> | null = null
    private _canvasRef: MutableRefObject<HTMLCanvasElement | null> | null = null
    private _drawing: boolean = false
    private _whiteboardData: RealtimeData[] = []
    set videoRef(val: MutableRefObject<HTMLVideoElement | null>) {
        this._videoRef = val
        this._videoRef.current!.play()
    }
    set canvasRef(val: MutableRefObject<HTMLCanvasElement | null>) { 
        this._canvasRef = val 
        // this._canvasRef.current!.addEventListener("mousedown",  this.drawingStart, { passive: false })
        // this._canvasRef.current!.addEventListener("mouseup",    this.drawingEnd,   { passive: false })
        // this._canvasRef.current!.addEventListener("mouseleave", this.drawingEnd,   { passive: false })
        // this._canvasRef.current!.addEventListener("mousemove",  this.drawingDraw,      { passive: false })         
    
    }
    set drawing(val: boolean) {
        if (this._drawing !== val) {
            this._drawing = val
            this.startDrawing()
        }
    }

    set whiteboardData(val:RealtimeData[]){this._whiteboardData=val}
    // inDrawing = false


//     drawingStart = (e: MouseEvent) => {this.inDrawing = true}
//     drawingEnd = (e: MouseEvent) => {this.inDrawing = false}
//     drawingDraw = (e: MouseEvent) => {
// //            if(inDrawing && this.state.inDrawingMode && this.state.enableDrawing){
//         if(this.inDrawing){
            
//             const startX = e.offsetX - e.movementX
//             const startY = e.offsetY - e.movementY

//             const cs = getComputedStyle(this._canvasRef!.current!)
//             console.log("CS:",cs)
//             const width = cs.getPropertyValue("width")
//             const height = cs.getPropertyValue("height")
            
//             const startXR = startX  / this._canvasRef!.current!.width!
//             const startYR = startY  / this._canvasRef!.current!.height!
//             const endXR   = e.offsetX / this._canvasRef!.current!.width!
//             const endYR   = e.offsetY / this._canvasRef!.current!.height!
//             console.log(startXR, startYR, endXR, endYR, "  1111 ", this._canvasRef!.current!.width, this._canvasRef!.current!.height, width, height)
//             //console.log("CS: ",cs)
//         }
//     }    

    private startDrawing = () => {
        if (this._videoRef && this._canvasRef && this._videoRef.current && this._drawing) {
            try{
                this._canvasRef.current!.width = this._videoRef.current!.videoWidth
                this._canvasRef.current!.height = this._videoRef.current!.videoHeight
                this._canvasRef.current!.getContext("2d")!.drawImage(this._videoRef.current!, 0, 0, this._canvasRef.current!.width, this._canvasRef.current!.height)

                for(let data of this._whiteboardData){
                    const drawing = data.data as DrawingData
                    const ctx = this._canvasRef.current!.getContext("2d")!
                    if(drawing.drawingCmd === "DRAW"){
                        ctx.beginPath();
                        ctx.moveTo(drawing.startXR * this._canvasRef.current!.width, drawing.startYR*this._canvasRef.current!.height);
                        ctx.lineTo(drawing.endXR*this._canvasRef.current!.width, drawing.endYR*this._canvasRef.current!.height);
                        ctx.strokeStyle = drawing.stroke
                        ctx.lineWidth = drawing.lineWidth
                        ctx.stroke();
                        ctx.closePath();
                    }else{
                        const width = drawing.lineWidth
                        ctx.clearRect(drawing.startXR*this._canvasRef.current!.width-width, drawing.startYR*this._canvasRef.current!.height-width, width*2, width*2)
                        ctx.clearRect(drawing.endXR*this._canvasRef.current!.width-width, drawing.endYR*this._canvasRef.current!.height-width, width*2, width*2);
                    }
                }

            }catch(exception){
                console.log(exception)
            }
            requestAnimationFrame(this.startDrawing)
        }
    }

}

export interface VideoTileProps
    extends Omit<HTMLAttributes<HTMLDivElement>, 'css'>,
    BaseProps {
    nameplate?: string | null;
    objectFit?: ObjectFit;
}

export const CustomVideoTile = forwardRef(
    (props: VideoTileProps, ref: React.Ref<HTMLVideoElement>) => {
        const { tag, className, nameplate, ...rest } = props;
        const audioVideo = useAudioVideo();
        const { tileId } = useContentShareState();
        const canvasEl = useRef<HTMLCanvasElement | null>(null);
        const videoEl = useRef<HTMLVideoElement | null>(null);

        const [inDrawing, setInDrawing] = useState(false)
        const [previousPosition, setPreviousPosition] = useState([0,0])
        const {sendWhiteBoardData, whiteboardData, drawingMode, drawingStroke} = useRealitimeSubscribeState()

        const drawer = SharedContentDrawer.getInstance()
        drawer.whiteboardData = whiteboardData
        useEffect(() => {
            if (!audioVideo || !videoEl.current || !tileId) {
                return;
            }

            if (tileId) {
                const drawer = SharedContentDrawer.getInstance()
                drawer.videoRef = videoEl
                drawer.canvasRef = canvasEl
                drawer.drawing = true
                canvasEl.current!.width = videoEl.current!.videoWidth
                canvasEl.current!.height = videoEl.current!.videoHeight
                console.log(">>>>>>>>>>>>>>>>>>>>", canvasEl.current!.width, canvasEl.current!.height)
            }
            audioVideo.bindVideoElement(tileId, videoEl.current);
            return () => {
                const drawer = SharedContentDrawer.getInstance()
                drawer.drawing = false
                const tile = audioVideo.getVideoTile(tileId);
                if (tile) {
                    audioVideo.unbindVideoElement(tileId);
                }
            };
        }, [audioVideo, tileId]);

        const drawingStart = (e: MouseEvent) => {setInDrawing(true)}
        const drawingEnd = (e: MouseEvent) => {setInDrawing(false)}
        const drawing = (e: MouseEvent) => {
//            if(inDrawing && this.state.inDrawingMode && this.state.enableDrawing){
            if(inDrawing){

                const cs = getComputedStyle(canvasEl.current!)
                const width = parseInt(cs.getPropertyValue("width"))
                const height = parseInt(cs.getPropertyValue("height"))

                const rateX = width / canvasEl.current!.width
                const rateY = height / canvasEl.current!.height
                const drawingData = (()=>{
                    if(rateX > rateY){ //  widthにあまりがある。
                        const trueWidth = canvasEl.current!.width * rateY
                        const trueHeight = canvasEl.current!.height * rateY
                        const restW = (width - trueWidth) / 2
                        const startX = e.offsetX - restW - e.movementX
                        const startY = e.offsetY - e.movementY
    
                        const startXR = startX / trueWidth
                        const startYR = startY / trueHeight
                        const endXR   = (e.offsetX - restW) / trueWidth
                        const endYR   = e.offsetY / trueHeight
                        const drawingData:DrawingData = {
                            drawingCmd: drawingMode==="DRAW" ? "DRAW" : "ERASE",
                            startXR: startXR,
                            startYR: startYR,
                            endXR: endXR,
                            endYR: endYR,
                            stroke: drawingStroke,
                            lineWidth: 2
                        }
                        return drawingData
                    }else{ // heightにあまりがある
                        const trueWidth = canvasEl.current!.width * rateY
                        const trueHeight = canvasEl.current!.height * rateY
                        const restH = (height - trueHeight) / 2
                        const startX = e.offsetX - e.movementX
                        const startY = e.offsetY - restH - e.movementY
    
                        const startXR = startX / trueWidth
                        const startYR = startY / trueHeight
                        const endXR   = e.offsetX / trueWidth
                        const endYR   = (e.offsetY - restH) / trueHeight
                        const drawingData:DrawingData = {
                            drawingCmd: drawingMode==="DRAW" ? "DRAW" : "ERASE",
                            startXR: startXR,
                            startYR: startYR,
                            endXR: endXR,
                            endYR: endYR,
                            stroke: drawingStroke,
                            lineWidth: 2
                        }
                        return drawingData
                    }
                })()
                sendWhiteBoardData(drawingData)
                //console.log("CS: ",cs)
            }
        }

        const touchStart = (e: TouchEvent) => {
            setInDrawing(true)
            const x = e.changedTouches[0].clientX - canvasEl.current!.getBoundingClientRect().left
            const y = e.changedTouches[0].clientY - canvasEl.current!.getBoundingClientRect().top
            setPreviousPosition([x, y])
        }
        const touchEnd = (e: TouchEvent) => {
            setInDrawing(false)
        }
        const touchMove = (e: TouchEvent) => {
            e.preventDefault(); 
            const prevX = previousPosition[0]
            const prevY = previousPosition[1]
            const thisTimeX = e.changedTouches[0].clientX - canvasEl.current!.getBoundingClientRect().left
            const thisTimeY = e.changedTouches[0].clientY - canvasEl.current!.getBoundingClientRect().top
            console.log(prevX, prevY, thisTimeX, thisTimeY)
        }

        useEffect(()=>{
            if(!canvasEl.current){
                return
            }
            console.log("ADD EVENT LISTENER")
            canvasEl.current!.addEventListener("mousedown",  drawingStart, { passive: false })
            canvasEl.current!.addEventListener("mouseup",    drawingEnd,   { passive: false })
            canvasEl.current!.addEventListener("mouseleave", drawingEnd,   { passive: false })
            canvasEl.current!.addEventListener("mousemove",  drawing,      { passive: false }) 

            canvasEl.current!.addEventListener("touchstart", touchStart, { passive: false })
            canvasEl.current!.addEventListener("touchend",   touchEnd,   { passive: false })
            canvasEl.current!.addEventListener("touchmove",  touchMove,  { passive: false })

            return ()=>{
                if(canvasEl.current){
                    canvasEl.current!.removeEventListener("mousedown",  drawingStart)
                    canvasEl.current!.removeEventListener("mouseup",    drawingEnd)
                    canvasEl.current!.removeEventListener("mouseleave", drawingEnd)
                    canvasEl.current!.removeEventListener("mousemove",  drawing)

                    canvasEl.current!.removeEventListener("touchstart", touchStart)
                    canvasEl.current!.removeEventListener("touchend",   touchEnd)
                    canvasEl.current!.removeEventListener("touchmove",  touchMove)

                }
            }
        })



        return (
            <CustomStyledVideoTile
                as={tag}
                className={className || ''}
                data-testid="video-tile"
                {...rest}
            >
                <video ref={videoEl} className="ch-video" /> 
                <canvas ref={canvasEl} />
                {nameplate && (
                    <header className="ch-nameplate">
                        <p className="ch-text">{nameplate}</p>
                    </header>
                )}
            </CustomStyledVideoTile>
        );
    }
);

interface Props extends BaseSdkProps { }

export const CustomContentShare: React.FC<Props> = ({ className, ...rest }) => {
    const { tileId } = useContentShareState();

    return tileId ? (
        <>
            <ContentTile
                objectFit="contain"
                className={className || ''}
                {...rest}
            />
        </>
    ) : null;
};

export const ContentTile = styled(CustomVideoTile)`
  background-color: ${({ theme }) => theme.colors.greys.grey70};
  position: "absolute";
`;

export default CustomContentShare;
