import React, { useEffect } from "react"
import { Container, Avatar, Typography, Button, Grid, Link, Box, CssBaseline, CircularProgress } from '@material-ui/core'
import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core'
import { MeetingRoom } from '@material-ui/icons'
import { Copyright } from "../components/Copyright"
import { makeStyles } from '@material-ui/core/styles';
import routes from "../constants/routes"
import { useHistory } from "react-router-dom"
import { useSignInState } from "../providers/SignInStateProvider"
import { useAppState } from "../providers/AppStateProvider";
import { useMeetingState } from "../providers/MeetingStateProvider";
import { useDeviceState } from "../providers/DeviceStateProvider";

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
    const { userId } = useAppState()
    const { audioInputList, videoInputList, audioOutputList, reloadDeivces } = useDeviceState()
    const { meetingName, userName, isLoading, leaveMeeting, enterMeetingRoom } = useMeetingState()
    const { audioInputDeviceSetting, videoInputDeviceSetting, audioOutputDeviceSetting } = useMeetingState()
    const { handleSignOut } = useSignInState()
    const classes = useStyles()
    const history = useHistory()

    const onReloadDeviceClicked = () =>{
        reloadDeivces()
    }

    const onEnterClicked = () => {
        enterMeetingRoom().then(()=>{
            history.push(routes.MEETING_ROOM)
        }).catch(e=>{
            console.log(e)
        })
    }

    const onGoBackClicked = () => {
        leaveMeeting()
        history.push(routes.ENTRANCE)
    }
    const onSignOutClicked = () => {
        leaveMeeting()
        handleSignOut(userId).then(()=>{
            history.push(routes.HOME)
        }).catch(e=>{
            history.push(routes.HOME)
        })
    }

    const onInputVideoChange = async (e: any) => {
        if (e.target.value === "None") {
            await videoInputDeviceSetting!.setVideoInput(null,true)
            await videoInputDeviceSetting!.setVideoInputEnable(false,true)
            videoInputDeviceSetting!.stopPreview()
        } else if (e.target.value === "File") {
            // fileInputRef.current!.click()
        } else {
            await videoInputDeviceSetting!.setVideoInput(e.target.value,true)
            await videoInputDeviceSetting!.setVideoInputEnable(true,true)
            videoInputDeviceSetting!.startPreview()
        }
    }
    const onVirtualBGChange = async (e: any) => {
        if (e.target.value === "None") {
            videoInputDeviceSetting!.setVirtualBackgrounEnable(false,true)
            videoInputDeviceSetting!.setVirtualBackgroundSegmentationType("None",true)
        } else {
            videoInputDeviceSetting!.setVirtualBackgrounEnable(true,true)
            videoInputDeviceSetting!.setVirtualBackgroundSegmentationType(e.target.value,true)
        }
    }

    const onInputAudioChange = async (e: any) => {
        if (e.target.value === "None") {
            audioInputDeviceSetting!.setAudioInput(null)
        } else {
            audioInputDeviceSetting!.setAudioInput(e.target.value)
        }
    }
    const onOutputAudioChange = async (e: any) => {
        if (e.target.value === "None") {
            audioOutputDeviceSetting!.setAudioOutput(null)
        } else {
            audioOutputDeviceSetting!.setAudioOutput(e.target.value)
        }
    }

    useEffect(() => {
        const videoEl = document.getElementById("camera-preview") as HTMLVideoElement
        videoInputDeviceSetting!.setPreviewVideoElement(videoEl)
        // videoInputDeviceSetting!.startPreview()
        // return ()=>{videoInputDeviceSetting!.stopPreview()}
    })

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
                        {/* <Select onChange={onInputVideoChange} value={videoInputList!.length>0?videoInputList![0].deviceId:"None"}> */}
                        <Select onChange={onInputVideoChange} defaultValue={"None"}>
                            <MenuItem disabled value="Video">
                                <em>Video</em>
                            </MenuItem>
                            <MenuItem value="None">
                                <em>None</em>
                            </MenuItem>
                            {videoInputList?.map(dev => {
                                return <MenuItem value={dev.deviceId} key={dev.deviceId}>{dev.label}</MenuItem>
                            })}
                        </Select>
                    </FormControl>
                    <Typography>
                        Preview.(virtual bg is not applied here yet.)
                    </Typography>
                    <video id="camera-preview" className={classes.cameraPreview} />

                    <FormControl className={classes.formControl} >
                        <InputLabel>VirtualBG</InputLabel>
                        <Select onChange={onVirtualBGChange} defaultValue="None">
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
                        </Select>
                    </FormControl>

                    <FormControl className={classes.formControl} >
                        <InputLabel>Microhpone</InputLabel>
                        <Select onChange={onInputAudioChange} defaultValue={"None"}>
                            <MenuItem disabled value="Video">
                                <em>Microphone</em>
                            </MenuItem>
                            <MenuItem value="None">
                                <em>None</em>
                            </MenuItem>
                            {audioInputList?.map(dev => {
                                return <MenuItem value={dev.deviceId} key={dev.deviceId}>{dev.label}</MenuItem>
                            })}
                        </Select>
                    </FormControl>

                    <FormControl className={classes.formControl} >
                        <InputLabel>Speaker</InputLabel>
                        <Select onChange={onOutputAudioChange} defaultValue={"None"} >
                            <MenuItem disabled value="Video">
                                <em>Speaker</em>
                            </MenuItem>
                            <MenuItem value="None">
                                <em>None</em>
                            </MenuItem>
                            {audioOutputList?.map(dev => {
                                return <MenuItem value={dev.deviceId} key={dev.deviceId} >{dev.label}</MenuItem>
                            })}
                        </Select>
                    </FormControl>

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
                            >
                                Enter
                            </Button>

                    }
                    <Grid container direction="column" >
                        <Grid item xs>
                            <Link onClick={onGoBackClicked}>
                                Go Back
                            </Link>
                        </Grid>
                        <Grid item xs>
                            <Link onClick={onSignOutClicked}>
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
