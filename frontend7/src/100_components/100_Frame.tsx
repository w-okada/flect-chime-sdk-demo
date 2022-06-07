import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SignInDialog, SignInDialogProps } from "./101-1_SignInDialog";
import { Sidebar, SidebarProps } from "./102_Sidebar";
import { useStateControlCheckbox } from "./hooks/useStateControlCheckbox";
import { CreateRoomDialog, CreateRoomDialogProps } from "./101-2_CreateRoomDialog";
import { useAppState } from "../003_provider/AppStateProvider";
import { JoinRoomDialog, JoinRoomDialogProps } from "./101-3_JoinRoomDialog";
import { SettingDialog } from "./101-5_SettingDialog";
import { Chime } from "aws-sdk";
import { RightSidebar, RightSidebarProps } from "./103_RightSidebar";

export type FrameProps = {
    signInCompleted: boolean;
    signInDialogProps: SignInDialogProps;
};

export const Frame = (props: FrameProps) => {
    const { frontendState, chimeClientState } = useAppState();
    const [joinRoomProps, setJoinRoomProps] = useState<JoinRoomDialogProps>({
        decodedMeetingName: "",
        useCode: false,
        close: () => {},
    });
    const openSidebarCheckbox = useStateControlCheckbox("open-sidebar-checkbox");
    const micEnableCheckbox = useStateControlCheckbox("mic-enable-checkbox");
    const cameraEnableCheckbox = useStateControlCheckbox("camera-enable-checkbox");
    const speakerEnableCheckbox = useStateControlCheckbox("speaker-enable-checkbox");
    const openBottomNavCheckbox = useStateControlCheckbox("open-bottom-nav-checkbox");
    const openRightSidebarCheckbox = useStateControlCheckbox("open-right-sidebar-checkbox");
    const shareScreenCheckbox = useStateControlCheckbox("share-screen-checkbox");
    const startTranscribeCheckbox = useStateControlCheckbox("start-transcribe-checkbox");
    const settingCheckbox = useStateControlCheckbox("setting-checkbox");
    const leaveCheckbox = useStateControlCheckbox("leave-checkbox");

    const signInCheckbox = useStateControlCheckbox("sign-in-checkbox");
    const createRoomCheckbox = useStateControlCheckbox("create-room-checkbox");
    const joinRoomCheckbox = useStateControlCheckbox("join-room-checkbox");

    /**
     * components
     */
    // (1) Header Buttons
    //// (1-1) Left space
    ////// (1-1-1) Sidebar Button
    const sidebarButton = (
        <div className="rotate-button-container">
            {openSidebarCheckbox.trigger}
            <label htmlFor="open-sidebar-checkbox" className="rotate-lable">
                <div className="spinner">
                    <FontAwesomeIcon icon={["fas", "bars"]} className="spin-off" />
                    <FontAwesomeIcon icon={["fas", "xmark"]} className="spin-on" />
                </div>
            </label>
        </div>
    );
    //// (1-2) Center space
    // None....

    //// (1-3) Right space

    ///// (1-3-1) Microphone
    const micButton = (
        <div className="rotate-button-container tooltip-bottom" data-tooltip="mic on/off">
            {micEnableCheckbox.trigger}
            <label htmlFor="mic-enable-checkbox" className="rotate-lable">
                <div className="colored">
                    <FontAwesomeIcon icon={["fas", "microphone"]} className="spin-on" />
                    <FontAwesomeIcon icon={["fas", "microphone-slash"]} className="spin-off" />
                </div>
            </label>
        </div>
    );

    ///// (1-3-2) Camera
    const cameraButton = (
        <div className="rotate-button-container tooltip-bottom" data-tooltip="camera on/off">
            {cameraEnableCheckbox.trigger}
            <label htmlFor="camera-enable-checkbox" className="rotate-lable">
                <div className="colored">
                    <FontAwesomeIcon icon={["fas", "video"]} className="spin-on" />
                    <FontAwesomeIcon icon={["fas", "video-slash"]} className="spin-off" />
                </div>
            </label>
        </div>
    );

    ///// (1-3-3) Speaker
    const speakerButton = (
        <div className="rotate-button-container tooltip-bottom" data-tooltip="speaker on/off">
            {speakerEnableCheckbox.trigger}
            <label htmlFor="speaker-enable-checkbox" className="rotate-lable">
                <div className="colored">
                    <FontAwesomeIcon icon={["fas", "volume-high"]} className="spin-on" />
                    <FontAwesomeIcon icon={["fas", "volume-mute"]} className="spin-off" />
                </div>
            </label>
        </div>
    );

    ///// (1-3-4) Bottom Nav
    const bottomNavButton = (
        <div className="rotate-button-container tooltip-bottom" data-tooltip="show attendee's video">
            {openBottomNavCheckbox.trigger}
            <label htmlFor="open-bottom-nav-checkbox" className="rotate-lable">
                <div className="colored">
                    <FontAwesomeIcon icon={["fas", "users-rectangle"]} className="spin-on" />
                    <FontAwesomeIcon icon={["fas", "users-rectangle"]} className="spin-off" />
                </div>
            </label>
        </div>
    );
    ///// (1-3-5) Right Sidebar
    const rightSidebarButton = (
        <div className="rotate-button-container tooltip-bottom" data-tooltip="open utility area(attendee-list, chat...)">
            {openRightSidebarCheckbox.trigger}
            <label htmlFor="open-right-sidebar-checkbox" className="rotate-lable">
                <div className="colored">
                    <div className="spin-on" style={{ position: "relative", width: "100%" }}>
                        <FontAwesomeIcon icon={["fas", "chart-line"]} style={{ width: "45%", height: "65%", top: "-2px", position: "absolute" }} />
                        <FontAwesomeIcon icon={["fas", "comment"]} style={{ width: "35%", height: "35%", right: 0, position: "absolute" }} />

                        <FontAwesomeIcon icon={["fas", "user-group"]} style={{ width: "85%", height: "80%", right: 0, bottom: "-1px", position: "absolute" }} />
                    </div>
                    <div className="spin-off" style={{ position: "relative", width: "100%" }}>
                        <FontAwesomeIcon icon={["fas", "chart-line"]} style={{ width: "45%", height: "65%", top: "-2px", position: "absolute" }} />
                        <FontAwesomeIcon icon={["fas", "comment"]} style={{ width: "35%", height: "35%", right: 0, position: "absolute" }} />

                        <FontAwesomeIcon icon={["fas", "user-group"]} style={{ width: "85%", height: "80%", right: 0, bottom: "-1px", position: "absolute" }} />
                    </div>
                </div>
            </label>
        </div>
    );

    ///// (1-3-6) share screen
    const shareScreenButton = (
        <div className="rotate-button-container tooltip-bottom" data-tooltip="share screen">
            {shareScreenCheckbox.trigger}
            <label htmlFor="share-screen-checkbox" className="rotate-lable">
                <div className="colored">
                    <FontAwesomeIcon icon={["fas", "share-from-square"]} className="spin-on" />
                    <FontAwesomeIcon icon={["fas", "share-from-square"]} className="spin-off" />
                </div>
            </label>
        </div>
    );

    ///// (1-3-7) start transcribe
    const startTranscribeButton = (
        <div className="rotate-button-container tooltip-bottom" data-tooltip="transcribe">
            {startTranscribeCheckbox.trigger}
            <label htmlFor="start-transcribe-checkbox" className="rotate-lable">
                <div className="colored">
                    <FontAwesomeIcon icon={["fas", "t"]} className="spin-on" />
                    <FontAwesomeIcon icon={["fas", "t"]} className="spin-off" />
                </div>
            </label>
        </div>
    );
    ///// (1-3-8) setting
    const settingButton = (
        <div className="rotate-button-container tooltip-bottom" data-tooltip="setting">
            {settingCheckbox.trigger}
            <label htmlFor="setting-checkbox" className="rotate-lable">
                <div className="colored">
                    <FontAwesomeIcon icon={["fas", "gear"]} className="spin-on" />
                    <FontAwesomeIcon icon={["fas", "gear"]} className="spin-off" />
                </div>
            </label>
        </div>
    );
    ///// (1-3-9) leave
    const leaveButton = (
        <div className="rotate-button-container tooltip-bottom" data-tooltip="leave demo">
            {leaveCheckbox.trigger}
            <label htmlFor="leave-checkbox" className="rotate-lable">
                <div className="colored">
                    <FontAwesomeIcon icon={["fas", "right-from-bracket"]} className="spin-on" />
                    <FontAwesomeIcon icon={["fas", "right-from-bracket"]} className="spin-off" />
                </div>
            </label>
        </div>
    );

    // (2) Header
    const header = (
        <div className="header">
            <div className="sidebar-button-area">{sidebarButton}</div>
            <div className="status-area">{frontendState.username}</div>
            <div className="menu-item-area">
                <div className="group">
                    {micButton}
                    {cameraButton}
                    {speakerButton}
                </div>
                <div className="group">
                    {shareScreenButton}
                    {startTranscribeButton}
                    <div className="spacer"></div>
                    {bottomNavButton}
                    {rightSidebarButton}
                </div>
                <div className="group">
                    {settingButton}
                    <div className="spacer"></div>
                    {leaveButton}
                    <div className="spacer"></div>
                </div>
            </div>
        </div>
    );

    // (3) sidebar
    const sidebarProps: SidebarProps = {
        newRoomClicked: () => {
            createRoomCheckbox.updateState(true);
        },
        joinRoomClicked: (decodedMeetingName: string, useCode: boolean) => {
            setJoinRoomProps({
                decodedMeetingName: decodedMeetingName,
                useCode: useCode,
                close: () => {
                    joinRoomCheckbox.updateState(false);
                },
            });
            joinRoomCheckbox.updateState(true);
        },
        joinSecretRoomClicked: () => {
            setJoinRoomProps({
                decodedMeetingName: "",
                useCode: true,
                close: () => {
                    joinRoomCheckbox.updateState(false);
                },
            });
            joinRoomCheckbox.updateState(true);
        },
        sidebarTrigger: openSidebarCheckbox.trigger,
    };
    const sidebar = <Sidebar {...sidebarProps}></Sidebar>;
    // (4) right sidebar
    const rightSidebarProps: RightSidebarProps = {
        rightSidebarTrigger: openRightSidebarCheckbox.trigger,
    };
    const rightSidebar = <RightSidebar {...rightSidebarProps}></RightSidebar>;

    // (5) bottom nav (belongs to main area)
    const bottomNav = (
        <>
            {openBottomNavCheckbox.trigger}
            <div className="bottom-nav"></div>
        </>
    );

    // (6) main vide area (belongs to main area)
    const height = "33%";
    const width = "33%";
    const mainVideoArea = (
        <>
            {openBottomNavCheckbox.trigger}
            <div className="main-video-area">
                <div style={{ display: "flex", alignItems: "stretch", justifyContent: "stretch", flexWrap: "wrap", height: "100%", width: "100%" }}>
                    <div style={{ width: width, height: height }}>
                        <video controls src="test.mp4" autoPlay style={{ objectFit: "contain", width: "100%", height: "100%" }} />
                    </div>
                    <div style={{ width: width, height: height }}>
                        <video controls src="test.mp4" autoPlay style={{ objectFit: "contain", width: "100%", height: "100%" }} />
                    </div>
                    <div style={{ width: width, height: height }}>
                        <video controls src="test.mp4" autoPlay style={{ objectFit: "contain", width: "100%", height: "100%" }} />
                    </div>
                    <div style={{ width: width, height: height }}>
                        <video controls src="test.mp4" autoPlay style={{ objectFit: "contain", width: "100%", height: "100%" }} />
                    </div>
                    <div style={{ width: width, height: height }}>
                        <video controls src="test.mp4" autoPlay style={{ objectFit: "contain", width: "100%", height: "100%" }} />
                    </div>
                    <div style={{ width: width, height: height }}>
                        <video controls src="test.mp4" autoPlay style={{ objectFit: "contain", width: "100%", height: "100%" }} />
                    </div>
                    <div style={{ width: width, height: height }}>
                        <video controls src="test.mp4" autoPlay style={{ objectFit: "contain", width: "100%", height: "100%" }} />
                    </div>
                    <div style={{ width: width, height: height }}>
                        <video controls src="test.mp4" autoPlay style={{ objectFit: "contain", width: "100%", height: "100%" }} />
                    </div>
                </div>
            </div>
        </>
    );

    // (7) main area
    const mainArea = (
        <>
            {openSidebarCheckbox.trigger}
            {openRightSidebarCheckbox.trigger}
            <div className="main-area">
                {mainVideoArea}
                {bottomNav}
            </div>
        </>
    );

    /**
     * action linking
     */
    // (x) signin state
    useEffect(() => {
        if (!props.signInCompleted) {
            const signInDialogCheckboxs = document.querySelectorAll(".sign-in-checkbox");
            signInDialogCheckboxs.forEach((x) => {
                //@ts-ignore
                x.checked = true;
            });
        } else {
            const signInDialogCheckboxs = document.querySelectorAll(".sign-in-checkbox");
            signInDialogCheckboxs.forEach((x) => {
                //@ts-ignore
                x.checked = false;
            });
        }
    }, [props.signInCompleted]);

    //// Dialog
    ////// create
    const createRoomDialogProps: CreateRoomDialogProps = {
        meetingCreated: () => {},
        close: () => {
            createRoomCheckbox.updateState(false);
        },
    };

    //// for DEBUG
    useEffect(() => {
        openSidebarCheckbox.updateState(true);
    }, []);
    useEffect(() => {
        openRightSidebarCheckbox.updateState(true);
    }, []);

    return (
        <>
            {header}
            {sidebar}
            {rightSidebar}
            {mainArea}
            <div>
                {/* <input type="checkbox" className="setting-checkbox" id="setting-checkbox-secondary" /> */}
                {settingCheckbox.trigger}
                <div className="dialog-container setting-checkbox-remover">
                    <SettingDialog></SettingDialog>
                </div>
            </div>

            <div>
                {/* <input type="checkbox" className="leave-checkbox" id="leave-checkbox-secondary" /> */}
                {leaveCheckbox.trigger}
                <div className="dialog-container leave-checkbox-remover"></div>
            </div>

            <div>
                {createRoomCheckbox.trigger}
                <div className="dialog-container create-room-checkbox-remover">
                    <CreateRoomDialog {...createRoomDialogProps}></CreateRoomDialog>
                </div>
            </div>

            <div>
                {joinRoomCheckbox.trigger}
                <div className="dialog-container join-room-checkbox-remover">
                    <JoinRoomDialog {...joinRoomProps} />
                </div>
            </div>

            <div>
                {signInCheckbox.trigger}
                <div className="dialog-container">
                    <SignInDialog {...props.signInDialogProps}></SignInDialog>
                </div>
            </div>

            <div>
                <audio id="chime-audio-output-element" />
            </div>
        </>
    );
};
