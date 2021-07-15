import { useEffect, useState } from "react"
import { useAppState } from "../../../../providers/AppStateProvider"
import { useScheduler } from "../../../../providers/hooks/useScheduler"


export const useStatusMonitor = () =>{

    const { tenSecondsTaskTrigger } = useScheduler()
    const { chimeClient } = useAppState()
    const [ meetingActive, setMeetingActive ] = useState(true)
    const [ noAttendeesCount, setNoAttendeesCount] = useState(0)

    useEffect(()=>{
        if(!chimeClient?.attendeeId){ // not yet ready
            return
        }
        //// exclude hmm and shared contents
        let meetingActive = true
        const pureAttendees = Object.keys(chimeClient!.attendees).filter(x =>{return x.indexOf(chimeClient!.attendeeId!) < 0})
        if(pureAttendees.length > 0){
            meetingActive = true
        }else{
            meetingActive = false
        }

        // console.log( `[HeadlessManager][MeetingStatusMonitor] active:${meetingActive}, pureAttendees:${JSON.stringify(pureAttendees)}`)
        const attendeeList = pureAttendees.reduce((prev,cur)=>{return prev+"_____"+cur}, "")
        console.log(`[HeadlessManager][MeetingStatusMonitor] pureAttendees:${attendeeList}`)
        // console.log(`[HeadlessManager][MeetingStatusMonitor] pureAttendees: share contents? ${chimeClient.isShareContent? "true" : "false"}`)
        // console.log((`[HeadlessManager][MeetingStatusMonitor] pureAttendees: attendees ? ${JSON.stringify(chimeClient.attendees)}`))
        

        const maxCount = 5
        if(meetingActive){
            setNoAttendeesCount(0)
        }else{
            setNoAttendeesCount(noAttendeesCount + 1)
            console.log(`[HeadlessManager][MeetingStatusMonitor] no attendees ${noAttendeesCount}/${maxCount}`)
            if(noAttendeesCount > maxCount ){
                setMeetingActive(false)
            }
        }
    },[tenSecondsTaskTrigger]) // eslint-disable-line
    
    return {meetingActive}
}
