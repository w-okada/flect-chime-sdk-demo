
import { DefaultMeetingSession, DataMessage } from "amazon-chime-sdk-js";
import { useEffect, useMemo, useState } from "react";
import { RealtimeData, RealtimeDataApp} from "./const";
import { v4 } from 'uuid';

type UseRealtimeSubscribeChat = {
    meetingSession?:DefaultMeetingSession
    attendeeId:string
}

export const useRealtimeSubscribeChat = (props: UseRealtimeSubscribeChat) =>{
    const meetingSession = useMemo(()=>{
        return props.meetingSession
    },[props.meetingSession])
    const attendeeId = useMemo(()=>{
        return props.attendeeId
    },[props.attendeeId])

    const [chatData, setChatData] = useState<RealtimeData[]>([])
    
    const sendChatData = (text: string) => {
        console.log("chatdata::", attendeeId )
        const mess: RealtimeData = {
            uuid: v4(),
            action: 'sendmessage',
            app: RealtimeDataApp.CHAT ,
            data: text,
            createdDate: new Date().getTime(),
            senderId: attendeeId           
        }
        meetingSession?.audioVideo!.realtimeSendDataMessage(RealtimeDataApp.CHAT , JSON.stringify(mess))
        setChatData([...chatData, mess])
    }

    const receiveChatData = (mess: DataMessage) => {
        const senderId = mess.senderAttendeeId
        const data = JSON.parse(mess.text()) as RealtimeData
        data.senderId = senderId
        setChatData([...chatData, data])
    }

    useEffect(() => {
        meetingSession?.audioVideo?.realtimeSubscribeToReceiveDataMessage(
            RealtimeDataApp.CHAT,
            receiveChatData
        )
        return () => {
            meetingSession?.audioVideo?.realtimeUnsubscribeFromReceiveDataMessage(RealtimeDataApp.CHAT)
        }
    })

    return {chatData, sendChatData}


}