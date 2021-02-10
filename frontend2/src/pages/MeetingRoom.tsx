import React, { createRef, useEffect } from "react"
import clsx from 'clsx';
import { Typography, Button, CssBaseline, AppBar, Drawer, Toolbar, IconButton, Dialog, DialogTitle, DialogContent, FormControl, InputLabel, Select, MenuItem, DialogActions, Tooltip, Icon } from '@material-ui/core'
import {  ChevronLeft, ChevronRight, Settings, ExitToApp, Videocam, VideocamOff, 
    Mic, MicOff, VolumeOff, VolumeUp, ScreenShare, StopScreenShare, ViewComfy, ViewCompact,
    FiberManualRecord, Album} from '@material-ui/icons'
import { createMuiTheme, makeStyles, ThemeProvider} from '@material-ui/core/styles';
import routes from "../constants/routes"
import { useHistory } from "react-router-dom"
import { useMeetingState } from "../providers/MeetingStateProvider";
import { AttendeesTable } from "../components/AttendeesTable";


import { CustomAccordion } from "../components/CustomAccordion";
import { VideoTilesView } from "../components/VideoTileView";
import { useDeviceState } from "../providers/DeviceStateProvider";
import { ChatArea } from "../components/ChatArea";
import { useEnvironmentState } from "../providers/EvironmentStateProvider";
import { useState } from "react";
import { VideoGridView } from "../components/VideoGridView";
import { useWebSocketWhiteboardState } from "../providers/websocket/WebScoketWhiteboardProvider";
import { useWebSocketState } from "../providers/websocket/WebScoketProvider";
import { WhiteboardPanel } from "../components/WhiteboardPanel";
import { VideoRecorderView } from "../components/VideoRecorderView";

const toolbarHeight = 20
const drawerWidth = 240;
const accordionSummaryHeight = 20
const bufferHeight = 20
const theme = createMuiTheme({
    mixins: {
        toolbar: {
            minHeight: toolbarHeight,
        }
    },
});

type ViewMode = "FeatureView" | "GridView" | "RecorderView"


const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        width:'100%',
        height:'100%',
        overflowX:'hidden',
        overflowY:'hidden',
    },

    ////////////////
    // ToolBar
    ////////////////
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        height: toolbarHeight
    },
    toolbar: {
        height: toolbarHeight
    },
    menuSpacer: {
        width: toolbarHeight, height: toolbarHeight,
    },

    menuButton: {
        width: toolbarHeight, height: toolbarHeight,
    },

    menuButtonActive: {
        width: toolbarHeight, height: toolbarHeight,
        color: "#ee7777"
    },


    title: {
        flexGrow: 1,
    },
    appBarSpacer: {
        height: toolbarHeight
    },

    ////////////////
    // SideBar
    ////////////////
    drawerPaper: {
        // marginLeft: drawerWidth,
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        // width: theme.spacing(3),
        [theme.breakpoints.up('xs')]: {
            // width: theme.spacing(0),
            width: 0,
        },
    },
    toolbarIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },



    ////////////////
    // Main
    ////////////////
    content: {
        flexGrow: 1,
        // width: `calc(100%-drawerWidth)`,
        // height: "100%",
        // height: `calc(100%-toolbarHeight)`,
        // width: 'auto',
        // height: 'auto',
        // overflow:'auto',
        overflow:'hidden',

    },

    ////////////////////
    // dialog
    ////////////////////
    form: {
        width: '100%',
        marginTop: theme.spacing(1),
    },
    formControl: {
        margin: theme.spacing(1),
        width: '100%'
        // minWidth: 120,
    },    
}));


