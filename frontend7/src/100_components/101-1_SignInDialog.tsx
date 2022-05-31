import React, { useState } from "react";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export type SignInDialogProps = {
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (userId: string, password: string) => Promise<void>;
    verify: (userId: string, verifyCode: string) => Promise<void>;
    resendVerification: (userId: string) => Promise<void>;
    sendVerificationCodeForChangePassword: (userId: string) => Promise<void>;
    changePassword: (userId: string, verifycode: string, password: string) => Promise<void>;
    signInSucceeded: (username: string) => void;
};

export const SignInDialog = (props: SignInDialogProps) => {
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
                    await props.resendVerification(email);
                } catch (exception: any) {
                    console.warn("Request code for signup exception", JSON.stringify(exception));
                    switch (exception.code) {
                        case "UserNotFoundException":
                            console.warn("未登録のユーザ");
                            break;
                        case "InvalidParameterException":
                            console.warn("パラメータが不正");
                            break;
                        case "LimitExceededException":
                            console.warn("??");
                            break;
                        default:
                            console.error("Unknown Exception");
                    }
                }

                break;
            // (2-1-2) Send for Change Password
            case "forgot":
                try {
                    await props.sendVerificationCodeForChangePassword(email);
                } catch (exception: any) {
                    console.warn("Request code for change password exception", JSON.stringify(exception));
                    switch (exception.code) {
                        case "UserNotFoundException":
                            console.warn("未登録のユーザ");
                            break;
                        case "InvalidParameterException":
                            console.warn("パラメータが不正");
                            break;
                        case "LimitExceededException":
                            console.warn("??");
                            break;
                        default:
                            console.error("Unknown Exception");
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
        const username = (document.getElementById("signin-dialog-username") as HTMLInputElement).value;
        switch (tab) {
            // (A) Sign In
            case "signin":
                try {
                    if (username.length < 1) {
                        console.warn("ユーザネームが入ってない。");
                        throw "no user name";
                    }
                    await props.signIn(email, password);
                    props.signInSucceeded(username);
                } catch (exception: any) {
                    console.warn("Sign In Exception", JSON.stringify(exception));
                    switch (exception.code) {
                        case "NotAuthorizedException":
                            console.warn("サインインできない。");
                            break;
                        case "UserNotFoundException":
                            console.warn("未登録のユーザ");
                            break;
                        case "InvalidParameterException":
                            console.warn("不正なパラメータ");
                            break;

                        default:
                            console.error("Unknown Exception");
                    }
                }
                break;
            // (B) Sign Up
            case "signup":
                try {
                    await props.signUp(email, newPassword);
                    setTab("verify");
                } catch (exception: any) {
                    console.warn("Sign Up Exception", JSON.stringify(exception));
                    switch (exception.code) {
                        case "InvalidParameterException":
                            console.warn("パラメータがおかしい");
                            break;
                        case "UsernameExistsException":
                            console.warn("登録済みのユーザ");
                            break;
                        default:
                            console.error("Unknown Exception");
                    }
                }
                break;
            // (C) Verify
            case "verify":
                try {
                    await props.verify(email, code);
                    setTab("signin");
                } catch (exception: any) {
                    console.warn("Verification Exception", JSON.stringify(exception));
                    switch (exception.code) {
                        case "UserNotFoundException":
                            console.warn("しらないユーザ");
                            break;
                        case "CodeMismatchException":
                            console.warn("コードが間違っている");
                            break;
                        case "NotAuthorizedException":
                            console.warn("？？？　ベリファイ後にもう一回やろうとすると出る");
                            break;
                        default:
                            console.error("Unknown Exception");
                    }
                }
                break;
            // (D) Change password
            case "forgot":
                try {
                    await props.changePassword(email, code, newPassword);
                    setTab("signin");
                } catch (exception: any) {
                    console.warn("Verification Exception", JSON.stringify(exception));
                    switch (exception.code) {
                        case "UserNotFoundException":
                            console.warn("しらないユーザ");
                            break;
                        case "InvalidParameterException":
                            console.warn("不正なパラメータ");
                            break;
                        case "CodeMismatchException":
                            console.warn("コードが間違っている");
                            break;
                        default:
                            console.error("Unknown Exception");
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
        return (
            <div className="dialog-input-controls">
                <input type="text" id="signin-dialog-email" className="input-text" name="email" placeholder="email" autoComplete="email" />
                <label htmlFor="email">Email</label>
            </div>
        );
    }, [tab]);
    const passwordField = useMemo(() => {
        const hidden = tab !== "signin" ? "hidden" : "";
        return (
            <div className={`dialog-input-controls ${hidden}`}>
                <input type="password" id="signin-dialog-password" className="input-text" name="password" placeholder="password" autoComplete="current-password" />
                <label htmlFor="password">Password</label>
            </div>
        );
    }, [tab]);

    const usernameField = useMemo(() => {
        const hidden = tab !== "signin" ? "hidden" : "";
        return (
            <div className={`dialog-input-controls ${hidden}`}>
                <input type="text" id="signin-dialog-username" className="input-text" name="username" placeholder="username" autoComplete="username" />
                <label htmlFor="username">username(displayed in meeting)</label>
            </div>
        );
    }, [tab]);

    const newPasswordField = useMemo(() => {
        const hidden = tab !== "signup" && tab !== "forgot" ? "hidden" : "";
        return (
            <div className={`dialog-input-controls ${hidden}`}>
                <input type="password" id="signin-dialog-new-password" className="input-text" name="newPassword" placeholder="new password" autoComplete="current-password" />
                <label htmlFor="newPassword">newPassword</label>
            </div>
        );
    }, [tab]);

    const verifyCodeFeild = useMemo(() => {
        const hidden = tab !== "verify" && tab !== "forgot" ? "hidden" : "";
        return (
            <div className={`dialog-input-controls ${hidden}`}>
                <input type="text" id="signin-dialog-verify-code" className="input-text" name="verify-code" placeholder="verify-code" autoComplete="off" />
                <label htmlFor="verify-code">verify-code</label>
            </div>
        );
    }, [tab]);
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
                {tab === "verify" || tab === "forgot" ? requestCodeButton : <></>}
                <div id="submit" className="submit-button" onClick={onSubmit}>
                    submit
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
                {submitButton}
            </>
        );
    }, [tab]);

    return (
        <div className="dialog-frame-warpper">
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
                    <form>
                        <div className="dialog-input-container">{form}</div>
                    </form>
                </div>
            </div>
        </div>
    );
};
