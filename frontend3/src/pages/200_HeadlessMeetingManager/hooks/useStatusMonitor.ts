import { useEffect, useState } from "react"
import { useAppState } from "../../../providers/AppStateProvider"
import { HMMCmd, HMM_STATUS } from "../../../providers/hooks/RealtimeSubscribers/useRealtimeSubscribeHMM"
import { useScheduler } from "../../../providers/hooks/useScheduler"


export const useStatusMonitor = () =>{

    const {tenSecondsTaskTrigger} = useScheduler()
    const { attendees, sendHMMCommand, hMMCommandData, attendeeId} = useAppState()
    const [ meetingActive, setMeetingActive ] = useState(true)
    const [ noAttendeesCount, setNoAttendeesCount] = useState(0)

    useEffect(()=>{
        let meetingActive = true
        //// exclude hmm and shared contents
        if(!attendeeId){ // not yet ready
            return
        }
        const pureAttendees = Object.keys(attendees).filter(x =>{return x.indexOf(attendeeId) < 0})
        if(pureAttendees.length > 0){
            meetingActive = true
        }else{
            meetingActive = false
        }

        console.log("meetingActive1:", meetingActive, pureAttendees)
        const attendeeList = pureAttendees.reduce((prev,cur)=>{return prev+"_____"+cur}, "")
        console.log("meetingActive2:", attendeeList)
        
        const status:HMM_STATUS = {
            active: true,
            recording: true
        }
        sendHMMCommand({command:HMMCmd.NOTIFY_STATUS, data:status})


        if(meetingActive){
            setNoAttendeesCount(0)
        }else{
            setNoAttendeesCount(noAttendeesCount + 1)
            if(noAttendeesCount > 10){
                setMeetingActive(false)
            }
        }


    },[tenSecondsTaskTrigger])

    return {meetingActive}
}
