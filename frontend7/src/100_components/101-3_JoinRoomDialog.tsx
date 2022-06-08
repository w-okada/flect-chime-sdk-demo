import React, { useState } from "react";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AVAILABLE_AWS_REGIONS, DEFAULT_REGION } from "../const";
import { useAppState } from "../003_provider/AppStateProvider";
import { ChimeDemoException } from "../000_exception/Exception";
import { Processing } from "./parts/001_processing";

export type JoinRoomDialogProps = {
    decodedMeetingName: string;
    useCode: boolean;
    close: () => void;
};

export const JoinRoomDialog = (props: JoinRoomDialogProps) => {
    const [message, setMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const { backendManagerState, chimeClientState, frontendState, deviceState } = useAppState();

    // (2) Action
    const initializeState = () => {
        (document.getElementById("join-room-dialog-room-name") as HTMLInputElement).value = "";
        (document.getElementById("join-room-dialog-code") as HTMLInputElement).value = "";
        setIsProcessing(false);
        setMessage(null);
    };
    const onSubmit = async () => {
        const meetingName = (document.getElementById("join-room-dialog-room-name") as HTMLInputElement).value;
        const code = (document.getElementById("join-room-dialog-code") as HTMLInputElement).value;
        try {
            setIsProcessing(true);
            // (1) get meeting token from backend
            setMessage("try to get meeting token....");
            const joinTokenResult = await backendManagerState.joinMeeting({
                meetingName: props.decodedMeetingName.length > 0 ? props.decodedMeetingName : meetingName,
                attendeeName: frontendState.username,
                code: code,
            });
            setMessage("try to get meeting token.... done.");
            if (!joinTokenResult) {
                throw new Error(ChimeDemoException.RestClientNotInitilized);
            }

            // (2) join with token
            setMessage("join meeting.... ");
            const meetingInfo = joinTokenResult.meeting;
            const attendeeInfo = joinTokenResult.attendee;
            frontendState.setCurrentMeetingInfo({
                meetingInfo: meetingInfo,
                attendeeInfo: attendeeInfo,
                meetingName: meetingName,
                attendeeName: frontendState.username,
            });
            await chimeClientState.joinMeeting(props.decodedMeetingName, meetingInfo, attendeeInfo);
            setMessage("join meeting.... done.");
            // (3) enter
            setMessage("enter meeting.... ");
            const audioElement = document.getElementById("chime-audio-output-element") as HTMLAudioElement;
            await chimeClientState.enterMeeting(deviceState.chimeAudioInputDevice, deviceState.chimeVideoInputDevice, deviceState.chimeAudioOutputDevice, audioElement);
            setMessage("enter meeting.... done.");
            initializeState();
            props.close();
        } catch (ex) {
            // @ts-ignore
            if (ex.message === ChimeDemoException.RestClientNotInitilized) {
                setMessage("Failed to create meeting room. maybe rest api client is not initilized.");
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

    const description = `Join the room: ${props.decodedMeetingName}`;

    const roomNameField = useMemo(() => {
        const hidden = props.decodedMeetingName.length > 0 ? "hidden" : "";
        return (
            <div className={`dialog-input-controls ${hidden}`}>
                <input type="text" id="join-room-dialog-room-name" className="input-text" name="room-name" placeholder="roomName" autoComplete="none" />
                <label htmlFor="room-name">room name</label>
            </div>
        );
    }, [props.decodedMeetingName]);

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
                <div>
                    <div id="cancel" className="cancel-button" onClick={cancel}>
                        cancel
                    </div>
                    <div id="submit" className="submit-button" onClick={onSubmit}>
                        submit
                    </div>
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
                {roomNameField}
                {codeField}
                {messageArea}
                {buttons}
                {processing}
            </>
        );
    }, [roomNameField, codeField, messageArea, buttons, processing]);

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
