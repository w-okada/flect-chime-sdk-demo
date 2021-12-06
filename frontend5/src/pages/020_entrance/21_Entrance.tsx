import { Button, Checkbox, CircularProgress } from "@material-ui/core";
import { Favorite, FavoriteBorder, MeetingRoom } from "@material-ui/icons";
import React, { useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { CustomTextField } from "../000_common/CustomTextField";
import { Questionnaire } from "../000_common/Questionnaire";
import { useStyles } from "../000_common/Style";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const c = require("../../backend_const");

type EntranceProps = {
    asGuest?: boolean;
};

export const Entrance = (props: EntranceProps) => {
    const { chimeClientState, setMessage, setStage, deviceState } = useAppState();
    const [meetingName, setMeetingName] = useState(chimeClientState.meetingName || "");
    const [userName, setUserName] = useState(chimeClientState.userName || "");
    const [codeToAccess, setCodeToAccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [useDefault, setUseDefault] = useState(true);

    const classes = useStyles();

    const onJoinMeetingClicked = async () => {
        setIsLoading(true);
        try {
            const meetingInfo = await chimeClientState.getMeetingInfo(meetingName, userName);
            console.log("MeetingInfo:", meetingInfo);
        } catch (e: any) {
            setMessage("Exception", "Enter Room Failed", [`${e.message}\n, please create new room.`, `(code: ${e.code})`, c.MEETING_NOT_FOUND]);
            setStage("CREATE_MEETING_ROOM");
            return;
        }
        try {
            if (props.asGuest) {
                await chimeClientState.initializeWithCode(codeToAccess);
                await chimeClientState.joinMeeting(meetingName, userName);
            } else {
                await chimeClientState.joinMeeting(meetingName, userName);
            }
            console.log("joined to meeting..");
            if (useDefault) {
                try {
                    const { defaultAudioInputDeviceId, defaultVideoInputDeviceId, defaultAudioOutputDeviceId } = deviceState.getDefaultDeviceIds();
                    await chimeClientState.setAudioInput(defaultAudioInputDeviceId);
                    await chimeClientState.setAudioInputEnable(true);
                    await chimeClientState.setVideoInput(defaultVideoInputDeviceId);
                    await chimeClientState.setVirtualBackgroundSegmentationType("GoogleMeetTFLite");
                    await chimeClientState.setVideoInputEnable(true);
                    await chimeClientState.setAudioOutput(defaultAudioOutputDeviceId);
                    await chimeClientState.setAudioOutputEnable(true);

                    // await new Promise<void>((resolve, reject) => {
                    //     setTimeout(() => {
                    //         console.log("TIMEOUT!!");
                    //         resolve();
                    //     }, 1000 * 5);
                    // });

                    await chimeClientState.enterMeeting();
                    setIsLoading(false);
                    chimeClientState.startLocalVideoTile();
                    setStage("MEETING_ROOM");
                } catch (e: any) {
                    setIsLoading(false);
                    console.log(e);
                }
            } else {
                setIsLoading(false);
                setStage("WAITING_ROOM");
            }
        } catch (e: any) {
            console.log(e);
            setMessage("Exception", "Enter Room Failed", [`${e.message}`, `(code: ${e.code})`]);
            setIsLoading(false);
        }
    };

    const forms = (
        <>
            <div className={classes.loginField}>
                <CustomTextField onChange={(e) => setMeetingName(e.target.value)} label="meeting name" secret={false} height={20} fontsize={16} defaultValue={meetingName} autofocus />
                <CustomTextField onChange={(e) => setUserName(e.target.value)} label="user name" secret={false} height={20} fontsize={16} defaultValue={userName} />
                {props.asGuest ? <CustomTextField onChange={(e) => setCodeToAccess(e.target.value)} label="guest code" secret={false} height={20} fontsize={16} defaultValue={codeToAccess} /> : <></>}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginRight: 0 }}>
                {isLoading ? (
                    <CircularProgress />
                ) : (
                    <Button variant="contained" color="primary" className={classes.submit} onClick={onJoinMeetingClicked} id="submit">
                        Join Meeting
                    </Button>
                )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div>
                    <Checkbox
                        icon={<FavoriteBorder />}
                        checkedIcon={<Favorite />}
                        size="small"
                        checked={useDefault ? true : false}
                        onClick={(e) => {
                            setUseDefault(!useDefault);
                        }}
                    />
                    use default setting
                </div>
            </div>
        </>
    );

    const links = [
        {
            title: "Create Meeting Room",
            onClick: () => {
                setStage("CREATE_MEETING_ROOM");
            },
        },
        {
            title: "Sign out",
            onClick: () => {
                chimeClientState.leaveMeeting();
                setStage("SIGNIN");
            },
        },
    ];

    return (
        <>
            <Questionnaire avatorIcon={<MeetingRoom />} title="Join Meeting" forms={forms} links={links} />
        </>
    );
};
