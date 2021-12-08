import React, { useEffect, useMemo } from "react";
import { VideoTileState } from "amazon-chime-sdk-js";

import { useAppState } from "../../../../providers/AppStateProvider";
import { ScreenType } from "../../../../providers/hooks/useFrontend";

const ID_PREFIX = "FeatureView-video-";

type BaseGridViewProps = {
    targetTiles: VideoTileState[];
};

const BaseGridView = (props: BaseGridViewProps) => {
    const { chimeClientState } = useAppState();

    const targetTiles = props.targetTiles;
    const targetTilesKey = targetTiles.reduce((prev, cur) => {
        return `${prev}_${cur.boundAttendeeId}[${cur.paused}]`;
    }, "");

    const viewGrid = useMemo(() => {
        const colNum = Math.ceil(Math.sqrt(targetTiles.length));
        const rowNum = Math.ceil(targetTiles.length / colNum);
        const widthPerTile = Math.floor(100 / colNum);
        const heightPerTile = Math.floor(100 / rowNum);

        const rows: JSX.Element[] = [];
        for (let row = 0; row < rowNum; row++) {
            const videoElems: JSX.Element[] = [];
            for (let col = 0; col < colNum; col++) {
                const elemId = `${ID_PREFIX}${row * colNum + col}`;
                const targetIndex = row * colNum + col;
                const targetTile = targetTiles[targetIndex];
                if (targetIndex < targetTiles.length) {
                    console.log("localtile:::", targetTile.localTile);
                    // videoElems.push(<video key={elemId} id={elemId} style={{ objectFit: targetTile.isContent ? "contain" : "cover", width: `${widthPerTile}%`, height: `100%`, transform: targetTile.localTile ? "scale(-1, 1)" : "scale(1, 1)" }}></video>);
                    videoElems.push(<video key={elemId} id={elemId} style={{ objectFit: targetTile.isContent ? "contain" : "cover", width: `${widthPerTile}%`, height: `100%` }}></video>);
                }
            }
            const rowElem = (
                <div key={`${ID_PREFIX}row_${row}`} style={{ width: "100%", height: `${heightPerTile}%`, display: "flex", justifyContent: "center" }}>
                    {videoElems}
                </div>
            );
            rows.push(rowElem);
        }
        return <>{rows}</>;
    }, [targetTilesKey]);

    useEffect(() => {
        targetTiles.forEach((x, i) => {
            const targetVideoElem = document.getElementById(`${ID_PREFIX}${i}`) as HTMLVideoElement;
            console.log(x.tileId, `${ID_PREFIX}${i}`);
            chimeClientState.bindVideoElement(x.tileId!, targetVideoElem);
        });
        return () => {
            targetTiles.forEach((x) => {
                chimeClientState.unbindVideoElement(x.tileId!);
            });
        };
    }, [targetTilesKey]);

    return <div style={{ width: "100%", height: "100%" }}>{viewGrid}</div>;
};

const FeatureView = () => {
    const { chimeClientState } = useAppState();
    const targetTiles = chimeClientState.getContentTiles();
    if (targetTiles.length === 0) {
        const activeSpeakerTile = chimeClientState.getActiveSpeakerTile();
        if (activeSpeakerTile) {
            targetTiles.push(activeSpeakerTile);
        }
    }

    return (
        <>
            <BaseGridView targetTiles={targetTiles} />
        </>
    );
};

const GridView = () => {
    const { chimeClientState } = useAppState();
    const targetTiles = chimeClientState.getAllTiles();

    return (
        <>
            <BaseGridView targetTiles={targetTiles} />
        </>
    );
};

export const useMainView = () => {
    const { frontendState, chimeClientState } = useAppState();
    const targetTilesForKey = chimeClientState.getAllTiles();
    const targetTilesKey = targetTilesForKey.reduce((prev, cur) => {
        return `${prev}_${cur.boundAttendeeId}[${cur.paused}]`;
    }, "");
    const mainView = useMemo(() => {
        if (frontendState.screenType === ScreenType.FeatureView) {
            return <FeatureView />;
        } else if (frontendState.screenType === ScreenType.GridView) {
            return <GridView />;
        } else {
            return <div>unknown view type</div>;
        }
    }, [frontendState.screenType]);
    return { mainView, targetTilesKey };
};
