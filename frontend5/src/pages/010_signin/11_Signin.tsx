import { Button, CircularProgress } from "@material-ui/core";
import { Lock } from "@material-ui/icons";
import React, { useState } from "react";
import { DEFAULT_REGION } from "../../constants";
import { useAppState } from "../../providers/AppStateProvider";
// import { CustomSelect } from "../000_common/CustomSelect";
import { CustomTextField } from "../000_common/CustomTextField";
import { Questionnaire } from "../000_common/Questionnaire";
import { useStyles } from "../000_common/Style";

export const SignIn = () => {
    const { cognitoClientState, setMessage, setStage, chimeClientState, deviceState } = useAppState();
    const [userId, setUserId] = useState(cognitoClientState.userId || "");
    const [password, setPassword] = useState(cognitoClientState || "");

    const [isLoading, setIsLoading] = useState(false);

    const classes = useStyles();

    const onSignInClicked = async () => {
        setIsLoading(true);
        try {
            await cognitoClientState.signIn(userId, password);
            setIsLoading(false);
            setStage("ENTRANCE");
        } catch (e: any) {
            console.log("sign in error:::", e);
            setMessage("Exception", "Signin error", [`${e.message}`, `(code: ${e.code})`]);
            setIsLoading(false);
        }
    };

    const forms = (
        <>
            {/* <CustomSelect
                onChange={(e) => console.log("select:::", e)}
                label="email"
                height={16}
                fontsize={12}
                items={[
                    { label: "aaaa", value: "bbbb" },
                    { label: "1111", value: "2222" },
                ]}
                defaultValue="bbbb"
            /> */}
            <div className={classes.loginField}>
                <CustomTextField onChange={(e) => setUserId(e.target.value)} label="email" secret={false} height={20} fontsize={16} defaultValue={userId} autofocus />
                <CustomTextField onChange={(e) => setPassword(e.target.value)} label="password" secret={true} height={20} fontsize={16} defaultValue={password} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginRight: 0 }}>
                {isLoading ? (
                    <CircularProgress />
                ) : (
                    <Button id="submit" variant="contained" color="primary" className={classes.submit} onClick={onSignInClicked}>
                        Sign in
                    </Button>
                )}
            </div>
        </>
    );
    const links = [
        {
            title: "Enter as a guest",
            onClick: () => {
                setStage("ENTRANCE_AS_GUEST");
            },
        },
        {
            title: "Sign up",
            onClick: () => {
                setStage("SIGNUP");
            },
        },
        {
            title: "Forgot or chnage password",
            onClick: () => {
                setStage("REQUEST_NEW_PASSWORD");
            },
        },
        {
            title: "Verify code",
            onClick: () => {
                setStage("VERIFY");
            },
        },
    ];

    return (
        <>
            <div>
                <Button
                    onClick={(e) => {
                        cognitoClientState.signIn(userId, password).then(async () => {
                            console.log("logined1");
                            chimeClientState.initialize(cognitoClientState.userId!, cognitoClientState.idToken!, cognitoClientState.accessToken!, cognitoClientState.refreshToken!);
                            console.log("logined2");
                            try {
                                await chimeClientState.createMeeting("TEST", DEFAULT_REGION);
                            } catch (e) {
                                console.log("create meeting exception:", e);
                            }
                            console.log("logine3d");
                            await chimeClientState.joinMeeting("TEST", "HOGE" + new Date().getTime());

                            const { defaultAudioInputDeviceId, defaultVideoInputDeviceId, defaultAudioOutputDeviceId } = deviceState.getDefaultDeviceIds();
                            await chimeClientState.setAudioInput(defaultAudioInputDeviceId);
                            await chimeClientState.setAudioInputEnable(true);
                            await chimeClientState.setVideoInput(defaultVideoInputDeviceId);
                            await chimeClientState.setVirtualBackgroundSegmentationType("GoogleMeetTFLite");
                            await chimeClientState.setVideoInputEnable(true);
                            await chimeClientState.setAudioOutput(defaultAudioOutputDeviceId);
                            await chimeClientState.setAudioOutputEnable(true);

                            await chimeClientState.enterMeeting();
                            console.log("logined4");
                            chimeClientState.startLocalVideoTile();
                            setStage("MEETING_ROOM");
                        });
                    }}
                >
                    {" "}
                    Bypass{" "}
                </Button>
            </div>
            <Questionnaire avatorIcon={<Lock />} title="Sign in" forms={forms} links={links} />
        </>
    );
};
