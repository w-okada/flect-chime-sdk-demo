import React from "react";
import { useMemo } from "react";
import { useAppState } from "../003_provider/AppStateProvider";

export type LeaveDialogProps = {};

export const LeaveDialog = (_props: LeaveDialogProps) => {
    const { cognitoClientState, chimeClientState, frontendState } = useAppState();

    const description = useMemo(() => {
        return "Leave Application?";
    }, []);

    const buttons = useMemo(() => {
        // OKクリック
        const onOKPressed = async () => {
            frontendState.stateControls.leaveCheckbox.updateState(false);
            cognitoClientState.signOut();
            chimeClientState.leaveMeeting();
        };
        // キャンセルクリック
        const onCancelPressed = () => {
            frontendState.stateControls.leaveCheckbox.updateState(false);
        };
        return (
            <div className="dialog-input-controls">
                <div id="cancel" className="cancel-button" onClick={onCancelPressed}>
                    cancel
                </div>
                <div id="submit" className="submit-button" onClick={onOKPressed}>
                    OK
                </div>
            </div>
        );
    }, []);

    const form = useMemo(() => {
        return (
            <div className="dialog-frame">
                <div className="dialog-title">Sign in</div>
                <div className="dialog-content">
                    <div className={"dialog-application-title"}>Flect Amazon Chime Demo</div>
                    <div className="dialog-description">{description}</div>
                    <form>
                        <div className="dialog-input-container">{buttons}</div>
                    </form>
                </div>
            </div>
        );
    }, []);
    return form;
};
