import { ReactNode, useContext, useState } from "react";
import React from "react";
import { WebSocketWhiteboardStateProvider } from "./WebScoketWhiteboardProvider";
import { DefaultWebSocketAdapter, Logger, WebSocketAdapter } from "amazon-chime-sdk-js";
import { useAppState } from "../AppStateProvider";
import { useMeetingState } from "../MeetingStateProvider";
import { WebSocketEndpoint } from "../../BackendConfig";

type Props = {
    children: ReactNode;
};

export interface WebSocketMessage {
    action: string
    topic: string
    senderId: string
    data: any
}

export interface WebSocketMessages{
   topics: {[topic:string]:WebSocketMessage[]}
}



export interface WebSocketStateValue {
    sendWebSocketMessage: (topic: string, data: any) => void
    addEventListener: (topic: string, f: (mess: WebSocketMessage) => void) => void
    removeEventListener: (topic: string, f: (mess: WebSocketMessage) => void) => void
    initWebSocketManager: () => void
}

const WebSocketStateContext = React.createContext<WebSocketStateValue | null>(null)

export const useWebSocketState = (): WebSocketStateValue => {
    const state = useContext(WebSocketStateContext)
    if (!state) {
        throw new Error("Error using WebSocket in context!")
    }
    return state
}

class WebSocketManager{
    private static _instance:WebSocketManager
    public static getInstance(){
        if(!this._instance){
            this._instance = new WebSocketManager()
        }
        return this._instance
    }

    messagingURLWithQuery:string=""
    private websocketAdapter:WebSocketAdapter|null = null
    createWebSocket = (messagingURLWithQuery:string, logger:Logger, reuse:boolean=true) => {
        if(reuse && this.messagingURLWithQuery === messagingURLWithQuery){
            console.log("reuse websocket")
        }else{
            console.log("not reuse,", reuse, this.messagingURLWithQuery,  messagingURLWithQuery)
            this.websocketAdapter =  new DefaultWebSocketAdapter(logger)
            this.websocketAdapter.create(
                messagingURLWithQuery,
                []
            )
            this.websocketAdapter.addEventListener('message', this.receiveMessage)
            this.websocketAdapter.addEventListener('close', this.reconnect)
            this.websocketAdapter.addEventListener('error', this.reconnect)
            
            this.messagingURLWithQuery = messagingURLWithQuery
            console.log("WebSocket Created!!", this.websocketAdapter)
        }
    }

    private _userId:string|null = null
    set userId(val:string){this._userId=val}

    private listener:{[topic:string]:((mess:WebSocketMessage)=>void)[]} = {}
    addEventListener = (topic:string, f:(mess:WebSocketMessage)=>void) =>{
        if(!this.listener[topic]){
            this.listener[topic] = []
        }
        this.listener[topic].push(f)
        console.log("Listener", this.listener)
    }
    removeEventListener = (topic:string, f:(mess:WebSocketMessage)=>void) =>{
        if(this.listener[topic]){
            this.listener[topic] = this.listener[topic].filter(x=>x!==f)
        }
    }

    reconnect = (e:Event) => {
        console.log("Reconnect!!!!!! or error !?", e)
        setTimeout(()=>{
            console.log("reconnecting... ")
            this.websocketAdapter!.create(
                this.messagingURLWithQuery,
                []
            )
            this.websocketAdapter!.addEventListener('message', this.receiveMessage)
            this.websocketAdapter!.addEventListener('close', this.reconnect)
            this.websocketAdapter!.addEventListener('error', this.reconnect)
        },10*1000)
    }
    
    receiveMessage = (e:Event) => {
        const event = e as MessageEvent
        const message = JSON.parse(event.data)  as WebSocketMessage
        const topic = message.topic
//        console.log("recieveMessage!!", event)
        if(this.listener[topic]){
            this.listener[topic].forEach(x=>{
                x(message)
            })
        }
    }

    
    sendMessage = (topic:string,data:any) =>{
        const mess:WebSocketMessage = {
            action   : 'sendmessage',
            senderId: this._userId!,
            topic: topic,
            data: data
        }
        const message = JSON.stringify(mess)
        const res = this.websocketAdapter!.send(message)
        console.log("send data(ws):", message.length, "sending result:", res)
        // console.log("data",message)
    }
}


export const WebSocketStateProvider = ({ children }: Props) => {
    const { userId } = useAppState()
    const { meetingSession } = useMeetingState()
    const meetingId = meetingSession?.configuration.meetingId
    const [webSocketManager, setWebSocketManager] = useState(null as WebSocketManager| null)
    
    
    const initWebSocketManager = () =>{
        const attendeeId = meetingSession?.configuration.credentials?.attendeeId
        const joinToken = meetingSession?.configuration.credentials?.joinToken
        const messagingURLWithQuery = `${WebSocketEndpoint}/Prod?joinToken=${joinToken}&meetingId=${meetingId}&attendeeId=${attendeeId}`
        console.log("[WebSocket Provider] MessageQuery: ", messagingURLWithQuery)
        const webSocketManager = WebSocketManager.getInstance()
        webSocketManager.createWebSocket(messagingURLWithQuery, meetingSession?.logger!, true)
        webSocketManager.userId = attendeeId || "unknown"
        setWebSocketManager(webSocketManager)
    }

    const sendWebSocketMessage = (topic:string, data:any) => {
        webSocketManager?.sendMessage(topic, data)
    }
    const addEventListener = (topic:string, f:(mess:WebSocketMessage)=>void) => {
        webSocketManager?.addEventListener(topic, f)
    }
    const removeEventListener = (topic:string, f:(mess:WebSocketMessage)=>void) => {
        webSocketManager?.removeEventListener(topic, f)
    }

    const providerValue = {
        sendWebSocketMessage,
        addEventListener,
        removeEventListener,
        initWebSocketManager,
    }
    return (
        <WebSocketStateContext.Provider value={providerValue}>
            <WebSocketWhiteboardStateProvider>
                {children}
            </WebSocketWhiteboardStateProvider>
        </WebSocketStateContext.Provider>
    )
}


