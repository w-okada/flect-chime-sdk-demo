
import { DefaultMeetingSession, DataMessage } from "amazon-chime-sdk-js";
import { useEffect, useMemo, useState } from "react";
import { RealtimeData, RealtimeDataApp } from "./const";
import { v4 } from 'uuid';
import { FlectChimeClient } from "../../flect-amazon-chime-lib";

type UseRealtimeSubscribeChat = {
    meetingSession?:DefaultMeetingSession
    attendeeId:string
}
export class RealtimeSubscribeChatClient{
    private _chimeClient:FlectChimeClient
    constructor(chimeClient:FlectChimeClient){
        this._chimeClient = chimeClient

        this._chimeClient.meetingSession?.audioVideo?.realtimeSubscribeToReceiveDataMessage(
            RealtimeDataApp.CHAT,
            this.receiveChatData
        )
    }

    private _chatData:RealtimeData[] = []
    get chatData():RealtimeData[]{
        return this._chatData
    }

    ///////
    // Listener
    ///////
    private _chatDataUpdateListener = (list:RealtimeData[]) =>{console.log("[FlectChimeClient][RealtimeSubscribeChatClient] default listener!")}
    setChatDataUpdateListener = ( l: ((list:RealtimeData[]) =>void)) =>{
        this._chatDataUpdateListener = l
    }

    sendChatData = (text: string) => {
        console.log("chatdata::", this._chimeClient.attendeeId)
        const mess: RealtimeData = {
            uuid: v4(),
            action: 'sendmessage',
            app: RealtimeDataApp.CHAT ,
            data: text,
            createdDate: new Date().getTime(),
            senderId: this._chimeClient.attendeeId ? this._chimeClient.attendeeId : "unknown.."
        }
        this._chimeClient.meetingSession?.audioVideo!.realtimeSendDataMessage(RealtimeDataApp.CHAT , JSON.stringify(mess))
        // this._cahtData.push(mess)
        this._chatData = [...this._chatData, mess]
        this._chatDataUpdateListener(this._chatData)
    }

    private receiveChatData = (mess: DataMessage) => {
        const senderId = mess.senderAttendeeId
        const data = JSON.parse(mess.text()) as RealtimeData
        data.senderId = senderId
        // this._cahtData.push(data)
        this._chatData = [...this._chatData, data] 

        this._chatDataUpdateListener(this._chatData)
    }

}
