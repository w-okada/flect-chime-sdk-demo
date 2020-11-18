import { ReactNode, useContext, useEffect, useState } from "react";
import React from "react";
import { useAudioVideo, useRosterState } from "amazon-chime-sdk-component-library-react";
import { DataMessage } from "amazon-chime-sdk-js";


type Props = {
    children: ReactNode;
};

type DataMessageType = "CHAT" | "STAMP" | "WHITE_BOARD"

export interface RealitimeSubscribeStateValue {
    chatData:  DataMessage[]
    sendChatData: (mess: string) => void
}

export const RealitimeSubscribeStateContext = React.createContext<RealitimeSubscribeStateValue | null>(null)


export const useRealitimeSubscribeState = (): RealitimeSubscribeStateValue => {
    const state = useContext(RealitimeSubscribeStateContext)
    if (!state) {
      throw new Error("Error using RealitimeSubscribe in context!")
    }
    return state
}

class RealitimeSubscriber {

    private static _instance:RealitimeSubscriber;
    public static getInstance():RealitimeSubscriber{
    if(!this._instance){
        this._instance= new RealitimeSubscriber()
    }
    return this._instance
    }
    constructor(){
    console.log("RealitimeSubscriber !!!!!!")
    }


}

export const RealitimeSubscribeStateProvider = ({ children }: Props) => {
    const audioVideo = useAudioVideo()
    const [chatData, setChatData] = useState([] as DataMessage[])
    const sendChatData = (text:string) =>{
        const message= {
            action   : 'sendmessage',
            cmd      : "TEXT",
            text     : text,
        } 
        audioVideo!.realtimeSendDataMessage("CHAT" as DataMessageType, JSON.stringify(message))
    }

    const receiveChatData = (mess: DataMessage) =>{
        setChatData([...chatData, mess])
    }

    useEffect(()=>{
        const receivedChatDataCallback = (mess:DataMessage):void=>{
            receiveChatData(mess)
        }
        audioVideo!.realtimeSubscribeToReceiveDataMessage(
            "CHAT" as DataMessageType,
            receivedChatDataCallback
        )
        return ()=>{
            audioVideo!.realtimeUnsubscribeFromReceiveDataMessage("CHAT" as DataMessageType)
        }
    })

    const providerValue = {
        chatData,
        sendChatData,
    }
    return (
        <RealitimeSubscribeStateContext.Provider value={providerValue}>
          {children}
        </RealitimeSubscribeStateContext.Provider>
      )
}