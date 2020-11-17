import { ReactNode, useContext, useEffect, useState } from "react";
import React from "react";
import { useAudioVideo, useRosterState } from "amazon-chime-sdk-component-library-react";
import { DataMessage } from "amazon-chime-sdk-js";


type Props = {
    children: ReactNode;
};

type DataMessageType = "CHAT" | "STAMP" | "WHITE_BOARD"

export interface RealitimeSubscribeStateValue {
    chatData:  string[]
    sendChatData: (text: string) => void
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
    const [chatData, setChatData] = useState([] as string[])
    const roster = useRosterState()
    const sendChatData = (text:string) =>{
        const message= {
            action   : 'sendmessage',
            cmd      : "TEXT",
            text     : text,
        } 
        audioVideo!.realtimeSendDataMessage("CHAT" as DataMessageType, JSON.stringify(message))
    }

    const receiveChatData = (mess: DataMessage) =>{
        console.log("MESSAGE:::",mess)
        let attendees = Object.values(roster);
        console.log(">>>>>",roster)
        console.log(attendees)
        console.log(attendees[0])
        console.log(attendees[0][mess.senderAttendeeId].name)
    }

    useEffect(()=>{
        audioVideo!.realtimeSubscribeToReceiveDataMessage(
            "CHAT" as DataMessageType,
            receiveChatData
        )
    })

    const providerValue = {
        chatData,
        sendChatData

    }
    return (
        <RealitimeSubscribeStateContext.Provider value={providerValue}>
          {children}
        </RealitimeSubscribeStateContext.Provider>
      )
}