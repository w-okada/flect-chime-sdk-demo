import { Avatar, Box, Button, CircularProgress, Container, CssBaseline, FormControl, Grid, InputLabel, Link, makeStyles, MenuItem, Select, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { MeetingRoom } from '@material-ui/icons'
import { Copyright } from "../000_common/Copyright";
import { DeviceInfo } from "../../utils";

const useStyles = makeStyles((theme) => ({
    root: {
        background: 'white',
    },
    root_amongus: {
        background: 'black'
    },
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
    margin: {
        margin: theme.spacing(1),
    },
    input: {
        color: 'black',
    },
    input_amongus: {
        color: 'blue',
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    select: {
        '&:before': {
            borderColor: "blue",
            color:"blue",
        },
        '&:after': {
            borderColor: "blue",
            color:"blue",
        }
    },
    icon: {
        fill: "blue",
    },
    label: {
        color: "blue",
        "&.Mui-focused": {
          color: "blue",
        },
    },

}));



export const WaitingRoomAmongUs = () => {
    const classes = useStyles()
    const { mode, userId, userName, meetingName, audioInputList, audioOutputList, 
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
    const defaultAudioOutputDevice = defaultDeiceId(audioOutputList)
    const [audioInputDeviceId,  setAudioInputDeviceId]  = useState(defaultAudioInputDevice)
    const [audioOutputDeviceId, setAudioOutputDeviceId] = useState(defaultAudioOutputDevice)

    const onReloadDeviceClicked = () =>{
        reloadDevices()
    }

    const onEnterClicked = () => {
        setIsLoading(true)
        enterMeeting().then(()=>{
            setIsLoading(false)
            videoInputDeviceSetting!.startLocalVideoTile()
            setStage("MEETING_ROOM")
        }).catch(e=>{
            setIsLoading(false)
            console.log(e)
        })
    }

    useEffect(() => {
        const videoEl = document.getElementById("camera-preview") as HTMLVideoElement
        videoInputDeviceSetting!.setPreviewVideoElement(videoEl)
        videoInputDeviceSetting!.setVirtualBackgroundSegmentationType("None").then(()=>{})
        videoInputDeviceSetting!.setVideoInput(null).then(()=>{
            videoInputDeviceSetting!.stopPreview()
        })
        videoInputDeviceSetting!.setVirtualForegrounEnable(false)
        videoInputDeviceSetting!.setVirtualBackgrounEnable(false)
    },[])// eslint-disable-line

    useEffect(()=>{
        if (audioInputDeviceId === "None") {
            audioInputDeviceSetting!.setAudioInput(null)
        } else {
            audioInputDeviceSetting!.setAudioInput(audioInputDeviceId)
        }
    },[audioInputDeviceId])// eslint-disable-line

    useEffect(()=>{
        if (audioOutputDeviceId === "None") {
            audioOutputDeviceSetting!.setAudioOutput(null)
        } else {
            audioOutputDeviceSetting!.setAudioOutput(audioOutputDeviceId)
        }
    },[audioOutputDeviceId]) // eslint-disable-line

    return (
        <Container maxWidth="xs" className={mode === "amongus" ? classes.root_amongus : classes.root}>
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <MeetingRoom />
                </Avatar>

                <Typography variant="h4" color={mode === "amongus" ? "secondary":"primary"} >
                    Waiting Meeting
                </Typography>
                <Typography color={mode === "amongus" ? "secondary":"primary"} >
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
                        <InputLabel className={classes.label}>Microhpone</InputLabel>
                        <Select onChange={(e)=>{setAudioInputDeviceId(e.target.value! as string)}} 
                                defaultValue={audioInputDeviceId} 
                                className={classes.select}
                                inputProps={{
                                    classes: {
                                        icon: classes.icon,
                                    },
                                    className: classes.input_amongus
                                }}                                
                                >
                            <MenuItem disabled value="Video">
                                <em>Microphone</em>
                            </MenuItem>
                            {audioInputList?.map(dev => {
                                return <MenuItem value={dev.deviceId} key={dev.deviceId}>{dev.label}</MenuItem>
                            })}
                        </Select>
                    </FormControl>

                    <FormControl className={classes.formControl} >
                        <InputLabel className={classes.label}>Speaker</InputLabel>
                        <Select onChange={(e)=>{setAudioOutputDeviceId(e.target.value! as string)}}
                                defaultValue={audioOutputDeviceId}
                                className={classes.select}
                                inputProps={{
                                    classes: {
                                        icon: classes.icon,
                                    },
                                    className: classes.input_amongus
                                }}                                
                                >
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
