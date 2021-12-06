import React, { useMemo } from "react";
import { IconButton, Tooltip } from "@material-ui/core";
import { Mic, MicOff, Videocam, VideocamOff, VolumeOff, VolumeUp } from "@material-ui/icons";
import { useAppState } from "../../../../providers/AppStateProvider";
import { ToolbarHeight } from "../../../../constants";

const DeviceType = {
    Microphone: "Microphone",
    Camera: "Camera",
    Speaker: "Speaker",
} as const;
type DeviceType = typeof DeviceType[keyof typeof DeviceType];

type DeviceEnablerSetting = {
    onIcon: JSX.Element;
    offIcon: JSX.Element;
    onTooltip: string;
    offTooltip: string;
};

const DeivceEnableSettings: { [key in DeviceType]: DeviceEnablerSetting } = {
    Microphone: {
        onIcon: <MicOff />,
        offIcon: <Mic />,
        onTooltip: "Mic on",
        offTooltip: "Mute",
    },
    Camera: {
        onIcon: <Videocam />,
        offIcon: <VideocamOff />,
        onTooltip: "Camera off",
        offTooltip: "Camera on",
    },
    Speaker: {
        onIcon: <VolumeUp />,
        offIcon: <VolumeOff />,
        onTooltip: "Speaker off",
        offTooltip: "Speaker on",
    },
};

export const useDeviceEnabler = () => {
    const { chimeClientState } = useAppState();

    const setAudioInputEnable = async (val: boolean) => {
        // await chimeClientState.setAudioInputEnable(val);
        console.log("set mute::::", val);
        await chimeClientState.setMute(val);
    };
    const setVideoInputEnable = async (val: boolean) => {
        await chimeClientState.setVideoInputEnable(val);
        if (val) {
            await chimeClientState.startLocalVideoTile();
        } else {
            await chimeClientState.stopLocalVideoTile();
        }
    };
    const setAudioOutputEnable = async (val: boolean) => {
        await chimeClientState.setAudioOutputEnable(val);
    };

    const generateButton = (setting: DeviceEnablerSetting, setEnable: (val: boolean) => void, enable: boolean) => {
        console.log("view mute", enable);
        return (
            <Tooltip title={enable ? setting.onTooltip : setting.offTooltip}>
                <IconButton
                    style={{ height: ToolbarHeight, width: ToolbarHeight }}
                    color="inherit"
                    onClick={() => {
                        setEnable(!enable);
                    }}
                >
                    {enable ? setting.onIcon : setting.offIcon}
                </IconButton>
            </Tooltip>
        );
    };

    const microphoneButton = useMemo(() => {
        return generateButton(DeivceEnableSettings.Microphone, setAudioInputEnable, chimeClientState.isMuted);
    }, [chimeClientState.isMuted]);
    const cameraButton = useMemo(() => {
        return generateButton(DeivceEnableSettings.Camera, setVideoInputEnable, chimeClientState.videoInputEnable);
    }, [chimeClientState.videoInputEnable]);
    const speakerButton = useMemo(() => {
        return generateButton(DeivceEnableSettings.Speaker, setAudioOutputEnable, chimeClientState.audioOutputEnable);
    }, [chimeClientState.audioOutputEnable]);
    return { microphoneButton, cameraButton, speakerButton };
};
