import { Avatar, Box, Button, CircularProgress, Container, CssBaseline, FormControl, Grid, InputLabel, Link, makeStyles, MenuItem, Select, Typography } from "@material-ui/core";
import React, { useEffect, useMemo, useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { MeetingRoom } from '@material-ui/icons'
import { Copyright } from "../000_common/Copyright";
import { DeviceInfo } from "../../utils";
import { VirtualBackgroundSegmentationType } from "../../frameProcessors/VirtualBackground";

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
    },
    form: {
        width: '100%',
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },

    formControl: {
        margin: theme.spacing(1),
        width: '100%'
        // minWidth: 120,
    },

    cameraPreview: {
        width: '50%'
    },
}));

export const WaitingRoom = () => {
    const classes = useStyles()
    const { userId, userName, meetingName, audioInputList, videoInputList, audioOutputList, 
            audioInputDeviceSetting, videoInputDeviceSetting, audioOutputDeviceSetting, 
            setStage, handleSignOut, reloadDevices, enterMeeting} = useAppState()
    const [isLoading, setIsLoading] = useState(false)

    //// Default Device ID
    const defaultDeiceId = (deviceList: DeviceInfo[] | null) => {
        if(!deviceList){
            return "None"
        }
        const defaultDevice = deviceList.find(dev=>{return dev.deviceId !== "default"})
        return defaultDevice ? defaultDevice.deviceId : "None"
    }

    const defaultAudioInputDevice  = defaultDeiceId(audioInputList)
    const defaultVideoInputDevice  = defaultDeiceId(videoInputList)
    const defaultAudioOutputDevice = defaultDeiceId(audioOutputList)
    const [audioInputDeviceId,  setAudioInputDeviceId]  = useState(defaultAudioInputDevice)
    const [videoInputDeviceId,  setVideoInputDeviceId]  = useState(defaultVideoInputDevice)
    const [audioOutputDeviceId, setAudioOutputDeviceId] = useState(defaultAudioOutputDevice)
    const [segmentationType, setSegmentationType] = useState<VirtualBackgroundSegmentationType>("GoogleMeetTFLite")

    const onReloadDeviceClicked = () =>{
        reloadDevices()
    }

    const onEnterClicked = () => {
        setIsLoading(true)
        enterMeeting().then(()=>{
            setIsLoading(false)
            setStage("MEETING_ROOM")
        }).catch(e=>{
            setIsLoading(false)
            console.log(e)
        })
    }

    useEffect(() => {
        const videoEl = document.getElementById("camera-preview") as HTMLVideoElement
        videoInputDeviceSetting!.setPreviewVideoElement(videoEl)
    },[])// eslint-disable-line
    
    useEffect(() => {
        if (videoInputDeviceId === "None") {
            const p1 = videoInputDeviceSetting!.setVideoInput(null,true)
            const p2 = videoInputDeviceSetting!.setVideoInputEnable(false,true)
            Promise.all([p1, p2]).then(()=>{
                videoInputDeviceSetting!.stopPreview()
            }) 
        } else if (videoInputDeviceId=== "File") {
            // fileInputRef.current!.click()
        } else {
            const p1 = videoInputDeviceSetting!.setVideoInput(videoInputDeviceId,true)
            const p2 = videoInputDeviceSetting!.setVideoInputEnable(true,true)
            Promise.all([p1, p2]).then(()=>{
                videoInputDeviceSetting!.startPreview()
            })
        }

        if (segmentationType === "None") {
            videoInputDeviceSetting!.setVirtualBackgrounEnable(false, true)
            videoInputDeviceSetting!.setVirtualBackgroundSegmentationType("None", true)
        } else {
            videoInputDeviceSetting!.setVirtualBackgrounEnable(true, true)
            videoInputDeviceSetting!.setVirtualBackgroundSegmentationType(segmentationType, true)
        }
    
        if (audioInputDeviceId === "None") {
            audioInputDeviceSetting!.setAudioInput(null)
        } else {
            audioInputDeviceSetting!.setAudioInput(audioInputDeviceId)
        }

        if (audioOutputDeviceId === "None") {
            audioOutputDeviceSetting!.setAudioOutput(null)
        } else {
            audioOutputDeviceSetting!.setAudioOutput(audioOutputDeviceId)
        }

    },[audioInputDeviceId, segmentationType, videoInputDeviceId, audioOutputDeviceId])// eslint-disable-line


    const videoPreview = useMemo(()=>{
        return (<video id="camera-preview" className={classes.cameraPreview} />)
    },[])// eslint-disable-line
    return (
        <Container maxWidth="xs" >
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <MeetingRoom />
                </Avatar>

                <Typography variant="h4">
                    Waiting Meeting
                </Typography>
                <Typography>
                    You will join room <br />
                (user:{userName}, room:{meetingName}) <br />
                Setup your devices.
                </Typography>


                <form className={classes.form} noValidate>

                    <Button
                        fullWidth
                        variant="outlined"
                        color="primary"
                        onClick={onReloadDeviceClicked}
                    >
                        reload device list
                    </Button>

                    <FormControl className={classes.formControl} >
                        <InputLabel>Camera</InputLabel>
                        <Select onChange={(e)=>{setVideoInputDeviceId(e.target.value! as string)}} defaultValue={videoInputDeviceId}>
                            <MenuItem disabled value="Video">
                                <em>Video</em>
                            </MenuItem>
                            {videoInputList?.map(dev => {
                                return <MenuItem value={dev.deviceId} key={dev.deviceId}>{dev.label}</MenuItem>
                            })}
                        </Select>
                    </FormControl>
                    <Typography>
                        Preview.(virtual bg is not applied here yet.)
                    </Typography>
                    {videoPreview}
                    

                    <FormControl className={classes.formControl} >
                        <InputLabel>VirtualBG</InputLabel>
                        <Select onChange={(e)=>{setSegmentationType(e.target.value! as VirtualBackgroundSegmentationType)}} defaultValue={segmentationType}>
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

                    <FormControl className={classes.formControl} >
                        <InputLabel>Microhpone</InputLabel>
                        <Select onChange={(e)=>{setAudioInputDeviceId(e.target.value! as string)}} defaultValue={audioInputDeviceId}>
                            <MenuItem disabled value="Video">
                                <em>Microphone</em>
                            </MenuItem>
                            {audioInputList?.map(dev => {
                                return <MenuItem value={dev.deviceId} key={dev.deviceId}>{dev.label}</MenuItem>
                            })}
                        </Select>
                    </FormControl>

                    <FormControl className={classes.formControl} >
                        <InputLabel>Speaker</InputLabel>
                        <Select onChange={(e)=>{setAudioOutputDeviceId(e.target.value! as string)}} defaultValue={audioOutputDeviceId}>
                            <MenuItem disabled value="Video">
                                <em>Speaker</em>
                            </MenuItem>
                            {audioOutputList?.map(dev => {
                                return <MenuItem value={dev.deviceId} key={dev.deviceId} >{dev.label}</MenuItem>
                            })}
                        </Select>
                    </FormControl>
                    <Grid container direction="column" alignItems="center" >

                    {
                        isLoading ?
                            <CircularProgress />
                            :
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                                onClick={onEnterClicked}
                                id="submit"
                            >
                                Enter
                            </Button>

                    }
                    </Grid>
                    <Grid container direction="column" >
                        <Grid item xs>
                        <Link onClick={(e: any) => { setStage("ENTRANCE") }}>
                                Go Back
                            </Link>
                        </Grid>
                        <Grid item xs>
                        <Link onClick={(e: any) => { handleSignOut(userId!); setStage("SIGNIN") }}>
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
    )
}
