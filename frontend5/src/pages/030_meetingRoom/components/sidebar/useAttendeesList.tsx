import { IconButton, Tooltip } from "@material-ui/core";
import { Mic, MicOff, Videocam, VideocamOff } from "@material-ui/icons";
import React from "react";
import { useMemo } from "react";
import { useAppState } from "../../../../providers/AppStateProvider";

const ICON_SIZE = 14;
const FONT_SIZE = 12;

const AttendeeStateIconType = {
    MicOn: "MicOn",
    MicOff: "MicOff",
    CameraOn: "CameraOn",
    CameraOff: "CameraOff",
    CameraPaused: "CameraPaused",
} as const;

type AttendeeStateIconType = typeof AttendeeStateIconType[keyof typeof AttendeeStateIconType];

type AttendeeStateIconSetting = {
    icon: JSX.Element;
    tooltip: string;
    color?: string;
};

const AttendeeStateIconSettings: { [key in AttendeeStateIconType]: AttendeeStateIconSetting } = {
    MicOn: {
        icon: <Mic style={{ height: ICON_SIZE, width: ICON_SIZE }} />,
        tooltip: "microphone on",
    },
    MicOff: {
        icon: <MicOff style={{ height: ICON_SIZE, width: ICON_SIZE }} />,
        tooltip: "microphone off",
    },
    CameraOn: {
        icon: <Videocam style={{ height: ICON_SIZE, width: ICON_SIZE }} />,
        tooltip: "camera on",
    },
    CameraOff: {
        icon: <VideocamOff style={{ height: ICON_SIZE, width: ICON_SIZE }} />,
        tooltip: "camera off",
    },
    CameraPaused: {
        icon: <VideocamOff style={{ height: ICON_SIZE, width: ICON_SIZE }} />,
        tooltip: "camera paused",
        color: "#ee7777",
    },
};

export const useAttendeesList = () => {
    const { chimeClientState } = useAppState();
    chimeClientState.attendees;

    const attendeesKey = Object.values(chimeClientState.attendees).reduce((prev, cur) => {
        return `${prev}_${cur.attendeeId}[m:${cur.muted},c:${cur.attendeeId === chimeClientState.attendeeId ? chimeClientState.videoInputEnable : cur.cameraOn},p:${cur.isVideoPaused}]`;
    }, "");

    const generateButton = (setting: AttendeeStateIconSetting, onClick?: () => void) => {
        return (
            <Tooltip title={setting.tooltip}>
                <IconButton color="inherit" style={{ paddingTop: "1px", paddingBottom: "1px", paddingLeft: "1px", paddingRight: "1px", color: setting.color ? setting.color : "#000000" }} onClick={onClick}>
                    {setting.icon}
                </IconButton>
            </Tooltip>
        );
    };
    const generateNamePlate = (name: string) => {
        let attendeeName = name;
        if (name.length > 10) {
            attendeeName = name.substr(0, 8) + "...";
        }
        return <Tooltip title={name}>{<div style={{ fontSize: FONT_SIZE }}>{attendeeName}</div>}</Tooltip>;
    };
    const attendeeList = useMemo(() => {
        const attendeeRows = Object.values(chimeClientState.attendees).map((x) => {
            const micIcon = x.muted ? generateButton(AttendeeStateIconSettings.MicOff) : generateButton(AttendeeStateIconSettings.MicOn);
            let cameraIcon;
            let isCameraOn;
            if (x.attendeeId === chimeClientState.attendeeId) {
                isCameraOn = chimeClientState.videoInputEnable;
            } else {
                isCameraOn = x.cameraOn;
            }
            if (isCameraOn === true && x.isVideoPaused === true) {
                cameraIcon = generateButton(AttendeeStateIconSettings.CameraPaused, () => {
                    chimeClientState.pauseVideo(x.attendeeId, false);
                    console.log("unpause!", x.attendeeId);
                });
            } else if (isCameraOn === true && x.isVideoPaused === false) {
                cameraIcon = generateButton(AttendeeStateIconSettings.CameraOn, () => {
                    chimeClientState.pauseVideo(x.attendeeId, true);
                    console.log("pause!", x.attendeeId);
                });
            } else {
                cameraIcon = generateButton(AttendeeStateIconSettings.CameraOff);
            }
            const namePlate = generateNamePlate(x.name);
            return (
                <div key={x.attendeeId} style={{ display: "flex", alignItems: "center" }}>
                    {micIcon}
                    {cameraIcon}
                    {namePlate}
                </div>
            );
        });
        return <div style={{ display: "flex", flexDirection: "column", background: "#ffffffaa", overflow: "auto" }}>{attendeeRows}</div>;
    }, [attendeesKey]);

    return { attendeeList };
};
