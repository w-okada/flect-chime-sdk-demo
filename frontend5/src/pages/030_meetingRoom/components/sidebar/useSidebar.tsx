import { IconButton, Tooltip } from "@material-ui/core";
import { Mic, MicOff, Videocam, VideocamOff } from "@material-ui/icons";
import React from "react";
import { useMemo } from "react";
import { ToolbarHeight } from "../../../../constants";
import { useAppState } from "../../../../providers/AppStateProvider";
import { useAttendeesList } from "./useAttendeesList";
import { useChatArea } from "./useChatArea";
import { useWhiteboardArea } from "./useWhiteboardArea";

export const useSidebar = () => {
    const { frontendState } = useAppState();
    const { attendeeList } = useAttendeesList();
    const { chatArea } = useChatArea();
    const { whiteboardArea } = useWhiteboardArea();
    const sideBar = useMemo(() => {
        if (frontendState.sideBarOpen === false) {
            return <></>;
        }

        return (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ maxHeight: "30%" }}>{attendeeList}</div>
                <div style={{ maxHeight: "50%", width: "100%" }}>{chatArea}</div>
                <div style={{ maxHeight: "20%", width: "100%" }}>{whiteboardArea}</div>
            </div>
        );
    }, [attendeeList, chatArea, whiteboardArea, frontendState.sideBarOpen]);

    return { sideBar };
};
