import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SignInDialog, SignInDialogProps } from "./101-1_SignInDialog";
import { Sidebar, SidebarProps } from "./102_Sidebar";
import { useStateControlCheckbox } from "./hooks/useStateControlCheckbox";
import { CreateRoomDialog, CreateRoomDialogProps } from "./101-2_CreateRoomDialog";
import { useAppState } from "../003_provider/AppStateProvider";
import { JoinRoomDialog, JoinRoomDialogProps } from "./101-3_JoinRoomDialog";
import { SettingDialog } from "./101-5_SettingDialog";
import { RightSidebar, RightSidebarProps } from "./103_RightSidebar";
import { MainVideoArea, MainVideoAreaProps } from "./111_MainVideoArea";
import { useStateControlRadioButton } from "./hooks/useStateControlRadioButton";
import { ViewType } from "../002_hooks/011_useFrontend";
import { BottomNav, BottomNavProps } from "./112_BottomNav";
import { LeaveDialog, LeaveDialogProps } from "./101-6_LeaveDialog";
import { AnimationTypes, HeaderButton, HeaderButtonProps } from "./parts/002_HeaderButton";
import { useHeader } from "./100-1_Header";

export type FrameProps = {
    signInCompleted: boolean;
    signInDialogProps: SignInDialogProps;
};

