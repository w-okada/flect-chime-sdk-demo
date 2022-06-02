import React, { useState } from "react";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AVAILABLE_AWS_REGIONS, DEFAULT_REGION } from "../const";

export type CreateRoomDialogProps = {
    // signIn: (email: string, password: string) => Promise<void>;
    // signUp: (userId: string, password: string) => Promise<void>;
    // verify: (userId: string, verifyCode: string) => Promise<void>;
    // resendVerification: (userId: string) => Promise<void>;
    // sendVerificationCodeForChangePassword: (userId: string) => Promise<void>;
    // changePassword: (userId: string, verifycode: string, password: string) => Promise<void>;
    // signInSucceeded: (username: string) => void;
    meetingCreated: () => void;
    cancel: () => void;
};

export const CreateRoomDialog = (props: CreateRoomDialogProps) => {
    const [useCode, setUseCode] = useState<boolean>(false);

    // (2) Action
    const onSubmit = async () => {
        const roomName = (document.getElementById("create-room-dialog-room-name") as HTMLInputElement).value;
        const region = (document.getElementById("create-room-dialog-region") as HTMLSelectElement).value;
        const secret = (document.getElementById("create-room-dialog-secret") as HTMLInputElement).checked;
        const useCode = (document.getElementById("create-room-dialog-use-code") as HTMLInputElement).checked;
        const code = (document.getElementById("create-room-dialog-code") as HTMLInputElement).value;

        console.log(roomName, region, secret, useCode, code);
    };
    const cancel = () => {
        props.cancel();
    };

    ////////////////////////////
    //  Conponents
    ////////////////////////////

    const description = "aaa";

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

    const secretToggle = useMemo(() => {
        return (
            <div className="dialog-input-controls">
                <input className="checkbox" type="checkbox" id="create-room-dialog-secret" />
                <label htmlFor="secret">secret</label>
            </div>
        );
    }, []);
    const useCodeToggle = useMemo(() => {
        return (
            <div className="dialog-input-controls">
                <input
                    className="checkbox"
                    type="checkbox"
                    id="create-room-dialog-use-code"
                    onChange={(ev) => {
                        console.log("target:", ev.target.checked);
                        setUseCode(ev.target.checked);
                    }}
                />
                <label htmlFor="user-code">use code</label>
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
    const submitButton = useMemo(() => {
        return (
            <div className="dialog-input-controls align-center">
                <div id="cancel" className="cancel-button" onClick={cancel}>
                    cancel
                </div>
                <div id="submit" className="submit-button" onClick={onSubmit}>
                    submit
                </div>
            </div>
        );
    }, []);
    const form = useMemo(() => {
        return (
            <>
                {roomNameField}
                {regionField}
                {secretToggle}
                {useCodeToggle}
                {codeField}
                {submitButton}
            </>
        );
    }, [useCode]);

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
