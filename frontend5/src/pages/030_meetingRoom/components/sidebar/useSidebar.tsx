import { IconButton, Tooltip } from "@material-ui/core";
import { Mic, MicOff, Videocam, VideocamOff } from "@material-ui/icons";
import React from "react";
import { useMemo } from "react";
import { ToolbarHeight } from "../../../../constants";
import { useAppState } from "../../../../providers/AppStateProvider";
import { useAttendeesList } from "./useAttendeesList";
import { useChatArea } from "./useChatArea";

export const useSidebar = () => {
    const { frontendState } = useAppState();
    const { attendeeList } = useAttendeesList();
    const { chatArea } = useChatArea();

    const sideBar = useMemo(() => {
        if (frontendState.sideBarOpen === false) {
            return <></>;
        }

        return (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ maxHeight: "30%" }}>{attendeeList}</div>
                <div style={{ maxHeight: "50%", width: "100%" }}>{chatArea}</div>
            </div>
        );
    }, [attendeeList, chatArea, frontendState.sideBarOpen]);

    return { sideBar };
};
