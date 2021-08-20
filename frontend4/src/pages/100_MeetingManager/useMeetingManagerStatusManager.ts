import { RestApiClient } from "@dannadori/flect-amazon-chime-lib"
import { useEffect, useState } from "react"
import { RestAPIEndpoint } from "../../BackendConfig"
import { useAppState } from "../../providers/AppStateProvider"

type InternalStage = "Initializing" | "SelectCode" | "WaitForEntering" | "InMeeting"


type MeetingManagerStatusManagerProps = {
    meetingName:string,
    attendeeId:string,
    uuid:string,
}


export const useMeetingManagerStatusManager = (props:MeetingManagerStatusManagerProps) =>{

    const [ internalStage, setInternalStage ] = useState<InternalStage>("Initializing")
    const [ challengeCode, setChallengeCode] = useState<string[]>([])
    const [ userName, setUserName ] = useState<string>("")

    const { cognitoClient, setLastUpdateTime, chimeClient } = useAppState() 

    useEffect(()=>{
        const restClient = new RestApiClient(RestAPIEndpoint, "", "", "")
        restClient.requestOnetimeSigninChallengeRequest(props.meetingName, props.attendeeId, props.uuid).then((challenge)=>{
            setInternalStage("SelectCode")
            setChallengeCode(challenge.codes)
        })
    },[]) // eslint-disable-line

    const sendChallengeCode = async(code:string) =>{
        const restClient = new RestApiClient(RestAPIEndpoint, "", "", "")
        const res = await restClient.singinWithOnetimeCode(props.meetingName, props.attendeeId, props.uuid, code)
        if(res.result){
            cognitoClient.userId       = "MANAGER"
            cognitoClient.idToken      = res.idToken!
            cognitoClient.accessToken  = res.accessToken!
            cognitoClient.refreshToken = "N/A"
            setUserName(res.attendeeName!)
            setLastUpdateTime(new Date().getTime())
            setInternalStage("WaitForEntering")
            return res
        }else{
            return res
        }
    }

    const enterMeeting = async() =>{
        if(chimeClient){
            console.log("[useMeetingManagerStatusMaanger] Joining...")
            chimeClient.joinMeeting(props.meetingName, `Manager(${userName})`).then(()=>{
                console.log("[useMeetingManagerStatusMaanger] entering...")
                const p1 = chimeClient.audioInputDeviceSetting!.setAudioInput("dummy")
                const p2 = chimeClient.videoInputDeviceSetting!.setVideoInput(null)
                const p3 = chimeClient.audioOutputDeviceSetting!.setAudioOutput(null)                
                chimeClient.enterMeeting().then(()=>{
                    Promise.all([p1,p2,p3]).then(()=>{
                        setInternalStage("InMeeting")
                        // setStage("MEETING_MANAGER")
                    })
                }).catch(e=>{
                    console.log(`[useMeetingManagerStatusMaanger] ${e}`)
                })
            })
        }
    }

    return {internalStage, challengeCode, sendChallengeCode, enterMeeting}
}



