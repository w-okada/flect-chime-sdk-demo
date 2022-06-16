import React, { useState } from "react";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppState } from "../003_provider/AppStateProvider";

export type LeaveDialogProps = {};

export const LeaveDialog = (props: LeaveDialogProps) => {
    const { cognitoClientState, chimeClientState, frontendState } = useAppState();

    const description = useMemo(() => {
        return "Leave Application?";
    }, []);

    const form = useMemo(() => {
        // OKクリック
        const onOKPressed = async () => {
            cognitoClientState.signOut();
            chimeClientState.leaveMeeting();
            frontendState.stateControls.leaveCheckbox.updateState(false);
        };
        // キャンセルクリック
        const onCancelPressed = () => {
            frontendState.stateControls.leaveCheckbox.updateState(false);
        };
        return (
            <div className="dialog-input-controls">
                <div>
                    <div id="cancel" className="cancel-button" onClick={onCancelPressed}>
                        cancel
                    </div>
                    <div id="submit" className="submit-button" onClick={onOKPressed}>
                        OK
                    </div>
                </div>
            </div>
        );
    }, []);

    return (
        <>
            {frontendState.stateControls.leaveCheckbox.trigger}
            <div className="dialog-container leave-checkbox-remover">
                <div className="dialog-frame-warpper">
                    <div className="dialog-frame">
                        <div className="dialog-title">Sign in</div>
                        <div className="dialog-content">
                            <div className={"dialog-application-title"}>Flect Amazon Chime Demo</div>
                            <div className="dialog-description">{description}</div>
                            <form>
                                <div className="dialog-input-container">{form}</div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
