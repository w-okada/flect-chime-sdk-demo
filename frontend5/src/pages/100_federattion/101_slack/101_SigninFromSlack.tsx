import { Button, CircularProgress, LinearProgress, Typography } from "@material-ui/core";
import { Lock } from "@material-ui/icons";
import React, { useState, useEffect, useMemo } from "react";
import { RestAPIEndpoint } from "../../../BackendConfig";
import { DEFAULT_REGION } from "../../../constants";
import { useAppState } from "../../../providers/AppStateProvider";
import { STAGE } from "../../../providers/hooks/useStageManager";
// import { CustomSelect } from "../000_common/CustomSelect";
import { CustomTextField } from "../../000_common/CustomTextField";
import { Questionnaire } from "../../000_common/Questionnaire";
import { useStyles } from "../../000_common/Style";
import { getUserInformation } from "./rest";

const AutoSigninProcessState = {
    INIT: "INIT",
    USER_CHECK_COMPLETED: "USER_CHECK_COMPLETED",
    DEVICE_CHECK_COMPLETED: "DEVICE_CHECK_COMPLETED",
    CREATE_MEETING_COMPLETED: "CREATE_MEETING_COMPLETED",
    JOIN_MEETING_COMPLETED: "JOIN_MEETING_COMPLETED",
    SET_DEVICES_COMPLETED: "SET_DEVICES_COMPLETED",
    ENTER_MEETING_COMPLETED: "ENTER_MEETING_COMPLETED",
} as const;
type AutoSigninProcessState = typeof AutoSigninProcessState[keyof typeof AutoSigninProcessState];

type AutoSigninState = {
    state: AutoSigninProcessState;
    meetingName?: string;
    attendeeName?: string;
    useDefault?: boolean;
    deviceListRetry: number;
};

const generateLinearProgressWithLabel = (rate: number) => {
    return (
        <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "100%" }}>
                <LinearProgress variant="determinate" value={rate} />
            </div>
            <div style={{ minWidth: 35 }}>
                <Typography variant="body2">{`${Math.round(rate)}%`}</Typography>
            </div>
        </div>
    );
};

