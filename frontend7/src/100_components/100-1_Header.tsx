import React, { useMemo } from "react";
import { ViewTypes } from "../002_hooks/011_useFrontend";
import { useAppState } from "../003_provider/AppStateProvider";
import { AnimationTypes, HeaderButton, HeaderButtonProps } from "./parts/002_HeaderButton";

type HeaderButtons = {
    sidebarButton: JSX.Element;
    bottomNavButton: JSX.Element;
    rightSidebarButton: JSX.Element;
    micButton: JSX.Element;
    cameraButton: JSX.Element;

    speakerButton: JSX.Element;
    featureViewButton: JSX.Element;
    gridViewButton: JSX.Element;
    shareScreenButton: JSX.Element;
    startTranscribeButton: JSX.Element;
    startRecordingButton: JSX.Element;
    settingButton: JSX.Element;
    leaveButton: JSX.Element;

    showSelfCameraViewButton: JSX.Element;
};

export const Header = () => {
    const { frontendState, chimeClientState } = useAppState();

    // State 生成
    const buttons: HeaderButtons = useMemo(() => {
        //// (1) Frame
        ////// (1-1) Sidebar Button
        const sidebarButtonProps: HeaderButtonProps = {
            stateControlCheckbox: frontendState.stateControls.openSidebarCheckbox,
            tooltip: "sidebar open/close",
            onIcon: ["fas", "chevron-right"],
            offIcon: ["fas", "chevron-right"],
            animation: AnimationTypes.spinner,
            tooltipClass: "tooltip-right",
        };
        const sidebarButton = <HeaderButton {...sidebarButtonProps}></HeaderButton>;

        ///// (1-2) Bottom Nav
        const bottomNavButtonProps: HeaderButtonProps = {
            stateControlCheckbox: frontendState.stateControls.openBottomNavCheckbox,
            tooltip: "show attendee's camera",
            onIcon: ["fas", "users-rectangle"],
            offIcon: ["fas", "users-rectangle"],
            animation: AnimationTypes.colored,
        };
        const bottomNavButton = <HeaderButton {...bottomNavButtonProps}></HeaderButton>;

        ///// (1-3) Right Sidebar
        const rightSidebarButtonProps: HeaderButtonProps = {
            stateControlCheckbox: frontendState.stateControls.openRightSidebarCheckbox,
            tooltip: "open meeting props",
            onIcon: ["fas", "address-card"],
            offIcon: ["fas", "address-card"],
            animation: AnimationTypes.colored,
        };
        const rightSidebarButton = <HeaderButton {...rightSidebarButtonProps}></HeaderButton>;

        //// (2) Devices
        ///// (2-1) Microphone
        const micButtonProps: HeaderButtonProps = {
            stateControlCheckbox: frontendState.stateControls.micEnableCheckbox,
            tooltip: "mic on/off",
            onIcon: ["fas", "microphone"],
            offIcon: ["fas", "microphone-slash"],
            animation: AnimationTypes.colored,
        };
        const micButton = <HeaderButton {...micButtonProps}></HeaderButton>;

        ///// (2-2) Camera
        const cameraButtonProps: HeaderButtonProps = {
            stateControlCheckbox: frontendState.stateControls.cameraEnableCheckbox,
            tooltip: "camera on/off",
            onIcon: ["fas", "video"],
            offIcon: ["fas", "video-slash"],
            animation: AnimationTypes.colored,
        };
        const cameraButton = <HeaderButton {...cameraButtonProps}></HeaderButton>;

        ///// (2-3) Speaker
        const speakerButtonProps: HeaderButtonProps = {
            stateControlCheckbox: frontendState.stateControls.speakerEnableCheckbox,
            tooltip: "speaker on/off",
            onIcon: ["fas", "volume-high"],
            offIcon: ["fas", "volume-mute"],
            animation: AnimationTypes.colored,
        };
        const speakerButton = <HeaderButton {...speakerButtonProps}></HeaderButton>;

        //// (3) View
        ///// (3-1) Feature View
        const featureViewButtonProps: HeaderButtonProps = {
            stateControlCheckbox: frontendState.stateControls.viewRadioButtons[ViewTypes.feature],
            tooltip: "feature view",
            onIcon: ["fas", "square"],
            offIcon: ["fas", "square"],
            animation: AnimationTypes.colored,
        };
        const featureViewButton = <HeaderButton {...featureViewButtonProps}></HeaderButton>;
        ///// (3-2) Grid View
        const gridViewButtonProps: HeaderButtonProps = {
            stateControlCheckbox: frontendState.stateControls.viewRadioButtons[ViewTypes.grid],
            tooltip: "grid view",
            onIcon: ["fas", "table-cells"],
            offIcon: ["fas", "table-cells"],
            animation: AnimationTypes.colored,
        };
        const gridViewButton = <HeaderButton {...gridViewButtonProps}></HeaderButton>;

        //// (4) Util
        ///// (4-1) share screen
        const shareScreenButtonProps: HeaderButtonProps = {
            stateControlCheckbox: frontendState.stateControls.shareScreenCheckbox,
            tooltip: "share screen",
            onIcon: ["fas", "share-from-square"],
            offIcon: ["fas", "share-from-square"],
            animation: AnimationTypes.colored,
        };
        const shareScreenButton = <HeaderButton {...shareScreenButtonProps}></HeaderButton>;

        ///// (4-2) start transcribe
        const startTranscribeButtonProps: HeaderButtonProps = {
            stateControlCheckbox: frontendState.stateControls.startTranscribeCheckbox,
            tooltip: "transcribe",
            onIcon: ["fas", "t"],
            offIcon: ["fas", "t"],
            animation: AnimationTypes.colored,
        };
        const startTranscribeButton = <HeaderButton {...startTranscribeButtonProps}></HeaderButton>;

        ///// (4-3) start recording
        const startRecordingButtonProps: HeaderButtonProps = {
            stateControlCheckbox: frontendState.stateControls.startRecordingCheckbox,
            tooltip: "Recording",
            onIcon: ["fas", "r"],
            offIcon: ["fas", "r"],
            animation: AnimationTypes.colored,
        };
        const startRecordingButton = <HeaderButton {...startRecordingButtonProps}></HeaderButton>;

        ///// (4-4) Show self camera view
        const showSelfCameraViewButtonProps: HeaderButtonProps = {
            stateControlCheckbox: frontendState.stateControls.showSelfCameraViewCheckbox,
            tooltip: "show my view",
            onIcon: ["fas", "user"],
            offIcon: ["fas", "user"],
            animation: AnimationTypes.colored,
        };
        const showSelfCameraViewButton = <HeaderButton {...showSelfCameraViewButtonProps}></HeaderButton>;

        //// (5) Dialog
        ///// (5-1) setting
        const settingButtonProps: HeaderButtonProps = {
            stateControlCheckbox: frontendState.stateControls.settingCheckbox,
            tooltip: "setting",
            onIcon: ["fas", "gear"],
            offIcon: ["fas", "gear"],
            animation: AnimationTypes.colored,
        };
        const settingButton = <HeaderButton {...settingButtonProps}></HeaderButton>;

        ///// (5-2) leave
        const leaveButtonProps: HeaderButtonProps = {
            stateControlCheckbox: frontendState.stateControls.leaveCheckbox,
            tooltip: "leave demo",
            onIcon: ["fas", "right-from-bracket"],
            offIcon: ["fas", "right-from-bracket"],
            animation: AnimationTypes.colored,
        };
        const leaveButton = <HeaderButton {...leaveButtonProps}></HeaderButton>;

        return {
            sidebarButton,
            bottomNavButton,
            rightSidebarButton,
            micButton,
            cameraButton,

            speakerButton,
            featureViewButton,
            gridViewButton,
            shareScreenButton,
            startTranscribeButton,
            startRecordingButton,
            showSelfCameraViewButton,
            settingButton,
            leaveButton,
        };
    }, []);

    const header = useMemo(() => {
        let statusString = "";
        if (chimeClientState.meetingName.length > 0) {
            statusString = `${frontendState.username} [${chimeClientState.meetingName}]`;
        } else {
            statusString = `${frontendState.username}`;
        }
        // (X) Header
        const header = (
            <div className="header">
                <div className="sidebar-button-area">{buttons.sidebarButton}</div>
                <div className="status-area">{statusString}</div>
                <div className="menu-item-area">
                    <div className="group">
                        {buttons.micButton}
                        {buttons.cameraButton}
                        {buttons.speakerButton}
                    </div>
                    <div className="group">
                        {buttons.featureViewButton}
                        {buttons.gridViewButton}
                    </div>

                    <div className="group">
                        {buttons.shareScreenButton}
                        {buttons.startTranscribeButton}
                        {buttons.startRecordingButton}
                        <div className="spacer"></div>
                        {buttons.bottomNavButton}
                        {buttons.rightSidebarButton}
                        {buttons.showSelfCameraViewButton}
                    </div>
                    <div className="group">
                        {buttons.settingButton}
                        <div className="spacer"></div>
                        {buttons.leaveButton}
                        <div className="spacer"></div>
                    </div>
                </div>
            </div>
        );
        return header;
    }, [frontendState.username, chimeClientState.meetingName]);

    return header;
};