export const Frame = (props: FrameProps) => {
    const [joinRoomProps, setJoinRoomProps] = useState<JoinRoomDialogProps>({
        decodedMeetingName: "",
        useCode: false,
        close: () => {},
    });

    const headerState = useHeader();
    // const openSidebarCheckbox = useStateControlCheckbox("open-sidebar-checkbox");
    // const micEnableCheckbox = useStateControlCheckbox("mic-enable-checkbox", (newVal: boolean) => {
    //     deviceState.setAudioInputEnable(newVal);
    // });
    // const cameraEnableCheckbox = useStateControlCheckbox("camera-enable-checkbox", (newVal: boolean) => {
    //     deviceState.setVideoInputEnable(newVal);
    // });
    // const speakerEnableCheckbox = useStateControlCheckbox("speaker-enable-checkbox", (newVal: boolean) => {
    //     console.log("speaker 1 ");
    //     deviceState.setAudioOutputEnable(newVal);
    // });
    // const openBottomNavCheckbox = useStateControlCheckbox("open-bottom-nav-checkbox");
    // const openRightSidebarCheckbox = useStateControlCheckbox("open-right-sidebar-checkbox");

    // const viewRadioButtons = useStateControlRadioButton("view-radio-button", [ViewType.feature, ViewType.grid], (suffix: string) => {
    //     frontendState.setViewType(suffix as ViewType);
    // });

    // const shareScreenCheckbox = useStateControlCheckbox("share-screen-checkbox", (newVal: boolean) => {
    //     const handleShareScreen = () => {
    //         if (newVal) {
    //             chimeClientState.startScreenShare().then((res) => {
    //                 if (!res) {
    //                     shareScreenCheckbox.updateState(false);
    //                 }
    //             });
    //         } else {
    //             chimeClientState.stopScreenShare();
    //         }
    //     };
    //     handleShareScreen();
    // });
    // const startTranscribeCheckbox = useStateControlCheckbox("start-transcribe-checkbox");
    // const settingCheckbox = useStateControlCheckbox("setting-checkbox");
    // const leaveCheckbox = useStateControlCheckbox("leave-checkbox");

    const signInCheckbox = useStateControlCheckbox("sign-in-checkbox");
    const createRoomCheckbox = useStateControlCheckbox("create-room-checkbox");
    const joinRoomCheckbox = useStateControlCheckbox("join-room-checkbox");

    /**
     * components
     */
    // (1) Header Buttons
    //// (1-1) Left space
    // ////// (1-1-1) Sidebar Button
    // const sidebarButtonProps: HeaderButtonProps = {
    //     stateControlCheckbox: openSidebarCheckbox,
    //     tooltip: "sidebar open/close",
    //     onIcon: ["fas", "chevron-right"],
    //     offIcon: ["fas", "chevron-right"],
    //     animation: AnimationTypes.spinner,
    //     tooltipClass: "tooltip-right",
    // };
    // const sidebarButton = <HeaderButton {...sidebarButtonProps}></HeaderButton>;

    // ///// (1-3-1) Microphone
    // const micButtonProps: HeaderButtonProps = {
    //     stateControlCheckbox: micEnableCheckbox,
    //     tooltip: "mic on/off",
    //     onIcon: ["fas", "microphone"],
    //     offIcon: ["fas", "microphone-slash"],
    //     animation: AnimationTypes.colored,
    // };
    // const micButton = <HeaderButton {...micButtonProps}></HeaderButton>;

    // ///// (1-3-2) Camera
    // const cameraButtonProps: HeaderButtonProps = {
    //     stateControlCheckbox: cameraEnableCheckbox,
    //     tooltip: "camera on/off",
    //     onIcon: ["fas", "video"],
    //     offIcon: ["fas", "video-slash"],
    //     animation: AnimationTypes.colored,
    // };
    // const cameraButton = <HeaderButton {...cameraButtonProps}></HeaderButton>;

    // ///// (1-3-3) Speaker
    // const speakerButtonProps: HeaderButtonProps = {
    //     stateControlCheckbox: speakerEnableCheckbox,
    //     tooltip: "speaker on/off",
    //     onIcon: ["fas", "volume-high"],
    //     offIcon: ["fas", "volume-mute"],
    //     animation: AnimationTypes.colored,
    // };
    // const speakerButton = <HeaderButton {...speakerButtonProps}></HeaderButton>;

    // ///// (1-3-x) Feature View
    // const featureViewButtonProps: HeaderButtonProps = {
    //     stateControlCheckbox: viewRadioButtons[ViewType.feature],
    //     tooltip: "feature view",
    //     onIcon: ["fas", "square"],
    //     offIcon: ["fas", "square"],
    //     animation: AnimationTypes.colored,
    // };
    // const featureViewButton = <HeaderButton {...featureViewButtonProps}></HeaderButton>;
    // ///// (1-3-x) Grid View
    // const gridViewButtonProps: HeaderButtonProps = {
    //     stateControlCheckbox: viewRadioButtons[ViewType.grid],
    //     tooltip: "grid view",
    //     onIcon: ["fas", "table-cells"],
    //     offIcon: ["fas", "table-cells"],
    //     animation: AnimationTypes.colored,
    // };
    // const gridViewButton = <HeaderButton {...gridViewButtonProps}></HeaderButton>;

    // ///// (1-3-4) Bottom Nav
    // const bottomNavButtonProps: HeaderButtonProps = {
    //     stateControlCheckbox: openBottomNavCheckbox,
    //     tooltip: "show attendee's camera",
    //     onIcon: ["fas", "users-rectangle"],
    //     offIcon: ["fas", "users-rectangle"],
    //     animation: AnimationTypes.colored,
    // };
    // const bottomNavButton = <HeaderButton {...bottomNavButtonProps}></HeaderButton>;

    // ///// (1-3-5) Right Sidebar
    // const rightSidebarButtonProps: HeaderButtonProps = {
    //     stateControlCheckbox: openBottomNavCheckbox,
    //     tooltip: "open meeting props",
    //     onIcon: ["fas", "address-card"],
    //     offIcon: ["fas", "address-card"],
    //     animation: AnimationTypes.colored,
    // };

    // const rightSidebarButton = <HeaderButton {...rightSidebarButtonProps}></HeaderButton>;

    // ///// (1-3-6) share screen
    // const shareScreenButtonProps: HeaderButtonProps = {
    //     stateControlCheckbox: shareScreenCheckbox,
    //     tooltip: "share screen",
    //     onIcon: ["fas", "share-from-square"],
    //     offIcon: ["fas", "share-from-square"],
    //     animation: AnimationTypes.colored,
    // };
    // const shareScreenButton = <HeaderButton {...shareScreenButtonProps}></HeaderButton>;

    // ///// (1-3-7) start transcribe
    // const startTranscribeButtonProps: HeaderButtonProps = {
    //     stateControlCheckbox: startTranscribeCheckbox,
    //     tooltip: "transcribe",
    //     onIcon: ["fas", "t"],
    //     offIcon: ["fas", "t"],
    //     animation: AnimationTypes.colored,
    // };
    // const startTranscribeButton = <HeaderButton {...startTranscribeButtonProps}></HeaderButton>;

    // ///// (1-3-8) setting
    // const settingButtonProps: HeaderButtonProps = {
    //     stateControlCheckbox: settingCheckbox,
    //     tooltip: "setting",
    //     onIcon: ["fas", "gear"],
    //     offIcon: ["fas", "gear"],
    //     animation: AnimationTypes.colored,
    // };
    // const settingButton = <HeaderButton {...settingButtonProps}></HeaderButton>;

    // ///// (1-3-9) leave
    // const leaveButtonProps: HeaderButtonProps = {
    //     stateControlCheckbox: leaveCheckbox,
    //     tooltip: "leave demo",
    //     onIcon: ["fas", "right-from-bracket"],
    //     offIcon: ["fas", "right-from-bracket"],
    //     animation: AnimationTypes.colored,
    // };
    // const leaveButton = <HeaderButton {...leaveButtonProps}></HeaderButton>;

    // // (2) Header
    // const header = (
    //     <div className="header">
    //         <div className="sidebar-button-area">{sidebarButton}</div>
    //         <div className="status-area">{frontendState.username}</div>
    //         <div className="menu-item-area">
    //             <div className="group">
    //                 {micButton}
    //                 {cameraButton}
    //                 {speakerButton}
    //             </div>
    //             <div className="group">
    //                 {featureViewButton}
    //                 {gridViewButton}
    //             </div>

    //             <div className="group">
    //                 {shareScreenButton}
    //                 {startTranscribeButton}
    //                 <div className="spacer"></div>
    //                 {bottomNavButton}
    //                 {rightSidebarButton}
    //             </div>
    //             <div className="group">
    //                 {settingButton}
    //                 <div className="spacer"></div>
    //                 {leaveButton}
    //                 <div className="spacer"></div>
    //             </div>
    //         </div>
    //     </div>
    // );

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
        sidebarTrigger: headerState.openSidebarCheckbox.trigger,
    };
    const sidebar = <Sidebar {...sidebarProps}></Sidebar>;
    // (4) right sidebar
    const rightSidebarProps: RightSidebarProps = {
        rightSidebarTrigger: headerState.openRightSidebarCheckbox.trigger,
    };
    const rightSidebar = <RightSidebar {...rightSidebarProps}></RightSidebar>;

    // (5) bottom nav (belongs to main area)
    const bottomNavProps: BottomNavProps = {
        bottomNavTrigger: headerState.openBottomNavCheckbox.trigger,
    };
    const bottomNav = <BottomNav {...bottomNavProps}></BottomNav>;

    // (6) main vide area (belongs to main area)
    const mainVideoAreaProps: MainVideoAreaProps = {
        bottomNavTrigger: headerState.openBottomNavCheckbox.trigger,
    };
    const mainVideoArea = <MainVideoArea {...mainVideoAreaProps}></MainVideoArea>;

    // (7) main area
    const mainArea = (
        <>
            {headerState.openSidebarCheckbox.trigger}
            {headerState.openRightSidebarCheckbox.trigger}
            <div className="main-area">
                {mainVideoArea}
                {bottomNav}
            </div>
        </>
    );

    const leaveDialogProps: LeaveDialogProps = useMemo(() => {
        return {
            close: () => {
                headerState.leaveCheckbox.updateState(false);
            },
        };
    }, []);

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
        headerState.openSidebarCheckbox.updateState(true);
    }, []);
    useEffect(() => {
        headerState.openRightSidebarCheckbox.updateState(true);
    }, []);

    //// initial
    useEffect(() => {
        headerState.viewRadioButtons[ViewType.feature].updateState(true);
        headerState.micEnableCheckbox.updateState(true);
        headerState.cameraEnableCheckbox.updateState(false);
        headerState.speakerEnableCheckbox.updateState(true);
        headerState.openBottomNavCheckbox.updateState(true);
    }, []);

    return (
        <>
            {headerState.header}
            {sidebar}
            {rightSidebar}
            {mainArea}
            <div>
                {headerState.settingCheckbox.trigger}
                <div className="dialog-container setting-checkbox-remover">
                    <SettingDialog></SettingDialog>
                </div>
            </div>

            <div>
                {headerState.leaveCheckbox.trigger}
                <div className="dialog-container leave-checkbox-remover">
                    <LeaveDialog {...leaveDialogProps}></LeaveDialog>
                </div>
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
