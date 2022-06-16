import React, { useState } from "react";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppState } from "../003_provider/AppStateProvider";
import { SignInDialog } from "./101-1_SignInDialog";
import { CreateRoomDialog } from "./101-2_CreateRoomDialog";

export const Dialog = () => {
    const { cognitoClientState, chimeClientState, frontendState } = useAppState();

    return (
        <div>
            {frontendState.stateControls.signInCheckbox.trigger}
            {frontendState.stateControls.createRoomCheckbox.trigger}
            {frontendState.stateControls.joinRoomCheckbox.trigger}
            {frontendState.stateControls.settingCheckbox.trigger}
            {frontendState.stateControls.leaveCheckbox.trigger}
            <div className="dialog-container">
                {frontendState.stateControls.signInCheckbox.trigger}
                <SignInDialog />

                {frontendState.stateControls.createRoomCheckbox.trigger}
                <CreateRoomDialog />
            </div>
        </div>
    );
};
