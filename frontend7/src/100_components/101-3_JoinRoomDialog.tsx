import React, { useState } from "react";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AVAILABLE_AWS_REGIONS, DEFAULT_REGION } from "../const";
import { useAppState } from "../providers/AppStateProvider";
import { ChimeDemoException } from "../000_exception/Exception";
import { Processing } from "./parts/001_processing";

export type JoinRoomDialogProps = {
    meetingName: string;
    useCode: boolean;
    joinMeeting: (meetingName: string, useCode: boolean, code: string) => void;
    close: () => void;
};

export const JoinRoomDialog = (props: JoinRoomDialogProps) => {
    const [message, setMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // (2) Action
    const initializeState = () => {
        (document.getElementById("join-room-dialog-code") as HTMLInputElement).value = "";
        setIsProcessing(false);
        setMessage(null);
    };
    const onSubmit = async () => {
        const code = (document.getElementById("join-room-dialog-code") as HTMLInputElement).value;
        console.log("codearea", document.getElementById("join-room-dialog-code"));
        try {
            console.log("Code1", code);
            props.joinMeeting(props.meetingName, props.useCode, code);
            setIsProcessing(true);
            initializeState();
            props.close();
        } catch (ex) {
            // @ts-ignore
            if (ex.message === ChimeDemoException.NoMeetingRoomCreated) {
                setMessage("Failed to create meeting room. maybe same name room exists.");
            } else {
                console.error(ex);
                // @ts-ignore
                setMessage(`Failed to create meeting room. Unknown error. ${ex.message}`);
            }
            setIsProcessing(false);
        }
    };
    const cancel = () => {
        props.close();
        initializeState();
    };

    ////////////////////////////
    //  Conponents
    ////////////////////////////

    const description = `Join the room: ${decodeURIComponent(props.meetingName)}`;

    const codeField = useMemo(() => {
        const hidden = props.useCode ? "" : "hidden";
        return (
            <div className={`dialog-input-controls ${hidden}`}>
                <input type="text" id="join-room-dialog-code" className="input-text" name="code" placeholder="code" autoComplete="none" />
                <label htmlFor="code">code</label>
            </div>
        );
    }, [props.useCode]);

    const messageArea = useMemo(() => {
        return (
            <div className="dialog-input-controls">
                <div className="dialog-message">{message}</div>
            </div>
        );
    }, [message]);

    const buttons = useMemo(() => {
        return (
            <div className="dialog-input-controls">
                <div id="cancel" className="cancel-button" onClick={cancel}>
                    cancel
                </div>
                <div id="submit" className="submit-button" onClick={onSubmit}>
                    submit
                </div>
            </div>
        );
    }, [onSubmit]);
    const processing = useMemo(() => {
        return (
            <div className="dialog-input-controls">
                <div className="dialog-processing">{isProcessing ? <Processing /> : <></>}</div>
            </div>
        );
    }, [isProcessing]);
    const form = useMemo(() => {
        return (
            <>
                {codeField}
                {messageArea}
                {buttons}
                {processing}
            </>
        );
    }, [codeField, messageArea, buttons, processing]);

    return (
        <div className="dialog-frame-warpper">
            <div className="dialog-frame">
                <div className="dialog-title">Create New Room</div>

                <div className="dialog-content">
                    <div className="dialog-application-title"></div>
                    <div className="dialog-description">{description}</div>
                    <form>
                        <div className="dialog-input-container">{form}</div>
                    </form>
                </div>
            </div>
        </div>
    );
};
