import React, { useEffect, useMemo, useState } from "react";
import { useAppState } from "../../../../providers/AppStateProvider";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import { IconButton } from "@mui/material";

const PicturesInPage = 5;
const PicPrefix = "AttendeeLine-pic-";
export const useAttendeesView = () => {
    const { chimeClientState, frontendState } = useAppState();
    const [page, setPage] = useState(0);
    const tiles = chimeClientState.getAllTiles();
    const pageNum = Math.ceil(tiles.length / PicturesInPage);

    const targetTiles = tiles.slice(page * PicturesInPage, page * PicturesInPage + PicturesInPage);
    const targetTileKey = targetTiles.reduce((prev, cur) => {
        return `${prev}_${cur.boundAttendeeId}`;
    }, "");

    const pics = useMemo(() => {
        return targetTiles.map((x) => {
            const picId = `${PicPrefix}${x.tileId}`;
            let name = chimeClientState.getUserNameByAttendeeIdFromList(x.boundAttendeeId!);
            if (name.length > 10) {
                name = name.substr(0, 8) + "...";
            }
            return (
                <div key={`${picId}-container`} style={{ position: "relative", width: "15%", height: "100%" }}>
                    <video key={`${picId}`} id={`${picId}`} style={{ width: "100%", height: "100%", objectFit: x.isContent ? "contain" : "cover" }} />
                    <div style={{ position: "absolute", top: "75%", left: "10%", height: "15%", background: "#ffffff", fontSize: "20%", display: "flex", alignItems: "flex-end" }}>{name}</div>
                </div>
            );
        });
    }, [targetTileKey, frontendState.attendeesViewOpen]);

    const prevPage = () => {
        if (page > 0) {
            setPage(page - 1);
        }
    };

    const nextPage = () => {
        if (page + 1 < pageNum) {
            setPage(page + 1);
        }
    };

    useEffect(() => {
        targetTiles.forEach((x) => {
            const picId = `${PicPrefix}${x.tileId}`;
            const videoElem = document.getElementById(picId) as HTMLVideoElement;
            console.log("binding...", x, videoElem);
            console.log("binding...", picId);
            if (videoElem) {
                chimeClientState.bindVideoElement(x.tileId!, videoElem);
            }
        });
    }, [targetTileKey, frontendState.attendeesViewOpen]);
    const attendeeLine = useMemo(() => {
        if (frontendState.attendeesViewOpen === false) {
            return <></>;
        }
        return (
            <div style={{ width: "100%", height: "100%", background: "#eeeeeedd", display: "flex", justifyItems: "center" }}>
                <div>
                    <IconButton
                        onClick={() => {
                            prevPage();
                        }}
                    >
                        <KeyboardDoubleArrowLeftIcon />
                    </IconButton>
                    <div>{`${page + 1}/${pageNum}`}</div>
                </div>
                {pics}
                <div>
                    <IconButton
                        onClick={() => {
                            nextPage();
                        }}
                    >
                        <KeyboardDoubleArrowRightIcon />
                    </IconButton>
                </div>
            </div>
        );
    }, [targetTileKey, pageNum, frontendState.attendeesViewOpen]);
    return { attendeeLine };
};
