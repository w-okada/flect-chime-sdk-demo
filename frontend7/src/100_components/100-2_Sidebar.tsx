import React, { useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useStateControlCheckbox } from "./hooks/useStateControlCheckbox";
import { useAppState } from "../003_provider/AppStateProvider";
import { AnimationTypes, HeaderButton, HeaderButtonProps } from "./parts/002_HeaderButton";
import { ChannelMessageType } from "@aws-sdk/client-chime";
import { MessageTypes } from "../messaging_format";

export type SidebarProps = {};

export const Sidebar = (_props: SidebarProps) => {
    const { backendManagerState, frontendState, messagingClientState } = useAppState();
    const sidebarAccordionMeetingCheckbox = useStateControlCheckbox("sidebar-accordion-meeting-checkbox");
    const sidebarAccordionChatCheckbox = useStateControlCheckbox("sidebar-accordion-chat-checkbox");

    /**
     * (1) Operation
     */
    //// (1-1) new meeting room
    const newRoomClicked = useMemo(() => {
        return async () => {
            frontendState.stateControls.createRoomCheckbox.updateState(true);
        };
    }, []);
    //// (1-2) reload meetings
    const reloadRoomClicked = useMemo(() => {
        return async () => {
            backendManagerState.reloadMeetingList({});
        };
    }, [backendManagerState]);
    ///// (1-3)
    const joinSecretRoomClicked = useMemo(() => {
        return async () => {
            frontendState.setJoinRoomDialogProps({
                decodedMeetingName: "",
                useCode: true,
            });
            frontendState.stateControls.joinRoomCheckbox.updateState(true);
        };
    }, []);
    const joinMeetingClicked = useMemo(() => {
        return async (decodedMeetingName: string, useCode: boolean) => {
            frontendState.setJoinRoomDialogProps({
                decodedMeetingName,
                useCode: useCode,
            });
            frontendState.stateControls.joinRoomCheckbox.updateState(true);
        };
    }, []);

    // Buttons
    //// (1) accordion button for meeting list
    const accodionButtonForMeeting = useMemo(() => {
        const accodionButtonForMeetingProps: HeaderButtonProps = {
            stateControlCheckbox: sidebarAccordionMeetingCheckbox,
            tooltip: "Open/Close meeting list",
            onIcon: ["fas", "caret-down"],
            offIcon: ["fas", "caret-down"],
            animation: AnimationTypes.spinner,
            tooltipClass: "tooltip-right",
        };
        return <HeaderButton {...accodionButtonForMeetingProps}></HeaderButton>;
    }, []);

    //// (2) accordion button for global chat
    const accodionButtonForChat = useMemo(() => {
        const accodionButtonForChatProps: HeaderButtonProps = {
            stateControlCheckbox: sidebarAccordionChatCheckbox,
            tooltip: "Open/Close chat",
            onIcon: ["fas", "caret-down"],
            offIcon: ["fas", "caret-down"],
            animation: AnimationTypes.spinner,
            tooltipClass: "tooltip-right",
        };
        return <HeaderButton {...accodionButtonForChatProps}></HeaderButton>;
    }, []);

    //// () generate Room list
    const roomItems = useMemo(() => {
        return backendManagerState.meetings.map((x, index) => {
            const key = x.meetingId === "---secret---" ? `---secret---${index}` : x.meetingId;
            const decodedMeetingName = decodeURIComponent(x.meetingName);
            return (
                <div key={key} className="sidebar-room-item">
                    <div className="sidebar-room-name">{decodedMeetingName}</div>
                    <div
                        className="sidebar-room-join"
                        onClick={() => {
                            joinMeetingClicked(decodedMeetingName, x.metadata["UseCode"]);
                        }}
                    >
                        Join <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                    </div>
                </div>
            );
        });
    }, [backendManagerState.meetings]);

    const messages = useMemo(() => {
        console.log("[Global Message Update]", messagingClientState.globalMessages);
        const messages = messagingClientState.globalMessages
            .slice(0, 100)
            .map((x) => {
                try {
                    const content = JSON.parse(x.content);
                    const date = new Date(x.createdTimestamp);
                    return {
                        type: x.type,
                        senderName: x.senderName,
                        time: `${date.toLocaleString()}`,
                        contentType: content.type,
                        content: content.data,
                    };
                } catch (ex) {
                    return {
                        type: x.type,
                        senderName: x.senderName,
                        time: new Date(x.createdTimestamp).toDateString(),
                        contentType: "",
                        content: "",
                    };
                }
            })
            .filter((x) => {
                return x.type == ChannelMessageType.STANDARD;
            })
            .filter((x) => {
                return x.contentType == MessageTypes.MESSAGE;
            });
        const m = messages.map((x, index) => {
            return (
                <div key={`sidebar-chat-message-content-${index}`} className="sidebar-chat-message-content">
                    <div className="sidebar-chat-message-metadata">
                        {x.time} {x.senderName}
                    </div>
                    <div className="sidebar-chat-message-data">{x.content}</div>
                </div>
            );
        });
        return m;
    }, [messagingClientState.globalMessages]);

    const sendMessage = async () => {
        const input = document.getElementById("sidebar-chat-text-input") as HTMLInputElement;
        // messagingClientState.sendChannelMessage(input.value);
        messagingClientState.sendGlobalMessage(input.value);
        input.value = "";
    };
    return (
        <>
            {frontendState.stateControls.openSidebarCheckbox.trigger}
            <div className="sidebar">
                {sidebarAccordionMeetingCheckbox.trigger}
                <div className="sidebar-partition">
                    <div className="sidebar-header">
                        <div className="title"> Room</div>
                        <div className="caret"> {accodionButtonForMeeting}</div>
                    </div>
                    <div className="sidebar-content">
                        <div className="sidebar-create-room" onClick={newRoomClicked}>
                            + new room
                        </div>
                        <div className="sidebar-create-room" onClick={reloadRoomClicked}>
                            + reload list
                        </div>
                        <div className="sidebar-create-room" onClick={joinSecretRoomClicked}>
                            + join secret room
                        </div>

                        <div className="sidebar-room-list">{roomItems}</div>
                    </div>
                </div>

                {sidebarAccordionChatCheckbox.trigger}

                <div className="sidebar-partition">
                    <div className="sidebar-header">
                        <div className="title"> Chat (Global)</div>
                        <div className="caret"> {accodionButtonForChat}</div>
                    </div>

                    <div className="sidebar-content">
                        <div className="sidebar-chat">
                            <div className="sidebar-chat-message-view">{messages}</div>
                            <input type="text" id="sidebar-chat-text-input" className="sidebar-chat-text-input" />
                            <div
                                className="sidebar-chat-text-submit"
                                onClick={() => {
                                    sendMessage();
                                }}
                            >
                                send
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
