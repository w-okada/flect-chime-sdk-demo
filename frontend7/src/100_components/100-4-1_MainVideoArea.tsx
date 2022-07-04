import { VideoTileState } from "amazon-chime-sdk-js";
import React, { useEffect, useMemo } from "react";
import { ViewTypes } from "../002_hooks/011_useFrontend";
import { useAppState } from "../003_provider/AppStateProvider";

const MAX_TILES = 27;

export type MainVideoAreaProps = {};

export const MainVideoArea = (props: MainVideoAreaProps) => {
    const { chimeClientState, frontendState } = useAppState();
    const initialHeight = "33%";
    const initialWidth = "33%";

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
                <div key={ids.container} id={ids.container} className="main-video-area-tile" style={{ width: initialWidth, height: initialHeight }}>
                    <video id={ids.video} autoPlay className="main-video-area-tile-video" />
                    <div id={ids.tag} className="main-video-area-tile-tag"></div>
                </div>
            );
        });
    }, []);
    //// (2-2) 表示対象タイルの決定
    const targetTiles = useMemo(() => {
        const targetTiles: VideoTileState[] = [];
        if (frontendState.viewType == ViewTypes.grid) {
            // Grid View
            const otherThanSelfCamera = Object.values(chimeClientState.videoTileStates).filter((x) => {
                return x.localTile === false;
            });
            targetTiles.push(...otherThanSelfCamera);
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
                    //// アクティブスピーカーが自分でなければ表示
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
    //// (2-3) リバインド判定用IDの作成
    const rebindId = useMemo(() => {
        return targetTiles
            .sort((x, y) => {
                return x.boundAttendeeId! > y.boundAttendeeId! ? -1 : 1;
            })
            .reduce((prev, cur) => {
                return `${prev}_${cur.boundExternalUserId}_${cur.isContent}`;
            }, "");
    }, [targetTiles]);
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

        for (let i = num; i < MAX_TILES; i++) {
            const ids = getIds(i);
            const div = document.getElementById(ids.container) as HTMLDivElement;
            const video = document.getElementById(ids.video) as HTMLVideoElement;
            div.style.display = "none";
            video.src = "";
        }

        if (targetTiles.length === 0) {
            const ids = getIds(0);
            const div = document.getElementById(ids.container) as HTMLDivElement;
            const video = document.getElementById(ids.video) as HTMLVideoElement;
            div.style.display = "block";
            div.style.width = `100%`;
            div.style.height = `100%`;

            const ms = createBlackCanvas();
            video.srcObject = ms;
        }
    }, [rebindId, chimeClientState.meetingName]);

    // Default Stream
    const createBlackCanvas = () => {
        const canvas = document.createElement("canvas");
        const width = 640;
        const height = 480;
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.fillRect(0, 0, width, height);

        const drawInfo = (count: number) => {
            const ctx = canvas.getContext("2d")!;
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, width, height);
            const num = (Math.sin(count * 0.3) + 1) * 128;
            console.log(num);
            // ctx.fillStyle = `rgb(255,${num * 255},${num * 255})`;
            ctx.fillStyle = `rgb(${num},${num},${num})`;
            ctx.font = "bold 48px serif";
            ctx.fillText(`NOW:${new Date().toLocaleString()}`, 30, 60);
            setTimeout(() => {
                drawInfo(count + 1);
            }, 100 * 1);
        };
        setTimeout(() => {
            drawInfo(0);
        }, 0);
        return canvas.captureStream();
    };
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

        for (let i = num; i < MAX_TILES; i++) {
            const ids = getIds(i);
            const tag = document.getElementById(ids.tag) as HTMLDivElement;
            tag.innerText = "";
        }
    }, [rebindId, chimeClientState.attendees, chimeClientState.activeSpeakerId]);

    ///// (3-4) Self Camera View
    useEffect(() => {
        const selfCamera = Object.values(chimeClientState.videoTileStates).find((x) => {
            return x.localTile === true;
        });
        if (selfCamera) {
            const selfCameraVideoElement = document.getElementById(`main-video-area-video-self-camera`) as HTMLVideoElement;
            chimeClientState.bindVideoElement(selfCamera.tileId!, selfCameraVideoElement);
        }
    });

    return (
        <>
            {frontendState.stateControls.openBottomNavCheckbox.trigger}
            <div className="main-video-area">
                {frontendState.stateControls.showSelfCameraViewCheckbox.trigger}
                <div className="main-video-area-self-camera">
                    <video id={`main-video-area-video-self-camera`} autoPlay className="main-video-area-self-camera-video" />
                </div>
                <div className="main-video-area-container">{tileComponents}</div>
            </div>
        </>
    );
};
