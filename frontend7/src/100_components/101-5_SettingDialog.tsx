import React, { useState } from "react";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppState } from "../providers/AppStateProvider";

export type SettingDialogProps = {};

export const SettingDialog = (props: SettingDialogProps) => {
    const { cognitoClientState } = useAppState();

    // (1) States
    const TabItems = {
        audioInput: "audio-input",
        videoInput: "video-input",
        audioOutput: "audio-output",
    } as const;
    type TabItems = typeof TabItems[keyof typeof TabItems];
    const [tab, setTab] = useState<TabItems>("audio-input");

    ////////////////////////////
    //  Conponents
    ////////////////////////////
    const audioInputIcon = (
        <div className="dialog-tile-icon-container">
            <input
                id="audio-input"
                className="dialog-radio-button"
                type="radio"
                name="audio-input"
                onChange={() => {
                    setTab("audio-input");
                }}
                checked={tab === "audio-input"}
            />
            <div className="dialog-radio-tile">
                <FontAwesomeIcon icon={["fas", "microphone"]} size="3x" />
                <label htmlFor="audio-input" className="dialog-radio-tile-label">
                    Audio Input
                </label>
            </div>
        </div>
    );
    const videoInputIcon = (
        <div className="dialog-tile-icon-container">
            <input
                id="video-input"
                className="dialog-radio-button"
                type="radio"
                name="video-input"
                onChange={() => {
                    setTab("video-input");
                }}
                checked={tab === "video-input"}
            />
            <div className="dialog-radio-tile">
                <FontAwesomeIcon icon={["fas", "video"]} size="3x" />
                <label htmlFor="video-input" className="dialog-radio-tile-label">
                    Video Input
                </label>
            </div>
        </div>
    );
    const audioOutputIcon = (
        <div className="dialog-tile-icon-container">
            <input
                id="audio-output"
                className="dialog-radio-button"
                type="radio"
                name="audio-output"
                onChange={() => {
                    setTab("audio-output");
                }}
                checked={tab === "audio-output"}
            />
            <div className="dialog-radio-tile">
                <FontAwesomeIcon icon={["fas", "volume-high"]} size="3x" />
                <label htmlFor="audio-output" className="dialog-radio-tile-label">
                    Audio Output
                </label>
            </div>
        </div>
    );

    const description = useMemo(() => {
        switch (tab) {
            case "audio-input":
                return "Audio input setting.";
            case "video-input":
                return "Video input setting.";
            case "audio-output":
                return "Audio output setting.";
            default:
                console.error("unknwon state", tab);
                return "Unknown state.";
        }
    }, [tab]);

    const form = useMemo(() => {
        return <></>;
    }, [tab]);

    return (
        <div className="dialog-frame-warpper">
            <div className="dialog-frame">
                <div className="dialog-title">Setting</div>
                <div className="dialog-content">
                    <div className={"dialog-application-title"}>Setting</div>
                    <div className="dialog-radio-tile-group">
                        {audioInputIcon}
                        {videoInputIcon}
                        {audioOutputIcon}
                    </div>
                    <div className="dialog-description">{description}</div>
                    <form>
                        <div className="dialog-input-container">{form}</div>
                    </form>
                </div>
            </div>
        </div>
    );
};
