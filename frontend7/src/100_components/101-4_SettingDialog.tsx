import React, { useEffect, useState } from "react";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppState } from "../003_provider/AppStateProvider";
import { NoiseSuppressionTypeList, NoiseSuppressionTypes, VirtualBackgroundTypeList, VirtualBackgroundTypes } from "../002_hooks/004_useDeviceState";
import { VideoInputCustomDevices } from "../001_clients_and_managers/004_devices/io/VideoInputDeviceGenerator";
import { useStateControlCheckbox } from "./hooks/useStateControlCheckbox";

const TabItems = {
    audioInput: "audioInput",
    videoInput: "videoInput",
    audioOutput: "audioOutput",
} as const;
type TabItems = typeof TabItems[keyof typeof TabItems];

type DialogTileIconProps = {
    tabId: TabItems;
    onChange: (tabId: TabItems) => void;
    selected: boolean;
    icon: JSX.Element;
    label: string;
};

const DialogTileIcon = (props: DialogTileIconProps) => {
    const icon = useMemo(() => {
        return (
            <div className="dialog-tile-icon-container">
                <input
                    id={props.tabId}
                    className="dialog-radio-button"
                    type="radio"
                    name="setting-dialog"
                    onChange={() => {
                        props.onChange(props.tabId);
                    }}
                    checked={props.selected}
                />
                <div className="dialog-radio-tile">
                    {props.icon}
                    <label htmlFor={props.tabId} className="dialog-radio-tile-label">
                        {props.label}
                    </label>
                </div>
            </div>
        );
    }, [props.selected]);
    return icon;
};

type DialogTilesProps = {
    currentTab: TabItems;
    onChange: (tabId: TabItems) => void;
};

const DialogTiles = (props: DialogTilesProps) => {
    const tiles = useMemo(() => {
        const audioInputIconProps: DialogTileIconProps = {
            tabId: TabItems.audioInput,
            onChange: () => {
                props.onChange(TabItems.audioInput);
            },
            selected: props.currentTab == TabItems.audioInput,
            icon: <FontAwesomeIcon icon={["fas", "microphone"]} size="3x" />,
            label: "microphone",
        };
        const audioInputIcon = <DialogTileIcon {...audioInputIconProps}></DialogTileIcon>;

        const videoInputIconProps: DialogTileIconProps = {
            tabId: TabItems.videoInput,
            onChange: () => {
                props.onChange(TabItems.videoInput);
            },
            selected: props.currentTab == TabItems.videoInput,
            icon: <FontAwesomeIcon icon={["fas", "video"]} size="3x" />,
            label: "camera",
        };
        const videoInputIcon = <DialogTileIcon {...videoInputIconProps}></DialogTileIcon>;

        const audioOutputIconProps: DialogTileIconProps = {
            tabId: TabItems.audioOutput,
            onChange: () => {
                props.onChange(TabItems.audioOutput);
            },
            selected: props.currentTab == TabItems.audioOutput,
            icon: <FontAwesomeIcon icon={["fas", "volume-high"]} size="3x" />,
            label: "camera",
        };
        const audioOutputIcon = <DialogTileIcon {...audioOutputIconProps}></DialogTileIcon>;

        const tiles = (
            <div className="dialog-radio-tile-group">
                {audioInputIcon}
                {videoInputIcon}
                {audioOutputIcon}
            </div>
        );
        return tiles;
    }, [props.currentTab]);
    return tiles;
};

