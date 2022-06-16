import React, { useEffect, useMemo } from "react";
import { SignInDialog, SignInDialogProps } from "./101-1_SignInDialog";
import { Sidebar } from "./100-2_Sidebar";
import { CreateRoomDialog } from "./101-2_CreateRoomDialog";
import { JoinRoomDialog } from "./101-3_JoinRoomDialog";
import { SettingDialog } from "./101-5_SettingDialog";
import { RightSidebar } from "./100-3_RightSidebar";
import { ViewType } from "../002_hooks/011_useFrontend";
import { LeaveDialog, LeaveDialogProps } from "./101-6_LeaveDialog";
import { Header } from "./100-1_Header";
import { useAppState } from "../003_provider/AppStateProvider";
import { MainArea } from "./100-4_MainArea";

export type FrameProps = {
    signInCompleted: boolean;
    signInDialogProps: SignInDialogProps;
};

export const Frame = (props: FrameProps) => {
    const { frontendState } = useAppState();

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

    //// for DEBUG
    useEffect(() => {
        frontendState.stateControls.openSidebarCheckbox.updateState(true);
    }, []);
    useEffect(() => {
        frontendState.stateControls.openRightSidebarCheckbox.updateState(true);
    }, []);

    //// initial
    useEffect(() => {
        frontendState.stateControls.viewRadioButtons[ViewType.feature].updateState(true);
        frontendState.stateControls.micEnableCheckbox.updateState(true);
        frontendState.stateControls.cameraEnableCheckbox.updateState(false);
        frontendState.stateControls.speakerEnableCheckbox.updateState(true);
        frontendState.stateControls.openBottomNavCheckbox.updateState(true);
    }, []);

    return (
        <>
            <Header />
            <Sidebar />
            <RightSidebar />
            <MainArea />

            <SettingDialog />
            <LeaveDialog />
            <CreateRoomDialog />
            <JoinRoomDialog />

            <div>
                {frontendState.stateControls.signInCheckbox.trigger}
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
