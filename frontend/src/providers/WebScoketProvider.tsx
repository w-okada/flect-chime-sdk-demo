import { ReactNode, useContext, useEffect, useState } from "react";
import React from "react";
import { useAudioVideo, useRosterState, useUniqueId } from "amazon-chime-sdk-component-library-react";
import { DataMessage, ReconnectingPromisedWebSocket, DefaultPromisedWebSocketFactory, DefaultDOMWebSocketFactory, FullJitterBackoff } from "amazon-chime-sdk-js";
import { v4 } from 'uuid';
import { useAppState } from "./AppStateProvider";
import { RealtimeData } from "./RealtimeSubscribeProvider";
import { WebSocketEndpoint } from "../BackendConfig";

type Props = {
    children: ReactNode;
};

type DataMessageType = "CHAT" 

export interface WebSocketStateValue {
    webSocket:ReconnectingPromisedWebSocket
}

const WebSocketStateContext = React.createContext<WebSocketStateValue | null>(null)


export const useWebSocketState = (): WebSocketStateValue => {
    const state = useContext(WebSocketStateContext)
    if (!state) {
        throw new Error("Error using RealitimeSubscribe in context!")
    }
    return state
}

export const WebSocketStateProvider = ({ children }: Props) => {
    const {meetingId, localUserId, joinToken } = useAppState()
    const messagingURLWithQuery = `${WebSocketEndpoint}/Prod?joinToken=${joinToken}&meetingId=${meetingId}&attendeeId=${localUserId}`
    console.log("MESSAGEING_URL", messagingURLWithQuery)
    
    const [webSocket] = useState( (() => {
        const ws = new ReconnectingPromisedWebSocket(
            messagingURLWithQuery,
            [],
            'arraybuffer',
            new DefaultPromisedWebSocketFactory(new DefaultDOMWebSocketFactory()),
            new FullJitterBackoff(1000, 0, 10000)
        )
        ws.open(20 * 1000)
        console.log("WebSocket Created!!")
        return ws
    })())

    console.log("websocket",webSocket)

    const providerValue = {
        webSocket
    }
    return (
        <WebSocketStateContext.Provider value={providerValue}>
            {children}
        </WebSocketStateContext.Provider>
    )
}

