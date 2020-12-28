import { ReactNode, useContext, useEffect, useState } from "react";
import React from "react";
import { useAudioVideo } from "amazon-chime-sdk-component-library-react";
import { DataMessage, AudioVideoFacade } from "amazon-chime-sdk-js";
import { v4 } from 'uuid';
import { useAppState } from "./AppStateProvider";
import { RealtimeData } from "./RealtimeSubscribeProvider";

import {Semaphore} from 'await-semaphore';


type Props = {
    children: ReactNode;
};

const SEND_INTERVAL_TIME = 1000 * 5
const SEND_INTERVAL_NUM  = 5

export type DrawingData = {
    drawingCmd: DrawingCmd
    startXR: number
    startYR: number
    endXR: number
    endYR: number
    stroke: string
    lineWidth: number
}

type DataMessageType = "WHITEBOARD"

type DrawingCmd = "DRAW" | "ERASE" | "CLEAR" | "SYNC_SCREEN"
type DrawingMode = "DRAW" | "ERASE" | "DISABLE"

export interface RealitimeSubscribeWhiteboardStateValue {
    drawingDatas: DrawingData[]
    sendDrawingData: (data: DrawingData) => void
    drawingMode: DrawingMode
    setDrawingMode: (mode: DrawingMode) => void
    drawingStroke: string
    setDrawingStroke: (stroke: string) => void
}

export const RealitimeSubscribeWhiteboardStateContext = React.createContext<RealitimeSubscribeWhiteboardStateValue | null>(null)


export const useRealitimeSubscribeWhiteboardState = (): RealitimeSubscribeWhiteboardStateValue => {
    const state = useContext(RealitimeSubscribeWhiteboardStateContext)
    if (!state) {
        throw new Error("Error using RealitimeSubscribe in context!")
    }
    return state
}

class DrawingDataBufferSender{
    private semaphore = new Semaphore(1);
    private drawingDataBuffer:DrawingData[] =[]

    private _audioVideo:AudioVideoFacade|null = null
    set audioVideo(val:AudioVideoFacade){this._audioVideo=val}
    private _localUserId:string|null = null
    set localUserId(val:string){this._localUserId=val}

    private static _instance: DrawingDataBufferSender
    public static getInstance(): DrawingDataBufferSender {
        if (!this._instance) {
            this._instance = new DrawingDataBufferSender()
        }
        return this._instance
    }

    private constructor(){
        this.startMonitor()
    }

    addDrawindData = (data:DrawingData) => {
        this.semaphore.acquire().then(release=>{
            this.drawingDataBuffer.push(data)
            if(this.drawingDataBuffer.length > SEND_INTERVAL_NUM){
                this.sendDrawingBuffer()
            }
            release()
        })
    }

    startMonitor = () =>{
        this.semaphore.acquire().then(release=>{
            if(this.drawingDataBuffer.length > 0){
                this.sendDrawingBuffer()
            }
            release()
            setTimeout(this.startMonitor, SEND_INTERVAL_TIME)
        })
    }

    // Use this function under semaphore. (startMonitor, addDrawindData are known.)
    private sendDrawingBuffer = () => {
        if(this._localUserId && this._audioVideo){
            const mess: RealtimeData = {
                uuid: v4(),
                action: 'sendmessage',
                cmd: "WHITEBOARD",
                data: this.drawingDataBuffer,
                createdDate: new Date().getTime(),
                senderId: this._localUserId
            }
            console.log("send data",JSON.stringify(mess).length)
            this._audioVideo!.realtimeSendDataMessage("WHITEBOARD" as DataMessageType, JSON.stringify(mess))
            this.drawingDataBuffer = []
        }
    }


}

export const RealitimeSubscribeWhiteboardStateProvider = ({ children }: Props) => {
    const audioVideo = useAudioVideo()
    const { localUserId } = useAppState()
    const [drawingDatas, setDrawingDatas] = useState([] as DrawingData[])
    const [drawingMode, setDrawingMode] = useState("DISABLE" as DrawingMode)
    const [drawingStroke, setDrawingStroke] = useState("black")

    const sender = DrawingDataBufferSender.getInstance()

    const sendDrawingData = (data: DrawingData) => {
        sender.addDrawindData(data)
        sender.audioVideo = audioVideo!
        sender.localUserId = localUserId

        newDataHandler([data])
    }

    const receiveWhiteboardData = (dataMessage: DataMessage) => {
        const senderId = dataMessage.senderAttendeeId
        const mess = JSON.parse(dataMessage.text()) as RealtimeData
        mess.senderId = senderId
        newDataHandler(mess.data as DrawingData[])
    }

    const newDataHandler = (data: DrawingData[]) => {
        // if (data.drawingCmd === "CLEAR") {
        //     setDrawingDatas([])
        // } else {
            setDrawingDatas([...drawingDatas, ...data])
        // }
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
        drawingDatas,
        sendDrawingData,
        drawingMode,
        setDrawingMode,
        drawingStroke,
        setDrawingStroke
    }
    return (
        <RealitimeSubscribeWhiteboardStateContext.Provider value={providerValue}>
            {children}
        </RealitimeSubscribeWhiteboardStateContext.Provider>
    )
}

