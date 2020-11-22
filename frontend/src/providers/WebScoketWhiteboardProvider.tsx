import { ReactNode, useContext, useEffect, useState } from "react";
import React from "react";
import { useAudioVideo, useRosterState, useUniqueId } from "amazon-chime-sdk-component-library-react";
import { DataMessage, ReconnectingPromisedWebSocket, DefaultPromisedWebSocketFactory, DefaultDOMWebSocketFactory, FullJitterBackoff } from "amazon-chime-sdk-js";
import { v4 } from 'uuid';
import { useAppState } from "./AppStateProvider";
import { RealtimeData } from "./RealtimeSubscribeProvider";
import { WebSocketEndpoint } from "../BackendConfig";
import { useWebSocketState } from "./WebScoketProvider";

type Props = {
    children: ReactNode;
};

const TOPIC_NAME = "WHITEBOARD"


export type DrawingData = {
    drawingCmd: DrawingCmd
    startXR: number
    startYR: number
    endXR: number
    endYR: number
    stroke: string
    lineWidth: number
}

type DrawingCmd = "DRAW" | "ERASE" | "CLEAR"
type DrawingMode = "DRAW" | "ERASE" | "DISABLE"

export interface WebSocketWhiteboardStateValue {
    sendWebSocketWhiteboardMessage: (data:DrawingData) => void
    drawingDatas: DrawingData[]
    drawingMode: DrawingMode
    setDrawingMode: (mode:DrawingMode) => void

    drawingStroke: string
    setDrawingStroke: (stroke: string) => void

}

const WebSocketWhiteboardStateContext = React.createContext<WebSocketWhiteboardStateValue | null>(null)


export const useWebSocketWhiteboardState = (): WebSocketWhiteboardStateValue => {
    const state = useContext(WebSocketWhiteboardStateContext)
    if (!state) {
        throw new Error("Error using WebSocket in context!")
    }
    return state
}

export const WebSocketWhiteboardStateProvider = ({ children }: Props) => {
    console.log("WebSocket Created!! Provider white")
    const { sendWebSocketMessage, webSocketMessages } = useWebSocketState()
    const [ drawingMode, setDrawingMode ] = useState("DISABLE" as DrawingMode)    
    const [ drawingDatas, setDrawingDatas ] = useState([] as DrawingData[])
    const [ drawingStroke, setDrawingStroke ] = useState("black")

    const sendWebSocketWhiteboardMessage = (data:DrawingData) => {
        sendWebSocketMessage(TOPIC_NAME, data)
    }
    useEffect(()=>{
        if(webSocketMessages.topics[TOPIC_NAME]){
            const drawingData = webSocketMessages.topics[TOPIC_NAME].map(x=>{
                return x.data as DrawingData
            })
            setDrawingDatas(drawingData)
        }
    },[webSocketMessages])

    const providerValue = {
        sendWebSocketWhiteboardMessage,
        drawingDatas,
        drawingMode,
        setDrawingMode,
        drawingStroke, 
        setDrawingStroke

    }
    return (
        <WebSocketWhiteboardStateContext.Provider value={providerValue}>
            {children}
        </WebSocketWhiteboardStateContext.Provider>
    )
}

