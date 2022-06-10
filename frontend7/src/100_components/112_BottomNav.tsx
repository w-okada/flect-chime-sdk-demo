import { VideoTileState } from "amazon-chime-sdk-js";
import { lstat } from "fs/promises";
import React, { useEffect, useMemo } from "react";
import { ViewType } from "../002_hooks/011_useFrontend";
import { useAppState } from "../003_provider/AppStateProvider";

const MAX_TILES = 18;

export type BottomNavProps = {
    bottomNavTrigger: JSX.Element;
};

export const BottomNav = (props: BottomNavProps) => {
    const { chimeClientState, frontendState } = useAppState();

    const TILES_IN_CARD = 6;
    // const cardNum = useMemo(() => {
    //     return Math.ceil(Object.values(chimeClientState.videoTileStates).length / TILES_IN_CARD);
    // }, [chimeClientState.videoTileStates]);
    const cardNum = 3;
    const list = useMemo(() => {
        console.log("TILENUM : ", Object.values(chimeClientState.videoTileStates).length, chimeClientState.videoTileStates);
        return [...Array(cardNum)].map((_x, index) => {
            const tiles = [...Array(TILES_IN_CARD)].map((_x, innerIndex) => {
                const tileIndex = index * TILES_IN_CARD + innerIndex;
                if (tileIndex >= Object.values(chimeClientState.videoTileStates).length) {
                    return <React.Fragment key={`attendee-video-list-video-tile-frag-${tileIndex}`}></React.Fragment>;
                }
                return (
                    <div key={`attendee-video-list-video-tile-${tileIndex}`} className="attendee-video-list-tile-container">
                        <video controls autoPlay id={`attendee-video-list-video-tile-${tileIndex}`} className="attendee-video-list-video-tile" src="./demo.mp4" />
                        <div className="attendee-video-list-video-tile-tag" id={`attendee-video-list-video-tile-tag-${tileIndex}`}>
                            a
                        </div>
                    </div>
                );
            });
            return (
                <React.Fragment key={`attendee-video-list-video-tile-frag-${index}`}>
                    <label key={`attendee-video-list-video-tile-label-${index}`} htmlFor={`attendee-video-list-checkbox-${index}`} className="attendee-video-list-checkbox-label">
                        Page.{index}
                    </label>
                    <input key={`attendee-video-list-video-tile-input-${index}`} type="radio" className="attendee-video-list-checkbox" id={`attendee-video-list-checkbox-${index}`} name="attendee-video-list-checkbox" />
                    <div key={`attendee-video-list-video-tile-div-${index}`} className="attendee-video-list">
                        {tiles}
                    </div>
                </React.Fragment>
            );
        });
    }, [cardNum, chimeClientState.videoTileStates]);
    // 初期セレクト
    useEffect(() => {
        const firstPageCheckboxID = "attendee-video-list-checkbox-0";
        const firstPageCheckbox = document.getElementById(firstPageCheckboxID) as HTMLInputElement;
        if (firstPageCheckbox) {
            firstPageCheckbox.checked = true;
        }
    }, []);

    useEffect(() => {
        Object.values(chimeClientState.videoTileStates).forEach((x, index) => {
            const videoId = `attendee-video-list-video-tile-${index}`;
            const tagId = `attendee-video-list-video-tile-tag-${index}`;
            const videoElem = document.getElementById(videoId) as HTMLVideoElement;
            console.log("aaa", videoId, videoElem, x.tileId);
            chimeClientState.bindVideoElement(x.tileId!, videoElem);
            // const tagElem = document.getElementById(tagId) as HTMLDivElement;
            // tagElem.innerText = `${chimeClientState.attendees[x.boundAttendeeId!].attendeeName}`;
        });
    }, [chimeClientState.videoTileStates]);

    return (
        <>
            {props.bottomNavTrigger}
            <div className="bottom-nav">
                <div className="attendee-video-list-container">{list}</div>
            </div>
            <div></div>
        </>
    );
};
