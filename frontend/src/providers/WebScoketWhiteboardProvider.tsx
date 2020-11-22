import { ReactNode, useContext, useEffect, useState } from "react";
import React from "react";
import { useWebSocketState, WebSocketMessage } from "./WebScoketProvider";
import { Semaphore } from "await-semaphore";
import { useAppState } from "./AppStateProvider";

type Props = {
    children: ReactNode;
};

const TOPIC_NAME = "WHITEBOARD"


const SEND_INTERVAL_TIME = 1000 * 2
const SEND_INTERVAL_NUM  = 100

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

type DrawingCmd = "DRAW" | "ERASE" | "CLEAR"
type DrawingMode = "DRAW" | "ERASE" | "DISABLE"


export interface WebSocketWhiteboardStateValue {
    sendDrawingData: (data: DrawingData) => void
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

class DrawingDataBufferSender{
    private semaphore = new Semaphore(1);
    private drawingDataBuffer:DrawingData[] =[]

    private _localUserId:string|null = null
    set localUserId(val:string){this._localUserId=val}

    private _sendWebSocketMessage:(topic: string, data: any) => void = (topic:string, data:any) =>{
        console.log("sender is not prepaired.")
    }
    set sendWebSocketMessage(val:(topic: string, data: any) => void ){this._sendWebSocketMessage=val}

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
            if(this.drawingDataBuffer.length>0){
                this.sendDrawingBuffer()
            }
            release()
            setTimeout(this.startMonitor, SEND_INTERVAL_TIME)
        })
    }

    // Use this function under semaphore. (startMonitor, addDrawindData are known.)
    private sendDrawingBuffer = () => {
        if(this._sendWebSocketMessage){
            this._sendWebSocketMessage(TOPIC_NAME, this.drawingDataBuffer)
            this.drawingDataBuffer = []
        }
    }


}


export const WebSocketWhiteboardStateProvider = ({ children }: Props) => {
    console.log("WebSocket Whiteboard Provider rendering")
    const { sendWebSocketMessage, addEventListener, removeEventListener } = useWebSocketState()
    const [ drawingMode, setDrawingMode ] = useState("DISABLE" as DrawingMode)    
    const [ drawingDatas, setDrawingDatas ] = useState([] as DrawingData[])
    const [ drawingStroke, setDrawingStroke ] = useState("black")
    const { localUserId } = useAppState()

    const sender = DrawingDataBufferSender.getInstance()
    sender.sendWebSocketMessage = sendWebSocketMessage


    const sendDrawingData = (data:DrawingData) => {
        sender.addDrawindData(data)
        newDataHandler([data])
    }

    const receiveDrawingData = (mess: WebSocketMessage) => {
        if(mess.senderId!==localUserId){
            newDataHandler(mess.data as DrawingData[])
        }else{
            // console.log("my drawing!")
        }
    }

    const newDataHandler = (data: DrawingData[]) => {
        if(data.find(x=>x.drawingCmd==="CLEAR")){
            setDrawingDatas([])
        } else {
            setDrawingDatas([...drawingDatas, ...data])
        }
    }

    useEffect(()=>{
        addEventListener(TOPIC_NAME, receiveDrawingData)
        return ()=>{removeEventListener(TOPIC_NAME, receiveDrawingData)}
    })

    const providerValue = {
        sendDrawingData,
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

