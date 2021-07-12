import { AppBar, Button, CircularProgress, Container, createTheme, CssBaseline, ThemeProvider, Toolbar } from "@material-ui/core";
import React, { useEffect, useMemo, useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { DialogOpener } from "../023_meetingRoom/components/appbars/DialogOpener";
import { FeatureEnabler } from "../023_meetingRoom/components/appbars/FeatureEnabler";
import { Title } from "../023_meetingRoom/components/appbars/Title";
import { LeaveMeetingDialog } from "../023_meetingRoom/components/dialog/LeaveMeetingDialog";
import { AttendeesTable } from "../023_meetingRoom/components/sidebars/AttendeesTable";
import { BGMPanel } from "../023_meetingRoom/components/sidebars/BGMPanel";
import { ChatArea } from "../023_meetingRoom/components/sidebars/ChatArea";
import { CreditPanel } from "../023_meetingRoom/components/sidebars/CreditPanel";
import { CustomAccordion } from "../023_meetingRoom/components/sidebars/CustomAccordion";
import { RecorderPanel } from "../023_meetingRoom/components/sidebars/RecorderPanel";
import { useStyles } from "./css";
import { useHMeetingManagerStatusManager } from "./useMeetingManagerStatusManager";


export const HMeetingManager = () => {
    const classes = useStyles();
    //// Query Parameters
    const query       = new URLSearchParams(window.location.search);
    const meetingName = query.get('meetingName') || null  // meeting name is already encoded
    const attendeeId  = query.get('attendeeId') || null
    const uuid        = query.get('uuid') || null
    const code        = query.get('code') || null // OnetimeCode

    const { setMessage, chimeClient, audioOutputList } = useAppState()
    const [ isLoading, setIsLoading] = useState(false)
    const [ guiCounter, setGuiCounter] = useState(0)

    const { internalStage, challengeCode, sendChallengeCode, enterMeeting } = useHMeetingManagerStatusManager({
        meetingName: meetingName!,
        attendeeId: attendeeId!,
        uuid: uuid!,
        code: code!,
    })

    // useEffect(()=>{
    //     sendChallengeCode(code!).then(()=>{
    //         console.log("CHALLENGE DONE")
    //     })
    // },[])

    const onetimeCodeClicked = async(code:string) =>{
        setIsLoading(true)
        const res = await sendChallengeCode(code)
        if(res.result){
            setIsLoading(false)
        }else{
            setMessage("Exception", "Signin error", [`can not sigin. please generate code and retry.`] )
            setIsLoading(false)
        }
    }

    // useEffect(()=>{
    //     sendChallengeCode(code!).then(()=>{
    //         console.log("SEND CHALLENGE!")
    //     })
    // },[])

    ////////////////////////////////
    /////// (1) Code Selector //////
    ////////////////////////////////
    const codeSelector = useMemo(()=>{
        if(internalStage === "Initializing"){
            return <div>now loading</div>
        }else if(internalStage === "SelectCode"){
            if(isLoading){
                return <CircularProgress />
            }else if(challengeCode.length>0){
                const codes = challengeCode.map(x=>{
                    return (
                        <div key={x}>
                            <div>
                                <Button color="primary" variant="outlined" className={classes.button} key={x} onClick={()=>{onetimeCodeClicked(x)}}>{x}</Button>
                            </div>                    
                            <div className={classes.lineSpacer} />
                        </div>
                    )
                })
                return codes

            }else{
                return <div>now loading</div>
            }
        }else{
            return(<>unknwon status</>)
        }

    },[internalStage, challengeCode, isLoading]) // eslint-disable-line

    const codeSelectorView = useMemo(()=>{
        return (
            <Container maxWidth="xs">
                <CssBaseline />
                <div className={classes.paper}>
                    <div>
                        Select your code.
                    </div>
                    <div className={classes.buttonList}>
                        {codeSelector}
                    </div>
                    
                </div>
            </Container>
        )
    }, [codeSelector]) // eslint-disable-line
    
    ////////////////////////////////
    /////// (2) entering      //////
    ////////////////////////////////
    useEffect(()=>{
        if(internalStage === "WaitForEntering" && chimeClient){
            enterMeeting()
        }else{

        }
    },[internalStage, chimeClient])// eslint-disable-line

    const waitingForEntering = useMemo(()=>{
        return (
            <Container maxWidth="xs">
                <CssBaseline />
                <div className={classes.paper}>
                    <CircularProgress />
                </div>
            </Container>
        )
    }, [codeSelector])// eslint-disable-line


    ////////////////////////////////
    /////// (3) inMeeting     //////
    ////////////////////////////////
    const toolbarHeight = 20
    const theme = createTheme({
        mixins: {
            toolbar: {
                minHeight: toolbarHeight,
            }
        },
    });
    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

    const meetingRoomForManager = useMemo(()=>{
        if(internalStage === "InMeeting"){
            console.log("IN MEETING CALLED!!!!")
            return (
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <div className={classes.root}>
        
                        <AppBar position="absolute" className={classes.appBar}>
                            <Toolbar className={classes.toolbar}>
                                <div className={classes.toolbarInnnerBox}>
                                </div>
                                <div className={classes.toolbarInnnerBox}>
                                    <Title title={meetingName||""} />
                                </div>
                                <div className={classes.toolbarInnnerBox}>
                                    <div className={classes.toolbarInnnerBox}>
                                        <span className={classes.menuSpacer}>  </span>
                                        <FeatureEnabler type="ShareScreen" enable={chimeClient!.isShareContent} setEnable={(val:boolean)=>{enableShareScreen(val)}}/>
                                        <span className={classes.menuSpacer}>  </span>
                                        <span className={classes.menuSpacer}>  </span>
                                        <DialogOpener type="LeaveMeeting" onClick={()=>setLeaveDialogOpen(true)}/>
                                    </div>
                                    <div className={classes.toolbarInnnerBox}>
                                    </div>
                                </div>
                            </Toolbar>
                        </AppBar>
                        <LeaveMeetingDialog open={leaveDialogOpen} onClose={()=>setLeaveDialogOpen(false)} />                
                        <div style={{display:"flex", flexDirection:"column"}}>
                            <CustomAccordion title="Member">
                                <AttendeesTable/>
                            </CustomAccordion>
        
                            <CustomAccordion title="Chat">
                                <ChatArea/>
                            </CustomAccordion>
        
                            <CustomAccordion title="RecordMeeting (exp.)">
                                <RecorderPanel />
                            </CustomAccordion>
                            
                            <CustomAccordion title="BGM/SE">
                                <BGMPanel />
                            </CustomAccordion>
                            
                            <CustomAccordion title="About">
                                <CreditPanel />
                            </CustomAccordion>
                        </div>
                    </div>
        
                    {/* ************************************** */}
                    {/* *****   Hidden Elements          ***** */}
                    {/* ************************************** */}
                    <div>
                        <audio id="for-speaker" style={{display:"none"}}/>
        
                    </div>
        
                </ThemeProvider>
            )
        }else{
            return(<>unknwon status</>)
        }
    },[internalStage]) // eslint-disable-line

    useEffect(()=>{
        if(internalStage === "InMeeting"){
            const audioOutput = (audioOutputList && audioOutputList!.length > 0) ? audioOutputList[0].deviceId:null
            chimeClient!.audioOutputDeviceSetting!.setAudioOutput(audioOutput).then(async()=>{
                const audioElement = document.getElementById("for-speaker")! as HTMLAudioElement
                audioElement.autoplay=true
                audioElement.volume = 0
                await chimeClient!.audioOutputDeviceSetting!.setOutputAudioElement(audioElement)
            })
        }
    },[internalStage]) // eslint-disable-line


    const enableShareScreen = async(val:boolean) =>{
        if(val){
            try{
                // @ts-ignore https://github.com/microsoft/TypeScript/issues/31821
                const media = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true } )
                chimeClient!.startShareContent(media)
                setGuiCounter(guiCounter+1)
            }catch(e){
                console.log(e)
            }
        }else{
            chimeClient!.stopShareContent()
            setGuiCounter(guiCounter+1)
        }
    }

    ///// Return Component ////
    if(internalStage === "Initializing" || internalStage === "SelectCode"){
        // return <>waiting 1</>
        return codeSelectorView
    }else if(internalStage === "WaitForEntering"){
        // return <>waiting 2</>
        return waitingForEntering
    }else{
        return meetingRoomForManager
        // return <>not here</>
    }
}
