// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useRef, HTMLAttributes, forwardRef, MutableRefObject } from 'react';
import { BaseSdkProps } from 'amazon-chime-sdk-component-library-react/lib/components/sdk/Base';
import { useAudioVideo, useContentShareState, VideoTile } from 'amazon-chime-sdk-component-library-react';
import styled from 'styled-components';
// import CustomVideoTile from './CustomVideoTile';
import { BaseProps } from 'amazon-chime-sdk-component-library-react/lib/components/ui/Base';
import { CustomStyledVideoTile } from './CustomStyledVideoTile';

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
    set videoRef(val: MutableRefObject<HTMLVideoElement | null>) {
        this._videoRef = val
        this._videoRef.current!.play()
    }
    set canvasRef(val: MutableRefObject<HTMLCanvasElement | null>) { this._canvasRef = val }
    set drawing(val: boolean) {
        if (this._drawing !== val) {
            this._drawing = val
            this.startDrawing()
        }
    }

    private startDrawing = () => {
        if (this._videoRef && this._canvasRef && this._videoRef.current && this._drawing) {
            try{
                this._canvasRef.current!.width = this._videoRef.current!.videoWidth
                this._canvasRef.current!.height = this._videoRef.current!.videoHeight
                this._canvasRef.current!.getContext("2d")!.drawImage(this._videoRef.current!, 0, 0, this._canvasRef.current!.width, this._canvasRef.current!.height)
                const now = performance.now()
                this._canvasRef.current!.getContext("2d")!.fillText("" + now, 100, 200)
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

        useEffect(() => {
            if (!audioVideo || !videoEl.current || !tileId) {
                return;
            }

            if (tileId) {
                const drawer = SharedContentDrawer.getInstance()
                drawer.videoRef = videoEl
                drawer.canvasRef = canvasEl
                drawer.drawing = true
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
