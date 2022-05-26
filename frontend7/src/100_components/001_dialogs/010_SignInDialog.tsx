import React, { useMemo, useState } from "react";
import { Dialog } from "./001_Dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../App.css";

export type SignInDialogProps = {
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (userId: string, password: string) => Promise<void>;
    verify: (userId: string, verifyCode: string) => Promise<void>;
    resendVerification: (userId: string) => Promise<void>;
    sendVerificationCodeForChangePassword: (userId: string) => Promise<void>;
    changePassword: (userId: string, verifycode: string, password: string) => Promise<void>;
    signInSucceeded: () => void;
};

export const SignInDialog = (props: SignInDialogProps) => {
    const SignInDialogStates = {
        signIn: "signIn",
        signUp: "signUp",
        verify: "verify",
        forgot: "forgot",
    } as const;
    type SignInDialogStates = typeof SignInDialogStates[keyof typeof SignInDialogStates];

    const [state, setState] = useState<SignInDialogStates>(SignInDialogStates.signIn);

    // () Request to send verify code
    const requestVerifyCode = async () => {
        const email = (document.getElementById("signin-dialog-email") as HTMLInputElement).value;
        switch (state) {
            // () Resend for first verification
            case SignInDialogStates.verify:
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
            // () Send for Change Password
            case SignInDialogStates.forgot:
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

    // () Operations
    const onSubmit = async () => {
        const email = (document.getElementById("signin-dialog-email") as HTMLInputElement).value;
        const password = (document.getElementById("signin-dialog-password") as HTMLInputElement).value;
        const code = (document.getElementById("signin-dialog-verify-code") as HTMLInputElement).value;
        switch (state) {
            // () Sign In
            case SignInDialogStates.signIn:
                try {
                    await props.signIn(email, password);
                    props.signInSucceeded();
                } catch (exception: any) {
                    console.warn("Sign In Exception", JSON.stringify(exception));
                    switch (exception.code) {
                        case "NotAuthorizedException":
                            console.warn("サインインできない。");
                            break;
                        case "UserNotFoundException":
                            console.warn("未登録のユーザ");
                            break;
                        default:
                            console.error("Unknown Exception");
                    }
                }
                break;
            // () Sign Up
            case SignInDialogStates.signUp:
                try {
                    await props.signUp(email, password);
                    setState(SignInDialogStates.verify);
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
            // () Verify
            case SignInDialogStates.verify:
                try {
                    await props.verify(email, code);
                    setState(SignInDialogStates.signIn);
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
            // () Change password
            case SignInDialogStates.forgot:
                try {
                    await props.changePassword(email, code, password);
                    setState(SignInDialogStates.signIn);
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
                console.error("unknwon state", state);
                break;
        }
    };

    const description = useMemo(() => {
        switch (state) {
            case SignInDialogStates.signIn:
                return "Enter your email and password.";
            case SignInDialogStates.signUp:
                return "Enter your email and password. After you submit your information, you'll receive a verify code via email.";
            case SignInDialogStates.verify:
                return "Enter verify code. If you didn't receive, go forgot password to resend verify code.";
            case SignInDialogStates.forgot:
                return "Enter your email and push request verify code button. You can get verify code. Then please enter verfy code and new password.";
            default:
                console.error("unknwon state", state);
                return "Unknown state.";
        }
    }, [state]);

    return (
        <Dialog title={""}>
            {/*  Title */}
            <div className={"dialog-application-title"}>Flect Amazon Chime Demo</div>
            {/*  Tiles */}
            <div className="dialog-radio-tile-group">
                <div className="dialog-input-container">
                    <input id="signin" className="dialog-radio-button" type="radio" name="signin-dialog" checked={state == SignInDialogStates.signIn} onChange={() => setState(SignInDialogStates.signIn)} />
                    <div className="dialog-radio-tile">
                        <FontAwesomeIcon icon={["fas", "right-to-bracket"]} size="3x" />
                        <label htmlFor="signin" className="dialog-radio-tile-label">
                            sign in
                        </label>
                    </div>
                </div>
                <div className="dialog-input-container">
                    <input id="signup" className="dialog-radio-button" type="radio" name="signin-dialog" checked={state == SignInDialogStates.signUp} onChange={() => setState(SignInDialogStates.signUp)} />
                    <div className="dialog-radio-tile">
                        <FontAwesomeIcon icon={["fas", "user-plus"]} size="3x" />
                        <label htmlFor="signup" className="dialog-radio-tile-label">
                            sign up
                        </label>
                    </div>
                </div>
                <div className="dialog-input-container">
                    <input id="verify" className="dialog-radio-button" type="radio" name="signin-dialog" checked={state == SignInDialogStates.verify} onChange={() => setState(SignInDialogStates.verify)} />
                    <div className="dialog-radio-tile">
                        <FontAwesomeIcon icon={["fas", "spell-check"]} size="3x" />
                        <label htmlFor="verify" className="dialog-radio-tile-label">
                            verify
                        </label>
                    </div>
                </div>

                <div className="dialog-input-container">
                    <input id="forgot" className="dialog-radio-button" type="radio" name="signin-dialog" checked={state == SignInDialogStates.forgot} onChange={() => setState(SignInDialogStates.forgot)} />
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
            </div>
            {/*  Content */}
            <div className="dialog-description">{description}</div>
            <form>
                <div className="dialog-input-container">
                    <div className="dialog-input-controls">
                        <input type="text" id="signin-dialog-email" className="input-text" name="email" placeholder="email" autoComplete="email" />
                        <label htmlFor="email">Email</label>
                    </div>
                    <div className={([SignInDialogStates.verify, SignInDialogStates.forgot] as string[]).includes(state) ? `dialog-input-controls` : `dialog-input-controls hide`}>
                        <input type="text" id="signin-dialog-verify-code" className="input-text" name="verify-code" placeholder="verify-code" autoComplete="off" />
                        <label htmlFor="verify-code">verify-code</label>
                    </div>
                    <div className={([SignInDialogStates.signIn, SignInDialogStates.signUp, SignInDialogStates.forgot] as string[]).includes(state) ? `dialog-input-controls` : `dialog-input-controls hide`}>
                        <input type="password" id="signin-dialog-password" className="input-text" name="password" placeholder="password" autoComplete={state == SignInDialogStates.signIn ? "current-password" : "new-password"} />
                        <label htmlFor="password">{state == SignInDialogStates.signIn ? "Password" : "New Passowrd"}</label>
                    </div>

                    <div className="dialog-input-controls align-center">
                        <div
                            id="request-code"
                            className={([SignInDialogStates.verify, SignInDialogStates.forgot] as string[]).includes(state) ? "submit-button" : "submit-button hide"}
                            onClick={() => {
                                requestVerifyCode();
                            }}
                        >
                            request code
                        </div>
                        <div
                            id="submit"
                            className="submit-button"
                            onClick={() => {
                                onSubmit();
                            }}
                        >
                            submit
                        </div>
                    </div>
                </div>
            </form>
        </Dialog>
    );
};
