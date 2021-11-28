import { Avatar, Box, Button, CircularProgress, Container, CssBaseline, FormControl, Grid, InputLabel, Link, MenuItem, Select, Typography } from "@material-ui/core";
import React, { useEffect, useMemo, useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { MeetingRoom } from "@material-ui/icons";
import { Copyright } from "../000_common/Copyright";
import { useStyles } from "../000_common/Style";
import { DeviceInfo } from "../../providers/hooks/useDeviceState";
import { VirtualBackgroundSegmentationType } from "@dannadori/flect-amazon-chime-lib";

export const WaitingRoom = () => {
    const classes = useStyles();
    const { chimeClient, audioInputList, videoInputList, audioOutputList, reloadDevices, setStage } = useAppState();
    const [isLoading, setIsLoading] = useState(false);

    //// Default Device ID
    const defaultDeviceId = (deviceList: DeviceInfo[] | null) => {
        if (!deviceList) {
            return "None";
        }
        const defaultDevice = deviceList.find((dev) => {
            return dev.deviceId !== "default";
        });
        return defaultDevice ? defaultDevice.deviceId : "None";
    };

    const defaultAudioInputDevice = defaultDeviceId(audioInputList);
    const defaultVideoInputDevice = defaultDeviceId(videoInputList);
    const defaultAudioOutputDevice = defaultDeviceId(audioOutputList);
    const [audioInputDeviceId, setAudioInputDeviceId] = useState(defaultAudioInputDevice);
    const [videoInputDeviceId, setVideoInputDeviceId] = useState(defaultVideoInputDevice);
    const [audioOutputDeviceId, setAudioOutputDeviceId] = useState(defaultAudioOutputDevice);
    const [segmentationType, setSegmentationType] = useState<VirtualBackgroundSegmentationType>("GoogleMeetTFLite");

    const onReloadDeviceClicked = () => {
        reloadDevices();
    };

    const onEnterClicked = async () => {
        setIsLoading(true);
        try {
            await chimeClient!.enterMeeting();
            setIsLoading(false);
            chimeClient!.videoInputDeviceSetting!.startLocalVideoTile();
            setStage("MEETING_ROOM");
        } catch (e: any) {
            setIsLoading(false);
            console.log(e);
        }
    };

    useEffect(() => {
        const videoEl = document.getElementById("camera-preview") as HTMLVideoElement;
        chimeClient!.videoInputDeviceSetting!.setPreviewVideoElement(videoEl);
    }, []); // eslint-disable-line

    useEffect(() => {
        if (videoInputDeviceId === "None") {
            chimeClient!.videoInputDeviceSetting!.setVideoInput(null).then(() => {
                chimeClient!.videoInputDeviceSetting!.stopPreview();
            });
        } else if (videoInputDeviceId === "File") {
            // fileInputRef.current!.click()
        } else {
            chimeClient!.videoInputDeviceSetting!.setVideoInput(videoInputDeviceId).then(() => {
                chimeClient!.videoInputDeviceSetting!.startPreview();
            });
        }
    }, [videoInputDeviceId]); // eslint-disable-line

    useEffect(() => {
        if (segmentationType === "None") {
            chimeClient!.videoInputDeviceSetting!.setVirtualBackgroundSegmentationType("None");
        } else {
            chimeClient!.videoInputDeviceSetting!.setVirtualBackgroundSegmentationType(segmentationType);
        }
    }, [segmentationType]); // eslint-disable-line

    useEffect(() => {
        if (audioInputDeviceId === "None") {
            chimeClient!.audioInputDeviceSetting!.setAudioInput(null);
        } else {
            chimeClient!.audioInputDeviceSetting!.setAudioInput(audioInputDeviceId);
        }
    }, [audioInputDeviceId]); // eslint-disable-line

    useEffect(() => {
        if (audioOutputDeviceId === "None") {
            chimeClient!.audioOutputDeviceSetting!.setAudioOutput(null);
        } else {
            chimeClient!.audioOutputDeviceSetting!.setAudioOutput(audioOutputDeviceId);
        }
    }, [audioOutputDeviceId]); // eslint-disable-line

    const videoPreview = useMemo(() => {
        return <video id="camera-preview" className={classes.cameraPreview} />;
    }, []); // eslint-disable-line
    return (
        <Container maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <MeetingRoom />
                </Avatar>

                <Typography variant="h4" className={classes.title}>
                    Waiting Meeting
                </Typography>
                <Typography variant="h4" className={classes.title}>
                    You will join room <br />
                    (user:{chimeClient!.userName}, room:{chimeClient!.meetingName}) <br />
                    Setup your devices.
                </Typography>

                <form className={classes.form} noValidate>
                    <Button fullWidth variant="outlined" color="primary" onClick={onReloadDeviceClicked}>
                        reload device list
                    </Button>

                    <FormControl className={classes.formControl}>
                        <InputLabel>Camera</InputLabel>
                        <Select
                            onChange={(e) => {
                                setVideoInputDeviceId(e.target.value! as string);
                            }}
                            defaultValue={videoInputDeviceId}
                        >
                            <MenuItem disabled value="Video">
                                <em>Video</em>
                            </MenuItem>
                            {videoInputList?.map((dev) => {
                                return (
                                    <MenuItem value={dev.deviceId} key={dev.deviceId}>
                                        {dev.label}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                    <Typography>Preview.(virtual bg is not applied here yet.)</Typography>
                    {videoPreview}

                    <FormControl className={classes.formControl}>
                        <InputLabel>VirtualBG</InputLabel>
                        <Select
                            onChange={(e) => {
                                setSegmentationType(e.target.value! as VirtualBackgroundSegmentationType);
                            }}
                            defaultValue={segmentationType}
                        >
                            <MenuItem disabled value="Video">
                                <em>VirtualBG</em>
                            </MenuItem>
                            <MenuItem value="None">
                                <em>None</em>
                            </MenuItem>
                            <MenuItem value="BodyPix">
                                <em>BodyPix</em>
                            </MenuItem>
                            <MenuItem value="GoogleMeet">
                                <em>GoogleMeet</em>
                            </MenuItem>
                            <MenuItem value="GoogleMeetTFLite">
                                <em>GoogleMeetTFLite</em>
                            </MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl className={classes.formControl}>
                        <InputLabel>Microhpone</InputLabel>
                        <Select
                            onChange={(e) => {
                                setAudioInputDeviceId(e.target.value! as string);
                            }}
                            defaultValue={audioInputDeviceId}
                        >
                            <MenuItem disabled value="Video">
                                <em>Microphone</em>
                            </MenuItem>
                            {audioInputList?.map((dev) => {
                                return (
                                    <MenuItem value={dev.deviceId} key={dev.deviceId}>
                                        {dev.label}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>

                    <FormControl className={classes.formControl}>
                        <InputLabel>Speaker</InputLabel>
                        <Select
                            onChange={(e) => {
                                setAudioOutputDeviceId(e.target.value! as string);
                            }}
                            defaultValue={audioOutputDeviceId}
                        >
                            <MenuItem disabled value="Video">
                                <em>Speaker</em>
                            </MenuItem>
                            {audioOutputList?.map((dev) => {
                                return (
                                    <MenuItem value={dev.deviceId} key={dev.deviceId}>
                                        {dev.label}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                    <Grid container direction="column" alignItems="center">
                        {isLoading ? (
                            <CircularProgress />
                        ) : (
                            <Button fullWidth variant="contained" color="primary" className={classes.submit} onClick={onEnterClicked} id="submit">
                                Enter
                            </Button>
                        )}
                    </Grid>
                    <Grid container direction="column">
                        <Grid item xs>
                            <Link
                                onClick={(e: any) => {
                                    setStage("ENTRANCE");
                                }}
                            >
                                Go Back
                            </Link>
                        </Grid>
                        <Grid item xs>
                            <Link
                                onClick={(e: any) => {
                                    chimeClient!.leaveMeeting();
                                    setStage("SIGNIN");
                                }}
                            >
                                Sign out
                            </Link>
                        </Grid>
                    </Grid>
                    <Box mt={8}>
                        <Copyright />
                    </Box>
                </form>
            </div>
        </Container>
    );
};
