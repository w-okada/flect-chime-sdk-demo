import React, { useEffect, useMemo } from "react";
import { useAppState } from "../003_provider/AppStateProvider";

export type BottomNavProps = {};
const MAX_TILES = 27;
const TILES_IN_CARD = 7;
const cardNum = Math.ceil(MAX_TILES / TILES_IN_CARD);
// TODO: 非表示部分のバインドまでされてしまう。Chromeが映像再生を止めてくれればCPU負荷抑えられるが、ネットワークは多分無理。というかそもそもバインドしていなければデータを取得しない、という処理がChimeとしてサポートされていない可能性がある。明示的なpauseをする必要があるか？もしそうなら、表示切替のタイミングを取得してpauseをかける必要があるが、CSSによる制御のみである場合は不可。イベントをもらう必要が出てくる。（調査等いろいろ必要なので、まずはペンディング。）

export const BottomNav = (_props: BottomNavProps) => {
    const { chimeClientState, frontendState } = useAppState();

    // (1) Util Functions
    //// (1-1) DOM ID生成
    const getIds = (index: number) => {
        return {
            container: `attendee-video-list-${index}`,
            video: `attendee-video-list-video-tile-${index}`,
            tag: `attendee-video-list-video-tile-tag-${index}`,
        };
    };

    // (2) Rendering Phase.

    //// (2-1) カード数を計算 ⇒ 高々18なので3で固定。
    // const cardNum = useMemo(() => {
    //     return Math.ceil(Object.values(chimeClientState.videoTileStates).length / TILES_IN_CARD);
    // }, [chimeClientState.videoTileStates]);

    //// (2-2) カード内のビデオタイルリストのリストを作成　⇒ 高々18なので全数生成
    const list = useMemo(() => {
        return [...Array(cardNum)].map((_x, index) => {
            //// (a) カード内のタイルリストを生成
            const tiles = [...Array(TILES_IN_CARD)].map((_x, innerIndex) => {
                const tileIndex = index * TILES_IN_CARD + innerIndex;
                //// 全数生成にするため、スキップはしない。
                // if (tileIndex >= Object.values(chimeClientState.videoTileStates).length) {
                //     return <React.Fragment key={`attendee-video-list-video-tile-frag-${tileIndex}`}></React.Fragment>;
                // }
                const ids = getIds(tileIndex);
                return (
                    <div key={ids.container} className="attendee-video-list-tile-container" id={ids.container}>
                        <video autoPlay id={ids.video} className="attendee-video-list-video-tile" />
                        <div className="attendee-video-list-video-tile-tag" id={ids.tag}></div>
                    </div>
                );
            });
            //// (b) カードとその制御用checkbox等を生成
            return (
                <React.Fragment key={`attendee-video-list-video-tile-frag-${index}`}>
                    <input key={`attendee-video-list-video-tile-input-${index}`} type="radio" className="attendee-video-list-checkbox" id={`attendee-video-list-checkbox-${index}`} name="attendee-video-list-checkbox" />
                    <div key={`attendee-video-list-video-tile-div-${index}`} className="attendee-video-list">
                        {tiles}
                    </div>
                    <label key={`attendee-video-list-video-tile-label-${index}`} htmlFor={`attendee-video-list-checkbox-${index}`} className="attendee-video-list-checkbox-label">
                        Page.{index}
                    </label>
                </React.Fragment>
            );
        });
        // }, [cardNum, chimeClientState.videoTileStates]);
    }, [cardNum]);

    //// (2-3) リバインド判定用IDの作成
    const rebindId = useMemo(() => {
        const targetTiles = Object.values(chimeClientState.videoTileStates);
        return targetTiles
            .sort((x, y) => {
                return x.boundAttendeeId! > y.boundAttendeeId! ? -1 : 1;
            })
            .reduce((prev, cur) => {
                return `${prev}_${cur.boundExternalUserId}_${cur.isContent}`;
            }, "");
    }, [chimeClientState.videoTileStates]);

    // (3) Commit Phase.
    //// (3-1) カード選択の初期値設定。
    useEffect(() => {
        const firstPageCheckboxID = "attendee-video-list-checkbox-0";
        const firstPageCheckbox = document.getElementById(firstPageCheckboxID) as HTMLInputElement;
        if (firstPageCheckbox) {
            firstPageCheckbox.checked = true;
        }
    }, []);

    //// (3-2) タイルのバインド
    useEffect(() => {
        const num = Object.values(chimeClientState.videoTileStates).length;
        Object.values(chimeClientState.videoTileStates).forEach((x, index) => {
            const ids = getIds(index);
            const videoElem = document.getElementById(ids.video) as HTMLVideoElement;
            // console.log("sidebar bind::", ids, videoElem);
            chimeClientState.bindVideoElement(x.tileId!, videoElem);
        });

        for (let i = num; i < MAX_TILES; i++) {
            const ids = getIds(i);
            const video = document.getElementById(ids.video) as HTMLVideoElement;
            video.src = "";
        }
    }, [rebindId]);

    //// (3-3) タグとactive speakerのバインド
    useEffect(() => {
        const num = Object.values(chimeClientState.videoTileStates).length;
        Object.values(chimeClientState.videoTileStates).forEach((x, index) => {
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

    return (
        <>
            {frontendState.stateControls.openBottomNavCheckbox.trigger}
            <div className="bottom-nav">
                <div className="attendee-video-list-container">{list}</div>
            </div>
        </>
    );
};
