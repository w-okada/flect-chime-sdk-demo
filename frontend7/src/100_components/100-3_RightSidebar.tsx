import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useStateControlCheckbox } from "./hooks/useStateControlCheckbox";
import { useAppState } from "../003_provider/AppStateProvider";
import { AnimationTypes, HeaderButton, HeaderButtonProps } from "./parts/002_HeaderButton";
import { ChannelMessageType } from "@aws-sdk/client-chime";
import { MessageTypes } from "../messaging_format";
export type RightSidebarProps = {};

export const RightSidebar = (_props: RightSidebarProps) => {
    const { chimeClientState, frontendState, messagingClientState } = useAppState();
    const sidebarAccordionAttendeesCheckbox = useStateControlCheckbox("sidebar-accordion-attendees-checkbox");
    const sidebarAccordionLocalChatCheckbox = useStateControlCheckbox("sidebar-accordion-local-chat-checkbox");
    const sidebarAccordionWiteboardCheckbox = useStateControlCheckbox("sidebar-accordion-whiteboard-checkbox");

    /**
     * (1) action linking
     */
    //// (1-1) accordion button
    const accodionButtonForAttendeeList = useMemo(() => {
        const accodionButtonForAttendeeListProps: HeaderButtonProps = {
            stateControlCheckbox: sidebarAccordionAttendeesCheckbox,
            tooltip: "Open/Close attendee list",
            onIcon: ["fas", "caret-down"],
            offIcon: ["fas", "caret-down"],
            animation: AnimationTypes.spinner,
            tooltipClass: "tooltip-right",
        };
        return <HeaderButton {...accodionButtonForAttendeeListProps}></HeaderButton>;
    }, []);

    //// (1-2) accordion button
    const accodionButtonForLocalChat = useMemo(() => {
        const accodionButtonForLocalChatProps: HeaderButtonProps = {
            stateControlCheckbox: sidebarAccordionLocalChatCheckbox,
            tooltip: "Open/Close chat",
            onIcon: ["fas", "caret-down"],
            offIcon: ["fas", "caret-down"],
            animation: AnimationTypes.spinner,
            tooltipClass: "tooltip-right",
        };
        return <HeaderButton {...accodionButtonForLocalChatProps}></HeaderButton>;
    }, []);

    //// (1-3) accordion button
    const accodionButtonForWiteboard = useMemo(() => {
        const accodionButtonForWiteboardProps: HeaderButtonProps = {
            stateControlCheckbox: sidebarAccordionWiteboardCheckbox,
            tooltip: "Open/Close drawing",
            onIcon: ["fas", "caret-down"],
            offIcon: ["fas", "caret-down"],
            animation: AnimationTypes.spinner,
            tooltipClass: "tooltip-right",
        };
        return <HeaderButton {...accodionButtonForWiteboardProps}></HeaderButton>;
    }, []);

    //// () generate Attendee list
    const attendeeItems = useMemo(() => {
        return Object.values(chimeClientState.attendees).map((x) => {
            let cameraIcon;
            if (frontendState.currentMeetingInfo!.attendeeInfo.AttendeeId === x.attendeeId) {
                cameraIcon = chimeClientState.isLocalVideoStarted() ? <FontAwesomeIcon icon={["fas", "video"]} /> : <FontAwesomeIcon icon={["fas", "video-slash"]} />;
            } else {
                cameraIcon = x.cameraOn ? <FontAwesomeIcon icon={["fas", "video"]} /> : <FontAwesomeIcon icon={["fas", "video-slash"]} />;
            }

            const micIcon = !x.muted ? <FontAwesomeIcon icon={["fas", "microphone"]} /> : <FontAwesomeIcon icon={["fas", "microphone-slash"]} />;

            return (
                <div key={x.attendeeId} className="sidebar-attendee-item">
                    <div className="sidebar-attendee-name">
                        {micIcon} {cameraIcon}
                        {x.attendeeName}
                    </div>
                </div>
            );
        });
    }, [chimeClientState.attendees]);

    const [signageText, setSignageText] = useState<string>("Flect Amazon Chime SDK demo ");
    useEffect(() => {
        const sinageArea = document.getElementById("sidebar-signage-area") as HTMLDivElement;
        sinageArea.innerHTML = "";
        const letters = signageText.split("").map((x) => {
            const letter = document.createElement("span");
            letter.className = "letter";
            if (x === " ") {
                letter.innerHTML = "&nbsp&nbsp";
            } else {
                letter.innerHTML = x;
            }
            sinageArea.appendChild(letter);
            return letter;
        });

        letters.forEach((x, i) => {
            x.className = "letter behind";
            setTimeout(() => {
                x.className = "letter in";
            }, i * 80);
        });
        const wait = 1000 * 2;
        letters.forEach((x, i) => {
            setTimeout(() => {
                x.className = "letter out";
            }, 80 * letters.length + wait + i * 80);
        });
    }, [signageText]);

    useEffect(() => {
        setInterval(() => {
            setSignageText("now:" + new Date().getTime());
        }, 1000 * 5);
    }, []);

    const messages = useMemo(() => {
        console.log("[Global Message Update]", messagingClientState.globalMessages);
        const messages = messagingClientState.meetingMessages
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
    }, [messagingClientState.meetingMessages]);

    const sendMessage = async () => {
        const input = document.getElementById("right-sidebar-chat-text-input") as HTMLInputElement;
        messagingClientState.sendChannelMessage(input.value);
        input.value = "";
    };
    return (
        <>
            {frontendState.stateControls.openRightSidebarCheckbox.trigger}
            <div className="right-sidebar">
                <div className="sidebar-partition">
                    <div className="sidebar-signage-area" id="sidebar-signage-area"></div>
                </div>

                {sidebarAccordionAttendeesCheckbox.trigger}
                <div className="sidebar-partition">
                    <div className="sidebar-header">
                        <div className="title"> Attendees</div>
                        <div className="caret"> {accodionButtonForAttendeeList}</div>
                    </div>
                    <div className="sidebar-content">
                        <div className="sidebar-attendee-list">{attendeeItems}</div>
                    </div>
                </div>

                {sidebarAccordionLocalChatCheckbox.trigger}
                <div className="sidebar-partition">
                    <div className="sidebar-header">
                        <div className="title"> Chat (Local)</div>
                        <div className="caret"> {accodionButtonForLocalChat}</div>
                    </div>

                    <div className="sidebar-content">
                        <div className="sidebar-chat">
                            <div className="sidebar-chat-message-view">{messages}</div>
                            <input type="text" id="right-sidebar-chat-text-input" className="sidebar-chat-text-input" />
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

                {sidebarAccordionWiteboardCheckbox.trigger}
                <div className="sidebar-partition">
                    <div className="sidebar-header">
                        <div className="title">Draw</div>
                        <div className="caret"> {accodionButtonForWiteboard}</div>
                    </div>

                    <div className="sidebar-content">
                        <div>N/A</div>
                        <div>N/A</div>
                    </div>
                </div>
            </div>
        </>
    );
};
