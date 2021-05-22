
import { DefaultMeetingSession, DataMessage } from "amazon-chime-sdk-js";
import { useEffect, useMemo, useState } from "react";
import { RealtimeData, RealtimeDataApp} from "./const";
import { v4 } from 'uuid';
import { LocalLogger } from "../../../utils/localLogger";

type UseRealtimeSubscribeHMMProps = {
    meetingSession?:DefaultMeetingSession
    attendeeId:string
}

const logger = new LocalLogger("useRealtimeSubscribeHMM")

export const useRealtimeSubscribeHMM = (props: UseRealtimeSubscribeHMMProps) =>{
    const meetingSession = useMemo(()=>{
        return props.meetingSession
    },[props.meetingSession])
    const attendeeId = useMemo(()=>{
        return props.attendeeId
    },[props.attendeeId])

    const [chatData, setChatData] = useState<RealtimeData[]>([])
    
    const sendCommand = (text: string) => {
        logger.log(`sendCommand: ${attendeeId}`)
        const mess: RealtimeData = {
            uuid: v4(),
            action: 'sendmessage',
            app: RealtimeDataApp.HMM,
            data: text,
            createdDate: new Date().getTime(),
            senderId: attendeeId
        }
        meetingSession?.audioVideo!.realtimeSendDataMessage(RealtimeDataApp.HMM , JSON.stringify(mess))
    }

    const receiveCommand = (mess: DataMessage) => {
        const senderId = mess.senderAttendeeId
        const data = JSON.parse(mess.text()) as RealtimeData
        data.senderId = senderId
        console.log(data)
    }

    useEffect(() => {
        meetingSession?.audioVideo?.realtimeSubscribeToReceiveDataMessage(
            RealtimeDataApp.HMM,
            receiveCommand
        )
        return () => {
            meetingSession?.audioVideo?.realtimeUnsubscribeFromReceiveDataMessage(RealtimeDataApp.HMM)
        }
    })
    return {sendCommand}
}