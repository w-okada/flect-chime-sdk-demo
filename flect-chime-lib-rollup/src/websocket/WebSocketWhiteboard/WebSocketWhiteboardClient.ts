import { Logger } from "amazon-chime-sdk-js";
import { WebSocketClient, WebSocketMessage } from "../WebSocketClient";
var AsyncLock = require('async-lock');

export const DrawingCmd = {  // for DrawingData.
    DRAW:"DRAW",
    ERASE:"ERASE",
    CLEAR:"CLEAR",
    SYNC_SCREEN:"SYNC_SCREEN",
} as const

export const DrawingMode = { // for ClientState.
    DRAW:"DRAW",
    ERASE:"ERASE",
    DISABLE: "DISABLE"
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



export class WebSocketWhiteboardClient{
    lineWidth     = 3
    drawingStroke = "#aaaaaaaa"
    drawingMode   = DrawingMode.DISABLE
    drawingData:DrawingData[] = []

    lock = new AsyncLock();

    private drawingDataBuffer:DrawingData[] =[] // local buffer
    private wsClient:WebSocketClient

    constructor(attendeeId:string, messagingURLWithQuery:string, logger:Logger, recreate:()=>void){
        console.log(`[FlectChimeClient][WebSocketWhiteboardClient] ${attendeeId}, ${messagingURLWithQuery}`)
        this.wsClient = new WebSocketClient(attendeeId, messagingURLWithQuery, logger, recreate)
        this.wsClient.connect()
        this.startMonitor()

        this.wsClient.addEventListener(TOPIC_NAME, (wsMessages:WebSocketMessage[])=>{
            const newDrawingData = wsMessages.reduce<DrawingData[]>((sum:any[],cur:WebSocketMessage)=>{return [...sum, ...(cur.data as DrawingData[])]},[])
            this.drawingData = newDrawingData
            this._whiteboardDataUpdateListener(this.drawingData)
        })
    }

    private _whiteboardDataUpdateListener = (data: DrawingData[] ) =>{}
    setWhiteboardDataUpdateListener = ( l: ((data:DrawingData[]) =>void)) =>{
        this._whiteboardDataUpdateListener = l
    }

 
    addDrawingData = (data:DrawingData) => {
        // loopback
        this.wsClient.loopbackMessage(TOPIC_NAME, [data])

        this.lock.acquire('whiteboard',  async () => {
            // console.log(`[FlectChimeClient][WebSocketWhiteboardClient] addDrawingData`)

            this.drawingDataBuffer.push(data)
            if(this.drawingDataBuffer.length > SEND_INTERVAL_NUM){
                this.sendDrawingBuffer()
            }
            return 'Successful';
        }, (error:any, result:any) => {
            if(error) {
                console.log(`[FlectChimeClient][WebSocketWhiteboardClient] addDrawingData error`)
            }else {
                // console.log(`[FlectChimeClient][WebSocketWhiteboardClient] addDrawingData success`)
            }
        })

    }

    startMonitor = () =>{
        this.lock.acquire('whiteboard',  async () => {
            // console.log(`[FlectChimeClient][WebSocketWhiteboardClient] startMonitor`)

            if(this.drawingDataBuffer.length>0){
                this.sendDrawingBuffer()
            }
            setTimeout(this.startMonitor, SEND_INTERVAL_TIME)
            return 'Successful';
        }, (error:any, result:any) => {
            if(error) {
                console.log(`[FlectChimeClient][WebSocketWhiteboardClient] startMonitor error`)
            }else {
                // console.log(`[FlectChimeClient][WebSocketWhiteboardClient] startMonitor success`)
            }
        })
    }

    // Use this function under semaphore. (startMonitor, addDrawindData are known.)
    private sendDrawingBuffer = () => {
        this.wsClient.sendMessage(TOPIC_NAME, this.drawingDataBuffer)
        this.drawingDataBuffer = []
    }
}
