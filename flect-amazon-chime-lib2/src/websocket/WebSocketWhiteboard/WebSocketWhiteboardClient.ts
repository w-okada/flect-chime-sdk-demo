import { Logger } from "amazon-chime-sdk-js";
import { WebSocketClient, WebSocketMessage } from "../WebSocketClient";
import AsyncLock from "async-lock";

export const DrawingCmd = {
    // for DrawingData.
    DRAW: "DRAW",
    ERASE: "ERASE",
    CLEAR: "CLEAR",
    SYNC_SCREEN: "SYNC_SCREEN",
} as const;
type DrawingCmd = typeof DrawingCmd[keyof typeof DrawingCmd];

export const DrawingMode = {
    // for ClientState.
    DRAW: "DRAW",
    ERASE: "ERASE",
    DISABLE: "DISABLE",
} as const;
type DrawingMode = typeof DrawingMode[keyof typeof DrawingMode];

type WhiteboardClientListener = (data: DrawingData[]) => void;

export type DrawingData = {
    drawingCmd: DrawingCmd;
    startXR: number;
    startYR: number;
    endXR: number;
    endYR: number;
    stroke: string;
    lineWidth: number;
    canvasId?: string;
};

const TOPIC_NAME = "WHITEBOARD";
const SEND_INTERVAL_TIME = 1000;
const SEND_INTERVAL_NUM = 100;

export class WebSocketWhiteboardClient {
    lineWidth = 3;
    drawingStroke = "#aaaaaaaa";
    drawingMode: DrawingMode = DrawingMode.DISABLE;
    drawingData: DrawingData[] = [];

    private _whiteboardDataUpdateListeners: WhiteboardClientListener[] = [];

    lock = new AsyncLock();

    private drawingDataBuffer: DrawingData[] = []; // local buffer
    private wsClient: WebSocketClient;

    constructor(attendeeId: string, messagingURLWithQuery: string) {
        console.log(`[FlectChimeClient][WebSocketWhiteboardClient] creating.. ${attendeeId}, ${messagingURLWithQuery}`);
        this.wsClient = new WebSocketClient(attendeeId, messagingURLWithQuery);
        this.wsClient.connect();
        this.startMonitor();

        this.wsClient.addEventListener(TOPIC_NAME, (wsMessages: WebSocketMessage[]) => {
            this.drawingData = wsMessages.reduce((sum: DrawingData[], cur: WebSocketMessage) => {
                return [...sum, ...(cur.data as DrawingData[])];
            }, []);
            this._whiteboardDataUpdateListeners.forEach((listener) => {
                listener(this.drawingData);
            });
        });
    }

    addWhiteboardDataUpdateListener = (l: WhiteboardClientListener) => {
        this._whiteboardDataUpdateListeners.push(l);
    };
    removeWhiteboardDataUpdateListener = (l: WhiteboardClientListener) => {
        this._whiteboardDataUpdateListeners = this._whiteboardDataUpdateListeners.filter((x) => {
            return x !== l;
        });
    };

    addDrawingData = (data: DrawingData) => {
        // ローカルには即反映
        this.wsClient.loopbackMessage(TOPIC_NAME, [data]);

        // リモートにはバッファリングして送信
        this.lock.acquire(
            "whiteboard",
            async () => {
                this.drawingDataBuffer.push(data);
                if (this.drawingDataBuffer.length > SEND_INTERVAL_NUM) {
                    this.sendDrawingBuffer();
                }
                return "Successful";
            },
            (error: any, result: any) => {
                if (error) {
                    console.log(`[FlectChimeClient][WebSocketWhiteboardClient] addDrawingData error`);
                } else {
                    // console.log(`[FlectChimeClient][WebSocketWhiteboardClient] addDrawingData success`)
                }
            }
        );
    };

    startMonitor = () => {
        this.lock.acquire(
            "whiteboard",
            async () => {
                // console.log(`[FlectChimeClient][WebSocketWhiteboardClient] startMonitor`)

                if (this.drawingDataBuffer.length > 0) {
                    this.sendDrawingBuffer();
                }
                setTimeout(this.startMonitor, SEND_INTERVAL_TIME);
                return "Successful";
            },
            (error: any, result: any) => {
                if (error) {
                    console.log(`[FlectChimeClient][WebSocketWhiteboardClient] startMonitor error`);
                } else {
                    // console.log(`[FlectChimeClient][WebSocketWhiteboardClient] startMonitor success`)
                }
            }
        );
    };

    // Use this function under semaphore. (startMonitor, addDrawindData are known.)
    private sendDrawingBuffer = () => {
        this.wsClient.sendMessage(TOPIC_NAME, this.drawingDataBuffer);
        this.drawingDataBuffer = [];
    };
}
