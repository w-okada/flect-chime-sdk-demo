import { Avatar, Box, Button, CircularProgress, Container, CssBaseline, FormControl, Grid, InputLabel, Link, MenuItem, Select, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { MeetingRoom } from "@material-ui/icons";
import { Copyright } from "../000_common/Copyright";
import { useAmongUsStyles } from "../000_common/Style";
import { DeviceInfo } from "../../providers/hooks/useDeviceState";

export const WaitingRoomAmongUs = () => {
    const classes = useAmongUsStyles();
    const { chimeClient, audioInputList, audioOutputList, setStage, reloadDevices } = useAppState();
    const [isLoading, setIsLoading] = useState(false);

    //// Default Device ID
    const defaultDeiceId = (deviceList: DeviceInfo[] | null) => {
        if (!deviceList) {
            return "None";
        }
        const defaultDevice = deviceList.find((dev) => {
            return dev.deviceId !== "default";
        });
        return defaultDevice ? defaultDevice.deviceId : "None";
    };

    const defaultAudioInputDevice = defaultDeiceId(audioInputList);
    const defaultAudioOutputDevice = defaultDeiceId(audioOutputList);
    const [audioInputDeviceId, setAudioInputDeviceId] = useState(defaultAudioInputDevice);
    const [audioOutputDeviceId, setAudioOutputDeviceId] = useState(defaultAudioOutputDevice);

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
        chimeClient!.videoInputDeviceSetting!.setVirtualBackgroundSegmentationType("None");
        chimeClient!.videoInputDeviceSetting!.setVideoInput(null).then(() => {
            chimeClient!.videoInputDeviceSetting!.stopPreview();
        });
        chimeClient!.videoInputDeviceSetting!.setVirtualForegrounEnable(false);
        chimeClient!.videoInputDeviceSetting!.setVirtualBackgrounEnable(false);
    }, []); // eslint-disable-line

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

    return (
        <Container maxWidth="xs" className={classes.root}>
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
                        <InputLabel className={classes.label}>Microhpone</InputLabel>
                        <Select
                            onChange={(e) => {
                                setAudioInputDeviceId(e.target.value! as string);
                            }}
                            defaultValue={audioInputDeviceId}
                            className={classes.select}
                            inputProps={{
                                classes: {
                                    icon: classes.icon,
                                },
                                className: classes.input,
                            }}
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
                        <InputLabel className={classes.label}>Speaker</InputLabel>
                        <Select
                            onChange={(e) => {
                                setAudioOutputDeviceId(e.target.value! as string);
                            }}
                            defaultValue={audioOutputDeviceId}
                            className={classes.select}
                            inputProps={{
                                classes: {
                                    icon: classes.icon,
                                },
                                className: classes.input,
                            }}
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
                                    chimeClient?.leaveMeeting();
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
