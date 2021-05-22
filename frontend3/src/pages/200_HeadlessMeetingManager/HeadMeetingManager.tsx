import { Button, CircularProgress, Container, createStyles, CssBaseline, makeStyles } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { RecorderView } from "./components/views/RecorderView";

type InternalStage = "Signining" | "Joining" | "Entering" | "Managing"

type State = {
    internalStage: InternalStage,
    userName: string | null
}


const localLog = (...strArray: any[]) =>{
    console.log(`[HeadlessMeetingManager]`, ...strArray)

}

export const HeadlessMeetingManager = () => {


    //// Query Parameters
    const query = new URLSearchParams(window.location.search);
    const meetingName = query.get('meetingName') || null  // meeting name is already encoded
    const attendeeId  = query.get('attendeeId') || null
    const uuid        = query.get('uuid') || null
    const code        = query.get('code') || null // OnetimeCode

    const { handleSinginWithOnetimeCode, joinMeeting, enterMeeting,
            audioInputDeviceSetting, videoInputDeviceSetting, audioOutputDeviceSetting
        } = useAppState()
    const [state, setState] = useState<State>({internalStage:"Signining", userName:null})

    useEffect(()=>{
        if(state.internalStage === "Signining"){
            localLog("Singining....")
            if(!meetingName || !attendeeId || !uuid || !code){
                localLog(`"Exception: Signin error. Information is insufficent meetingName${meetingName}, attendeeId=${attendeeId}, uuid=${uuid}, code=${code}`)
                return
            }
            console.log(meetingName)
            handleSinginWithOnetimeCode(meetingName, attendeeId, uuid, code).then((res)=>{
                console.log(res)
                if(res.result){
                    setState({...state, 
                        userName: res.userName||null, 
                        internalStage:"Joining"
                    })
                }else{
                    localLog("Exception: Signin error, can not sigin. please generate code and retry.", res)
                }
            })
        }else if(state.internalStage === "Joining"){
            localLog("Joining....")
            joinMeeting(meetingName!, `@Manager[${state.userName!}]`).then(()=>{
                setState({...state, internalStage:"Entering"})
            }).catch(e=>{
                localLog("joining failed",e)
            })
        }else if(state.internalStage === "Entering"){
            console.log("entering...")
            const p1 = audioInputDeviceSetting!.setAudioInput("dummy")
            const p2 = videoInputDeviceSetting!.setVideoInput(null)
            // const audioOutput = (audioOutputList && audioOutputList!.length > 0) ? audioOutputList[0].deviceId:null
            // const p3 = audioOutputDeviceSetting!.setAudioOutput(audioOutput)
            // const audioOutput = (audioOutputList && audioOutputList!.length > 0) ? audioOutputList[0].deviceId:null
            const p3 = audioOutputDeviceSetting!.setAudioOutput(null)
            enterMeeting().then(()=>{
                Promise.all([p1,p2,p3]).then(()=>{
                    setState({...state, internalStage:"Managing"})
                })
            }).catch(e=>{
                localLog("enter meeting failed",e)
            })
        }
    },[state.internalStage])
    
    return (
        <>
            <RecorderView height={200} width={500}/>
        </>
    )
}
