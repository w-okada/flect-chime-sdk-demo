import { Button, CircularProgress } from "@material-ui/core";
import { Lock } from "@material-ui/icons";
import React, { useState, useEffect } from "react";
import { RestAPIEndpoint } from "../../../BackendConfig";
import { DEFAULT_REGION } from "../../../constants";
import { useAppState } from "../../../providers/AppStateProvider";
import { STAGE } from "../../../providers/hooks/useStageManager";
// import { CustomSelect } from "../000_common/CustomSelect";
import { CustomTextField } from "../../000_common/CustomTextField";
import { Questionnaire } from "../../000_common/Questionnaire";
import { useStyles } from "../../000_common/Style";
import { getUserInformation } from "./rest";

export const SigninFromSlack = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [fail, setFail] = useState(false);
    const { cognitoClientState, setMessage, setStage, chimeClientState, deviceState, slackToken } = useAppState();

    const generateContext = () => {
        return {
            token: slackToken || "",
        };
    };

    useEffect(() => {
        console.log("REST ENDPOINT:", RestAPIEndpoint);
        console.log("SLACK TOKEN:", slackToken);
        console.log("Device:::", deviceState);
        if (deviceState.mediaDeviceList.audioinput.length > 0) {
            getUserInformation(generateContext()).then(async (result) => {
                if (result.isFailure()) {
                    setFail(true);
                    return;
                }
                console.log("success", result);
                const meetingName = result.value.roomName;
                const attendeeName = result.value.chimeInfo.attendeeName;
                const useDefault = result.value.chimeInfo.useDefault;

                console.log("slack login 1");
                try {
                    await chimeClientState.createMeeting(meetingName, DEFAULT_REGION);
                } catch (e) {
                    console.log("create meeting exception:", e);
                }
                console.log("slack login 2");

                await chimeClientState.joinMeeting(meetingName, attendeeName);
                console.log("slack login 3");
                const { defaultAudioInputDeviceId, defaultVideoInputDeviceId, defaultAudioOutputDeviceId } = deviceState.getDefaultDeviceIds();
                console.log("slack login 4", defaultAudioInputDeviceId, defaultVideoInputDeviceId, defaultAudioOutputDeviceId);
                // await deviceState.reloadDevices();
                const { defaultAudioInputDeviceId: defaultAudioInputDeviceId2, defaultVideoInputDeviceId: defaultVideoInputDeviceId2, defaultAudioOutputDeviceId: defaultAudioOutputDeviceId2 } = deviceState.getDefaultDeviceIds();
                console.log("slack login 5", defaultAudioInputDeviceId2, defaultVideoInputDeviceId2, defaultAudioOutputDeviceId2);

                await chimeClientState.setAudioInput(defaultAudioInputDeviceId);
                await chimeClientState.setAudioInputEnable(true);
                await chimeClientState.setVideoInput(defaultVideoInputDeviceId);
                await chimeClientState.setVirtualBackgroundSegmentationType("GoogleMeetTFLite");
                await chimeClientState.setVideoInputEnable(true);
                await chimeClientState.setAudioOutput(defaultAudioOutputDeviceId);
                await chimeClientState.setAudioOutputEnable(true);
                await chimeClientState.setBackgroundImagePath("/default/bg1.jpg");

                await chimeClientState.enterMeeting();
                console.log("slack login 4");
                chimeClientState.startLocalVideoTile();
                setStage(STAGE.MEETING_ROOM);
                console.log("slack login 5");
            });
        }
    }, [deviceState.mediaDeviceList]);

    const forms = (
        <>
            <div>processing....</div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginRight: 0 }}>{isLoading ? <CircularProgress /> : fail ? <>access failed</> : <></>}</div>
        </>
    );

    return (
        <>
            {/* <div>
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
                            setStage(STAGE.MEETING_ROOM);
                        });
                    }}
                >
                    {" "}
                    Bypass{" "}
                </Button>
            </div> */}
            <Questionnaire avatorIcon={<Lock />} title="Sign in" forms={forms} links={[]} />
        </>
    );
};
