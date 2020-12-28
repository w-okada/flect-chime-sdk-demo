import { ReactNode, useContext, useEffect, useState } from "react";
import React from "react";
import { useAudioVideo } from "amazon-chime-sdk-component-library-react";
import { DataMessage } from "amazon-chime-sdk-js";
import { v4 } from 'uuid';
import { useAppState } from "./AppStateProvider";
import { RealtimeData } from "./RealtimeSubscribeProvider";


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
    const audioVideo = useAudioVideo()
    const { localUserId } = useAppState()
    const [chatData, setChatData] = useState([] as RealtimeData[])
    
    const sendChatData = (text: string) => {
        const mess: RealtimeData = {
            uuid: v4(),
            action: 'sendmessage',
            cmd: "TEXT",
            data: text,
            createdDate: new Date().getTime(),
            senderId: localUserId
        }
        audioVideo!.realtimeSendDataMessage("CHAT" as DataMessageType, JSON.stringify(mess))
        setChatData([...chatData, mess])
    }

    const receiveChatData = (mess: DataMessage) => {
        const senderId = mess.senderAttendeeId
        const data = JSON.parse(mess.text()) as RealtimeData
        data.senderId = senderId
        setChatData([...chatData, data])
    }

    useEffect(() => {
        audioVideo?.realtimeSubscribeToReceiveDataMessage(
            "CHAT" as DataMessageType,
            receiveChatData
        )
        return () => {
            audioVideo?.realtimeUnsubscribeFromReceiveDataMessage("CHAT" as DataMessageType)
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

