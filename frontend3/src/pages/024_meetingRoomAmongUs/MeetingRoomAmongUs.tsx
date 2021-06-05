import React, { useEffect, useMemo, useState } from "react"
import clsx from 'clsx';
import { CssBaseline, AppBar, Drawer, Toolbar, Tooltip, Button, Typography, IconButton, Grid, Divider, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core'
import { createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import { useAppState } from "../../providers/AppStateProvider";
import EmojiPeopleIcon from '@material-ui/icons/EmojiPeople';
import { blue, blueGrey, deepOrange, deepPurple, red } from '@material-ui/core/colors';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import CameraRollIcon from '@material-ui/icons/CameraRoll';
import SportsEsportsIcon from '@material-ui/icons/SportsEsports';
import { useStyles } from "./css";
import { ICONS_ALIVE, ICONS_DEAD, REGIONS, STATES } from "../../providers/hooks/RealtimeSubscribers/useAmongUs";
import MicIcon from '@material-ui/icons/Mic';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import ViewComfyIcon from '@material-ui/icons/ViewComfy';
import SettingsIcon from '@material-ui/icons/Settings';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { VideoInputDeviceSetting } from "../../providers/helper/VideoInputDeviceSetting";

type ChimeState = {
    arenaMicrophone:boolean
    arenaSpeaker:boolean
    arenaShareScreen:boolean
    arenaViewScreen:boolean
    fieldMicrophone:boolean
    fieldSpeaker:boolean
}

const ChimeState_Arena:ChimeState = {
    arenaMicrophone:true,
    arenaSpeaker:true,
    arenaShareScreen:false,
    arenaViewScreen:true,
    fieldMicrophone:false,
    fieldSpeaker:false,
}

const ChimeState_Lobby:ChimeState = {
    arenaMicrophone:true,
    arenaSpeaker:true,
    arenaShareScreen:true,
    arenaViewScreen:true,
    fieldMicrophone:false,
    fieldSpeaker:false,
}

const ChimeState_Task:ChimeState = {
    arenaMicrophone:false,
    arenaSpeaker:false,
    arenaShareScreen:true,
    arenaViewScreen:false,
    fieldMicrophone:false,
    fieldSpeaker:false,
}

const ChimeState_Discuss:ChimeState = {
    arenaMicrophone:true,
    arenaSpeaker:false,
    arenaShareScreen:true,
    arenaViewScreen:false,
    fieldMicrophone:true,
    fieldSpeaker:true,
}

const ChimeState_Dead:ChimeState = {
    arenaMicrophone:true,
    arenaSpeaker:true,
    arenaShareScreen:true,
    arenaViewScreen:true,
    fieldMicrophone:false,
    fieldSpeaker:false,
}

const ChimeStateType = {
    "Arena"   : ChimeState_Arena,
    "Lobby"   : ChimeState_Lobby,
    "Task"    : ChimeState_Task,
    "Discuss" : ChimeState_Discuss,
    "Dead"    : ChimeState_Dead
}


export const MeetingRoomAmongUs = () => {
    const classes = useStyles();
    const {meetingSession, attendeeId, videoTileStates, attendees, videoInputDeviceSetting, audioInputDeviceSetting, audioOutputDeviceSetting, updateMeetingInfo, ownerId, isOwner, publicIp,
        startHMM, sendTerminate, sendStartRecord, sendStopRecord, sendStartShareTileView, sendStopShareTileView, hMMStatus, stateLastUpdate,
        currentGameState, sendRegisterAmongUsUserName
    } = useAppState()

    const [chimeState, setChimeState] = useState<ChimeState>(ChimeStateType.Arena)

    const [userName, _setUserName] = useState<string>()
    const [ captureStream, setCaptureStream ] = useState<MediaStream>()

    const setUserName = (newUserName:string) =>{
        _setUserName(newUserName)
    }


    const targetTilesId = Object.keys(videoTileStates).reduce<string>((sum,cur)=>{return `${sum}-${cur}`},"")


    useEffect(()=>{
        // if(!currentGameState.hmmAttendeeId){
        //     return
        // }
        meetingSession?.audioVideo.getAllRemoteVideoTiles().forEach((x, index)=>{
            if(x.state().boundAttendeeId === currentGameState.hmmAttendeeId){
                const tileviewComp = document.getElementById("tileView") as HTMLVideoElement
                x.bindVideoElement(tileviewComp)
                tileviewComp.play()
                console.log("video stream:", tileviewComp.videoWidth, tileviewComp.videoHeight)
            }
            const userViewComp = document.getElementById(`userView${index}`) as HTMLVideoElement
            x.bindVideoElement(userViewComp)
            console.log("video stream:", userViewComp.videoWidth, userViewComp.videoHeight)
            userViewComp.play()
        })
    
    },[targetTilesId, currentGameState.hmmAttendeeId])

    //// UserName Change
    useEffect(()=>{
        if(!userName){
            return
        }
        sendRegisterAmongUsUserName(userName, attendeeId!)
    },[userName])

    //// Chime State change
    useEffect(()=>{
        const player = currentGameState.players.find(x=>{return x.attendeeId === attendeeId})
        if(!player){
            // in arena
            setChimeState(ChimeStateType.Arena)
            return
        }
        if(currentGameState.state === 0){
            // in lobby(0)
            setChimeState(ChimeStateType.Lobby)
            return
        }
        if(currentGameState.state === 1){
            // in task
            if(player.isDead || player.disconnected){
                // dead man
                setChimeState(ChimeStateType.Dead)
                return
            }else{
                // task
                setChimeState(ChimeStateType.Task)
                return
            }
        }
        if(currentGameState.state === 2){
            //in discussing
            if(player.isDead || player.disconnected){
                // dead man
                setChimeState(ChimeStateType.Dead)
                return
            }else{
                // discuss
                setChimeState(ChimeStateType.Discuss)
                return
            }
        }
    },[currentGameState])

    //// UserName re-register
    useEffect(()=>{
        const player = currentGameState.players.find(x=>{return x.name === userName})
        if(!player){
            // no register target name
            return
        }
        if(player.attendeeId){
            if(player.attendeeId === attendeeId){
                // already registerd
                return
            }else{
                // register other person at the same name. clear my name.
                setUserName("__None__")
                return
            }
        }
        if(!player.attendeeId && userName){
            // not registerd yet and userName is choosen. register 
            sendRegisterAmongUsUserName(userName, attendeeId!)
        }
    },[currentGameState])


    //// Capture
    useEffect(()=>{
        const videoEl  = document.getElementById("capture") as HTMLVideoElement
        videoEl.addEventListener("click", (event)=>{

            meetingSession?.audioVideo.chooseVideoInputQuality(640,480,3,2000)
            let displayMediaOptions = {
                video: {
                  cursor: "never",
                  frameRate: 15,
                },
                audio: false
            };
            
            // @ts-ignore
            navigator.mediaDevices.getDisplayMedia(displayMediaOptions).then(stream=>{
                if(captureStream){
                    captureStream.getTracks().forEach(x=>{
                        x.stop()
                    })
                }
                setCaptureStream(stream)
                videoEl.srcObject = stream
                videoEl.play().then(()=>{
                    // @ts-ignore
                    const stream2 = videoEl.captureStream()
                    videoInputDeviceSetting?.setVideoInput(stream2).then(()=>{
                        videoInputDeviceSetting.startLocalVideoTile()
                    })
                })
            })
        })
    },[])


    //////////////////////////
    /// (1) hmm state
    //////////////////////////
    /// (1-1) owner
    const ownerStateComp = useMemo(()=>{
        return (
            isOwner?
            <>
                <Tooltip title={"Your are owner"}>
                    <EmojiPeopleIcon className={classes.activeState_hmm}  fontSize="large"/>
                </Tooltip>
            </>
            :
            <>
                <Tooltip title={"Your are not owner"}>
                    <EmojiPeopleIcon className={classes.inactiveState}  fontSize="large"/>
                </Tooltip>
            </>
        )
    },[isOwner])
    /// (1-2) hmm active
    const managerStateComp = useMemo(()=>{
        return (
            hMMStatus.active?
            <>
                <Tooltip title={"hmm active"}>
                    <IconButton classes={{root:classes.menuButton}} onClick={()=>{sendTerminate()}}>                    
                        <SportsEsportsIcon className={classes.activeState_hmm} fontSize="large"/>
                    </IconButton>                    
                </Tooltip>
            </>
            :
            <>
                <Tooltip title={"hmm not active"}>
                    <IconButton classes={{root:classes.menuButton}} onClick={()=>{startHMM()}}>                    
                        <SportsEsportsIcon className={classes.inactiveState} fontSize="large"/>
                    </IconButton>
                </Tooltip>
            </>
        )
    },[hMMStatus.active])
    /// (1-3) hmm recording
    const recordingStateComp = useMemo(()=>{
        return (
            hMMStatus.recording?
            <>
                <Tooltip title={"recording"}>
                    <IconButton classes={{root:classes.menuButton}} onClick={()=>{sendStopRecord()}}>
                        <CameraRollIcon className={classes.activeState_hmm} fontSize="large"/>
                    </IconButton>                    
                </Tooltip>
            </>
            :
            <>
                <Tooltip title={"not recording"}>
                    <IconButton classes={{root:classes.menuButton}} onClick={()=>{sendStartRecord()}}>
                        <CameraRollIcon className={classes.inactiveState} fontSize="large"/>
                    </IconButton>                    
                </Tooltip>
            </>
        )
    },[hMMStatus.recording])
    /// (1-4) share multi tile
    const shareTileViewStateComp = useMemo(()=>{
        return (
            hMMStatus.shareTileView?
            <>
                <Tooltip title={"share tile view"}>
                    <IconButton classes={{root:classes.menuButton}}  onClick={()=>{sendStopShareTileView()}}>                    
                        <ScreenShareIcon className={classes.activeState_hmm}  fontSize="large"/>
                    </IconButton>                    
                </Tooltip>
            </>
            :
            <>
                <Tooltip title={"not share share tile view"}>
                    <IconButton classes={{root:classes.menuButton}} onClick={()=>{sendStartShareTileView()}}>                    
                        <ScreenShareIcon className={classes.inactiveState} fontSize="large"/>
                    </IconButton>                    
                </Tooltip>
            </>
        )
    },[hMMStatus.shareTileView])

    //// (1-x) lastupdate
    const stateLastUpdateTime = useMemo(()=>{
        const datetime = new Date(stateLastUpdate);
        const d = datetime.toLocaleDateString()
        const t = datetime.toLocaleTimeString()
        // return `${d} ${t}`
        return `${t}`
    },[stateLastUpdate])


    //////////////////////////
    /// (2) chime state
    //////////////////////////
    /// (2-1) arena mic state
    const arenaMicrophoneComp = useMemo(()=>{
        return (
            chimeState.arenaMicrophone?
            <>
                <Tooltip title={"Mic On"}>
                    <MicIcon className={classes.activeState_arena}  fontSize="large"/>
                </Tooltip>
            </>
            :
            <>
                <Tooltip title={"Mic Off"}>
                    <MicIcon className={classes.inactiveState} fontSize="large"/>
                </Tooltip>
            </>
        )
    },[chimeState.arenaMicrophone])

    /// (2-2) arena speaker state
    const arenaSpeakerComp = useMemo(()=>{
        return (
            chimeState.arenaSpeaker?
            <>
                <Tooltip title={"Snd On"}>
                    <VolumeUpIcon className={classes.activeState_arena} fontSize="large"/>
                </Tooltip>
            </>
            :
            <>
                <Tooltip title={"Snd Off"}>
                    <VolumeUpIcon className={classes.inactiveState} fontSize="large"/>
                </Tooltip>
            </>
        )
    },[chimeState.arenaSpeaker])
    /// (2-3) arena share screen state
    const arenaShareScreenComp = useMemo(()=>{
        return (
            chimeState.arenaShareScreen?
            <>
                <Tooltip title={"ScreenShare On"}>
                    <ScreenShareIcon className={classes.activeState_arena} fontSize="large"/>
                </Tooltip>
            </>
            :
            <>
                <Tooltip title={"ScreenShare Off"}>
                    <ScreenShareIcon className={classes.inactiveState} fontSize="large"/>
                </Tooltip>
            </>
        )
    },[chimeState.arenaShareScreen])     
    /// (2-4) arena view screen  state
    const arenaViewScreenComp = useMemo(()=>{
        return (
            chimeState.arenaViewScreen?
            <>
                <Tooltip title={"ScreenShare On"}>
                    <ViewComfyIcon className={classes.activeState_arena} fontSize="large"/>
                </Tooltip>
            </>
            :
            <>
                <Tooltip title={"ScreenShare Off"}>
                    <ViewComfyIcon className={classes.inactiveState} fontSize="large"/>
                </Tooltip>
            </>
        )
    },[chimeState.arenaViewScreen])
    /// (2-5) field mic state
    const fieldMicrophoneComp = useMemo(()=>{
        return (
            chimeState.fieldMicrophone?
            <>
                <Tooltip title={"Mic On"}>
                    <MicIcon className={classes.activeState_field}  fontSize="large"/>
                </Tooltip>
            </>
            :
            <>
                <Tooltip title={"Mic Off"}>
                    <MicIcon className={classes.inactiveState} fontSize="large"/>
                </Tooltip>
            </>
        )
    },[chimeState.fieldMicrophone])

    /// (2-6) field speaker state
    const fieldSpeakerComp = useMemo(()=>{
        return (
            chimeState.fieldSpeaker?
            <>
                <Tooltip title={"Snd On"}>
                    <VolumeUpIcon className={classes.activeState_field} fontSize="large"/>
                </Tooltip>
            </>
            :
            <>
                <Tooltip title={"Snd Off"}>
                    <VolumeUpIcon className={classes.inactiveState} fontSize="large"/>
                </Tooltip>
            </>
        )
    },[chimeState.fieldSpeaker])

    //// (2-x) game state
    const gameStateComp = useMemo(()=>{
        return(
            <div>
                <div>
                    {STATES[currentGameState.state]}
                </div>
                <div>
                {currentGameState.lobbyCode}@{REGIONS[currentGameState.gameRegion]} {currentGameState.map}
                </div>
            </div>

        )
    },[currentGameState.state, currentGameState.gameRegion, currentGameState.lobbyCode, currentGameState.map])

    
    //////////////////////////
    /// (3) util
    //////////////////////////
    /// (3-1) Gear
    const gearComp = useMemo(()=>{
        return (
            <>
                <Tooltip title={"config"}>
                    <IconButton classes={{root:classes.menuButton}}>                    
                        <SettingsIcon className={classes.activeState_hmm} fontSize="large"/>
                    </IconButton>                    
                </Tooltip>
            </>
        )
    },[])
    /// (3-2) Leave
    const leaveComp = useMemo(()=>{
        return (
            <>
                <Tooltip title={"leave"}>
                    <IconButton classes={{root:classes.menuButton}}>                    
                        <ExitToAppIcon className={classes.activeState_hmm} fontSize="large"/>
                    </IconButton>                    
                </Tooltip>
            </>
        )
    },[])

    //////////////////////////////
    /// (4) user chooser
    /////////////////////////////
    const userChooser = useMemo(()=>{
        return(
            <FormControl className={classes.formControl} >
                <InputLabel className={classes.label}>UserName</InputLabel>
        
                <Select onChange={(e)=>{setUserName(e.target.value! as string)}} 
                        className={classes.select}
                        value={userName}
                        defaultValue={userName}
                        inputProps={{
                            classes: {
                                icon: classes.icon,
                            },
                            className: classes.input_amongus
                        }}                                
                        >
                    <MenuItem value="__None__">
                        <em>__None__</em>
                    </MenuItem>
                    <MenuItem disabled value={userName}>
                        <em>{userName}</em>
                    </MenuItem>
                    {currentGameState.players?.map(p => {
                        return <MenuItem value={p.name} key={p.name}>{p.name}</MenuItem>
                    })}
                </Select>
            </FormControl>
    
        )
    },[currentGameState.players])

    /////////////////////////////
    /// (5) User List
    ////////////////////////////
    const userList = useMemo(()=>{
        return(
            <div>
                {
                    currentGameState.players.map(x=>{
                        return(
                            <div>
                                {
                                    x.isDead || x.disconnected ? 
                                    <div><img style={{width:"20%"}} src={ICONS_DEAD[x.color]}></img>{x.name}/{x.chimeName}</div> 
                                    :
                                    <div><img style={{width:"20%"}} src={ICONS_ALIVE[x.color]}></img>{x.name}/{x.chimeName}</div> 
                                }
                            </div>
                        )}
                    )
                }
            </div>

        )
    },[currentGameState])


    return (
            <div className={classes.root}>

                <div style={{display:"flex", flexDirection:"row"}} >

                    <div style={{display:"flex", flexDirection:"column"}}>
                        <div style={{display:"flex"}}>
                            {ownerStateComp}
                            {managerStateComp}
                            {recordingStateComp}
                            {shareTileViewStateComp}
                        </div>
                        <div>
                            {publicIp?`${publicIp}:3000`:""}
                        </div>
                        <div>
                            lastupdate:{stateLastUpdateTime}
                        </div>
                    </div>

                    <span style={{width:"30px"}}/>

                    <div style={{display:"flex", flexDirection:"column"}}>
                        <div style={{display:"flex", flexDirection:"row"}}>
                            <div style={{display:"flex"}}>
                                {arenaMicrophoneComp}
                                {arenaSpeakerComp}
                                {arenaShareScreenComp}
                                {arenaViewScreenComp}
                            </div>
                            <span style={{margin:"3px" }}> </span>
                            <div style={{display:"flex"}}>
                                {fieldMicrophoneComp}
                                {fieldSpeakerComp}
                            </div>
                        </div>
                        <div>
                            {gameStateComp}
                        </div>
                    </div>

                    <span style={{width:"30px"}}/>


                    <div style={{display:"flex", flexDirection:"column"}}>
                        <div style={{display:"flex", flexDirection:"row"}}>
                            <div style={{display:"flex"}}>
                                {gearComp}
                                {leaveComp}
                            </div>
                        </div>
                        <div>
                        </div>
                    </div>

                </div>

                <Divider variant="middle" classes={{root:classes.dividerColor }}/>

                <div style={{height:"70%", display:"flex", flexDirection:"row"}}>
                    <div style={{width:"20%", display:"flex", flexDirection:"column"}}>
                        {userChooser}
                        {userList}
                    </div>

                    <div style={{width:"70%", height:"100%", display:"flex", flexDirection:"column"}}>
                        <div style={{height:"20%", display:"flex", flexDirection:"row"}}>
                            <div style={{width:"25%", height:"100%", textAlign:"right" }}>
                                click to share your screen
                            </div>
                            <div style={{width:"30%", height:"100%", alignItems:"center" }}>
                                <video id="capture" style={{width:"50%", height:"100%", borderStyle:"dashed",borderColor: blueGrey[200]}} />
                            </div>
                            <div style={{width:"30%", height:"100%", alignItems:"center" }}>
                            </div>
                        </div>
                        <div style={{height:"80%", display:"flex", flexDirection:"row"}}>
                            <video id="tileView"  style={{width:"100%", height:"100%", borderStyle:"solid",borderColor: red[900]}} />
                        </div>



                        <div style={{display:"flex", flexDirection:"row"}}>
                            <video id="userView0"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                            <video id="userView1"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                            <video id="userView2"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                            <video id="userView3"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                        </div>
                        <div style={{display:"flex", flexDirection:"row"}}>
                            <video id="userView4"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                            <video id="userView5"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                            <video id="userView6"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                            <video id="userView7"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                        </div>
                        <div style={{display:"flex", flexDirection:"row"}}>
                            <video id="userView8"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                            <video id="userView9"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                            <video id="userView10"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                            <video id="userView11"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                        </div>
                        <div style={{display:"flex", flexDirection:"row"}}>
                            <video id="userView12"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                            <video id="userView13"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                            <video id="userView14"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                            <video id="userView15"  style={{width:"23%",  borderStyle:"solid",borderColor: red[900]}} />
                        </div>

                    </div>
                </div>


            </div>

    );











    // const classes = useStyles()
    // const [drawerOpen, setDrawerOpen] = useState(false)

    // const { screenHeight, screenWidth, meetingName,
    //         audioInputDeviceSetting, videoInputDeviceSetting, audioOutputDeviceSetting, isShareContent,
    //         startShareScreen, stopShareScreen,} = useAppState()

    // const [guiCounter, setGuiCounter] = useState(0)

    // const [settingDialogOpen, setSettingDialogOpen] = useState(false);
    // const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
    // const [screenType, setScreenType] = useState<ScreenType>("FeatureView");

    // const setAudioInputEnable = async() =>{
    //     await audioInputDeviceSetting!.setAudioInputEnable(!audioInputDeviceSetting!.audioInputEnable)
    //     setGuiCounter(guiCounter+1)
    // }
    // const setVideoInputEnable = async() =>{
    //     const enable = !videoInputDeviceSetting!.videoInputEnable
    //     await videoInputDeviceSetting!.setVideoInputEnable(enable)
    //     if(enable){
    //         videoInputDeviceSetting!.startLocalVideoTile()
    //     }else{
    //         videoInputDeviceSetting!.stopLocalVideoTile()
    //     }
    //     setGuiCounter(guiCounter+1)
    // }
    // const setAudioOutputEnable = async() =>{
    //     await audioOutputDeviceSetting!.setAudioOutputEnable(!audioOutputDeviceSetting!.audioOutputEnable)
    //     setGuiCounter(guiCounter+1)
    // }

    // const enableShareScreen = (val:boolean) =>{
    //     if(val){
    //         startShareScreen()
    //     }else{
    //         stopShareScreen()
    //     }
    // }

    // const mainView = useMemo(()=>{
    //     switch(screenType){
    //         case "FullView":
    //             return <FullScreenView height={screenHeight-toolbarHeight-bufferHeight} width={drawerOpen?screenWidth-drawerWidth:screenWidth} pictureInPicture={"None"} focusTarget={"SharedContent"}/>
    //         case "FeatureView":
    //             return <FeatureView height={screenHeight-toolbarHeight-bufferHeight} width={drawerOpen?screenWidth-drawerWidth:screenWidth} pictureInPicture={"None"} focusTarget={"SharedContent"}/>
    //         case "GridView":
    //             return <GridView  height={screenHeight-toolbarHeight-bufferHeight} width={drawerOpen?screenWidth-drawerWidth:screenWidth} excludeSharedContent={false}/>
    //         default:
    //             return (<>Not found screen type:{screenType}</>)
    //     }
    // },[screenType, screenHeight, screenWidth]) // eslint-disable-line



    // useEffect(()=>{
    //     const audioElement = document.getElementById("for-speaker")! as HTMLAudioElement
    //     audioElement.autoplay=false
    //     audioOutputDeviceSetting!.setOutputAudioElement(audioElement)
    // },[]) // eslint-disable-line


    // return (
    //     <ThemeProvider theme={theme}>
    //         <CssBaseline />
    //         <div className={classes.root}>


    //             <AppBar position="absolute" className={clsx(classes.appBar)}>
    //                 <Toolbar className={classes.toolbar}>
    //                     <div className={classes.toolbarInnnerBox}>
    //                         <DrawerOpener open={drawerOpen} setOpen={setDrawerOpen} />
    //                     </div>
    //                     <div className={classes.toolbarInnnerBox}>
    //                         <Title title={meetingName||""} />
    //                     </div>
    //                     <div className={classes.toolbarInnnerBox}>
    //                         <div className={classes.toolbarInnnerBox}>
    //                             <DeviceEnabler type="Mic" enable={audioInputDeviceSetting!.audioInputEnable} setEnable={setAudioInputEnable}/>
    //                             <DeviceEnabler type="Camera" enable={videoInputDeviceSetting!.videoInputEnable} setEnable={setVideoInputEnable}/>
    //                             <DeviceEnabler type="Speaker" enable={audioOutputDeviceSetting!.audioOutputEnable} setEnable={setAudioOutputEnable}/>
    //                             <DialogOpener type="Setting" onClick={()=>setSettingDialogOpen(true)}/>
    //                             <span className={clsx(classes.menuSpacer)}>  </span>
    //                             <FeatureEnabler type="ShareScreen" enable={isShareContent} setEnable={(val:boolean)=>{enableShareScreen(val)}}/>
    //                             <span className={clsx(classes.menuSpacer)}>  </span>
    //                             <span className={clsx(classes.menuSpacer)}>  </span>
    //                             <SwitchButtons type="ScreenView" selected={screenType} onClick={(val)=>{setScreenType(val as ScreenType)}}/>
    //                             <span className={clsx(classes.menuSpacer)}>  </span>
    //                             <span className={clsx(classes.menuSpacer)}>  </span>
    //                             <DialogOpener type="LeaveMeeting" onClick={()=>setLeaveDialogOpen(true)}/>

    //                         </div>
    //                         <div className={classes.toolbarInnnerBox}>
    //                         </div>
    //                     </div>
    //                 </Toolbar>
    //             </AppBar>
    //             <SettingDialog      open={settingDialogOpen} onClose={()=>setSettingDialogOpen(false)} />
    //             <LeaveMeetingDialog open={leaveDialogOpen} onClose={()=>setLeaveDialogOpen(false)} />


    //             <div style={{marginTop:toolbarHeight, position:"absolute", display:"flex"}}>
    //                 <Drawer
    //                     variant="permanent"
    //                     classes={{
    //                         paper: clsx(classes.drawerPaper, !drawerOpen && classes.drawerPaperClose),
    //                     }}
    //                     open={drawerOpen}
    //                 >
    //                     <CustomAccordion title="Member">
    //                         <AttendeesTable/>
    //                     </CustomAccordion>

    //                     <CustomAccordion title="Chat">
    //                         <ChatArea/>
    //                     </CustomAccordion>

    //                     <CustomAccordion title="Whiteboard">
    //                         <WhiteboardPanel/>
    //                     </CustomAccordion>

    //                     {/* <CustomAccordion title="RecordMeeting (exp.)">
    //                         <RecorderPanel />
    //                     </CustomAccordion> */}
                        
    //                     {/* <CustomAccordion title="BGM/SE">
    //                         <BGMPanel />
    //                     </CustomAccordion> */}
                        
    //                     <CustomAccordion title="About">
    //                         <CreditPanel />
    //                     </CustomAccordion>

    //                     <CustomAccordion title="OnetimeCode">
    //                         <OnetimeCodePanel />
    //                     </CustomAccordion>

    //                     <CustomAccordion title="StartManagerPanel">
    //                         <ManagerControllerPanel />
    //                     </CustomAccordion>
                                                

    //                 </Drawer>

    //                 <main style={{height:`${screenHeight - toolbarHeight - bufferHeight}px`}}>
    //                     {mainView}
    //                 </main>
    //             </div>
    //         </div>

    //         {/* ************************************** */}
    //         {/* *****   Hidden Elements          ***** */}
    //         {/* ************************************** */}
    //         <div>
    //             <audio id="for-speaker" style={{display:"none"}}/>

    //         </div>

    //     </ThemeProvider>
    // )

}
