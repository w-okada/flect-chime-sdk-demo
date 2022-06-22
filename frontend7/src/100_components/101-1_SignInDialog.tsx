import React, { useEffect, useState } from "react";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppState } from "../003_provider/AppStateProvider";
import { FRONTEND_LOCAL_DEV, DEFAULT_EMAIL, DEFAULT_PASSWORD } from "../const";
import { Processing } from "./parts/001_processing";

const TabItems = {
    signin: "signin",
    signup: "signup",
    verify: "verify",
    forgot: "forgot",
} as const;
type TabItems = typeof TabItems[keyof typeof TabItems];

type DialogTileIconProps = {
    tabId: TabItems;
    onChange: (tabId: TabItems) => void;
    selected: boolean;
    icon: JSX.Element;
    label: string;
};

type DialogMessage = {
    content: string;
    color: string;
};

const DialogTileIcon = (props: DialogTileIconProps) => {
    const icon = useMemo(() => {
        return (
            <div className="dialog-tile-icon-container">
                <input
                    id={props.tabId}
                    className="dialog-radio-button"
                    type="radio"
                    name="signin-dialog"
                    onChange={() => {
                        props.onChange(props.tabId);
                    }}
                    checked={props.selected}
                />
                <div className="dialog-radio-tile">
                    {props.icon}
                    <label htmlFor={props.tabId} className="dialog-radio-tile-label">
                        {props.label}
                    </label>
                </div>
            </div>
        );
    }, [props.selected]);
    return icon;
};

type DialogTilesProps = {
    currentTab: TabItems;
    onChange: (tabId: TabItems) => void;
};

const DialogTiles = (props: DialogTilesProps) => {
    const tiles = useMemo(() => {
        const signInIconProps: DialogTileIconProps = {
            tabId: TabItems.signin,
            onChange: () => {
                props.onChange(TabItems.signin);
            },
            selected: props.currentTab == TabItems.signin,
            icon: <FontAwesomeIcon icon={["fas", "right-to-bracket"]} size="3x" />,
            label: "sign in",
        };
        const signInIcon = <DialogTileIcon {...signInIconProps}></DialogTileIcon>;

        const signUpIconProps: DialogTileIconProps = {
            tabId: TabItems.signup,
            onChange: () => {
                props.onChange(TabItems.signup);
            },
            selected: props.currentTab == TabItems.signup,
            icon: <FontAwesomeIcon icon={["fas", "user-plus"]} size="3x" />,
            label: "sign up",
        };
        const signUpIcon = <DialogTileIcon {...signUpIconProps}></DialogTileIcon>;

        const verfiyIconProps: DialogTileIconProps = {
            tabId: TabItems.verify,
            onChange: () => {
                props.onChange(TabItems.verify);
            },
            selected: props.currentTab == TabItems.verify,
            icon: <FontAwesomeIcon icon={["fas", "spell-check"]} size="3x" />,
            label: "verify",
        };
        const verfiyIcon = <DialogTileIcon {...verfiyIconProps}></DialogTileIcon>;

        const forgotIconProps: DialogTileIconProps = {
            tabId: TabItems.forgot,
            onChange: () => {
                props.onChange(TabItems.forgot);
            },
            selected: props.currentTab == TabItems.forgot,
            icon: (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                    <FontAwesomeIcon icon={["fas", "key"]} size="3x" />
                    <FontAwesomeIcon icon={["fas", "arrow-rotate-right"]} style={{ right: "4px", bottom: "0px", margin: 0, padding: 0, fontSize: "1.3rem" }} />
                </div>
            ),
            label: "forgot password",
        };
        const forgotIcon = <DialogTileIcon {...forgotIconProps}></DialogTileIcon>;

        const tiles = (
            <div className="dialog-radio-tile-group">
                {signInIcon}
                {signUpIcon}
                {verfiyIcon}
                {forgotIcon}
            </div>
        );
        return tiles;
    }, [props.currentTab]);
    return tiles;
};

