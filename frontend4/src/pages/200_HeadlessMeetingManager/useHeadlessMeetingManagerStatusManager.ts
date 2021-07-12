import { useEffect, useState } from "react"
import { RestAPIEndpoint } from "../../BackendConfig"
import { RestApiClient } from "../../common/rest/RestApiClient"
import { useAppState } from "../../providers/AppStateProvider"

type InternalStage =  "Initializing" | "WaitForEntering" | "InMeeting"


type HeadlessMeetingMeetingManagerStatusManagerProps = {
    meetingName:string,
    attendeeId:string,
    uuid:string,
    code:string,
}


export const useHeadlessMeetingManagerStatusManager = (props:HeadlessMeetingMeetingManagerStatusManagerProps) =>{

    const [ internalStage, setInternalStage ] = useState<InternalStage>("Initializing")
    const [ challengeCode, setChallengeCode] = useState<string[]>([])
    const [ userName, setUserName ] = useState<string>("")

    const { cognitoClient, setLastUpdateTime, chimeClient, audioOutputList } = useAppState() 

    useEffect(()=>{
        const restClient = new RestApiClient(RestAPIEndpoint, "", "", "")
        const res = restClient.singinWithOnetimeCode(props.meetingName, props.attendeeId, props.uuid, props.code).then(res=>{
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
                console.log("[useHeadlessMeetingManagerStatusMaanger] ERROR: Cannot sign in...")
                return res
            }
        })
    },[]) // eslint-disable-line

    const enterMeeting = async() =>{
        if(chimeClient){
            console.log("[useHeadlessMeetingManagerStatusMaanger] Joining...")
            chimeClient.joinMeeting(props.meetingName, `HMM(${userName})`).then(()=>{
                console.log("[useHeadlessMeetingManagerStatusMaanger] entering...")

                const p1 = chimeClient.audioInputDeviceSetting!.setAudioInput("dummy")
                const p2 = chimeClient.videoInputDeviceSetting!.setVideoInput(null)
                // chimeClient.videoInputDeviceSetting!.setVirtualForegrounEnable(false)
                // chimeClient.videoInputDeviceSetting!.setVirtualBackgrounEnable(false)
                // const audioOutput = (audioOutputList && audioOutputList!.length > 0) ? audioOutputList[0].deviceId:null
                // const p3 = chimeClient.audioOutputDeviceSetting!.setAudioOutput(audioOutput)
                const p3 = chimeClient.audioOutputDeviceSetting!.setAudioOutput(null)
                chimeClient.enterMeeting().then(()=>{
                    Promise.all([p1,p2,p3]).then(()=>{
                        setInternalStage("InMeeting")
                    })
                }).catch(e=>{
                    console.log(`[useMeetingManagerStatusMaanger] ${e}`)
                })
            })
        }
    }

    return {internalStage, challengeCode, enterMeeting}
}



