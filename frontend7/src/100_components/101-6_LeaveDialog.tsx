import React, { useState } from "react";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppState } from "../003_provider/AppStateProvider";

export type LeaveDialogProps = {
    close: () => void;
};

export const LeaveDialog = (props: LeaveDialogProps) => {
    const { cognitoClientState, chimeClientState } = useAppState();

    // (1) States

    // (2) Action
    // (2-1) Request to send verify code
    const onSubmit = async () => {
        cognitoClientState.signOut();
        chimeClientState.leaveMeeting();
        props.close();
    };
    const cancel = () => {
        props.close();
    };
    ////////////////////////////
    //  Conponents
    ////////////////////////////
    const description = useMemo(() => {
        return "Leave Application?";
    }, []);

    const buttons = useMemo(() => {
        return (
            <div className="dialog-input-controls">
                <div>
                    <div id="cancel" className="cancel-button" onClick={cancel}>
                        cancel
                    </div>
                    <div id="submit" className="submit-button" onClick={onSubmit}>
                        OK
                    </div>
                </div>
            </div>
        );
    }, []);

    const form = useMemo(() => {
        return <>{buttons}</>;
    }, []);

    return (
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
    );
};
