import React, { useEffect, useState } from "react";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppState } from "../003_provider/AppStateProvider";
import { NoiseSuppressionTypeList, NoiseSuppressionTypes, VirtualBackgroundTypeList, VirtualBackgroundTypes } from "../002_hooks/004_useDeviceState";
import { VideoInputCustomDevices } from "../001_clients_and_managers/004_devices/io/VideoInputDeviceGenerator";
import { useStateControlCheckbox } from "./hooks/useStateControlCheckbox";

export type SettingDialogProps = {};

export const SettingDialog = (props: SettingDialogProps) => {
    const { cognitoClientState, deviceState, chimeClientState } = useAppState();
    const videoInputFileCheckbox = useStateControlCheckbox("setting-dialog-video-file-checkbox");

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
    // Icons
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

    // Input field
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

    // () Audio Input
    const audioInputSelectField = useMemo(() => {
        // see: https://nessssy.net/blog/2021/01/08/react-select-defaultvalue
        if (deviceState.audioInputDevices.length == 0) {
            return <></>;
        }
        const hidden = tab === "audio-input" ? "" : "hidden";

        const options = deviceState.audioInputDevices.map((x) => {
            return (
                <option value={x.deviceId} key={x.deviceId}>
                    {x.label}
                </option>
            );
        });
        return (
            <div className={`dialog-input-controls ${hidden}`}>
                <select
                    id="setting-dialog-audio-input-select"
                    className="select"
                    required
                    defaultValue={deviceState.audioInput}
                    onChange={(e) => {
                        deviceState.setAudioInputDevice(e.target.value);
                    }}
                >
                    {options}
                </select>
                <label htmlFor="">auido device</label>
            </div>
        );
    }, [deviceState.audioInputDevices, tab]);

    const noiseSuppressionSelectField = useMemo(() => {
        const hidden = tab === "audio-input" ? "" : "hidden";
        const options = NoiseSuppressionTypeList.map((x) => {
            return (
                <option value={x.val} key={x.val}>
                    {x.label}
                </option>
            );
        });

        return (
            <div className={`dialog-input-controls ${hidden}`}>
                <select
                    id="setting-dialog-noise-suppression-select"
                    className="select"
                    required
                    defaultValue={deviceState.noiseSuppretionType}
                    onChange={(e) => {
                        deviceState.setNoiseSuppressionType(e.target.value as NoiseSuppressionTypes);
                    }}
                >
                    {options}
                </select>
                <label htmlFor="region">noise suppression</label>
            </div>
        );
    }, [tab]);

    // () Video Input
    const videoInputSelectField = useMemo(() => {
        // see: https://nessssy.net/blog/2021/01/08/react-select-defaultvalue
        if (deviceState.videoInputDevices.length == 0) {
            return <></>;
        }
        const hidden = tab === "video-input" ? "" : "hidden";
        const options = deviceState.videoInputDevices.map((x) => {
            return (
                <option value={x.deviceId} key={x.deviceId}>
                    {x.label}
                </option>
            );
        });
        return (
            <>
                <div className={`dialog-input-controls ${hidden}`}>
                    <select
                        id="setting-dialog-video-input-select"
                        className="select"
                        required
                        defaultValue={deviceState.videoInput}
                        onChange={(e) => {
                            if (e.target.value === VideoInputCustomDevices.file) {
                                videoInputFileCheckbox.updateState(true);
                            } else {
                                videoInputFileCheckbox.updateState(false);
                                deviceState.setVideoInputDevice(e.target.value);
                            }
                        }}
                    >
                        {options}
                    </select>
                    <label htmlFor="">video device</label>
                </div>
                <div className={`dialog-input-controls ${hidden}`}>
                    {videoInputFileCheckbox.trigger}
                    <div className="div-container">
                        <div
                            className="normal-button"
                            onClick={() => {
                                deviceState.setVideoInputDevice(VideoInputCustomDevices.file);
                            }}
                        >
                            load file
                        </div>
                    </div>
                </div>
            </>
        );
    }, [deviceState.videoInputDevices, tab]);
    useEffect(() => {
        if (deviceState.videoInput === VideoInputCustomDevices.file) {
            videoInputFileCheckbox.updateState(true);
        }
    }, [tab]);

    const videoInputFileButton = useMemo(() => {
        const hidden = tab === "video-input" && deviceState.videoInput === VideoInputCustomDevices.file ? "" : "hidden";
        <div className={`dialog-input-controls ${hidden}`}>
            aaa
            <label htmlFor="">virtual background</label>
        </div>;
    }, [, tab]);

    const virtualBackgroundSelectField = useMemo(() => {
        const hidden = tab === "video-input" ? "" : "hidden";
        const options = VirtualBackgroundTypeList.map((x) => {
            return (
                <option value={x.val} key={x.val}>
                    {x.label}
                </option>
            );
        });

        return (
            <div className={`dialog-input-controls ${hidden}`}>
                <select
                    id="setting-dialog-virtual-background-select"
                    className="select"
                    required
                    defaultValue={deviceState.virtualBackgroundType}
                    onChange={(e) => {
                        deviceState.setVirtualBackgroundType(e.target.value as VirtualBackgroundTypes);
                    }}
                >
                    {options}
                </select>
                <label htmlFor="">virtual background</label>
            </div>
        );
    }, [tab]);

    const videoPreview = useMemo(() => {
        const hidden = tab === "video-input" ? "" : "hidden";
        return (
            <div className={`dialog-input-controls ${hidden}`}>
                <video id="setting-dialog-video-preview" controls className="video" />
            </div>
        );
    }, [tab]);
    // () Audio Output
    const audioOutputSelectField = useMemo(() => {
        // see: https://nessssy.net/blog/2021/01/08/react-select-defaultvalue
        if (deviceState.audioOutputDevices.length == 0) {
            return <></>;
        }
        const hidden = tab === "audio-output" ? "" : "hidden";
        const options = deviceState.audioOutputDevices.map((x) => {
            return (
                <option value={x.deviceId} key={x.deviceId}>
                    {x.label}
                </option>
            );
        });
        return (
            <div className={`dialog-input-controls ${hidden}`}>
                <select
                    id="setting-dialog-audio-output-select"
                    className="select"
                    required
                    defaultValue={deviceState.audioOutput}
                    onChange={(e) => {
                        deviceState.setAudioOutputDevice(e.target.value);
                    }}
                >
                    {options}
                </select>
                <label htmlFor="">audio output</label>
            </div>
        );
    }, [deviceState.audioOutputDevices, tab]);

    const form = useMemo(() => {
        return (
            <>
                {audioInputSelectField}
                {noiseSuppressionSelectField}
                {videoInputSelectField}
                {videoInputFileButton}
                {virtualBackgroundSelectField}
                {audioOutputSelectField}
                {videoPreview}
            </>
        );
    }, [tab, audioInputSelectField, noiseSuppressionSelectField, videoInputSelectField, virtualBackgroundSelectField, audioOutputSelectField]);

    // Effect
    // useEffect(() => {
    //     if (!chimeClientState.chimeClient.meetingSession) {
    //         console.log("no meetingsession");
    //         return;
    //     }
    //     console.log("meetingsession");
    //     const videoPreviewEl = document.getElementById("setting-dialog-video-preview") as HTMLVideoElement;

    //     chimeClientState.chimeClient.meetingSession?.audioVideo.stopLocalVideoTile();
    //     chimeClientState.chimeClient.meetingSession?.audioVideo.startVideoPreviewForVideoInput(videoPreviewEl);
    //     // if (deviceState.chimeVideoInputDevice) {
    //     //     chimeClientState.chimeClient.meetingSession.audioVideo.startVideoInput(deviceState.chimeVideoInputDevice).then(() => {
    //     //         chimeClientState.chimeClient.meetingSession!.audioVideo.startVideoPreviewForVideoInput(videoPreviewEl);
    //     //     });
    //     // } else {
    //     //     chimeClientState.chimeClient.meetingSession.audioVideo.startVideoInput(deviceState.videoInput).then(() => {
    //     //         chimeClientState.chimeClient.meetingSession!.audioVideo.startVideoPreviewForVideoInput(videoPreviewEl);
    //     //     });
    //     // }
    // }, [deviceState.videoInput, deviceState.chimeVideoInputDevice]);

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
