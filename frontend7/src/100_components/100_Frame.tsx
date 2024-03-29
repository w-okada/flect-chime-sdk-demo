import React, { useEffect } from "react";
import { Sidebar } from "./100-2_Sidebar";
import { RightSidebar } from "./100-3_RightSidebar";
import { ViewTypes } from "../002_hooks/011_useFrontend";
import { Header } from "./100-1_Header";
import { useAppState } from "../003_provider/AppStateProvider";
import { MainArea } from "./100-4_MainArea";
import { Dialog } from "./101_Dialog";

export type FrameProps = {};

export const Frame = (_props: FrameProps) => {
    const { frontendState, cognitoClientState, backendManagerState } = useAppState();

    /**
     * action linking
     */
    // (x) signin state
    useEffect(() => {
        if (!cognitoClientState.signInCompleted) {
            const signInDialogCheckboxs = document.querySelectorAll(".sign-in-checkbox");
            signInDialogCheckboxs.forEach((x) => {
                //@ts-ignore
                x.checked = true;
                // x.checked = false;
            });
        } else if (!backendManagerState.environment) {
            const signInDialogCheckboxs = document.querySelectorAll(".sign-in-checkbox");
            signInDialogCheckboxs.forEach((x) => {
                //@ts-ignore
                x.checked = false;
            });
            const loadingUserInformationDialogCheckboxs = document.querySelectorAll(".loading-user-information-checkbox");
            loadingUserInformationDialogCheckboxs.forEach((x) => {
                //@ts-ignore
                x.checked = true;
            });
        } else {
            const loadingUserInformationDialogCheckboxs = document.querySelectorAll(".loading-user-information-checkbox");
            loadingUserInformationDialogCheckboxs.forEach((x) => {
                //@ts-ignore
                x.checked = false;
            });
        }
    }, [cognitoClientState.signInCompleted, backendManagerState.environment]);

    //// Dialog

    //// for DEBUG
    useEffect(() => {
        frontendState.stateControls.openSidebarCheckbox.updateState(true);
    }, []);
    useEffect(() => {
        frontendState.stateControls.openRightSidebarCheckbox.updateState(true);
    }, []);

    //// initial
    useEffect(() => {
        frontendState.stateControls.viewRadioButtons[ViewTypes.feature].updateState(true);
        frontendState.stateControls.micEnableCheckbox.updateState(true);
        frontendState.stateControls.cameraEnableCheckbox.updateState(false);
        frontendState.stateControls.speakerEnableCheckbox.updateState(true);
        frontendState.stateControls.openBottomNavCheckbox.updateState(true);
        frontendState.stateControls.showSelfCameraViewCheckbox.updateState(true);
    }, []);

    return (
        <>
            <Header />
            <Sidebar />
            <RightSidebar />
            <MainArea />

            <Dialog />

            <div>
                <audio id="chime-audio-output-element" />
            </div>
            <div className="video-for-recorder-container">
                <video id="video-for-recorder" />
            </div>
        </>
    );
};
