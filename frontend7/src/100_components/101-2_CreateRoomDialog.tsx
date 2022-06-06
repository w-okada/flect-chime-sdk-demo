import React, { useState } from "react";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AVAILABLE_AWS_REGIONS, DEFAULT_REGION } from "../const";
import { useAppState } from "../003_provider/AppStateProvider";
import { ChimeDemoException } from "../000_exception/Exception";
import { Processing } from "./parts/001_processing";

export type CreateRoomDialogProps = {
    meetingCreated: () => void;
    close: () => void;
};

export const CreateRoomDialog = (props: CreateRoomDialogProps) => {
    const { backendManagerState } = useAppState();
    const [useCode, setUseCode] = useState<boolean>(false);
    const [message, setMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // (2) Action
    const initializeState = () => {
        (document.getElementById("create-room-dialog-room-name") as HTMLInputElement).value = "";
        (document.getElementById("create-room-dialog-code") as HTMLInputElement).value = "";
        setIsProcessing(false);
        setMessage(null);
    };
    const onSubmit = async () => {
        const roomName = (document.getElementById("create-room-dialog-room-name") as HTMLInputElement).value;
        const region = (document.getElementById("create-room-dialog-region") as HTMLSelectElement).value;
        const secret = (document.getElementById("create-room-dialog-secret") as HTMLInputElement).checked;
        const useCode = (document.getElementById("create-room-dialog-use-code") as HTMLInputElement).checked;
        const code = (document.getElementById("create-room-dialog-code") as HTMLInputElement).value;
        try {
            setIsProcessing(true);
            const res = await backendManagerState.createMeeting({
                meetingName: roomName,
                region: region,
                secret: secret,
                useCode: useCode,
                code: code,
            });
            if (res?.created === false) {
                throw new Error(ChimeDemoException.NoMeetingRoomCreated);
            }
            await backendManagerState.reloadMeetingList({});
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

    const description = "fill in the fields below.";

    const roomNameField = useMemo(() => {
        return (
            <div className="dialog-input-controls">
                <input type="text" id="create-room-dialog-room-name" className="input-text" name="room-name" placeholder="roomName" autoComplete="none" />
                <label htmlFor="room-name">room name</label>
            </div>
        );
    }, []);
    const regionField = useMemo(() => {
        const options = Object.keys(AVAILABLE_AWS_REGIONS).map((key) => {
            return (
                <option value={key} key={key}>
                    {AVAILABLE_AWS_REGIONS[key]}
                </option>
            );
        });
        return (
            <div className="dialog-input-controls">
                <select id="create-room-dialog-region" className="select" required placeholder="region" defaultValue={`${DEFAULT_REGION}`}>
                    {options}
                </select>
                <label htmlFor="region">region</label>
            </div>
        );
    }, []);

    const useCodeToggle = useMemo(() => {
        return (
            <div className="dialog-input-controls">
                <div style={{ display: "flex" }}>
                    <input className="checkbox" type="checkbox" id="create-room-dialog-secret" />
                    <label htmlFor="create-room-dialog-secret">secret</label>
                    <input
                        className="checkbox"
                        type="checkbox"
                        id="create-room-dialog-use-code"
                        onChange={(ev) => {
                            console.log("target:", ev.target.checked);
                            setUseCode(ev.target.checked);
                        }}
                    />
                    <label create-room-dialog-use-code="user-code">use code</label>
                </div>
            </div>
        );
    }, []);

    const codeField = useMemo(() => {
        const hidden = useCode ? "" : "hidden";
        return (
            <div className={`dialog-input-controls ${hidden}`}>
                <input type="text" id="create-room-dialog-code" className="input-text" name="code" placeholder="code" autoComplete="none" />
                <label htmlFor="code">code</label>
            </div>
        );
    }, [useCode]);

    const messageArea = useMemo(() => {
        return (
            <div className="dialog-input-controls">
                <div className="dialog-message">{message}</div>
                {/* <div className="dialog-message">aaa a aaaaa aaa aaa</div> */}
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
                {regionField}
                {useCodeToggle}
                {codeField}
                {messageArea}
                {buttons}
                {processing}
            </>
        );
    }, [useCode, buttons, messageArea, processing]);

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