export const SignInDialog = () => {
    const { cognitoClientState, frontendState, messagingClientState, backendManagerState } = useAppState();
    const [message, setMessage] = useState<DialogMessage | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // (x) Show  Message
    const showMessage = (action: string, exception: any) => {
        console.log("showMessage:(row):", exception);
        console.log("showMessage:(json):", JSON.stringify(exception));
        switch (exception.code) {
            case "UserNotFoundException":
                console.warn("未登録のユーザ");
                setMessage({
                    content: `[${action}][${exception.code}] No registered user`,
                    color: "#ff0000",
                });
                break;
            case "InvalidParameterException":
                console.warn("パラメータが不正");
                setMessage({
                    content: `[${action}][${exception.code}] Invalide parameter`,
                    color: "#ff0000",
                });
                break;
            case "LimitExceededException":
                console.warn("??");
                setMessage({
                    content: `[${action}][${exception.code}] Unknown Exception`,
                    color: "#ff0000",
                });
                break;
            case "NotAuthorizedException":
                console.warn("サインインできない。");
                setMessage({
                    content: `[${action}][${exception.code}] Password error`,
                    color: "#ff0000",
                });
                break;
            case "NoUserNameInput":
                console.warn("ユーザ名が入っていない");
                setMessage({
                    content: `[${action}][${exception.code}] No display name`,
                    color: "#ff0000",
                });
                break;
            case "UsernameExistsException":
                console.warn("登録済みのユーザ");
                setMessage({
                    content: `[${action}][${exception.code}] The user is already registered.`,
                    color: "#ff0000",
                });
                break;
            case "CodeMismatchException":
                console.warn("コードが間違っている");
                setMessage({
                    content: `[${exception.code}] Invalid code.`,
                    color: "#ff0000",
                });
                break;
            default:
                console.error("Unknown Exception");
                setMessage({
                    content: `[${action}][${exception.code}] Unknown Exception`,
                    color: "#ff0000",
                });
        }
    };

    // (1) States

    const [tab, setTab] = useState<TabItems>("signin");

    // (2) Action
    // (2-1) Request to send verify code
    const requestVerifyCode = async () => {
        const email = (document.getElementById("signin-dialog-email") as HTMLInputElement).value;
        try {
            switch (tab) {
                // (2-1-1) Resend for first verification
                case "verify":
                    await cognitoClientState.resendVerification(email);
                    break;
                // (2-1-2) Send for Change Password
                case "forgot":
                    await cognitoClientState.sendVerificationCodeForChangePassword(email);
                    break;
                default:
                    break;
            }
        } catch (exception) {
            showMessage(tab, exception);
        }
    };

    //// (2-2) Main Operation
    const onSubmit = async () => {
        const email = (document.getElementById("signin-dialog-email") as HTMLInputElement).value;
        const password = (document.getElementById("signin-dialog-password") as HTMLInputElement).value;
        const newPassword = (document.getElementById("signin-dialog-new-password") as HTMLInputElement).value;
        const code = (document.getElementById("signin-dialog-verify-code") as HTMLInputElement).value;
        const username = (document.getElementById("signin-dialog-display-name") as HTMLInputElement).value;
        try {
            switch (tab) {
                // (A) Sign In
                case "signin":
                    setIsProcessing(true);
                    if (username.length < 1) {
                        console.warn("ユーザネームが入ってない。");
                        const err = new Error("no user name");
                        // @ts-ignore
                        err.code = "NoUserNameInput";
                        throw err;
                    }
                    await cognitoClientState.signIn(email, password);
                    backendManagerState.setUsername(username);
                    frontendState.setUserName(username);
                    localStorage.username = username;
                    setIsProcessing(false);
                    break;
                // (B) Sign Up
                case "signup":
                    setIsProcessing(true);
                    await cognitoClientState.signUp(email, newPassword);
                    setIsProcessing(false);
                    setMessage({
                        content: "A verification code is sent to your address. Please verify the code.",
                        color: "#0000ff",
                    });
                    break;
                // (C) Verify
                case "verify":
                    setIsProcessing(true);
                    await cognitoClientState.verify(email, code);
                    setIsProcessing(false);
                    setMessage({
                        content: "Verified.",
                        color: "#0000ff",
                    });

                    break;
                // (D) Change password
                case "forgot":
                    setIsProcessing(true);
                    await cognitoClientState.changePassword(email, code, newPassword);
                    setTab("signin");
                    setMessage(null);
                    setIsProcessing(false);
                    break;
                default:
                    console.error("unknwon tab:", tab);
                    setIsProcessing(false);
                    break;
            }
        } catch (exception) {
            showMessage(tab, exception);
            setIsProcessing(false);
        }
    };

    ////////////////////////////
    //  Conponents
    ////////////////////////////
    const dialogTilesProps: DialogTilesProps = {
        currentTab: tab,
        onChange: (tabId: TabItems) => {
            setTab(tabId);
            setMessage({
                content: "",
                color: "#000000",
            });
        },
    };
    const dialogTiles = <DialogTiles {...dialogTilesProps}></DialogTiles>;

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
            additionalAttr["defaultValue"] = DEFAULT_EMAIL;
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
            additionalAttr["defaultValue"] = DEFAULT_PASSWORD;
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
            additionalAttr["defaultValue"] = localStorage.username || "";
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
        let requestCode;
        if (tab == TabItems.signin || tab == TabItems.signup) {
            requestCode = <></>;
        } else {
            requestCode = (
                <div id="request-code" className={`submit-button`} onClick={requestVerifyCode}>
                    request code
                </div>
            );
        }
        return (
            <div className="dialog-input-controls">
                {requestCode}
                <div id="submit" className="submit-button" onClick={onSubmit}>
                    enter
                </div>
            </div>
        );
    }, [tab]);

    const processing = useMemo(() => {
        if (isProcessing) {
            return (
                <div className="dialog-input-controls">
                    {" "}
                    <Processing />{" "}
                </div>
            );
        } else {
            return <></>;
        }
    }, [cognitoClientState.signInCompleted, isProcessing]);

    const form = useMemo(() => {
        return (
            <div className="dialog-frame">
                <div className="dialog-title">Sign in</div>
                <div className="dialog-content">
                    <div className={"dialog-application-title"}>Flect Amazon Chime Demo</div>
                    {dialogTiles}
                    <div className="dialog-description">{description}</div>
                    <form>
                        <div className="dialog-input-container">
                            {emailField}
                            {passwordField}
                            {usernameField}
                            {newPasswordField}
                            {verifyCodeFeild}
                            {messageArea}
                            {buttons}
                            {processing}
                        </div>
                    </form>
                </div>
            </div>
        );
    }, [tab, messageArea, processing]);

    return form;
};
