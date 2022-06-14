import React, { useState } from "react";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppState } from "../003_provider/AppStateProvider";
import { FRONTEND_LOCAL_DEV } from "../const";

export type SignInDialogProps = {
    signInSucceeded: (username: string) => void;
    defaultEmail?: string;
    defaultPassword?: string;
    defaultNickname?: string;
};

export const SignInDialog = (props: SignInDialogProps) => {
    const { cognitoClientState } = useAppState();
    const [message, setMessage] = useState<string | null>(null);
    // (1) States
    const TabItems = {
        signin: "signin",
        signup: "signup",
        verify: "verify",
        forgot: "forgot",
    } as const;
    type TabItems = typeof TabItems[keyof typeof TabItems];
    const [tab, setTab] = useState<TabItems>("signin");

    // (2) Action
    // (2-1) Request to send verify code
    const requestVerifyCode = async () => {
        const email = (document.getElementById("signin-dialog-email") as HTMLInputElement).value;
        switch (tab) {
            // (2-1-1) Resend for first verification
            case "verify":
                try {
                    await cognitoClientState.resendVerification(email);
                } catch (exception: any) {
                    console.warn("Request code for signup exception", JSON.stringify(exception));
                    switch (exception.code) {
                        case "UserNotFoundException":
                            console.warn("未登録のユーザ");
                            setMessage(`[${exception.code}] No registered user`);
                            break;
                        case "InvalidParameterException":
                            console.warn("パラメータが不正");
                            setMessage(`[${exception.code}] Invalide parameter`);
                            break;
                        case "LimitExceededException":
                            console.warn("??");
                            setMessage(`[${exception.code}] Unknown Exception`);
                            break;
                        default:
                            console.error("Unknown Exception");
                            setMessage(`[${exception.code}] Unknown Exception`);
                    }
                }

                break;
            // (2-1-2) Send for Change Password
            case "forgot":
                try {
                    await cognitoClientState.sendVerificationCodeForChangePassword(email);
                } catch (exception: any) {
                    console.warn("Request code for change password exception", JSON.stringify(exception));
                    switch (exception.code) {
                        case "UserNotFoundException":
                            console.warn("未登録のユーザ");
                            setMessage(`[${exception.code}] No registered user`);
                            break;
                        case "InvalidParameterException":
                            console.warn("パラメータが不正");
                            setMessage(`[${exception.code}] Invalide parameter`);
                            break;
                        case "LimitExceededException":
                            console.warn("??");
                            setMessage(`[${exception.code}] Unknown Exception`);
                            break;
                        default:
                            console.error("Unknown Exception");
                            setMessage(`[${exception.code}] Unknown Exception`);
                    }
                }
                break;
            default:
                break;
        }
    };

    //// (2-2) Main Operation
    const onSubmit = async () => {
        const email = (document.getElementById("signin-dialog-email") as HTMLInputElement).value;
        const password = (document.getElementById("signin-dialog-password") as HTMLInputElement).value;
        const newPassword = (document.getElementById("signin-dialog-new-password") as HTMLInputElement).value;
        const code = (document.getElementById("signin-dialog-verify-code") as HTMLInputElement).value;
        const username = (document.getElementById("signin-dialog-display-name") as HTMLInputElement).value;
        switch (tab) {
            // (A) Sign In
            case "signin":
                try {
                    if (username.length < 1) {
                        console.warn("ユーザネームが入ってない。");
                        const err = new Error("no user name");
                        // @ts-ignore
                        err.code = "NoUserNameInput";
                        throw err;
                    }
                    await cognitoClientState.signIn(email, password);
                    props.signInSucceeded(username);
                } catch (exception: any) {
                    console.warn("Sign In Exception", JSON.stringify(exception));
                    switch (exception.code) {
                        case "NotAuthorizedException":
                            console.warn("サインインできない。");
                            setMessage(`[${exception.code}] Password error`);
                            break;
                        case "UserNotFoundException":
                            console.warn("未登録のユーザ");
                            setMessage(`[${exception.code}] No registered user`);
                            break;
                        case "InvalidParameterException":
                            console.warn("不正なパラメータ");
                            setMessage(`[${exception.code}] Invalide parameter`);
                            break;
                        case "NoUserNameInput":
                            console.warn("ユーザ名が入っていない");
                            setMessage(`[${exception.code}] No display name`);
                            break;
                        default:
                            console.error("Unknown Exception");
                            setMessage(`[${exception.code}] Unknown Exception`);
                            break;
                    }
                }
                break;
            // (B) Sign Up
            case "signup":
                try {
                    await cognitoClientState.signUp(email, newPassword);
                    setTab("verify");
                    setMessage(null);
                } catch (exception: any) {
                    console.warn("Sign Up Exception", JSON.stringify(exception));
                    switch (exception.code) {
                        case "InvalidParameterException":
                            console.warn("不正なパラメータ");
                            setMessage(`[${exception.code}] Invalide parameter`);
                            break;
                        case "UsernameExistsException":
                            console.warn("登録済みのユーザ");
                            setMessage(`[${exception.code}] The user is already registered.`);
                            break;
                        default:
                            console.error("Unknown Exception");
                            setMessage(`[${exception.code}] Unknown Exception`);
                    }
                }
                break;
            // (C) Verify
            case "verify":
                try {
                    await cognitoClientState.verify(email, code);
                    setTab("signin");
                    setMessage(null);
                } catch (exception: any) {
                    console.warn("Verification Exception", JSON.stringify(exception));
                    switch (exception.code) {
                        case "UserNotFoundException":
                            console.warn("未登録のユーザ");
                            setMessage(`[${exception.code}] No registered user`);
                            break;
                        case "CodeMismatchException":
                            console.warn("コードが間違っている");
                            setMessage(`[${exception.code}] Invalid code.`);
                            break;
                        case "NotAuthorizedException":
                            console.warn("？？？　ベリファイ後にもう一回やろうとすると出る");
                            setMessage(`[${exception.code}] Unknown Exception. Maybe you verified twice.`);
                            break;
                        default:
                            console.error("Unknown Exception");
                            setMessage(`[${exception.code}] Unknown Exception`);
                    }
                }
                break;
            // (D) Change password
            case "forgot":
                try {
                    await cognitoClientState.changePassword(email, code, newPassword);
                    setTab("signin");
                    setMessage(null);
                } catch (exception: any) {
                    console.warn("Verification Exception", JSON.stringify(exception));
                    switch (exception.code) {
                        case "UserNotFoundException":
                            console.warn("未登録のユーザ");
                            setMessage(`[${exception.code}] No registered user`);
                            break;
                        case "InvalidParameterException":
                            console.warn("不正なパラメータ");
                            setMessage(`[${exception.code}] Invalide parameter`);
                            break;
                        case "CodeMismatchException":
                            console.warn("コードが間違っている");
                            setMessage(`[${exception.code}] Invalid code.`);
                            break;
                        default:
                            console.error("Unknown Exception");
                            setMessage(`[${exception.code}] Unknown Exception`);
                    }
                }
                break;
            default:
                console.error("unknwon tab:", tab);
                break;
        }
    };

    ////////////////////////////
    //  Conponents
    ////////////////////////////
    const signInIcon = (
        <div className="dialog-tile-icon-container">
            <input
                id="signin"
                className="dialog-radio-button"
                type="radio"
                name="signin-dialog"
                onChange={() => {
                    setTab("signin");
                    setMessage(null);
                }}
                checked={tab === "signin"}
            />
            <div className="dialog-radio-tile">
                <FontAwesomeIcon icon={["fas", "right-to-bracket"]} size="3x" />
                <label htmlFor="signin" className="dialog-radio-tile-label">
                    sign in
                </label>
            </div>
        </div>
    );
    const signUpIcon = (
        <div className="dialog-tile-icon-container">
            <input
                id="signup"
                className="dialog-radio-button"
                type="radio"
                name="signin-dialog"
                onChange={() => {
                    setTab("signup");
                    setMessage(null);
                }}
                checked={tab === "signup"}
            />
            <div className="dialog-radio-tile">
                <FontAwesomeIcon icon={["fas", "user-plus"]} size="3x" />
                <label htmlFor="signup" className="dialog-radio-tile-label">
                    sign up
                </label>
            </div>
        </div>
    );
    const verfiyIcon = (
        <div className="dialog-tile-icon-container">
            <input
                id="verify"
                className="dialog-radio-button"
                type="radio"
                name="signin-dialog"
                onChange={() => {
                    setTab("verify");
                    setMessage(null);
                }}
                checked={tab === "verify"}
            />
            <div className="dialog-radio-tile">
                <FontAwesomeIcon icon={["fas", "spell-check"]} size="3x" />
                <label htmlFor="verify" className="dialog-radio-tile-label">
                    verify
                </label>
            </div>
        </div>
    );
    const forgotIcon = (
        <div className="dialog-tile-icon-container">
            <input
                id="forgot"
                className="dialog-radio-button"
                type="radio"
                name="signin-dialog"
                onChange={() => {
                    setTab("forgot");
                    setMessage(null);
                }}
                checked={tab === "forgot"}
            />
            <div className="dialog-radio-tile">
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                    <FontAwesomeIcon icon={["fas", "key"]} size="3x" />
                    <FontAwesomeIcon icon={["fas", "arrow-rotate-right"]} style={{ right: "4px", bottom: "0px", margin: 0, padding: 0, fontSize: "1.3rem" }} />
                </div>
                <label htmlFor="forgot" className="dialog-radio-tile-label">
                    forgot password
                </label>
            </div>
        </div>
    );

    const description = useMemo(() => {
        switch (tab) {
            case "signin":
                return "Enter your email and password.";
            case "signup":
                return "Enter your email and password. After you submit your information, you'll receive a verify code via email.";
            case "verify":
                return "Enter verify code. If you didn't receive, go forgot password to resend verify code.";
            case "forgot":
                return "Enter your email and push request verify code button. You can get verify code. Then please enter verfy code and new password.";
            default:
                console.error("unknwon state", tab);
                return "Unknown state.";
        }
    }, [tab]);

    const emailField = useMemo(() => {
        // usernameというキーワードがname, label等どこかに使用されるとそこにautofillが引っ張られる？
        // 動作仕様が見つからない。
        const additionalAttr = {};
        if (FRONTEND_LOCAL_DEV) {
            // @ts-ignore
            additionalAttr["defaultValue"] = props.defaultEmail;
        }
        return (
            <div className="dialog-input-controls">
                <input type="text" id="signin-dialog-email" className="input-text" name="email" autoComplete="email" {...additionalAttr} />
                <label htmlFor="email">email</label>
            </div>
        );
    }, [tab]);
    const passwordField = useMemo(() => {
        const hidden = tab !== "signin" ? "hidden" : "";
        const additionalAttr = {};
        if (FRONTEND_LOCAL_DEV) {
            // @ts-ignore
            additionalAttr["defaultValue"] = props.defaultPassword;
        }
        return (
            <div className={`dialog-input-controls ${hidden}`}>
                <input type="password" id="signin-dialog-password" className="input-text" name="password" autoComplete="current-password" {...additionalAttr} />
                <label htmlFor="password">Password</label>
            </div>
        );
    }, [tab]);

    const usernameField = useMemo(() => {
        const hidden = tab !== "signin" ? "hidden" : "";
        const additionalAttr = {};
        if (FRONTEND_LOCAL_DEV) {
            // @ts-ignore
            additionalAttr["defaultValue"] = props.defaultNickname;
        }
        return (
            <div className={`dialog-input-controls ${hidden}`}>
                <input type="text" id="signin-dialog-display-name" className="input-text" name="display-name" autoComplete="nickname" {...additionalAttr} />
                <label htmlFor="display-name">display name in meeting</label>
            </div>
        );
    }, [tab]);

    const newPasswordField = useMemo(() => {
        const hidden = tab !== "signup" && tab !== "forgot" ? "hidden" : "";
        return (
            <div className={`dialog-input-controls ${hidden}`}>
                <input type="password" id="signin-dialog-new-password" className="input-text" name="newPassword" autoComplete="current-password" />
                <label htmlFor="newPassword">newPassword</label>
            </div>
        );
    }, [tab]);

    const verifyCodeFeild = useMemo(() => {
        const hidden = tab !== "verify" && tab !== "forgot" ? "hidden" : "";
        return (
            <div className={`dialog-input-controls ${hidden}`}>
                <input type="text" id="signin-dialog-verify-code" className="input-text" name="verify-code" autoComplete="off" />
                <label htmlFor="verify-code">verify-code</label>
            </div>
        );
    }, [tab]);

    const messageArea = useMemo(() => {
        return (
            <div className="dialog-input-controls">
                <div className="dialog-message">{message}</div>
            </div>
        );
    }, [message]);

    const requestCodeButton = useMemo(() => {
        return (
            <div id="request-code" className="submit-button" onClick={requestVerifyCode}>
                request code
            </div>
        );
    }, [tab]);

    const submitButton = useMemo(() => {
        return (
            <div className="dialog-input-controls align-center">
                <div>
                    {tab === "verify" || tab === "forgot" ? requestCodeButton : <></>}
                    <div id="submit" className="submit-button" onClick={onSubmit}>
                        enter
                    </div>
                </div>
            </div>
        );
    }, [tab]);

    const form = useMemo(() => {
        return (
            <>
                {emailField}
                {passwordField}
                {usernameField}
                {newPasswordField}
                {verifyCodeFeild}
                {messageArea}
                {submitButton}
            </>
        );
    }, [tab, messageArea]);

    return (
        <div className="dialog-frame-warpper">
            <iframe id="dummy" name="dummy" style={{ display: "none" }} src="about:blank"></iframe>
            <div className="dialog-frame">
                <div className="dialog-title">Sign in</div>
                <div className="dialog-content">
                    <div className={"dialog-application-title"}>Flect Amazon Chime Demo</div>
                    <div className="dialog-radio-tile-group">
                        {signInIcon}
                        {signUpIcon}
                        {verfiyIcon}
                        {forgotIcon}
                    </div>
                    <div className="dialog-description">{description}</div>
                    <form target="dummy" method="post" action="about:blank" autoComplete="on">
                        <div className="dialog-input-container">{form}</div>
                    </form>
                </div>
            </div>
        </div>
    );
};
