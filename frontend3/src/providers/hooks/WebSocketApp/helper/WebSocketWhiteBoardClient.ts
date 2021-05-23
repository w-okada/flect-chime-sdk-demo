import { Logger } from "amazon-chime-sdk-js";
import { Semaphore } from "await-semaphore";
import { WebSocketClient, WebSocketMessage } from "./WebSocketClient";

export const DrawingCmd = {
    DRAW:"DRAW",
    ERASE:"ERASE",
    CLEAR:"CLEAR",
    SYNC_SCREEN:"SYNC_SCREEN",
} as const

export type DrawingData = {
    drawingCmd: keyof typeof DrawingCmd
    startXR: number
    startYR: number
    endXR: number
    endYR: number
    stroke: string
    lineWidth: number
    canvasId?: string
}

const TOPIC_NAME = "WHITEBOARD"
const SEND_INTERVAL_TIME = 1000
const SEND_INTERVAL_NUM  = 100



export class WebSocketWhiteBoardClient{
    private semaphore = new Semaphore(1);
    private drawingDataBuffer:DrawingData[] =[]
    private wsClient:WebSocketClient

    constructor(attendeeId:string, messagingURLWithQuery:string, logger:Logger, recreate:()=>void){
        this.wsClient = new WebSocketClient(attendeeId, messagingURLWithQuery, logger, recreate)
        this.wsClient.connect()
        this.startMonitor()
    }

    addEventListener = (f:(wsMessage:WebSocketMessage[]) => void) =>{
        this.wsClient.addEventListener(TOPIC_NAME, f)
    }
    removeEventListener = (f:(wsMessage:WebSocketMessage[])=>void) =>{
        this.wsClient.removeEventListener(TOPIC_NAME, f)
    }
 
    addDrawindData = (data:DrawingData) => {
        // loopback
        this.wsClient.loopbackMessage(TOPIC_NAME, [data])

        // send
        this.semaphore.acquire().then(release=>{
            this.drawingDataBuffer.push(data)
            if(this.drawingDataBuffer.length > SEND_INTERVAL_NUM){
                this.sendDrawingBuffer()
            }
            release()
        })
    }

    startMonitor = () =>{
        // console.log("startMonitor")
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
        this.wsClient.sendMessage(TOPIC_NAME, this.drawingDataBuffer)
        this.drawingDataBuffer = []
    }
}