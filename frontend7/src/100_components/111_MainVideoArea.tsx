import { lstat } from "fs/promises";
import React, { useEffect, useMemo } from "react";
import { useAppState } from "../003_provider/AppStateProvider";

export type MainVideoAreaProps = {
    bottomNavTrigger: JSX.Element;
};

export const MainVideoArea = (props: MainVideoAreaProps) => {
    const { chimeClientState } = useAppState();
    const height = "33%";
    const width = "33%";

    const getIds = (index: number) => {
        return {
            container: `main-video-area-container-${index}`,
            video: `main-video-area-video-${index}`,
            tag: `main-video-area-tag-${index}`,
        };
    };

    const tiles = useMemo(() => {
        return [...Array(18)].map((x, index) => {
            const ids = getIds(index);
            return (
                <div key={ids.container} id={ids.container} style={{ position: "relative", width: width, height: height, display: "none" }}>
                    <video id={ids.video} controls autoPlay style={{ position: "absolute", objectFit: "contain", width: "100%", height: "100%" }} />
                    <div id={ids.tag} style={{ position: "absolute", background: "#333333", color: "#ffffff", bottom: 0, left: 0, marginLeft: "20px", paddingLeft: "2px", paddingRight: "2px" }}>
                        aaaaa
                    </div>
                </div>
            );
        });
    }, []);

    useEffect(() => {
        const loadDemoMovie = async () => {
            const demo = await fetch("test.mp4");
            const data = await demo.blob();
            const url = URL.createObjectURL(data);

            [...Array(18)].map((x, index) => {
                const ids = getIds(index);
                const div = document.getElementById(ids.container) as HTMLDivElement;
                const video = document.getElementById(ids.video) as HTMLVideoElement;
                const tag = document.getElementById(ids.tag) as HTMLDivElement;
                if (index < 9) {
                    div.style.display = "block";
                    video.onloadeddata = () => {
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
        Object.values(chimeClientState.videoTileStates).forEach((x, index) => {
            const ids = getIds(index);
            const div = document.getElementById(ids.container) as HTMLDivElement;
            const video = document.getElementById(ids.video) as HTMLVideoElement;
            const tag = document.getElementById(ids.tag) as HTMLDivElement;

            chimeClientState.bindVideoElement(x.tileId!, video);
            div.style.display = "block";
            video.src = "";
        });
        const num = Object.values(chimeClientState.videoTileStates).length;

        for (let i = num; i < 18; i++) {
            const ids = getIds(i);
            const div = document.getElementById(ids.container) as HTMLDivElement;
            const video = document.getElementById(ids.video) as HTMLVideoElement;
            div.style.display = "none";
            video.src = "";
        }
    }, [chimeClientState.videoTileStates]);

    return (
        <>
            {props.bottomNavTrigger}
            <div className="main-video-area">
                <div style={{ display: "flex", flexWrap: "wrap", height: "100%", width: "100%" }}>
                    {tiles}
                    {/* <div style={{ position: "relative", width: width, height: height, display: "block" }}>
                        <video controls src="test.mp4" autoPlay style={{ position: "absolute", objectFit: "contain", width: "100%", height: "100%" }} />
                        <div style={{ position: "absolute", background: "#333333", color: "#ffffff", bottom: 0, left: 0, marginLeft: "20px" }}>aaaaa</div>
                    </div>
                    <div style={{ width: width, height: height, display: "none" }}>
                        <video controls src="test.mp4" autoPlay style={{ objectFit: "contain", width: "100%", height: "100%" }} />
                    </div>
                    <div style={{ width: width, height: height, transform: "translateY(10px)" }}>
                        <video controls src="test.mp4" autoPlay style={{ objectFit: "contain", width: "100%", height: "100%" }} />
                    </div>
                    <div style={{ width: width, height: height }}>
                        <video controls src="test.mp4" autoPlay style={{ objectFit: "contain", width: "100%", height: "100%" }} />
                    </div>
                    <div style={{ width: width, height: height }}>
                        <video controls src="test.mp4" autoPlay style={{ objectFit: "contain", width: "100%", height: "100%" }} />
                    </div>
                    <div style={{ width: width, height: height }}>
                        <video controls src="test.mp4" autoPlay style={{ objectFit: "contain", width: "100%", height: "100%" }} />
                    </div>
                    <div style={{ width: width, height: height }}>
                        <video controls src="test.mp4" autoPlay style={{ objectFit: "contain", width: "100%", height: "100%" }} />
                    </div>
                    <div style={{ width: width, height: height }}>
                        <video controls src="test.mp4" autoPlay style={{ objectFit: "contain", width: "100%", height: "100%" }} />
                    </div> */}
                </div>
            </div>
        </>
    );
};
