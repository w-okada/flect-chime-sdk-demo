import React, { useMemo } from "react";
import { ViewType } from "../002_hooks/011_useFrontend";
import { useAppState } from "../003_provider/AppStateProvider";
import { StateControlCheckbox, useStateControlCheckbox } from "./hooks/useStateControlCheckbox";
import { StateControlRadioButtons, useStateControlRadioButton } from "./hooks/useStateControlRadioButton";
import { AnimationTypes, HeaderButton, HeaderButtonProps } from "./parts/002_HeaderButton";

export type HeaderState = {
    header: JSX.Element;
    // Frames
    openSidebarCheckbox: StateControlCheckbox;
    openBottomNavCheckbox: StateControlCheckbox;
    openRightSidebarCheckbox: StateControlCheckbox;
    // Devices
    micEnableCheckbox: StateControlCheckbox;
    cameraEnableCheckbox: StateControlCheckbox;
    speakerEnableCheckbox: StateControlCheckbox;

    // View
    viewRadioButtons: StateControlRadioButtons;

    // Util
    shareScreenCheckbox: StateControlCheckbox;
    startTranscribeCheckbox: StateControlCheckbox;

    // Dialogs
    settingCheckbox: StateControlCheckbox;
    leaveCheckbox: StateControlCheckbox;
};

