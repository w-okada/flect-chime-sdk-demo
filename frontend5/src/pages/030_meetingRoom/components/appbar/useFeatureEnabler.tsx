import React, { useMemo } from "react";
import { IconButton, Tooltip } from "@material-ui/core";
import { ScreenShare, StopScreenShare, Receipt } from "@material-ui/icons";
import PeopleIcon from "@mui/icons-material/People";
import { useAppState } from "../../../../providers/AppStateProvider";
import { ToolbarHeight } from "../../../../constants";
const FeatureType = {
    ScreenShare: "ScreenShare",
    SideBar: "SideBar",
    AttendeesView: "AttendeesView",
} as const;
type FeatureType = typeof FeatureType[keyof typeof FeatureType];

type FeatureEnablerSetting = {
    onIcon: JSX.Element;
    offIcon: JSX.Element;
    onTooltip: string;
    offTooltip: string;
};

const FeatureEnablerSettings: { [key in FeatureType]: FeatureEnablerSetting } = {
    ScreenShare: {
        onIcon: <ScreenShare style={{ color: "#ee7777" }} />,
        offIcon: <ScreenShare />,
        onTooltip: "Stop ScreenShare",
        offTooltip: "Start ScreenShare",
    },
    SideBar: {
        onIcon: <Receipt style={{ color: "#ee7777" }} />,
        offIcon: <Receipt />,
        onTooltip: "close sidebar",
        offTooltip: "open sidebar",
    },
    AttendeesView: {
        onIcon: <PeopleIcon style={{ color: "#ee7777" }} />,
        offIcon: <PeopleIcon />,
        onTooltip: "close attendees view",
        offTooltip: "show attendees view",
    },
};

export const useFeatureEnabler = () => {
    const { chimeClientState, frontendState } = useAppState();

    const enableShareContet = async (val: boolean) => {
        console.log("enable share", val);
        if (val) {
            try {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore https://github.com/microsoft/TypeScript/issues/31821
                const media = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: true,
                });
                chimeClientState.startShareContent(media);
            } catch (e) {
                console.log(e);
            }
        } else {
            chimeClientState.stopShareContent();
        }
    };

    const generateButton = (setting: FeatureEnablerSetting, setEnable: (val: boolean) => void, enable: boolean) => {
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

    const screenShareButton = useMemo(() => {
        return generateButton(FeatureEnablerSettings.ScreenShare, enableShareContet, chimeClientState.isShareContent);
    }, [chimeClientState.isShareContent]);
    const sideBarButton = useMemo(() => {
        return generateButton(FeatureEnablerSettings.SideBar, frontendState.setSideBarOpen, frontendState.sideBarOpen);
    }, [frontendState.sideBarOpen]);
    const attendeesViewButton = useMemo(() => {
        return generateButton(FeatureEnablerSettings.AttendeesView, frontendState.setAttendeesViewOpen, frontendState.attendeesViewOpen);
    }, [frontendState.attendeesViewOpen]);

    return { screenShareButton, sideBarButton, attendeesViewButton };
};
