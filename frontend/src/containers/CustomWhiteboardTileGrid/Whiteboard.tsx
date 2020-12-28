// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useRef, HTMLAttributes, MutableRefObject, useState, FC } from 'react';
import { BaseSdkProps } from 'amazon-chime-sdk-component-library-react/lib/components/sdk/Base';
import { useAudioVideo, useContentShareState } from 'amazon-chime-sdk-component-library-react';
import styled from 'styled-components';
import { BaseProps } from 'amazon-chime-sdk-component-library-react/lib/components/ui/Base';
import { CustomStyledVideoTile } from './CustomStyledVideoTile';
import { DrawingData, useWebSocketWhiteboardState } from '../../providers/WebScoketWhiteboardProvider';
// import { useRealitimeSubscribeWhiteboardState, DrawingData } from '../../providers/RealtimeSubscribeWhiteboardProvider';

type ObjectFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
const THROTTLE_MSEC = 20

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
    private _drawingDatas: DrawingData[] = []
    set videoRef(val: MutableRefObject<HTMLVideoElement | null>) {
        this._videoRef = val
        this._videoRef.current!.play()
    }
    set canvasRef(val: MutableRefObject<HTMLCanvasElement | null>) {
        this._canvasRef = val
    }
    set drawing(val: boolean) {
        if (this._drawing !== val) {
            this._drawing = val
            this.startDrawing()
        }
    }

    set drawingDatas(val: DrawingData[]) {
        this._drawingDatas = val
    }

    private startDrawing = () => {
        if (this._videoRef && this._canvasRef && this._videoRef.current && this._drawing) {
            try {
                this._canvasRef.current!.width = this._videoRef.current!.videoWidth
                this._canvasRef.current!.height = this._videoRef.current!.videoHeight
                this._canvasRef.current!.getContext("2d")!.drawImage(this._videoRef.current!, 0, 0, this._canvasRef.current!.width, this._canvasRef.current!.height)

                for (let drawing of this._drawingDatas) {
                    const ctx = this._canvasRef.current!.getContext("2d")!
                    if (drawing.drawingCmd === "DRAW") {
                        ctx.beginPath();
                        ctx.moveTo(drawing.startXR * this._canvasRef.current!.width, drawing.startYR * this._canvasRef.current!.height);
                        ctx.lineTo(drawing.endXR * this._canvasRef.current!.width, drawing.endYR * this._canvasRef.current!.height);
                        ctx.strokeStyle = drawing.stroke
                        ctx.lineWidth = drawing.lineWidth
                        ctx.stroke();
                        ctx.closePath();
                    } else {
                        const width = drawing.lineWidth
                        ctx.clearRect(drawing.startXR * this._canvasRef.current!.width - width, drawing.startYR * this._canvasRef.current!.height - width, width * 2, width * 2)
                        ctx.clearRect(drawing.endXR * this._canvasRef.current!.width - width, drawing.endYR * this._canvasRef.current!.height - width, width * 2, width * 2);
                    }
                }

            } catch (exception) {
                console.log(exception)
            }
            requestAnimationFrame(this.startDrawing)
        }
    }

}

export interface VideoTileProps extends Omit<HTMLAttributes<HTMLDivElement>, 'css'>,
    BaseProps {
    nameplate?: string | null;
    objectFit?: ObjectFit;
}