export const useHeader = (): HeaderState => {
    const { deviceState, frontendState, chimeClientState } = useAppState();

    // Checkbox/Radiobutton
    // Hookの中(useMemoの中)ではHookは呼べないので、ここはuseMemoの外。
    const openSidebarCheckbox = useStateControlCheckbox("open-sidebar-checkbox");
    const openBottomNavCheckbox = useStateControlCheckbox("open-bottom-nav-checkbox");
    const openRightSidebarCheckbox = useStateControlCheckbox("open-right-sidebar-checkbox");

    const micEnableCheckbox = useStateControlCheckbox("mic-enable-checkbox", (newVal: boolean) => {
        deviceState.setAudioInputEnable(newVal);
    });
    const cameraEnableCheckbox = useStateControlCheckbox("camera-enable-checkbox", (newVal: boolean) => {
        deviceState.setVideoInputEnable(newVal);
    });
    const speakerEnableCheckbox = useStateControlCheckbox("speaker-enable-checkbox", (newVal: boolean) => {
        console.log("speaker 1 ");
        deviceState.setAudioOutputEnable(newVal);
    });

    const viewRadioButtons = useStateControlRadioButton("view-radio-button", [ViewType.feature, ViewType.grid], (suffix: string) => {
        frontendState.setViewType(suffix as ViewType);
    });

    const shareScreenCheckbox = useStateControlCheckbox("share-screen-checkbox", (newVal: boolean) => {
        const handleShareScreen = () => {
            if (newVal) {
                chimeClientState.startScreenShare().then((res) => {
                    if (!res) {
                        shareScreenCheckbox.updateState(false);
                    }
                });
            } else {
                chimeClientState.stopScreenShare();
            }
        };
        handleShareScreen();
    });
    const startTranscribeCheckbox = useStateControlCheckbox("start-transcribe-checkbox");
    const settingCheckbox = useStateControlCheckbox("setting-checkbox");
    const leaveCheckbox = useStateControlCheckbox("leave-checkbox");

    // State 生成
    const state: HeaderState = useMemo(() => {
        //// (1) Frame
        ////// (1-1) Sidebar Button
        const sidebarButtonProps: HeaderButtonProps = {
            stateControlCheckbox: openSidebarCheckbox,
            tooltip: "sidebar open/close",
            onIcon: ["fas", "chevron-right"],
            offIcon: ["fas", "chevron-right"],
            animation: AnimationTypes.spinner,
            tooltipClass: "tooltip-right",
        };
        const sidebarButton = <HeaderButton {...sidebarButtonProps}></HeaderButton>;

        ///// (1-2) Bottom Nav
        const bottomNavButtonProps: HeaderButtonProps = {
            stateControlCheckbox: openBottomNavCheckbox,
            tooltip: "show attendee's camera",
            onIcon: ["fas", "users-rectangle"],
            offIcon: ["fas", "users-rectangle"],
            animation: AnimationTypes.colored,
        };
        const bottomNavButton = <HeaderButton {...bottomNavButtonProps}></HeaderButton>;

        ///// (1-3) Right Sidebar
        const rightSidebarButtonProps: HeaderButtonProps = {
            stateControlCheckbox: openRightSidebarCheckbox,
            tooltip: "open meeting props",
            onIcon: ["fas", "address-card"],
            offIcon: ["fas", "address-card"],
            animation: AnimationTypes.colored,
        };
        const rightSidebarButton = <HeaderButton {...rightSidebarButtonProps}></HeaderButton>;

        //// (2) Devices
        ///// (2-1) Microphone
        const micButtonProps: HeaderButtonProps = {
            stateControlCheckbox: micEnableCheckbox,
            tooltip: "mic on/off",
            onIcon: ["fas", "microphone"],
            offIcon: ["fas", "microphone-slash"],
            animation: AnimationTypes.colored,
        };
        const micButton = <HeaderButton {...micButtonProps}></HeaderButton>;

        ///// (2-2) Camera
        const cameraButtonProps: HeaderButtonProps = {
            stateControlCheckbox: cameraEnableCheckbox,
            tooltip: "camera on/off",
            onIcon: ["fas", "video"],
            offIcon: ["fas", "video-slash"],
            animation: AnimationTypes.colored,
        };
        const cameraButton = <HeaderButton {...cameraButtonProps}></HeaderButton>;

        ///// (2-3) Speaker
        const speakerButtonProps: HeaderButtonProps = {
            stateControlCheckbox: speakerEnableCheckbox,
            tooltip: "speaker on/off",
            onIcon: ["fas", "volume-high"],
            offIcon: ["fas", "volume-mute"],
            animation: AnimationTypes.colored,
        };
        const speakerButton = <HeaderButton {...speakerButtonProps}></HeaderButton>;

        //// (3) View
        ///// (3-1) Feature View
        const featureViewButtonProps: HeaderButtonProps = {
            stateControlCheckbox: viewRadioButtons[ViewType.feature],
            tooltip: "feature view",
            onIcon: ["fas", "square"],
            offIcon: ["fas", "square"],
            animation: AnimationTypes.colored,
        };
        const featureViewButton = <HeaderButton {...featureViewButtonProps}></HeaderButton>;
        ///// (3-2) Grid View
        const gridViewButtonProps: HeaderButtonProps = {
            stateControlCheckbox: viewRadioButtons[ViewType.grid],
            tooltip: "grid view",
            onIcon: ["fas", "table-cells"],
            offIcon: ["fas", "table-cells"],
            animation: AnimationTypes.colored,
        };
        const gridViewButton = <HeaderButton {...gridViewButtonProps}></HeaderButton>;

        //// (4) Util
        ///// (4-1) share screen
        const shareScreenButtonProps: HeaderButtonProps = {
            stateControlCheckbox: shareScreenCheckbox,
            tooltip: "share screen",
            onIcon: ["fas", "share-from-square"],
            offIcon: ["fas", "share-from-square"],
            animation: AnimationTypes.colored,
        };
        const shareScreenButton = <HeaderButton {...shareScreenButtonProps}></HeaderButton>;

        ///// (4-2) start transcribe
        const startTranscribeButtonProps: HeaderButtonProps = {
            stateControlCheckbox: startTranscribeCheckbox,
            tooltip: "transcribe",
            onIcon: ["fas", "t"],
            offIcon: ["fas", "t"],
            animation: AnimationTypes.colored,
        };
        const startTranscribeButton = <HeaderButton {...startTranscribeButtonProps}></HeaderButton>;

        //// (5) Dialog
        ///// (5-1) setting
        const settingButtonProps: HeaderButtonProps = {
            stateControlCheckbox: settingCheckbox,
            tooltip: "setting",
            onIcon: ["fas", "gear"],
            offIcon: ["fas", "gear"],
            animation: AnimationTypes.colored,
        };
        const settingButton = <HeaderButton {...settingButtonProps}></HeaderButton>;

        ///// (5-2) leave
        const leaveButtonProps: HeaderButtonProps = {
            stateControlCheckbox: leaveCheckbox,
            tooltip: "leave demo",
            onIcon: ["fas", "right-from-bracket"],
            offIcon: ["fas", "right-from-bracket"],
            animation: AnimationTypes.colored,
        };
        const leaveButton = <HeaderButton {...leaveButtonProps}></HeaderButton>;

        // (X) Header
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
                        {featureViewButton}
                        {gridViewButton}
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
        return {
            header,
            openSidebarCheckbox,
            openBottomNavCheckbox,
            openRightSidebarCheckbox,

            micEnableCheckbox,
            cameraEnableCheckbox,
            speakerEnableCheckbox,

            viewRadioButtons,
            shareScreenCheckbox,
            startTranscribeCheckbox,

            settingCheckbox,
            leaveCheckbox,
        };
    }, []);

    return state;
};
