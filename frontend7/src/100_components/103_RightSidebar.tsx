import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useStateControlCheckbox } from "./hooks/useStateControlCheckbox";
import { useAppState } from "../003_provider/AppStateProvider";
import { MeetingInfo } from "../001_clients_and_managers/003_chime/FlectChimeClient";

export type RightSidebarProps = {
    rightSidebarTrigger: JSX.Element;
};

export const RightSidebar = (props: RightSidebarProps) => {
    const { chimeClientState } = useAppState();
    const sidebarAccordionAttendeesCheckbox = useStateControlCheckbox("sidebar-accordion-attendees-checkbox");
    const sidebarAccordionLocalChatCheckbox = useStateControlCheckbox("sidebar-accordion-local-chat-checkbox");
    const sidebarAccordionWiteboardCheckbox = useStateControlCheckbox("sidebar-accordion-whiteboard-checkbox");

    // /**
    //  * (1) Operation
    //  */
    // //// (1-1) new meeting room
    // const newRoomClicked = async () => {
    //     props.newRoomClicked();
    // };
    // //// (1-2) reload meetings
    // const reloadRoomClicked = async () => {
    //     backendManagerState.reloadMeetingList({});
    // };
    // ///// (1-3)
    // const joinSecretRoomClicked = async () => {
    //     props.joinSecretRoomClicked();
    // };
    // const joinMeetingClicked = async (decodedMeetingName: string, useCode: boolean) => {
    //     props.joinRoomClicked(decodedMeetingName, useCode);
    // };

    /**
     * (1) action linking
     */
    //// (1) accordion button
    const accodionButtonForMeeting = useMemo(() => {
        return (
            <div className="rotate-button-container">
                {sidebarAccordionAttendeesCheckbox.trigger}
                <label htmlFor="sidebar-accordion-attendees-checkbox" className="rotate-lable">
                    <div className="spinner">
                        <FontAwesomeIcon icon={["fas", "caret-down"]} className="spin-off" />
                        <FontAwesomeIcon icon={["fas", "caret-down"]} className="spin-on" />
                    </div>
                </label>
            </div>
        );
    }, []);

    //// (1) accordion button
    const accodionButtonForLocalChat = useMemo(() => {
        return (
            <div className="rotate-button-container">
                {sidebarAccordionLocalChatCheckbox.trigger}
                <label htmlFor="sidebar-accordion-local-chat-checkbox" className="rotate-lable">
                    <div className="spinner">
                        <FontAwesomeIcon icon={["fas", "caret-down"]} className="spin-off" />
                        <FontAwesomeIcon icon={["fas", "caret-down"]} className="spin-on" />
                    </div>
                </label>
            </div>
        );
    }, []);

    //// (1) accordion button
    const accodionButtonForWiteboard = useMemo(() => {
        return (
            <div className="rotate-button-container">
                {sidebarAccordionWiteboardCheckbox.trigger}
                <label htmlFor="sidebar-accordion-whiteboard-checkbox" className="rotate-lable">
                    <div className="spinner">
                        <FontAwesomeIcon icon={["fas", "caret-down"]} className="spin-off" />
                        <FontAwesomeIcon icon={["fas", "caret-down"]} className="spin-on" />
                    </div>
                </label>
            </div>
        );
    }, []);

    //// () generate Attendee list
    const attendeeItems = useMemo(() => {
        return Object.values(chimeClientState.attendees).map((x, index) => {
            return (
                <div key={x.attendeeId} className="sidebar-attendee-item">
                    <div className="sidebar-attendee-name">{x.attendeeName}</div>
                </div>
            );
        });
    }, [chimeClientState.attendees]);

    const [signageText, setSignageText] = useState<string>("F C");
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

    return (
        <>
            {props.rightSidebarTrigger}
            <div className="right-sidebar">
                <div className="sidebar-partition">
                    <div className="sidebar-signage-area" id="sidebar-signage-area"></div>
                </div>

                {sidebarAccordionAttendeesCheckbox.trigger}
                <div className="sidebar-partition">
                    <div className="sidebar-header">
                        <div className="title"> Attendees</div>
                        <div className="caret"> {accodionButtonForMeeting}</div>
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
                        {/* <div>a</div>
                        <div>a</div> */}
                    </div>
                </div>

                {sidebarAccordionWiteboardCheckbox.trigger}
                <div className="sidebar-partition">
                    <div className="sidebar-header">
                        <div className="title">Draw</div>
                        <div className="caret"> {accodionButtonForWiteboard}</div>
                    </div>

                    <div className="sidebar-content">
                        <div>a</div>
                        <div>a</div>
                    </div>
                </div>
            </div>
        </>
    );
};