export const SettingDialog = () => {
    const { deviceState, frontendState } = useAppState();
    const videoInputFileCheckbox = useStateControlCheckbox("setting-dialog-video-file-checkbox");

    // (1) States

    const [tab, setTab] = useState<TabItems>("audioInput");

    const close = () => {
        frontendState.stateControls.settingCheckbox.updateState(false);
    };
    ////////////////////////////
    //  Conponents
    ////////////////////////////
    // Icons
    const dialogTilesProps: DialogTilesProps = {
        currentTab: tab,
        onChange: (tabId: TabItems) => {
            setTab(tabId);
        },
    };
    const dialogTiles = <DialogTiles {...dialogTilesProps}></DialogTiles>;

    // Input field
    const description = useMemo(() => {
        switch (tab) {
            case "audioInput":
                return "Audio input setting.";
            case "videoInput":
                return "Video input setting.";
            case "audioOutput":
                return "Audio output setting.";
            default:
                console.error("unknwon state", tab);
                return "Unknown state.";
        }
    }, [tab]);

    // () Audio Input
    const audioInputOptions = useMemo(() => {
        const options = deviceState.audioInputDevices.map((x) => {
            return (
                <option value={x.deviceId} key={x.deviceId}>
                    {x.label}
                </option>
            );
        });
        return options;
    }, [deviceState.audioInputDevices]);
    const audioInputSelectField = useMemo(() => {
        // see: https://nessssy.net/blog/2021/01/08/react-select-defaultvalue
        if (deviceState.audioInputDevices.length == 0) {
            return <></>;
        }
        if (tab != "audioInput") {
            return <></>;
        }
        return (
            <div className={`dialog-input-controls`}>
                <select
                    id="setting-dialog-audio-input-select"
                    className="select"
                    required
                    defaultValue={deviceState.audioInput}
                    onChange={(e) => {
                        deviceState.setAudioInputDevice(e.target.value);
                    }}
                >
                    {audioInputOptions}
                </select>
                <label htmlFor="">auido device</label>
            </div>
        );
    }, [deviceState.audioInputDevices, tab]);

    const noiseSuppressionOptions = useMemo(() => {
        const options = NoiseSuppressionTypeList.map((x) => {
            return (
                <option value={x.val} key={x.val}>
                    {x.label}
                </option>
            );
        });
        return options;
    }, []);
    const noiseSuppressionSelectField = useMemo(() => {
        if (tab != "audioInput") {
            return <></>;
        }
        return (
            <div className={`dialog-input-controls`}>
                <select
                    id="setting-dialog-noise-suppression-select"
                    className="select"
                    required
                    defaultValue={deviceState.noiseSuppretionType}
                    onChange={(e) => {
                        deviceState.setNoiseSuppressionType(e.target.value as NoiseSuppressionTypes);
                    }}
                >
                    {noiseSuppressionOptions}
                </select>
                <label htmlFor="region">noise suppression</label>
            </div>
        );
    }, [tab]);

    // () Video Input
    const videoInputOptions = useMemo(() => {
        const options = deviceState.videoInputDevices.map((x) => {
            return (
                <option value={x.deviceId} key={x.deviceId}>
                    {x.label}
                </option>
            );
        });
        return options;
    }, [deviceState.videoInputDevices]);

    const videoInputSelectField = useMemo(() => {
        // see: https://nessssy.net/blog/2021/01/08/react-select-defaultvalue
        if (deviceState.videoInputDevices.length == 0) {
            return <></>;
        }
        if (tab != "videoInput") {
            return <></>;
        }

        return (
            <>
                <div className={`dialog-input-controls`}>
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
                        {videoInputOptions}
                    </select>
                    <label htmlFor="">video device</label>
                </div>
                <div className={`dialog-input-controls`}>
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

    const virtualBackgroundOptions = useMemo(() => {
        const options = VirtualBackgroundTypeList.map((x) => {
            return (
                <option value={x.val} key={x.val}>
                    {x.label}
                </option>
            );
        });
        return options;
    }, []);
    const virtualBackgroundSelectField = useMemo(() => {
        if (tab != "videoInput") {
            return <></>;
        }

        return (
            <div className={`dialog-input-controls`}>
                <select
                    id="setting-dialog-virtual-background-select"
                    className="select"
                    required
                    defaultValue={deviceState.virtualBackgroundType}
                    onChange={(e) => {
                        deviceState.setVirtualBackgroundType(e.target.value as VirtualBackgroundTypes);
                    }}
                >
                    {virtualBackgroundOptions}
                </select>
                <label htmlFor="setting-dialog-virtual-background-select">virtual background</label>
            </div>
        );
    }, [tab]);

    const videoEffectToggleField = useMemo(() => {
        if (tab != "videoInput") {
            return <></>;
        }
        return (
            <div className="dialog-input-controls">
                <div style={{ display: "flex", alignItems: "center" }}>
                    <input
                        className="checkbox"
                        type="checkbox"
                        id="setting-dialog-video-effect-center-stage"
                        onChange={(ev) => {
                            deviceState.enableCenterStage(ev.target.checked);
                            // setUseCode(ev.target.checked);
                        }}
                    />
                    <label htmlFor="setting-dialog-video-effect-center-stage">center stage</label>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <input
                        className="checkbox"
                        type="checkbox"
                        id="setting-dialog-video-effect-avatar"
                        onChange={(ev) => {
                            deviceState.enableAvatar(ev.target.checked);
                        }}
                    />
                    <label htmlFor="setting-dialog-video-effect-avatar">avatar</label>
                </div>
            </div>
        );
    }, [tab]);

    // const videoPreview = useMemo(() => {
    //     const hidden = tab === "videoInput" ? "" : "hidden";
    //     return (
    //         <div className={`dialog-input-controls ${hidden}`}>
    //             <video id="setting-dialog-video-preview" controls className="video" />
    //         </div>
    //     );
    // }, [tab]);

    // () Audio Output
    const audioOutputOptions = useMemo(() => {
        const options = deviceState.audioOutputDevices.map((x) => {
            return (
                <option value={x.deviceId} key={x.deviceId}>
                    {x.label}
                </option>
            );
        });
        return options;
    }, [deviceState.audioOutputDevices]);
    const audioOutputSelectField = useMemo(() => {
        if (tab != "audioOutput") {
            return <></>;
        }

        return (
            <div className={`dialog-input-controls `}>
                <select
                    id="setting-dialog-audio-output-select"
                    className="select"
                    required
                    defaultValue={deviceState.audioOutput}
                    onChange={(e) => {
                        deviceState.setAudioOutputDevice(e.target.value);
                    }}
                >
                    {audioOutputOptions}
                </select>
                <label htmlFor="setting-dialog-audio-output-select">audio output</label>
            </div>
        );
    }, [deviceState.audioOutputDevices, tab]);

    const buttons = useMemo(() => {
        return (
            <div className="dialog-input-controls">
                <div id="submit" className="submit-button" onClick={close}>
                    close
                </div>
            </div>
        );
    }, [tab]);

    const form = useMemo(() => {
        return (
            <div className="dialog-frame">
                <div className="dialog-title">Setting</div>
                <div className="dialog-content">
                    <div className={"dialog-application-title"}></div>
                    {dialogTiles}

                    <div className="dialog-description">{description}</div>
                    <form>
                        <div className="dialog-input-container">
                            {audioInputSelectField}
                            {noiseSuppressionSelectField}
                            {videoInputSelectField}
                            {virtualBackgroundSelectField}
                            {videoEffectToggleField}
                            {audioOutputSelectField}
                            {/* {videoPreview} */}
                            {buttons}
                        </div>
                    </form>
                </div>
            </div>
        );
    }, [tab, audioInputSelectField, noiseSuppressionSelectField, videoInputSelectField, virtualBackgroundSelectField, audioOutputSelectField]);

    return form;
};
