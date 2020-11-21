import { ReactNode, useContext, useEffect, useState } from "react";
import React from "react";
import { useAudioVideo, useRosterState, useUniqueId } from "amazon-chime-sdk-component-library-react";
import { DataMessage } from "amazon-chime-sdk-js";
import { v4 } from 'uuid';
import { useAppState } from "./AppStateProvider";
import { RealitimeSubscribeChatStateProvider } from "./RealtimeSubscribeChatProvider";
import { RealitimeSubscribeWhiteboardStateProvider } from "./RealtimeSubscribeWhiteboardProvider";

type Props = {
    children: ReactNode;
};
export type RealtimeData = {
    uuid: string
    action: RealtimeDataAction
    cmd: RealtimeDataCmd
    data: any
    createdDate: number
    senderId: string
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
type RealtimeDataCmd = "TEXT" | "WHITEBOARD"
type DrawingCmd = "DRAW" | "ERASE" | "CLEAR"
type DrawingMode = "DRAW" | "ERASE" | "DISABLE"

export interface RealitimeSubscribeStateValue {
    whiteboardData: RealtimeData[]
    sendWhiteBoardData: (data: DrawingData) => void
    drawingMode: DrawingMode
    setDrawingMode: (mode: DrawingMode) => void
    drawingStroke: string
    setDrawingStroke: (stroke: string) => void
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
    const [whiteboardData, setWhiteboardData] = useState([] as RealtimeData[])
    const [drawingMode, setDrawingMode] = useState("DISABLE" as DrawingMode)
    const [drawingStroke, setDrawingStroke] = useState("black")

    const sendWhiteBoardData = (data: DrawingData) => {
        const mess: RealtimeData = {
            uuid: v4(),
            action: 'sendmessage',
            cmd: "WHITEBOARD",
            data: data,
            createdDate: new Date().getTime(),
            senderId: localUserId
        }
        audioVideo!.realtimeSendDataMessage("WHITEBOARD" as DataMessageType, JSON.stringify(mess))
        if (data.drawingCmd === "CLEAR") {
            setWhiteboardData([])
        } else {
            setWhiteboardData([...whiteboardData, mess])
        }
    }

    const receiveWhiteboardData = (mess: DataMessage) => {
        const senderId = mess.senderAttendeeId
        const data = JSON.parse(mess.text()) as RealtimeData
        data.senderId = senderId
        console.log(data)
        if (((data.data) as DrawingData).drawingCmd === "CLEAR") {
            setWhiteboardData([])
        } else {
            setWhiteboardData([...whiteboardData, data])
        }
    }

    useEffect(() => {
        audioVideo!.realtimeSubscribeToReceiveDataMessage(
            "WHITEBOARD" as DataMessageType,
            receiveWhiteboardData
        )
        return () => {
            audioVideo!.realtimeUnsubscribeFromReceiveDataMessage("WHITEBOARD" as DataMessageType)
        }
    })

    const providerValue = {
        whiteboardData,
        sendWhiteBoardData,
        drawingMode,
        setDrawingMode,
        drawingStroke,
        setDrawingStroke
    }
    return (
        <RealitimeSubscribeStateContext.Provider value={providerValue}>
            <RealitimeSubscribeChatStateProvider>
                <RealitimeSubscribeWhiteboardStateProvider>
                    {children}
                </RealitimeSubscribeWhiteboardStateProvider>
            </RealitimeSubscribeChatStateProvider>
        </RealitimeSubscribeStateContext.Provider>
    )
}

