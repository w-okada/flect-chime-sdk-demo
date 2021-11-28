import { DrawingData, WebSocketWhiteboardClient } from "./WebSocketWhiteboardClient";

const THROTTLE_MSEC = 20;

export class DrawingHelper {
    private inDrawing = false;
    private previousPosition = [0, 0];
    private lastSendingTime = 0;
    // private _drawingStroke = ""
    // private _lineWidth = 3
    // private _drawingMode:keyof typeof DrawingMode = "DISABLE"
    // set drawingStroke(val:string){this._drawingStroke = val}
    // set lineWidth(val:number){this._lineWidth = val}
    // set drawingMode(val:keyof typeof DrawingMode){
    //     console.log("change drawing mode", val)
    //     this._drawingMode = val
    // }

    private canvasId;
    private client;
    constructor(canvasId: string, client: WebSocketWhiteboardClient) {
        this.canvasId = canvasId;
        this.client = client;
    }

    drawingStart = (e: MouseEvent) => {
        this.inDrawing = true;
        this.previousPosition = [e.offsetX, e.offsetY];
    };
    drawingEnd = (e: MouseEvent) => {
        this.inDrawing = false;
    };
    drawing = (e: MouseEvent) => {
        if (Date.now() - this.lastSendingTime < THROTTLE_MSEC) {
            return;
        }
        if (this.inDrawing) {
            const startX = this.previousPosition[0];
            const startY = this.previousPosition[1];
            const endX = e.offsetX;
            const endY = e.offsetY;
            const drawingData = this.generateDrawingData(e, startX, startY, endX, endY);
            this.lastSendingTime = Date.now();
            this.previousPosition = [e.offsetX, e.offsetY];
            this.client.addDrawingData!(drawingData);
        }
    };
    private generateDrawingData = (e: MouseEvent | TouchEvent, startX: number, startY: number, endX: number, endY: number) => {
        const source = e.target as HTMLCanvasElement;
        const cs = getComputedStyle(source);
        const width = parseInt(cs.getPropertyValue("width"));
        const height = parseInt(cs.getPropertyValue("height"));
        const rateX = width / source.width;
        const rateY = height / source.height;

        let drawingData: DrawingData;
        if (rateX > rateY) {
            // widthにあまりがある
            const trueWidth = source.width * rateY;
            const trueHeight = source.height * rateY;
            const restW = (width - trueWidth) / 2;

            const startXR = (startX - restW) / trueWidth;
            const startYR = startY / trueHeight;
            const endXR = (endX - restW) / trueWidth;
            const endYR = endY / trueHeight;

            console.log("drawingMode!!!", this.client.drawingMode, this.client.drawingMode === "DRAW" ? "DRAW" : "ERASE");
            drawingData = {
                drawingCmd: this.client.drawingMode === "DRAW" ? "DRAW" : "ERASE",
                startXR: startXR,
                startYR: startYR,
                endXR: endXR,
                endYR: endYR,
                stroke: this.client.drawingStroke,
                lineWidth: this.client.lineWidth,
                canvasId: this.canvasId,
            };
        } else {
            // heightにあまりがある
            const trueWidth = source.width * rateX;
            const trueHeight = source.height * rateX;
            const restH = (height - trueHeight) / 2;

            const startXR = startX / trueWidth;
            const startYR = (startY - restH) / trueHeight;
            const endXR = endX / trueWidth;
            const endYR = (endY - restH) / trueHeight;

            console.log("drawingMode!!!", this.client.drawingMode, this.client.drawingMode === "DRAW" ? "DRAW" : "ERASE");

            drawingData = {
                drawingCmd: this.client.drawingMode === "DRAW" ? "DRAW" : "ERASE",
                startXR: startXR,
                startYR: startYR,
                endXR: endXR,
                endYR: endYR,
                stroke: this.client.drawingStroke,
                lineWidth: this.client.lineWidth,
                canvasId: this.canvasId,
            };
        }
        return drawingData;
    };
    touchStart = (e: TouchEvent) => {
        this.inDrawing = true;
        const source = e.target as HTMLCanvasElement;
        const x = e.changedTouches[0].clientX - source.getBoundingClientRect().left;
        const y = e.changedTouches[0].clientY - source.getBoundingClientRect().top;
        this.previousPosition = [x, y];
    };
    touchEnd = (e: TouchEvent) => {
        this.inDrawing = false;
    };
    touchMove = (e: TouchEvent) => {
        e.preventDefault();
        const source = e.target as HTMLCanvasElement;
        if (Date.now() - this.lastSendingTime < THROTTLE_MSEC) {
            return;
        }
        if (this.inDrawing) {
            const startX = this.previousPosition[0];
            const startY = this.previousPosition[1];
            const endX = e.changedTouches[0].clientX - source.getBoundingClientRect().left;
            const endY = e.changedTouches[0].clientY - source.getBoundingClientRect().top;
            const drawingData = this.generateDrawingData(e, startX, startY, endX, endY);
            this.lastSendingTime = Date.now();
            this.previousPosition = [endX, endY];
            this.client.addDrawingData!(drawingData);
        }
    };
}
