import React from "react";
import { useAppState } from "../003_provider/AppStateProvider";
import { SignInDialog } from "./101-1_SignInDialog";
import { CreateRoomDialog } from "./101-2_CreateRoomDialog";
import { JoinRoomDialog } from "./101-3_JoinRoomDialog";
import { SettingDialog } from "./101-4_SettingDialog";
import { LeaveDialog } from "./101-5_LeaveDialog";
import { LoadingUserInformationDialog } from "./101-6_LoadingUserInformationDialog";

export const Dialog = () => {
    const { frontendState } = useAppState();

    return (
        <div>
            {frontendState.stateControls.signInCheckbox.trigger}
            {frontendState.stateControls.loadingUserInformationCheckbox.trigger}
            {frontendState.stateControls.createRoomCheckbox.trigger}
            {frontendState.stateControls.joinRoomCheckbox.trigger}
            {frontendState.stateControls.settingCheckbox.trigger}
            {frontendState.stateControls.leaveCheckbox.trigger}
            <div className="dialog-container">
                {frontendState.stateControls.signInCheckbox.trigger}
                <SignInDialog />

                {frontendState.stateControls.loadingUserInformationCheckbox.trigger}
                <LoadingUserInformationDialog />

                {frontendState.stateControls.createRoomCheckbox.trigger}
                <CreateRoomDialog />

                {frontendState.stateControls.joinRoomCheckbox.trigger}
                <JoinRoomDialog />

                {frontendState.stateControls.settingCheckbox.trigger}
                <SettingDialog />

                {frontendState.stateControls.leaveCheckbox.trigger}
                <LeaveDialog />
            </div>
        </div>
    );
};
