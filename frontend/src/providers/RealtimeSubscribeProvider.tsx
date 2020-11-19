import { ReactNode, useContext, useEffect, useState } from "react";
import React from "react";
import { useAudioVideo, useRosterState, useUniqueId } from "amazon-chime-sdk-component-library-react";
import { DataMessage } from "amazon-chime-sdk-js";
import { v4 } from 'uuid';
import { useAppState } from "./AppStateProvider";

type Props = {
    children: ReactNode;
};
export type RealtimeData = {
    uuid: string
    action: RealtimeDataAction
    cmd: RealtimeDataCmd
    data: any
    createdDate: number
    senderId   : string
}

export type DrawingData = {
    drawingCmd: DrawingCmd
    startXR: number
    startYR: number
    endXR: number
    endYR: number
    stroke: string
    lineWidth: number
}

type DataMessageType = "CHAT" | "STAMP" | "WHITEBOARD"
type RealtimeDataAction = "sendmessage"
type RealtimeDataCmd    = "TEXT" | "WHITEBOARD"
type DrawingCmd = "DRAW" | "ERASE" | "CLEAR"

export interface RealitimeSubscribeStateValue {
    chatData:  RealtimeData[]
    sendChatData: (mess: string) => void
    whiteboardData:  RealtimeData[]
    sendWhiteBoardData: (data: DrawingData) => void
}

export const RealitimeSubscribeStateContext = React.createContext<RealitimeSubscribeStateValue | null>(null)


export const useRealitimeSubscribeState = (): RealitimeSubscribeStateValue => {
    const state = useContext(RealitimeSubscribeStateContext)
    if (!state) {
      throw new Error("Error using RealitimeSubscribe in context!")
    }
    return state
}

export const RealitimeSubscribeStateProvider = ({ children }: Props) => {
    const audioVideo = useAudioVideo()
    const { localUserId } = useAppState()
    const [chatData, setChatData] = useState([] as RealtimeData[])
    const [whiteboardData, setWhiteboardData] = useState([] as RealtimeData[])

    const sendChatData = (text:string) =>{
        const mess:RealtimeData = {
            uuid        : v4(),
            action      : 'sendmessage',
            cmd         : "TEXT",
            data        : text,
            createdDate : new Date().getTime(),
            senderId    : localUserId
        } 
        audioVideo!.realtimeSendDataMessage("CHAT" as DataMessageType, JSON.stringify(mess))
        setChatData([...chatData, mess])
    }

    const sendWhiteBoardData = (data:DrawingData) =>{
        const mess:RealtimeData = {
            uuid        : v4(),
            action      : 'sendmessage',
            cmd         : "WHITEBOARD",
            data        : data,
            createdDate : new Date().getTime(),
            senderId    : localUserId
        } 
        audioVideo!.realtimeSendDataMessage("WHITEBOARD" as DataMessageType, JSON.stringify(mess))
        setWhiteboardData([...whiteboardData, mess])
    }



    const receiveChatData = (mess:DataMessage) => {
        const senderId = mess.senderAttendeeId
        const data = JSON.parse(mess.text()) as RealtimeData
        data.senderId = senderId
        setChatData([...chatData, data])
    }

    const receiveWhiteboardData = (mess:DataMessage) => {
        const senderId = mess.senderAttendeeId
        const data = JSON.parse(mess.text()) as RealtimeData
        data.senderId = senderId
        setWhiteboardData([...whiteboardData, data])
    }

    useEffect(()=>{
        audioVideo!.realtimeSubscribeToReceiveDataMessage(
            "CHAT" as DataMessageType,
            receiveChatData
        )
        audioVideo!.realtimeSubscribeToReceiveDataMessage(
            "WHITEBOARD" as DataMessageType,
            receiveWhiteboardData
        )
        return ()=>{
            audioVideo!.realtimeUnsubscribeFromReceiveDataMessage("CHAT" as DataMessageType)
            audioVideo!.realtimeUnsubscribeFromReceiveDataMessage("WHITEBOARD" as DataMessageType)
        }
    })

    const providerValue = {
        chatData,
        sendChatData,
        whiteboardData,
        sendWhiteBoardData
    }
    return (
        <RealitimeSubscribeStateContext.Provider value={providerValue}>
          {children}
        </RealitimeSubscribeStateContext.Provider>
      )
}