import React, { useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useStateControlCheckbox } from "./hooks/useStateControlCheckbox";

export type SidebarProps = {
    newRoomClicked: () => void;
    reloadRoomClicked: () => void;
};

export const Sidebar = (props: SidebarProps) => {
    const sidebarAccordionMeetingCheckbox = useStateControlCheckbox("sidebar-accordion-meeting-checkbox");
    const sidebarAccordionChatCheckbox = useStateControlCheckbox("sidebar-accordion-chat-checkbox");
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
                        <div className="sidebar-create-room" onClick={props.newRoomClicked}>
                            + new room
                        </div>
                        <div className="sidebar-room-list">
                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join tooltip-right" data-tooltip="join meeting">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-right" data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                                <div className="sidebar-room-join">
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} data-tooltip="join meeting" />
                                </div>
                            </div>

                            <div className="sidebar-room-item">
                                <div className="sidebar-room-name tooltip-bottom" data-tooltip="join meeting">
                                    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
                                </div>
                                <div className="sidebar-room-join tooltip-bottom" data-tooltip="join meeting" style={{ zIndex: 1000 }}>
                                    <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="tooltip-bottom" data-tooltip="join meeting" />
                                </div>
                            </div>
                        </div>
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
