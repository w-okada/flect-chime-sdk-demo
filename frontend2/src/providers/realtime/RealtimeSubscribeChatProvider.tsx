import { ReactNode, useContext, useEffect, useState } from "react";
import React from "react";
import { DataMessage } from "amazon-chime-sdk-js";
import { v4 } from 'uuid';
import { RealtimeData } from "./RealtimeSubscribeProvider";
import { useMeetingState } from "../MeetingStateProvider";

type Props = {
    children: ReactNode;
};

type DataMessageType = "CHAT" 

export interface RealitimeSubscribeChatStateValue {
    chatData: RealtimeData[]
    sendChatData: (mess: string) => void
}

const RealitimeSubscribeChatStateContext = React.createContext<RealitimeSubscribeChatStateValue | null>(null)


export const useRealitimeSubscribeChatState = (): RealitimeSubscribeChatStateValue => {
    const state = useContext(RealitimeSubscribeChatStateContext)
    if (!state) {
        throw new Error("Error using RealitimeSubscribe in context!")
    }
    return state
}

export const RealitimeSubscribeChatStateProvider = ({ children }: Props) => {
    const {meetingSession, userAttendeeId} = useMeetingState()
    const [chatData, setChatData] = useState([] as RealtimeData[])
    
    const sendChatData = (text: string) => {
        console.log("chatdata::", userAttendeeId )
        const mess: RealtimeData = {
            uuid: v4(),
            action: 'sendmessage',
            cmd: "TEXT",
            data: text,
            createdDate: new Date().getTime(),
            senderId: userAttendeeId            
        }
        meetingSession?.audioVideo!.realtimeSendDataMessage("CHAT" as DataMessageType, JSON.stringify(mess))
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
            "CHAT" as DataMessageType,
            receiveChatData
        )
        return () => {
            meetingSession?.audioVideo?.realtimeUnsubscribeFromReceiveDataMessage("CHAT" as DataMessageType)
        }
    })

    const providerValue = {
        chatData,
        sendChatData,
    }
    return (
        <RealitimeSubscribeChatStateContext.Provider value={providerValue}>
            {children}
        </RealitimeSubscribeChatStateContext.Provider>
    )
}

