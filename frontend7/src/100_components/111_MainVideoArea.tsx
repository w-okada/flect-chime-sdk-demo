import { VideoTileState } from "amazon-chime-sdk-js";
import { lstat } from "fs/promises";
import React, { useEffect, useMemo } from "react";
import { ViewType } from "../002_hooks/011_useFrontend";
import { useAppState } from "../003_provider/AppStateProvider";

const MAX_TILES = 18;

export type MainVideoAreaProps = {
    bottomNavTrigger: JSX.Element;
};

export const MainVideoArea = (props: MainVideoAreaProps) => {
    const { chimeClientState, frontendState } = useAppState();
    const height = "33%";
    const width = "33%";

    const getIds = (index: number) => {
        return {
            container: `main-video-area-container-${index}`,
            video: `main-video-area-video-${index}`,
            // TagのIDはvideoエレメントのIDから辿れるようにしておく。（★１）
            tag: `main-video-area-video-${index}-tag`,
        };
    };

    const tiles = useMemo(() => {
        return [...Array(MAX_TILES)].map((x, index) => {
            const ids = getIds(index);
            return (
                <div key={ids.container} id={ids.container} style={{ position: "relative", width: width, height: height, display: "none" }}>
                    <video id={ids.video} controls autoPlay style={{ position: "absolute", objectFit: "contain", width: "100%", height: "100%" }} />
                    <div id={ids.tag} style={{ position: "absolute", background: "#333333", color: "#ffffff", bottom: 0, left: 0, marginLeft: "20px", paddingLeft: "2px", paddingRight: "2px" }}></div>
                </div>
            );
        });
    }, []);

    const calcSize = (tileNum: number) => {
        const cols = Math.ceil(Math.sqrt(tileNum));
        const rows = Math.ceil(tileNum / cols);
        const width = 100 / cols;
        const height = 100 / rows;
        return { width, height };
    };
    useEffect(() => {
        const SHOW_DEMO_NUM = 4;
        const loadDemoMovie = async () => {
            const demo = await fetch("test.mp4");
            const data = await demo.blob();
            const url = URL.createObjectURL(data);

            const { width, height } = calcSize(SHOW_DEMO_NUM);

            [...Array(MAX_TILES)].map((x, index) => {
                const ids = getIds(index);
                const div = document.getElementById(ids.container) as HTMLDivElement;
                const video = document.getElementById(ids.video) as HTMLVideoElement;
                const tag = document.getElementById(ids.tag) as HTMLDivElement;
                if (index < SHOW_DEMO_NUM) {
                    div.style.display = "block";
                    div.style.width = `${width}%`;
                    div.style.height = `${height}%`;
                    video.onloadeddata = () => {
                        video.loop = true;
                        video.play();
                    };
                    video.src = url;
                    tag.innerText = `demo ${index}`;
                } else {
                    div.style.display = "none";
                }
            });
        };
        loadDemoMovie();
    }, []);

    useEffect(() => {
        const targetTiles: VideoTileState[] = [];
        if (frontendState.viewType == ViewType.grid) {
            // Grid View
            targetTiles.push(...Object.values(chimeClientState.videoTileStates));
        } else {
            // Feature View
            //// 画面共有を検索
            const shared = Object.values(chimeClientState.videoTileStates).filter((x) => {
                return x.isContent;
            });
            targetTiles.push(...shared);
            //// 面共有がなければ、アクティブスピーカーを検索
            if (targetTiles.length == 0 && chimeClientState.activeSpeakerId) {
                if (chimeClientState.videoTileStates[chimeClientState.activeSpeakerId]) {
                    targetTiles.push(chimeClientState.videoTileStates[chimeClientState.activeSpeakerId]);
                }
            }
            //// アクティブスピーカーがいなければ、最初のビデオを表示
            if (targetTiles.length == 0) {
                if (Object.values(chimeClientState.videoTileStates).length > 0) {
                    targetTiles.push(Object.values(chimeClientState.videoTileStates)[0]);
                }
            }
        }
        const num = targetTiles.length;
        const { width, height } = calcSize(num);
        console.log("TILE:", num);

        targetTiles.forEach((x, index) => {
            const ids = getIds(index);
            const div = document.getElementById(ids.container) as HTMLDivElement;
            const video = document.getElementById(ids.video) as HTMLVideoElement;
            const tag = document.getElementById(ids.tag) as HTMLDivElement;

            chimeClientState.bindVideoElement(x.tileId!, video);
            div.style.display = "block";
            div.style.width = `${width}%`;
            div.style.height = `${height}%`;
            video.src = "";
        });

        for (let i = num; i < 18; i++) {
            const ids = getIds(i);
            const div = document.getElementById(ids.container) as HTMLDivElement;
            const video = document.getElementById(ids.video) as HTMLVideoElement;
            div.style.display = "none";
            video.src = "";
        }
    }, [chimeClientState.videoTileStates, frontendState.viewType, chimeClientState.activeSpeakerId]);

    // useEffect(() => {
    //     console.log("UPDATE TAG");
    //     Object.values(chimeClientState.videoTileStates).forEach((x) => {
    //         console.log("UPDATE TAG1");
    //         if (x.boundVideoElement) {
    //             console.log("UPDATE TAG2");
    //             x.boundVideoElement.id;
    //             const tagId = `${x.boundVideoElement.id}-tag`;
    //             const tag = document.getElementById(tagId) as HTMLDivElement;
    //             if (chimeClientState.attendees[x.boundAttendeeId!]) {
    //                 console.log("UPDATE TAG3");

    //                 tag.innerText = chimeClientState.attendees[x.boundAttendeeId!].attendeeName || "aa";
    //             }
    //         }
    //     });
    // }, [chimeClientState.attendees]);
    return (
        <>
            {props.bottomNavTrigger}
            <div className="main-video-area">
                <div style={{ display: "flex", flexWrap: "wrap", height: "100%", width: "100%" }}>{tiles}</div>
            </div>
        </>
    );
};
