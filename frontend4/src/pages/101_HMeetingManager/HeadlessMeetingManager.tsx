import React, { useEffect, useMemo} from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { AmongUsServerComponent } from "./components/AmongUsServerComponent";
import { RecorderPanel } from "./components/RecorderPanel";
import { useStyles } from "./css";
import { useHMeetingManagerStatusManager } from "./useMeetingManagerStatusManager";

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //
// --autoplay-policy=no-user-gesture-required で起動することが前提。
// これがないとsignalを受け付けられない。(why...!?)
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //

export const HeadlessMeetingManager = () => {
    const classes = useStyles();
    //// Query Parameters
    const query       = new URLSearchParams(window.location.search);
    const meetingName = query.get('meetingName') || null  // meeting name is already encoded
    const attendeeId  = query.get('attendeeId') || null
    const uuid        = query.get('uuid') || null
    const code        = query.get('code') || null // OnetimeCode

    const { chimeClient, audioOutputList } = useAppState()

    const { internalStage, sendChallengeCode, enterMeeting } = useHMeetingManagerStatusManager({
        meetingName: meetingName!,
        attendeeId: attendeeId!,
        uuid: uuid!,
        code: code!,
    })

    ////////////////////////////////
    /////// (1) auto entering //////
    ////////////////////////////////
    useEffect(()=>{
        if(internalStage === "SelectCode"){
            sendChallengeCode(code!).then((res)=>{
                console.log(`[HeadlessMeetingManager] challenge result:${res.result}`)
            })
        }
    },[internalStage]) // eslint-disable-line
    
    ////////////////////////////////
    /////// (2) entering      //////
    ////////////////////////////////
    useEffect(()=>{
        if(internalStage === "WaitForEntering" && chimeClient){
            enterMeeting()
        }else{

        }
    },[internalStage, chimeClient])// eslint-disable-line

    ////////////////////////////////
    /////// (3) inMeeting     //////
    ////////////////////////////////
    const meetingRoomForManager = useMemo(()=>{
        if(internalStage === "InMeeting"){
            return (
                <div>
                    <div className={classes.root}>
                        <RecorderPanel />
                        <AmongUsServerComponent />
                    </div>
                    <div>
                        <audio id="for-speaker" style={{display:"none"}}/>
                    </div>
                </div>
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



    /////////////////////////////
    //// Functin 
    /////////////////////////////


    ///// Return Component ////
    if(internalStage === "Initializing" || internalStage === "SelectCode"){
        return <>waiting 1</>
    }else if(internalStage === "WaitForEntering"){
        return <>waiting 2</>
    }else{
        return meetingRoomForManager
    }
}
