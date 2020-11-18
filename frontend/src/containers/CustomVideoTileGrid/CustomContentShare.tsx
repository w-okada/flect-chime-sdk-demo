// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useRef, HTMLAttributes, forwardRef } from 'react';
import { BaseSdkProps } from 'amazon-chime-sdk-component-library-react/lib/components/sdk/Base';
import { useAudioVideo, useContentShareState, VideoTile } from 'amazon-chime-sdk-component-library-react';
import styled from 'styled-components';
// import CustomVideoTile from './CustomVideoTile';
import { BaseProps } from 'amazon-chime-sdk-component-library-react/lib/components/ui/Base';
import { CustomStyledVideoTile } from './CustomStyledVideoTile';

type ObjectFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';

export interface VideoTileProps
    extends Omit<HTMLAttributes<HTMLDivElement>, 'css'>,
    BaseProps {
    /** The name to show on the video tile */
    nameplate?: string | null;
    /** Specifies which CSS object-fit value to apply to the VideoTile so that it resizes to fit its container  */
    objectFit?: ObjectFit;
}

export const CustomVideoTile = forwardRef(
    (props: VideoTileProps, ref: React.Ref<HTMLVideoElement>) => {
        const { tag, className, nameplate, ...rest } = props;
        const canvasEl = useRef<HTMLCanvasElement | null>(null);

        const audioVideo = useAudioVideo();
        const { tileId } = useContentShareState();
        const videoEl = useRef<HTMLVideoElement | null>(null);

        console.log("--->", ref)

        useEffect(() => {

        });

        // setInterval(()=>{console.log("width^^",videoEl.current!.width)},1000)
        // setInterval(()=>{console.log("width^_^",canvasEl.current!.width)},1000)
        // setInterval(()=>{console.log("width^__^", audioVideo!.getRemoteVideoSources())},1000)
        
        useEffect(() => {
            if (!audioVideo || !videoEl.current || !tileId) {
                return;
            }


            if(tileId){
                const state = audioVideo!.getVideoTile(tileId)?.state()
                canvasEl.current!.width = state!.videoStreamContentWidth!
                canvasEl.current!.height = state!.videoStreamContentHeight!
                console.log("width^_.._^1:", state!.videoStreamContentWidth, state!.videoStreamContentHeight)
            }
                audioVideo.bindVideoElement(tileId, videoEl.current);
            // canvasEl.current!.getContext("2d")!.fillText(`${now}`, 10, 10)

            if (!canvasEl.current) {
                return;
            }
            const now = performance.now()
            canvasEl.current?.getContext("2d")?.fillText(`${now}`, 10, 10)
            console.log("-----", canvasEl.current!?.width, canvasEl.current!?.height)
                       
            return () => {
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
    const audioVideo = useAudioVideo();
    const { tileId } = useContentShareState();
    const videoEl = useRef<HTMLVideoElement | null>(null);
    const canvasEl = useRef<HTMLCanvasElement | null>(null);

    // useEffect(() => {
    //     if (!audioVideo || !videoEl.current || !tileId) {
    //         return;
    //     }

    //     audioVideo.bindVideoElement(tileId, videoEl.current);
    //     // canvasEl.current!.getContext("2d")!.fillText(`${now}`, 10, 10)
    //     return () => {
    //         const tile = audioVideo.getVideoTile(tileId);
    //         if (tile) {
    //             audioVideo.unbindVideoElement(tileId);
    //         }
    //     };
    // }, [audioVideo, tileId]);
    // console.log("------->", rest)
    // console.log("------->", className)

    // const now = performance.now()


    return tileId ? (
        <>
            <ContentTile
                objectFit="contain"
                className={className || ''}
                // {...rest}
                ref={videoEl}

            />
        </>
    ) : null;
};

export const ContentTile = styled(CustomVideoTile)`
  background-color: ${({ theme }) => theme.colors.greys.grey70};
  position: "absolute";
`;

export default CustomContentShare;
