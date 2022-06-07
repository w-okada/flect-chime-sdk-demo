import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useStateControlCheckbox } from "./hooks/useStateControlCheckbox";
import { useAppState } from "../003_provider/AppStateProvider";
import { MeetingInfo } from "../001_clients_and_managers/003_chime/FlectChimeClient";

export type SidebarProps = {
    newRoomClicked: () => void;
    joinRoomClicked: (decodedMeetingName: string, useCode: boolean) => void;
    joinSecretRoomClicked: () => void;
    sidebarTrigger: JSX.Element;
};

export const Sidebar = (props: SidebarProps) => {
    const { backendManagerState } = useAppState();
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
        backendManagerState.reloadMeetingList({});
    };
    ///// (1-3)
    const joinSecretRoomClicked = async () => {
        props.joinSecretRoomClicked();
    };
    const joinMeetingClicked = async (decodedMeetingName: string, useCode: boolean) => {
        props.joinRoomClicked(decodedMeetingName, useCode);
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

    return (
        <>
            {/* <input type="checkbox" className="open-sidebar-checkbox" id="open-sidebar-checkbox-secondary" /> */}
            {props.sidebarTrigger}
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
