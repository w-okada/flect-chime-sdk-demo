import React, { useState } from "react";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppState } from "../003_provider/AppStateProvider";

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
                <div className="dialog-frame">
                    <div className="dialog-title">Sign in</div>
                    <div className="dialog-content">
                        <div className={"dialog-application-title"}>Flect Amazon Chime Demo</div>
                        <div className="dialog-description">aaa</div>
                        <form>
                            <div className="dialog-input-container">bbb</div>
                        </form>
                    </div>
                </div>

                {frontendState.stateControls.createRoomCheckbox.trigger}
                <div className="dialog-frame">
                    <div className="dialog-title">Sign in</div>
                    <div className="dialog-content">
                        <div className={"dialog-application-title"}>Flect Amazon Chime Demo</div>
                        <div className="dialog-description">aaa</div>
                        <form>
                            <div className="dialog-input-container">bbb</div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
