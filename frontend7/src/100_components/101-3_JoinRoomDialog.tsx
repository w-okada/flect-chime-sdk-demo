import React, { useState } from "react";
import { useMemo } from "react";
import { useAppState } from "../003_provider/AppStateProvider";
import { ChimeDemoException } from "../000_exception/Exception";
import { Processing } from "./parts/001_processing";
export type JoinRoomDialogProps = {};
type DialogMessage = {
    content: string;
    color: string;
};
export const JoinRoomDialog = (_props: JoinRoomDialogProps) => {
    const [message, setMessage] = useState<DialogMessage | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const { backendManagerState, chimeClientState, frontendState, deviceState, messagingClientState } = useAppState();

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
            setMessage({
                content: "try to get meeting token....",
                color: "#0000ff",
            });
            const joinTokenResult = await backendManagerState.joinMeeting({
                meetingName: frontendState.joinRoomDialogProps.decodedMeetingName.length > 0 ? frontendState.joinRoomDialogProps.decodedMeetingName : meetingName,
                attendeeName: frontendState.username,
                code: code,
                messagingUserArn: backendManagerState.environment!.appInstanceUserArn,
            });
            setMessage({
                content: "try to get meeting token.... done.",
                color: "#0000ff",
            });
            if (!joinTokenResult) {
                throw new Error(ChimeDemoException.RestClientNotInitilized);
            }

            // (2) join with token
            setMessage({
                content: "join meeting.... ",
                color: "#0000ff",
            });
            const meetingInfo = joinTokenResult.meeting;
            const attendeeInfo = joinTokenResult.attendee;
            frontendState.setCurrentMeetingInfo({
                meetingInfo: meetingInfo,
                attendeeInfo: attendeeInfo,
                meetingName: meetingName,
                attendeeName: frontendState.username,
            });
            await chimeClientState.joinMeeting(frontendState.joinRoomDialogProps.decodedMeetingName, meetingInfo, attendeeInfo);
            setMessage({
                content: "join meeting.... done.",
                color: "#0000ff",
            });
            // (3) enter
            setMessage({
                content: "enter meeting.... ",
                color: "#0000ff",
            });
            const audioElement = document.getElementById("chime-audio-output-element") as HTMLAudioElement;
            await chimeClientState.enterMeeting(deviceState.chimeAudioInputDevice, deviceState.chimeVideoInputDevice, deviceState.chimeAudioOutputDevice, audioElement);
            setMessage({
                content: "enter meeting.... done.",
                color: "#0000ff",
            });

            // (4) メッセージング初期化
            const joinedMeetingInfo = await backendManagerState.getMeetingInfo({
                meetingName: frontendState.joinRoomDialogProps.decodedMeetingName,
            });
            console.log(`JOINEDMEETING`, joinedMeetingInfo);
            messagingClientState.setMeetingChannelArn(joinedMeetingInfo?.metadata.MessageChannelArn!);
            // messagingClientState.sendGlobalMessage("GLOBAL MESSAGING SEND...");
            // messagingClientState.sendChannelMessage("CHANNEL MESSAGING SEND...");

            // 後処理
            initializeState();
            frontendState.stateControls.joinRoomCheckbox.updateState(false);
        } catch (ex) {
            // @ts-ignore
            if (ex.message === ChimeDemoException.RestClientNotInitilized) {
                setMessage({
                    content: "Failed to create meeting room. maybe rest api client is not initilized.",
                    color: "#0000ff",
                });
            } else {
                console.error(ex);
                // @ts-ignore
                setMessage(`Failed to create meeting room. Unknown error. ${ex.message}`);
            }
            setIsProcessing(false);
        }
    };
    const cancel = () => {
        frontendState.stateControls.joinRoomCheckbox.updateState(false);
        initializeState();
    };

    ////////////////////////////
    //  Conponents
    ////////////////////////////

    const description = `Join the room: ${frontendState.joinRoomDialogProps.decodedMeetingName}`;

    const roomNameField = useMemo(() => {
        const hidden = frontendState.joinRoomDialogProps.decodedMeetingName.length > 0 ? "hidden" : "";
        return (
            <div className={`dialog-input-controls ${hidden}`}>
                <input type="text" id="join-room-dialog-room-name" className="input-text" name="room-name" autoComplete="none" />
                <label htmlFor="room-name">room name</label>
            </div>
        );
    }, [frontendState.joinRoomDialogProps.decodedMeetingName]);

    const codeField = useMemo(() => {
        const hidden = frontendState.joinRoomDialogProps.useCode ? "" : "hidden";
        return (
            <div className={`dialog-input-controls ${hidden}`}>
                <input type="text" id="join-room-dialog-code" className="input-text" name="code" autoComplete="none" />
                <label htmlFor="code">code</label>
            </div>
        );
    }, [frontendState.joinRoomDialogProps.useCode]);

    const messageArea = useMemo(() => {
        if (!message) {
            return <></>;
        }
        return (
            <div className="dialog-input-controls">
                <div className="dialog-message" style={{ color: `${message.color}` }}>
                    {message?.content}
                </div>
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
        return <div className="dialog-input-controls">{isProcessing ? <Processing /> : <></>}</div>;
    }, [isProcessing]);
    const form = useMemo(() => {
        return (
            <div className="dialog-frame">
                <div className="dialog-title">Create New Room</div>

                <div className="dialog-content">
                    <div className="dialog-application-title"></div>
                    <div className="dialog-description">{description}</div>
                    <form>
                        <div className="dialog-input-container">
                            {roomNameField}
                            {codeField}
                            {messageArea}
                            {buttons}
                            {processing}
                        </div>
                    </form>
                </div>
            </div>
        );
    }, [roomNameField, codeField, messageArea, buttons, processing]);

    return form;
};
