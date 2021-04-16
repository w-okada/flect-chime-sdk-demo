import { AppBar, createMuiTheme, CssBaseline, ThemeProvider, Toolbar } from "@material-ui/core"
import React, { useEffect, useState } from "react"
import { useAppState } from "../../providers/AppStateProvider"
import { DialogOpener } from "../023_meetingRoom/components/appbars/DialogOpener"
import { FeatureEnabler } from "../023_meetingRoom/components/appbars/FeatureEnabler"
import { AttendeesTable } from "../023_meetingRoom/components/sidebars/AttendeesTable"
import { BGMPanel } from "../023_meetingRoom/components/sidebars/BGMPanel"
import { ChatArea } from "../023_meetingRoom/components/sidebars/ChatArea"
import { CreditPanel } from "../023_meetingRoom/components/sidebars/CreditPanel"
import { CustomAccordion } from "../023_meetingRoom/components/sidebars/CustomAccordion"
import { RecorderPanel } from "../023_meetingRoom/components/sidebars/RecorderPanel"
import { useStyles } from "../023_meetingRoom/css"
import clsx from 'clsx';
import { Title } from "../023_meetingRoom/components/appbars/Title"
import { LeaveMeetingDialog } from "../023_meetingRoom/components/dialog/LeaveMeetingDialog"

const toolbarHeight = 20
const theme = createMuiTheme({
    mixins: {
        toolbar: {
            minHeight: toolbarHeight,
        }
    },
});


export const MeetingManager = () => {
    const classes = useStyles()

    const { meetingName, audioOutputDeviceSetting, isShareContent,
            startShareScreen, stopShareScreen, audioOutputList} = useAppState()

    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

    const enableShareScreen = (val:boolean) =>{
        if(val){
            startShareScreen()
        }else{
            stopShareScreen()
        }
    }



    useEffect(()=>{
        const audioOutput = (audioOutputList && audioOutputList!.length > 0) ? audioOutputList[0].deviceId:null
        audioOutputDeviceSetting!.setAudioOutput(audioOutput).then(()=>{
            const audioElement = document.getElementById("for-speaker")! as HTMLAudioElement
            audioElement.autoplay=false
            audioElement.volume = 0
            audioOutputDeviceSetting!.setOutputAudioElement(audioElement)
        })
    },[])


    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            aaa
            <div className={classes.root}>

                <AppBar position="absolute" className={clsx(classes.appBar)}>
                    <Toolbar className={classes.toolbar}>
                        <div className={classes.toolbarInnnerBox}>
                        </div>
                        <div className={classes.toolbarInnnerBox}>
                            <Title title={meetingName||""} />
                        </div>
                        <div className={classes.toolbarInnnerBox}>
                            <div className={classes.toolbarInnnerBox}>
                                <span className={clsx(classes.menuSpacer)}>  </span>
                                <FeatureEnabler type="ShareScreen" enable={isShareContent} setEnable={(val:boolean)=>{enableShareScreen(val)}}/>
                                <span className={clsx(classes.menuSpacer)}>  </span>
                                <span className={clsx(classes.menuSpacer)}>  </span>
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
}
