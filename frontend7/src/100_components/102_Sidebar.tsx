import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useStateControlCheckbox } from "./hooks/useStateControlCheckbox";
import { useAppState } from "../providers/AppStateProvider";
import { MeetingInfo } from "../003_chime/FlectChimeClient";

export type SidebarProps = {
    newRoomClicked: () => void;
    joinRoomClicked: (meetingName: string, useCode: boolean) => void;
    joinSecretRoomClicked: () => void;
};

export const Sidebar = (props: SidebarProps) => {
    const { chimeBackendState } = useAppState();
    const sidebarAccordionMeetingCheckbox = useStateControlCheckbox("sidebar-accordion-meeting-checkbox");
    const sidebarAccordionChatCheckbox = useStateControlCheckbox("sidebar-accordion-chat-checkbox");

    /**
     * (1) Operation
     */
    //// (1-1) new meeting room
    const newRoomClicked = async () => {
        props.newRoomClicked();
    };
    //// (1-2) reload meetings
    const reloadRoomClicked = async () => {
        chimeBackendState.reloadMeetingList({});
    };
    ///// (1-3)
    const joinSecretRoomClicked = async () => {
        props.joinSecretRoomClicked();
    };
    const joinMeetingClicked = async (meetingName: string, useCode: boolean) => {
        props.joinRoomClicked(meetingName, useCode);
    };

    /**
     * (1) action linking
     */
    //// (1) accordion button
    const accodionButtonForMeeting = useMemo(() => {
        return (
            <div className="rotate-button-container">
                {sidebarAccordionMeetingCheckbox.trigger}
                <label htmlFor="sidebar-accordion-meeting-checkbox" className="rotate-lable">
                    <div className="spinner">
                        <FontAwesomeIcon icon={["fas", "caret-down"]} className="spin-off" />
                        <FontAwesomeIcon icon={["fas", "caret-down"]} className="spin-on" />
                    </div>
                </label>
            </div>
        );
    }, []);

    //// (1) accordion button
    const accodionButtonForChat = useMemo(() => {
        return (
            <div className="rotate-button-container">
                {sidebarAccordionChatCheckbox.trigger}
                <label htmlFor="sidebar-accordion-chat-checkbox" className="rotate-lable">
                    <div className="spinner">
                        <FontAwesomeIcon icon={["fas", "caret-down"]} className="spin-off" />
                        <FontAwesomeIcon icon={["fas", "caret-down"]} className="spin-on" />
                    </div>
                </label>
            </div>
        );
    }, []);

    //// () generate Room list
    const roomItems = useMemo(() => {
        return chimeBackendState.meetings.map((x, index) => {
            const key = x.meetingId === "---secret---" ? `---secret---${index}` : x.meetingId;
            return (
                <div key={key} className="sidebar-room-item">
                    <div className="sidebar-room-name">{decodeURIComponent(x.meetingName)}</div>
                    <div
                        className="sidebar-room-join"
                        onClick={() => {
                            joinMeetingClicked(x.meetingName, x.metadata["UseCode"]);
                        }}
                    >
                        Join <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                    </div>
                </div>
            );
        });
    }, [chimeBackendState.meetings]);

    // /**
    //  * (2)action linking
    //  */
    // // (2-1) Open Meeting Accrdion
    // useEffect(() => {
    //     const meetingCheckboxes = document.querySelectorAll(".sidebar-accordion-meeting-checkbox");
    //     meetingCheckboxes.forEach((x) => {
    //         // @ts-ignore
    //         x.onchange = (ev) => {
    //             const meetingCheckboxes = document.querySelectorAll(".sidebar-accordion-meeting-checkbox");
    //             meetingCheckboxes.forEach((y) => {
    //                 //@ts-ignore
    //                 y.checked = ev.target.checked;
    //             });
    //         };
    //     });
    // }, []);

    // // (2-2) open Global Chat Accrdion
    // useEffect(() => {
    //     const meetingCheckboxes = document.querySelectorAll(".sidebar-accordion-chat-checkbox");
    //     meetingCheckboxes.forEach((x) => {
    //         // @ts-ignore
    //         x.onchange = (ev) => {
    //             const meetingCheckboxes = document.querySelectorAll(".sidebar-accordion-chat-checkbox");
    //             meetingCheckboxes.forEach((y) => {
    //                 //@ts-ignore
    //                 y.checked = ev.target.checked;
    //             });
    //         };
    //     });
    // }, []);

    return (
        <>
            <input type="checkbox" className="open-sidebar-checkbox" id="open-sidebar-checkbox-secondary" />
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
                        <div>a</div>
                        <div>a</div>
                        <div>a</div>
                        <div>a</div>
                        <div>a</div>
                        <div>a</div>
                        <div>a</div>
                        <div>a</div>
                        <div>a</div>
                        <div>a</div>
                        <div>a</div>
                    </div>
                </div>
            </div>
        </>
    );
};
