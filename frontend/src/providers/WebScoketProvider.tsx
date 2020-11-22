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

    private ws:ReconnectingPromisedWebSocket|null = null
    createWebSocket = (messagingURLWithQuery:string, reuse:boolean=true) => {
        if(reuse && this.messagingURLWithQuery === messagingURLWithQuery){
            console.log("reuse websocket")
        }else{
            console.log("not reuse,", reuse, this.messagingURLWithQuery,  messagingURLWithQuery)
            this.ws =  new ReconnectingPromisedWebSocket(
                messagingURLWithQuery,
                [],
                'arraybuffer',
                new DefaultPromisedWebSocketFactory(new DefaultDOMWebSocketFactory()),
                new FullJitterBackoff(1000, 0, 10000)
            )
            this.ws.open(20 * 1000)
            this.ws.addEventListener('message', this.receiveMessage)
            this.messagingURLWithQuery = messagingURLWithQuery
            console.log("WebSocket Created!!")
        }
    }

    private _localUserId:string|null = null
    set localUserId(val:string){this._localUserId=val}

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
    
    receiveMessage = (e:Event) => {
        const event = e as MessageEvent
        const message = JSON.parse(event.data)  as WebSocketMessage
        const topic = message.topic
//        console.log("recieveMessage!!", event)
        if(this.listener[topic]){
            this.listener[topic].map(x=>{
                x(message)
            })
        }
    }

    sendMessage = (topic:string,data:any) =>{
        const mess:WebSocketMessage = {
            action   : 'sendmessage',
            senderId: this._localUserId!,
            topic: topic,
            data: data
        }
        const message = JSON.stringify(mess)
        this.ws!.send(message)
        console.log("send data(ws):", message.length)
        // console.log("data",message)
    }
}


export const WebSocketStateProvider = ({ children }: Props) => {
    const {meetingId, localUserId, joinToken } = useAppState()
    const messagingURLWithQuery = `${WebSocketEndpoint}/Prod?joinToken=${joinToken}&meetingId=${meetingId}&attendeeId=${localUserId}`
    
    console.log("WebSocket Provider rendering")
    const webSocketManager = WebSocketManager.getInstance()
    webSocketManager.createWebSocket(messagingURLWithQuery, true)
    webSocketManager.localUserId = localUserId
    

    const sendWebSocketMessage = (topic:string, data:any) => {
        webSocketManager.sendMessage(topic, data)
    }
    const addEventListener = (topic:string, f:(mess:WebSocketMessage)=>void) => {
        webSocketManager.addEventListener(topic, f)
    }
    const removeEventListener = (topic:string, f:(mess:WebSocketMessage)=>void) => {
        webSocketManager.removeEventListener(topic, f)
    }

    const providerValue = {
        sendWebSocketMessage,
        addEventListener,
        removeEventListener
    }
    return (
        <WebSocketStateContext.Provider value={providerValue}>
            <WebSocketWhiteboardStateProvider>
                {children}
            </WebSocketWhiteboardStateProvider>
        </WebSocketStateContext.Provider>
    )
}


