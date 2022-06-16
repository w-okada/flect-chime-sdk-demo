import { VideoTileState } from "amazon-chime-sdk-js";
import React, { useEffect, useMemo } from "react";
import { ViewTypes } from "../002_hooks/011_useFrontend";
import { useAppState } from "../003_provider/AppStateProvider";

const MAX_TILES = 18;

export type MainVideoAreaProps = {};

export const MainVideoArea = (props: MainVideoAreaProps) => {
    const { chimeClientState, frontendState } = useAppState();
    const height = "33%";
    const width = "33%";

    // (1) Util Functions
    //// (1-1) DOM ID生成
    const getIds = (index: number) => {
        return {
            container: `main-video-area-container-${index}`,
            video: `main-video-area-video-${index}`,
            tag: `main-video-area-video-tag-${index}`,
        };
    };
    //// (1-2) 表示するタイル数に応じたサイズを算出
    const calcSize = (tileNum: number) => {
        const cols = Math.ceil(Math.sqrt(tileNum));
        const rows = Math.ceil(tileNum / cols);
        const width = 100 / cols;
        const height = 100 / rows;
        return { width, height };
    };

    // (2) Rendering Phase.
    // DOMの生成に加えレンダリングフェーズでバインド対象のタイル情報を生成しておく
    //// (2-1) タイル生成用ビデオコンポーネントを最大数分作成しておく。
    const tileComponents = useMemo(() => {
        return [...Array(MAX_TILES)].map((x, index) => {
            const ids = getIds(index);
            return (
                <div key={ids.container} id={ids.container} style={{ position: "relative", width: width, height: height, display: "none" }}>
                    <video id={ids.video} autoPlay style={{ position: "absolute", objectFit: "contain", width: "100%", height: "100%" }} />
                    <div id={ids.tag} style={{ position: "absolute", background: "#333333", color: "#ffffff", bottom: 0, left: 0, marginLeft: "20px", paddingLeft: "2px", paddingRight: "2px" }}></div>
                </div>
            );
        });
    }, []);
    //// (2-2) 表示対象タイルの決定
    const targetTiles = useMemo(() => {
        const targetTiles: VideoTileState[] = [];
        if (frontendState.viewType == ViewTypes.grid) {
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
                    //// 自分がアクティブでなければ表示
                    if (!chimeClientState.videoTileStates[chimeClientState.activeSpeakerId].localTile) {
                        targetTiles.push(chimeClientState.videoTileStates[chimeClientState.activeSpeakerId]);
                    }
                }
            }
            //// アクティブスピーカーがいなければ、自分以外の最初のビデオを表示
            if (targetTiles.length == 0) {
                const firstOtherVideo = Object.values(chimeClientState.videoTileStates).find((x) => {
                    return x.localTile === false;
                });
                if (firstOtherVideo) {
                    targetTiles.push(firstOtherVideo);
                }
            }
        }
        return targetTiles;
    }, [chimeClientState.videoTileStates, frontendState.viewType, chimeClientState.activeSpeakerId]);

    // (3) Commit Phase.
    //// (3-1) Demo用のバインド処理
    useEffect(() => {
        const SHOW_DEMO_NUM = 4;
        const loadDemoMovie = async () => {
            const demo = await fetch("demo.mp4");
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

    //// (3-2) タイルのバインド
    useEffect(() => {
        const num = targetTiles.length;
        const { width, height } = calcSize(num);
        console.log("TILE:", num);

        targetTiles.forEach((x, index) => {
            const ids = getIds(index);
            const div = document.getElementById(ids.container) as HTMLDivElement;
            const video = document.getElementById(ids.video) as HTMLVideoElement;

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
    }, [targetTiles]);

    //// (3-3) タグのバインド + Active Speakerのバインド
    useEffect(() => {
        const num = targetTiles.length;

        targetTiles.forEach((x, index) => {
            const ids = getIds(index);
            const tag = document.getElementById(ids.tag) as HTMLDivElement;
            if (x.boundAttendeeId && chimeClientState.attendees[x.boundAttendeeId]) {
                if (chimeClientState.activeSpeakerId === x.boundAttendeeId) {
                    tag.style.color = "#f00";
                } else {
                    tag.style.color = "#fff";
                }
                tag.innerText = `${chimeClientState.attendees[x.boundAttendeeId!].attendeeName}`;
            }
        });

        for (let i = num; i < 18; i++) {
            const ids = getIds(i);
            const tag = document.getElementById(ids.tag) as HTMLDivElement;
            tag.innerText = "";
        }
    }, [targetTiles, chimeClientState.attendees, chimeClientState.activeSpeakerId]);

    return (
        <>
            {frontendState.stateControls.openBottomNavCheckbox.trigger}
            <div className="main-video-area">
                <div style={{ display: "flex", flexWrap: "wrap", height: "100%", width: "100%" }}>{tileComponents}</div>
            </div>
        </>
    );
};