export const MeetingRoom = () => {
    const { screenHeight, screenWidth } = useEnvironmentState()
    const { audioInputList, videoInputList, audioOutputList } = useDeviceState()    
    const { meetingName, meetingSession, attendees, videoTileStates, leaveMeeting, shareScreen, stopShareScreen, isScreenSharing } = useMeetingState()
    const { audioInputDeviceSetting, videoInputDeviceSetting, audioOutputDeviceSetting, recorder } = useMeetingState()
    const { initWebSocketManager } = useWebSocketState()

    const [guiCounter, setGuiCounter] = useState(0)

    const classes = useStyles()
    const history = useHistory()
    
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [settingDialogOpen, setSettingDialogOpen] = useState(false);
    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
    const [viewMode, setViewMode] = useState("FeatureView" as ViewMode)
    const [recorderCanvasElement, setRecorderCanvasElement] = useState(null as HTMLCanvasElement|null)

    const bgFileInputRef = createRef<HTMLInputElement>()

    const toggleDrawerOpen = () => {
        setDrawerOpen(!drawerOpen);
    };
    const toggleAudioInputEnable = async() =>{
        await audioInputDeviceSetting!.setAudioInputEnable(!audioInputDeviceSetting!.audioInputEnable)
        setGuiCounter(guiCounter+1)
    }
    const toggleVideoInputEnable = async() =>{
        await videoInputDeviceSetting!.setVideoInputEnable(!videoInputDeviceSetting!.videoInputEnable)
        setGuiCounter(guiCounter+1)
    }
    const toggleAudioOutputEnable = async() =>{
        await audioOutputDeviceSetting!.setAudioOutputEnable(!audioOutputDeviceSetting!.audioOutputEnable)
        setGuiCounter(guiCounter+1)
    }


    const onInputVideoChange = async (e: any) => {
        if (e.target.value === "None") {
            videoInputDeviceSetting!.setVideoInput(null)
            setGuiCounter(guiCounter+1)
        } else if (e.target.value === "File") {
            // fileInputRef.current!.click()
        } else {
            videoInputDeviceSetting!.setVideoInput(e.target.value)
            setGuiCounter(guiCounter+1)
        }
    }
    const onVirtualBGChange = async (e: any) => {
        if (e.target.value === "None") {
            videoInputDeviceSetting!.setVirtualBackgrounEnable(false)
            videoInputDeviceSetting!.setVirtualBackgroundSegmentationType("None")
            setGuiCounter(guiCounter+1)
        } else {
            videoInputDeviceSetting!.setVirtualBackgrounEnable(true)
            videoInputDeviceSetting!.setVirtualBackgroundSegmentationType(e.target.value)
            setGuiCounter(guiCounter+1)
        }
    }
    const setBackgroundImage = (path:string, fileType:string) =>{
        if(fileType.startsWith("image")){
            videoInputDeviceSetting!.setBackgroundImagePath(path)
        }else{
            console.log("not supported filetype", fileType)
        }
    }    

    const onInputAudioChange = async (e: any) => {
        if (e.target.value === "None") {
            await audioInputDeviceSetting!.setAudioInput(null)
            setGuiCounter(guiCounter+1)
        } else {
            await audioInputDeviceSetting!.setAudioInput(e.target.value)
            setGuiCounter(guiCounter+1)
        }
    }
    const onSuppressionChange = async (e:any) =>{
        if (e.target.value === "None") {
            await audioInputDeviceSetting!.setAudioSuppressionEnable(false)
            setGuiCounter(guiCounter+1)
        } else {
            await audioInputDeviceSetting!.setAudioSuppressionEnable(true)
            await audioInputDeviceSetting!.setVoiceFocusSpec({variant:e.target.value})
            setGuiCounter(guiCounter+1)
        }
    }

    const onOutputAudioChange = async (e: any) => {
        if (e.target.value === "None") {
            await audioOutputDeviceSetting!.setAudioOutput(null)
            setGuiCounter(guiCounter+1)
        } else {
            await audioOutputDeviceSetting!.setAudioOutput(e.target.value)
            setGuiCounter(guiCounter+1)
        }
    }

    const handleOnClickScreenShare = async()=>{
        shareScreen()
    }
    const handleOnClickStopScreenShare = async() =>{
        stopShareScreen()
    }

    const handleOnClickStartRecording = async() =>{
        const audioElem = document.getElementById("for-speaker") as HTMLAudioElement
        const stream =  new MediaStream();

        // @ts-ignore
        const audioStream = audioElem.captureStream() as MediaStream
        // @ts-ignore
        const videoStream = recorderCanvasElement?.captureStream() as MediaStream

        [audioStream, videoStream].forEach(s=>{
            s?.getTracks().forEach(t=>{
                console.log("added tracks:", t)
                stream.addTrack(t)
            })
        });

        // @ts-ignore
        // const audioStream = audioElem.captureStream()
        recorder?.startRecording(stream)
        // recorder?.startRecording(audioStream)
        // recorder?.startRecording(videoStream)
        
    }
    const handleOnClickStopRecording = async() =>{
        recorder?.stopRecording()
        recorder?.toMp4()
    }

    useEffect(()=>{
        const audioElement = document.getElementById("for-speaker")! as HTMLAudioElement
        audioElement.autoplay=false
        audioOutputDeviceSetting!.setOutputAudioElement(audioElement)

    },[])

    useEffect(()=>{
        console.log("[MeetingRoom] generateWebSocketManager")
        initWebSocketManager()
    },[])


    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div className={classes.root}>


                <AppBar position="absolute" className={clsx(classes.appBar)}>
                    <Toolbar className={classes.toolbar}>
                        {
                            drawerOpen ?
                                <Tooltip title="Drawer Close">
                                    <Button color="inherit" className={clsx(classes.menuButton)} startIcon={<ChevronLeft />} onClick={toggleDrawerOpen}>
                                        menu
                                    </Button>
                                </Tooltip>
                                :
                                <Tooltip title="Drawer Open">
                                    <Button color="inherit" className={clsx(classes.menuButton)} endIcon={<ChevronRight />} onClick={toggleDrawerOpen}>
                                        menu
                                    </Button>
                                </Tooltip>
                        }
                        <Typography color="inherit" noWrap className={classes.title}>
                            {meetingName}
                        </Typography>

                        {audioInputDeviceSetting!.audioInputEnable?
                            <Tooltip title="Mic Off">
                                <IconButton color="inherit" className={clsx(classes.menuButton)} onClick={toggleAudioInputEnable}>
                                    <Mic />
                                </IconButton>
                            </Tooltip>
                            :
                            <Tooltip title="Mic On">
                                <IconButton color="inherit" className={clsx(classes.menuButton)} onClick={toggleAudioInputEnable}>
                                    <MicOff />
                                </IconButton>
                            </Tooltip>
                        }
                        {videoInputDeviceSetting!.videoInputEnable?
                            <Tooltip title="Video Off">
                                <IconButton color="inherit" className={clsx(classes.menuButton)} onClick={toggleVideoInputEnable}>
                                    <Videocam />
                                </IconButton>
                            </Tooltip>
                            :
                            <Tooltip title="Video On">
                                <IconButton color="inherit" className={clsx(classes.menuButton)} onClick={toggleVideoInputEnable}>
                                    <VideocamOff />
                                </IconButton>
                            </Tooltip>
                        }
                        {audioOutputDeviceSetting!.audioOutputEnable?
                            <Tooltip title="Speaker Off">
                                <IconButton color="inherit" className={clsx(classes.menuButton)} onClick={toggleAudioOutputEnable}>
                                    <VolumeUp />
                                </IconButton>
                            </Tooltip>
                            :
                            <Tooltip title="Speaker On">
                                <IconButton color="inherit" className={clsx(classes.menuButton)} onClick={toggleAudioOutputEnable}>
                                    <VolumeOff />
                                </IconButton>
                            </Tooltip>
                        }
                        <Tooltip title="Setting">
                            <IconButton color="inherit" className={clsx(classes.menuButton)} onClick={(e)=>{setSettingDialogOpen(true)}}>
                                <Settings />
                            </IconButton>
                        </Tooltip>
                        <span className={clsx(classes.menuSpacer)}>  </span>
                        <span className={clsx(classes.menuSpacer)}>  </span>
                        {isScreenSharing?
                            <Tooltip title="Stop Share Screen">
                                <IconButton color="inherit" className={clsx(classes.menuButton)} onClick={(e)=>{handleOnClickStopScreenShare()}}>
                                    <StopScreenShare />
                                </IconButton>
                            </Tooltip>
                        :
                            <Tooltip title="Share Screen">
                                <IconButton color="inherit" className={clsx(classes.menuButton)} onClick={(e)=>{handleOnClickScreenShare()}}>
                                    <ScreenShare />
                                </IconButton>
                            </Tooltip>
                        }

                        <Tooltip title={recorder?.isRecording?"stop recording":"start recording"}>
                            <IconButton color="inherit" className={recorder?.isRecording ? classes.menuButtonActive : classes.menuButton} 
                                onClick={(e)=>{
                                    recorder?.isRecording? handleOnClickStopRecording(): handleOnClickStartRecording()
                                }}>
                                <FiberManualRecord />
                            </IconButton>
                        </Tooltip>
                        
                        <span className={clsx(classes.menuSpacer)}>  </span>
                        <span className={clsx(classes.menuSpacer)}>  </span>

                        <Tooltip title="Feature View">
                            <IconButton color="inherit" className={viewMode === "FeatureView" ? classes.menuButtonActive : classes.menuButton} onClick={(e)=>{setViewMode("FeatureView")}}>
                                <ViewCompact/>  
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Feature View">
                            <IconButton color="inherit" className={viewMode === "GridView" ? classes.menuButtonActive : classes.menuButton} onClick={(e)=>{setViewMode("GridView")}}>
                                <ViewComfy/>  
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="RecorderView">
                            <IconButton color="inherit" className={viewMode === "RecorderView" ? classes.menuButtonActive : classes.menuButton} onClick={(e)=>{setViewMode("RecorderView")}}>
                                <Album />
                            </IconButton>
                        </Tooltip>
                        <span className={clsx(classes.menuSpacer)}>  </span>
                        <span className={clsx(classes.menuSpacer)}>  </span>


                        <Tooltip title="Leave Meeting">
                            <IconButton color="inherit" className={clsx(classes.menuButton)} onClick={(e)=>{setLeaveDialogOpen(true)}}>
                                <ExitToApp />
                            </IconButton>
                        </Tooltip>
                    </Toolbar>
                </AppBar>



                <Dialog disableBackdropClick disableEscapeKeyDown open={settingDialogOpen} onClose={(e)=>{setSettingDialogOpen(false)}} >
                    <DialogTitle>Setting</DialogTitle>
                    <DialogContent>
                        <form className={classes.form} noValidate>
                            <FormControl className={classes.formControl} >
                                <InputLabel>Camera</InputLabel>
                                <Select onChange={onInputVideoChange} value={videoInputDeviceSetting!.videoInput}>
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
                            <div style={{display:"flex"}}>
                                <FormControl className={classes.formControl} >
                                    <InputLabel>VirtualBG</InputLabel>
                                    <Select onChange={onVirtualBGChange} value={videoInputDeviceSetting!.virtualBackgroundSegmentationType} >
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

                                <Button variant="outlined" color="primary" onClick={()=>{bgFileInputRef.current!.click()}}>
                                    choose image file
                                </Button>
                            </div>

                            <FormControl className={classes.formControl} >
                                <InputLabel>Microhpone</InputLabel>
                                <Select onChange={onInputAudioChange} value={audioInputDeviceSetting!.audioInput} >
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
                                <InputLabel>Noise Suppression</InputLabel>
                                <Select onChange={onSuppressionChange} value={audioInputDeviceSetting!.audioSuppressionEnable ? audioInputDeviceSetting!.voiceFocusSpec?.variant: "None" } >
                                    <MenuItem disabled value="Video">
                                        <em>Microphone</em>
                                    </MenuItem>
                                    {["None", "auto", "c100", "c50", "c20", "c10"].map(val => {
                                        return <MenuItem value={val} key={val}>{val}</MenuItem>
                                    })}
                                </Select>
                            </FormControl>


                            <FormControl className={classes.formControl} >
                                <InputLabel>Speaker</InputLabel>
                                <Select onChange={onOutputAudioChange} value={audioOutputDeviceSetting!.audioOutput} >
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
                        </form>                    
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={(e)=>{setSettingDialogOpen(false)}} color="primary">
                            Ok
                        </Button>
                    </DialogActions>
                </Dialog>


                <Dialog disableBackdropClick disableEscapeKeyDown open={leaveDialogOpen} onClose={(e)=>{setLeaveDialogOpen(false)}} >
                    <DialogTitle>Leave meeting</DialogTitle>
                    <DialogContent>
                        You are leaving meeting.
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={(e)=>{setLeaveDialogOpen(false);leaveMeeting();history.push(routes.HOME)}} color="primary">
                            Ok
                        </Button>
                        <Button onClick={(e)=>{setLeaveDialogOpen(false)}} color="secondary">
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>

                <div style={{marginTop:toolbarHeight, position:"absolute", display:"flex"}}>
                    <Drawer
                        variant="permanent"
                        classes={{
                            paper: clsx(classes.drawerPaper, !drawerOpen && classes.drawerPaperClose),
                        }}
                        open={drawerOpen}
                    >
                        <CustomAccordion title="Member">
                            <div style={{ height: 200, width: '100%' }}>
                                <AttendeesTable attendees={attendees}/>
                            </div>
                        </CustomAccordion>

                        <CustomAccordion title="Chat">
                            <div style={{ height: 400, width: '100%'}}>
                                <ChatArea/>
                            </div>
                        </CustomAccordion>

                        <CustomAccordion title="Whiteboard">
                            <div style={{ height: 400, width: '100%'}}>
                                <WhiteboardPanel/>
                            </div>
                        </CustomAccordion>
                    </Drawer>

                {/* <main className={classes.content} style={{height:`${screenHeight}px`}}> */}
                <main style={{height:`${screenHeight-toolbarHeight-bufferHeight}px`}}>
                    {
                        (()=>{
                            switch(viewMode){
                                case "FeatureView":
                                    return <VideoTilesView attendees={attendees} videoTileStates={videoTileStates}
                                                height={screenHeight-toolbarHeight-bufferHeight} width={drawerOpen?screenWidth-drawerWidth:screenWidth}/>
                                case "GridView":
                                    return <VideoGridView attendees={attendees} videoTileStates={videoTileStates} onlyCameraView={false}
                                                height={screenHeight-toolbarHeight-bufferHeight} width={drawerOpen?screenWidth-drawerWidth:screenWidth} />
                                case "RecorderView":
                                    return <VideoRecorderView attendees={attendees} videoTileStates={videoTileStates} onlyCameraView={false}
                                    height={screenHeight-toolbarHeight-bufferHeight} width={drawerOpen?screenWidth-drawerWidth:screenWidth} focusTarget="SharedContent"
                                    setRecorderCanvasElement={setRecorderCanvasElement} />
                            }
                        })()
                    }
                </main>
                </div>
            </div>

            {/* ************************************** */}
            {/* *****   Hidden Elements          ***** */}
            {/* ************************************** */}
            <div>
                <audio id="for-speaker" style={{display:"none"}}/>
                <input type="file" hidden ref={bgFileInputRef} onChange={(e: any) => {
                    const path = URL.createObjectURL(e.target.files[0]);
                    const fileType = e.target.files[0].type
                    setBackgroundImage(path, fileType)
                }} />
            </div>

        </ThemeProvider>
    )
}