export const Page: FC<VideoTileProps> = (props: VideoTileProps) => {
    const { tag, className, nameplate, ...rest } = props;
    const audioVideo = useAudioVideo();
    const { tileId } = useContentShareState();
    const canvasEl = useRef<HTMLCanvasElement | null>(null);
    const videoEl = useRef<HTMLVideoElement | null>(null);

    const [inDrawing, setInDrawing] = useState(false)
    const [previousPosition, setPreviousPosition] = useState([0, 0])
    const [lastSendingTime, setLastSendingTime] = useState(Date.now())
    // const {sendDrawingData, drawingDatas, drawingMode, drawingStroke} = useRealitimeSubscribeWhiteboardState()
    const { sendDrawingData, drawingDatas, drawingMode, drawingStroke } = useWebSocketWhiteboardState()


    const drawer = SharedContentDrawer.getInstance()
    console.log("CustomVideoTile rendering!")
    drawer.drawingDatas = drawingDatas
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

    const drawingStart = (e: MouseEvent) => {
        setInDrawing(true)
        setPreviousPosition([e.offsetX, e.offsetY])
    }
    const drawingEnd = (e: MouseEvent) => { setInDrawing(false) }
    const drawing = (e: MouseEvent) => {
        if (Date.now() - lastSendingTime < THROTTLE_MSEC) {
            return
        }
        if (inDrawing) {
            const startX = previousPosition[0]
            const startY = previousPosition[1]
            const endX = e.offsetX
            const endY = e.offsetY
            const drawingData = generateDrawingData(startX, startY, endX, endY)
            setLastSendingTime(Date.now())
            setPreviousPosition([e.offsetX, e.offsetY])
            sendDrawingData(drawingData)
        }
    }

    const generateDrawingData = (startX: number, startY: number, endX: number, endY: number) => {
        const cs = getComputedStyle(canvasEl.current!)
        const width = parseInt(cs.getPropertyValue("width"))
        const height = parseInt(cs.getPropertyValue("height"))
        const rateX = width / canvasEl.current!.width
        const rateY = height / canvasEl.current!.height

        const drawingData = (() => {
            if (rateX > rateY) { //  widthにあまりがある。
                const trueWidth = canvasEl.current!.width * rateY
                const trueHeight = canvasEl.current!.height * rateY
                const restW = (width - trueWidth) / 2

                const startXR = (startX - restW) / trueWidth
                const startYR = startY / trueHeight
                const endXR = (endX - restW) / trueWidth
                const endYR = endY / trueHeight
                const drawingData: DrawingData = {
                    drawingCmd: drawingMode === "DRAW" ? "DRAW" : "ERASE",
                    startXR: startXR,
                    startYR: startYR,
                    endXR: endXR,
                    endYR: endYR,
                    stroke: drawingStroke,
                    lineWidth: 2
                }
                return drawingData
            } else { // heightにあまりがある
                const trueWidth = canvasEl.current!.width * rateX
                const trueHeight = canvasEl.current!.height * rateX
                const restH = (height - trueHeight) / 2

                const startXR = startX / trueWidth
                const startYR = (startY - restH) / trueHeight
                const endXR = endX / trueWidth
                const endYR = (endY - restH) / trueHeight
                const drawingData: DrawingData = {
                    drawingCmd: drawingMode === "DRAW" ? "DRAW" : "ERASE",
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
        return drawingData
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
        if (Date.now() - lastSendingTime < THROTTLE_MSEC) {
            return
        }

        if (inDrawing) {
            const startX = previousPosition[0]
            const startY = previousPosition[1]
            const endX = e.changedTouches[0].clientX - canvasEl.current!.getBoundingClientRect().left
            const endY = e.changedTouches[0].clientY - canvasEl.current!.getBoundingClientRect().top
            const drawingData = generateDrawingData(startX, startY, endX, endY)
            sendDrawingData(drawingData)
            setPreviousPosition([endX, endY])
            setLastSendingTime(Date.now())
        }
    }

    useEffect(() => {
        if (!canvasEl.current) {
            return
        }
        canvasEl.current!.addEventListener("mousedown", drawingStart, { passive: false })
        canvasEl.current!.addEventListener("mouseup", drawingEnd, { passive: false })
        canvasEl.current!.addEventListener("mouseleave", drawingEnd, { passive: false })
        canvasEl.current!.addEventListener("mousemove", drawing, { passive: false })

        canvasEl.current!.addEventListener("touchstart", touchStart, { passive: false })
        canvasEl.current!.addEventListener("touchend", touchEnd, { passive: false })
        canvasEl.current!.addEventListener("touchmove", touchMove, { passive: false })

        return () => {
            if (canvasEl.current) {
                canvasEl.current!.removeEventListener("mousedown", drawingStart)
                canvasEl.current!.removeEventListener("mouseup", drawingEnd)
                canvasEl.current!.removeEventListener("mouseleave", drawingEnd)
                canvasEl.current!.removeEventListener("mousemove", drawing)

                canvasEl.current!.removeEventListener("touchstart", touchStart)
                canvasEl.current!.removeEventListener("touchend", touchEnd)
                canvasEl.current!.removeEventListener("touchmove", touchMove)

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


interface Props extends BaseSdkProps { }

export const Whiteboard: React.FC<Props> = ({ className, ...rest }) => {
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

export const ContentTile = styled(Page)`
  background-color: ${({ theme }) => theme.colors.greys.grey70};
  position: "absolute";
`;

export default Whiteboard;
