import { ReactNode, useContext, useEffect, useState } from "react";
import React from "react";
import { ReconnectingPromisedWebSocket, DefaultPromisedWebSocketFactory, DefaultDOMWebSocketFactory, FullJitterBackoff } from "amazon-chime-sdk-js";
import { useAppState } from "./AppStateProvider";
import { WebSocketEndpoint } from "../BackendConfig";
import { WebSocketWhiteboardStateProvider } from "./WebScoketWhiteboardProvider";

type Props = {
    children: ReactNode;
};

export interface WebSocketMessage {
    action: string
    topic: string
    XsenderId?: string
    data: any
}

export interface WebSocketMessages{
    topics: {[topic:string]:WebSocketMessage[]}
}



export interface WebSocketStateValue {
    sendWebSocketMessage: (topic: string, data: any) => void
    webSocketMessages: WebSocketMessages
}


const WebSocketStateContext = React.createContext<WebSocketStateValue | null>(null)


export const useWebSocketState = (): WebSocketStateValue => {
    const state = useContext(WebSocketStateContext)
    if (!state) {
        throw new Error("Error using WebSocket in context!")
    }
    return state
}

const createWebSocket = (messagingURLWithQuery:string) => {
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
}

export const WebSocketStateProvider = ({ children }: Props) => {
    const {meetingId, localUserId, joinToken } = useAppState()
    const messagingURLWithQuery = `${WebSocketEndpoint}/Prod?joinToken=${joinToken}&meetingId=${meetingId}&attendeeId=${localUserId}`
    
    console.log("WebSocket Created!! Provider")
    const [webSocket, setWebSocket] = useState(null as ReconnectingPromisedWebSocket| null)

    if(webSocket===null){
        setWebSocket(createWebSocket(messagingURLWithQuery ))
    }
    const [webSocketMessages, setWebSocketMessages] = useState({topics:{}} as WebSocketMessages)


    const receiveWebSocketMessage = (e:Event) =>{
        const event = e as MessageEvent
        const message = JSON.parse(event.data)  as WebSocketMessage
        if(!webSocketMessages.topics[message.topic]){
            webSocketMessages.topics[message.topic] = []
        }
        webSocketMessages.topics[message.topic].push(message)
        const newData = {...webSocketMessages }
        setWebSocketMessages(newData)
    }

    const sendWebSocketMessage = (topic:string, data:any) => {
        const mess:WebSocketMessage = {
            action   : 'sendmessage',
            topic: topic,
            data: data
        }
        webSocket?.send(JSON.stringify(mess))
    }


    useEffect(()=>{
        if(!webSocket){
            console.log("websocket is not prepared.")
            return
        }
        webSocket.addEventListener('message', receiveWebSocketMessage)
        return ()=>{
            webSocket.removeEventListener('message', receiveWebSocketMessage)
        }
    })

    console.log("websocket",webSocket)

    const providerValue = {
        sendWebSocketMessage,
        webSocketMessages,
    }
    return (
        <WebSocketStateContext.Provider value={providerValue}>
            <WebSocketWhiteboardStateProvider>
                {children}
            </WebSocketWhiteboardStateProvider>
        </WebSocketStateContext.Provider>
    )
}