export const SigninFromSlack = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [autoSigninState, setAutoSigninState] = useState<AutoSigninState>({ state: AutoSigninProcessState.INIT, deviceListRetry: 0 });
    const [fail, setFail] = useState(false);
    const { setMessage, setStage, chimeClientState, deviceState, slackToken } = useAppState();

    const generateContext = () => {
        return {
            token: slackToken || "",
        };
    };

    const ckeckUser = async () => {
        console.log(`user checking....`);
        getUserInformation(generateContext()).then(async (result) => {
            if (result.isFailure()) {
                setMessage("Exception", "user check failed", [`The link may be too old. (Expire is 1 hour.)`, `Please click join button again to generate new dialog`]);
                return;
            } else {
                setAutoSigninState({
                    ...autoSigninState,
                    state: AutoSigninProcessState.USER_CHECK_COMPLETED,
                    meetingName: result.value.roomName,
                    attendeeName: result.value.chimeInfo.attendeeName,
                    useDefault: result.value.chimeInfo.useDefault,
                });
            }
        });
    };
    const checkDevice = async () => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        console.log(`device checking... [${autoSigninState.deviceListRetry}/10] ${deviceState.mediaDeviceList.audioinput.length}`);
        console.log(deviceState);
        // If there are no devices whose Id is empty string, check ok.
        if (
            deviceState.mediaDeviceList.audioinput.length > 0 &&
            !deviceState.mediaDeviceList.audioinput.find((x) => {
                return x.deviceId === "";
            })
        ) {
            setAutoSigninState({ ...autoSigninState, state: AutoSigninProcessState.DEVICE_CHECK_COMPLETED });
            return;
        }

        deviceState.reloadDevices();
        await new Promise((resolve, reject) => {
            setTimeout(resolve, 1000 * 1);
        });
        setAutoSigninState({ ...autoSigninState, deviceListRetry: autoSigninState.deviceListRetry + 1 });
    };

    const createMeeting = async () => {
        console.log("createMeeting....");
        try {
            await chimeClientState.createMeeting(autoSigninState.meetingName!, DEFAULT_REGION);
        } catch (e) {
            console.log("create meeting exception:", e);
        }
        setAutoSigninState({ ...autoSigninState, state: AutoSigninProcessState.CREATE_MEETING_COMPLETED });
    };

    const joinMeeting = async () => {
        console.log("joinMeeting....");
        await chimeClientState.joinMeeting(autoSigninState.meetingName!, autoSigninState.attendeeName!);
        setAutoSigninState({ ...autoSigninState, state: AutoSigninProcessState.JOIN_MEETING_COMPLETED });
    };

    const setDevices = async () => {
        console.log("setDevices....");
        try {
            const { defaultAudioInputDeviceId, defaultVideoInputDeviceId, defaultAudioOutputDeviceId } = deviceState.getDefaultDeviceIds();
            console.log("setDevices....1");
            await chimeClientState.setAudioInput(defaultAudioInputDeviceId);
            console.log("setDevices....2");
            await chimeClientState.setAudioInputEnable(true);
            console.log("setDevices....3");
            try {
                await chimeClientState.setVideoInput(defaultVideoInputDeviceId);
            } catch (e) {
                setMessage("Exception", "Device Setting Exception", [`${e}`, `This may occur when other application use the device.`, `Video device is set to None.`]);
                await chimeClientState.setVideoInput(null);
            }
            console.log("setDevices....4");
            await chimeClientState.setVirtualBackgroundSegmentationType("GoogleMeetTFLite");
            console.log("setDevices....5");
            await chimeClientState.setVideoInputEnable(true);
            console.log("setDevices....6");
            await chimeClientState.setAudioOutput(defaultAudioOutputDeviceId);
            console.log("setDevices....7");
            await chimeClientState.setAudioOutputEnable(true);
            console.log("setDevices....8");
            await chimeClientState.setBackgroundImagePath("/default/bg1.jpg");
            console.log("setDevices....9");
            setAutoSigninState({ ...autoSigninState, state: AutoSigninProcessState.SET_DEVICES_COMPLETED });
        } catch (e) {
            setMessage("Exception", "Device Setting Exception", [`${e}`, `relaod maybe help you`]);
            setFail(true);
        }
    };

    const enterMeeting = async () => {
        console.log("enterMeeting....");
        await chimeClientState.enterMeeting();
        chimeClientState.startLocalVideoTile();
        setAutoSigninState({ ...autoSigninState, state: AutoSigninProcessState.ENTER_MEETING_COMPLETED });
    };

    useEffect(() => {
        console.log("REST ENDPOINT:", RestAPIEndpoint);
        console.log("SLACK TOKEN:", slackToken);
        console.log("Device:::", deviceState);
        switch (autoSigninState.state) {
            case AutoSigninProcessState.INIT:
                ckeckUser();
                break;
            case AutoSigninProcessState.USER_CHECK_COMPLETED:
                checkDevice();
                break;
            case AutoSigninProcessState.DEVICE_CHECK_COMPLETED:
                createMeeting();
                break;
            case AutoSigninProcessState.CREATE_MEETING_COMPLETED:
                joinMeeting();
                break;
            case AutoSigninProcessState.JOIN_MEETING_COMPLETED:
                setDevices();
                break;
            case AutoSigninProcessState.SET_DEVICES_COMPLETED:
                enterMeeting();
                break;
            case AutoSigninProcessState.ENTER_MEETING_COMPLETED:
                setStage(STAGE.MEETING_ROOM);
                break;
            default:
        }
    }, [autoSigninState]);

    // const forms = (
    //     AccountBox
    //     Mic
    //     VideoCameraFront
    //     Living
    //     MeetingRoom

    //     <>
    //         <div>processing....</div>
    //         <div style={{ display: "flex", justifyContent: "center", marginRight: 0 }}>{isLoading ? <CircularProgress /> : fail ? <>access failed</> : <></>}</div>
    //     </>
    // );
    const processBar = useMemo(() => {
        switch (autoSigninState.state) {
            case AutoSigninProcessState.INIT:
                return generateLinearProgressWithLabel(0);
            case AutoSigninProcessState.USER_CHECK_COMPLETED:
                return generateLinearProgressWithLabel(10);
            case AutoSigninProcessState.DEVICE_CHECK_COMPLETED:
                return generateLinearProgressWithLabel(30);
            case AutoSigninProcessState.CREATE_MEETING_COMPLETED:
                return generateLinearProgressWithLabel(50);
            case AutoSigninProcessState.JOIN_MEETING_COMPLETED:
                return generateLinearProgressWithLabel(70);
            case AutoSigninProcessState.SET_DEVICES_COMPLETED:
                return generateLinearProgressWithLabel(90);
            case AutoSigninProcessState.ENTER_MEETING_COMPLETED:
                return generateLinearProgressWithLabel(100);
            default:
                return <></>;
        }
    }, [autoSigninState]);

    // const forms = useMemo(() => {
    //     return (
    //         <>
    //             <div>processing....</div>
    //             <div style={{ display: "flex", justifyContent: "center", marginRight: 0 }}>{isLoading ? <CircularProgress /> : fail ? <>access failed</> : <></>}</div>
    //             <div>{processBar}</div>
    //         </>
    //     );
    // }, [isLoading, autoSigninState]);

    const forms = useMemo(() => {
        const loadingView = <CircularProgress />;
        const notLoadingView = fail ? (
            <>
                exception occured. please reload.
                <Button onClick={location.reload}>reload</Button>
            </>
        ) : (
            <></>
        );
        return (
            <>
                <div>processing....</div>
                <div style={{ display: "flex", justifyContent: "center", marginRight: 0 }}>{isLoading ? loadingView : notLoadingView}</div>
                <div>{processBar}</div>
            </>
        );
    }, [isLoading, autoSigninState]);

    return (
        <>
            <Questionnaire avatorIcon={<Lock />} title="Sign in" forms={forms} links={[]} />
        </>
    );
};
