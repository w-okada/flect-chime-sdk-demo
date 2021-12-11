import { Button, CircularProgress, Typography } from "@material-ui/core";
import { MeetingRoom } from "@material-ui/icons";
import React, { useEffect, useMemo, useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { useStyles } from "../000_common/Style";
import { VirtualBackgroundSegmentationType } from "@dannadori/flect-amazon-chime-lib2";
import { Questionnaire } from "../000_common/Questionnaire";
import { CustomSelect } from "../000_common/CustomSelect";
import { STAGE } from "../../providers/hooks/useStageManager";

export const WaitingRoom = () => {
    const { chimeClientState, deviceState, setStage } = useAppState();
    const [isLoading, setIsLoading] = useState(false);
    const classes = useStyles();
    //// Default Device ID
    const { defaultAudioInputDeviceId, defaultVideoInputDeviceId, defaultAudioOutputDeviceId } = deviceState.getDefaultDeviceIds();

    const [audioInputDeviceId, setAudioInputDeviceId] = useState(defaultAudioInputDeviceId);
    const [videoInputDeviceId, setVideoInputDeviceId] = useState(defaultVideoInputDeviceId);
    const [audioOutputDeviceId, setAudioOutputDeviceId] = useState(defaultAudioOutputDeviceId);
    const [segmentationType, setSegmentationType] = useState<VirtualBackgroundSegmentationType>("GoogleMeetTFLite");

    const onReloadDeviceClicked = () => {
        deviceState.reloadDevices();
    };

    const onEnterClicked = async () => {
        setIsLoading(true);
        try {
            await chimeClientState.enterMeeting();
            setIsLoading(false);
            chimeClientState.startLocalVideoTile();

            setStage(STAGE.MEETING_ROOM);
        } catch (e: any) {
            setIsLoading(false);
            console.log(e);
        }
    };

    useEffect(() => {
        const videoEl = document.getElementById("camera-preview") as HTMLVideoElement;
        chimeClientState.setPreviewVideoElement(videoEl);
    }, []); // eslint-disable-line

    useEffect(() => {
        if (videoInputDeviceId === "None") {
            chimeClientState.setVideoInput(null).then(() => {
                chimeClientState.stopPreview();
            });
        } else if (videoInputDeviceId === "File") {
            // fileInputRef.current!.click()
        } else {
            chimeClientState.setVideoInput(videoInputDeviceId).then(() => {
                console.log("DO START PREVIEW!1");
                chimeClientState.startPreview();
                console.log("DO START PREVIEW!2");
            });
        }
    }, [videoInputDeviceId]); // eslint-disable-line

    useEffect(() => {
        if (segmentationType === "None") {
            chimeClientState.setVirtualBackgroundSegmentationType("None");
        } else {
            chimeClientState.setVirtualBackgroundSegmentationType(segmentationType).then(() => {
                console.log("SET VIRTUAL BACK!");
            });
        }
    }, [segmentationType]); // eslint-disable-line

    useEffect(() => {
        if (audioInputDeviceId === "None") {
            chimeClientState.setAudioInput(null);
        } else {
            chimeClientState.setAudioInput(audioInputDeviceId).then(() => {
                console.log("SET AUDIO!");
            });
        }
    }, [audioInputDeviceId]); // eslint-disable-line

    useEffect(() => {
        if (audioOutputDeviceId === "None") {
            chimeClientState.setAudioOutput(null);
        } else {
            chimeClientState.setAudioOutput(audioOutputDeviceId).then(() => {
                console.log("SET AUDIOOUT!");
            });
        }
    }, [audioOutputDeviceId]); // eslint-disable-line

    const videoPreview = useMemo(() => {
        return <video id="camera-preview" className={classes.cameraPreview} />;
    }, []); // eslint-disable-line

    const cameras = deviceState.mediaDeviceList.videoinput.map((x) => {
        return { label: x.label, value: x.deviceId };
    });
    const virtualBackgrounds = [
        { label: "None", value: "None" },
        { label: "BodyPix", value: "BodyPix" },
        { label: "GoogleMeet", value: "GoogleMeet" },
        { label: "GoogleMeetTFLite", value: "GoogleMeetTFLite" },
    ];
    const microphones = deviceState.mediaDeviceList.audioinput.map((x) => {
        return { label: x.label, value: x.deviceId };
    });
    const speakers = deviceState.mediaDeviceList.audiooutput.map((x) => {
        return { label: x.label, value: x.deviceId };
    });

    const forms = (
        <>
            <div style={{ margin: 10 }}>
                Setup your devices. (user:{chimeClientState.userName}, room:{chimeClientState.meetingName})
            </div>
            <div style={{ margin: 10 }}>
                <CustomSelect onChange={(e) => setVideoInputDeviceId(e)} label="camera" height={16} fontsize={12} labelFontsize={16} items={cameras} defaultValue={defaultVideoInputDeviceId} />
            </div>
            <div style={{ margin: 10 }}>
                <CustomSelect onChange={(e) => setSegmentationType(e as VirtualBackgroundSegmentationType)} label="virtual background" height={16} fontsize={12} labelFontsize={16} items={virtualBackgrounds} defaultValue={segmentationType} />
            </div>

            <div style={{ margin: 10 }}>
                <Typography>Preview</Typography>
                {videoPreview}
            </div>
            <div style={{ margin: 10 }}>
                <CustomSelect onChange={(e) => setAudioInputDeviceId(e)} label="Microhpone" height={16} fontsize={12} labelFontsize={16} items={microphones} defaultValue={defaultAudioInputDeviceId} />
            </div>
            <div style={{ margin: 10 }}>
                <CustomSelect onChange={(e) => setAudioOutputDeviceId(e)} label="Speaker" height={16} fontsize={12} labelFontsize={16} items={speakers} defaultValue={defaultAudioOutputDeviceId} />
            </div>
            <div style={{ margin: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Button size="small" variant="outlined" color="primary" onClick={onReloadDeviceClicked}>
                    reload device list
                </Button>

                {isLoading ? (
                    <CircularProgress />
                ) : (
                    <Button size="small" variant="contained" color="primary" onClick={onEnterClicked} id="submit">
                        Enter
                    </Button>
                )}
            </div>
        </>
    );
    const links = [
        {
            title: "Go Back",
            onClick: () => {
                setStage(STAGE.ENTRANCE);
            },
        },
        {
            title: "Sign out",
            onClick: () => {
                chimeClientState.leaveMeeting();
                setStage(STAGE.SIGNIN);
            },
        },
    ];
    return (
        <>
            <Questionnaire avatorIcon={<MeetingRoom />} title="Waiting Room" forms={forms} links={links} />
        </>
    );
};
