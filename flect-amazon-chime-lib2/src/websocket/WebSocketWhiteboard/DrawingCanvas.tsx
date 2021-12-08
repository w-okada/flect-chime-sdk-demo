import { useEffect, useMemo, useState } from "react";
import { DrawingHelper } from "./DrawingHelper";
import { DrawingData, WebSocketWhiteboardClient } from "./WebSocketWhiteboardClient";
type DrawingCanvasProps = {
    // chimeClient: FlectChimeClient;
    whiteboardClient: WebSocketWhiteboardClient;
    canvasId?: string;
    width: number;
    height: number;
};
export const DrawingCanvas = (props: DrawingCanvasProps) => {
    const whiteboardClient = props.whiteboardClient;
    const canvasId = props.canvasId || "drawing-canvas00000";
    const drawingHelper = useMemo(() => {
        return new DrawingHelper(canvasId, whiteboardClient);
    }, []); // eslint-disable-line
    const [_lastUpdateTime, setLastUpdateTime] = useState(0);

    useEffect(() => {
        const updateWhiteboardData = (data: DrawingData[]) => {
            setLastUpdateTime(new Date().getTime());
        };
        whiteboardClient.addWhiteboardDataUpdateListener(updateWhiteboardData);
        return () => {
            whiteboardClient.removeWhiteboardDataUpdateListener(updateWhiteboardData);
        };
    });

    // Set Drawing Listeners
    useEffect(() => {
        console.log("[DrawableVideoTile] add listeners");
        const canvasElement = document.getElementById(canvasId)! as HTMLCanvasElement;
        canvasElement.addEventListener("mousedown", drawingHelper.drawingStart, { passive: false });
        canvasElement.addEventListener("mouseup", drawingHelper.drawingEnd, { passive: false });
        canvasElement.addEventListener("mouseleave", drawingHelper.drawingEnd, { passive: false });
        canvasElement.addEventListener("mousemove", drawingHelper.drawing, { passive: false });

        canvasElement.addEventListener("touchstart", drawingHelper.touchStart, { passive: false });
        canvasElement.addEventListener("touchend", drawingHelper.touchEnd, { passive: false });
        canvasElement.addEventListener("touchmove", drawingHelper.touchMove, { passive: false });
    }, []); // eslint-disable-line

    // Apply Drawing Data
    useEffect(() => {
        console.log("[DrawableVideoTile] apply DrawingData");
        const canvasElement = document.getElementById(canvasId)! as HTMLCanvasElement;
        const ctx = canvasElement.getContext("2d")!;
        // ctx.strokeStyle = drawingStroke
        // ctx.lineWidth   = lineWidth
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        console.log("[DrawableVideoTile] apply DrawingData----", whiteboardClient.drawingData);
        whiteboardClient.drawingData.forEach((data) => {
            if (data.drawingCmd === "DRAW" && data.canvasId && (data.canvasId.indexOf(canvasId) >= 0 || canvasId.indexOf(data.canvasId) >= 0)) {
                ctx.beginPath();
                ctx.moveTo(data.startXR * canvasElement.width, data.startYR * canvasElement.height);
                ctx.lineTo(data.endXR * canvasElement.width, data.endYR * canvasElement.height);
                ctx.strokeStyle = data.stroke;
                ctx.lineWidth = data.lineWidth;
                ctx.stroke();
                ctx.closePath();
            } else if (data.drawingCmd === "ERASE" && data.canvasId && (data.canvasId.indexOf(canvasId) >= 0 || canvasId.indexOf(data.canvasId) >= 0)) {
                const startX = data.startXR * canvasElement.width - data.lineWidth / 2;
                const startY = data.startYR * canvasElement.height - data.lineWidth / 2;
                ctx.clearRect(startX, startY, data.lineWidth, data.lineWidth);
            } else if (data.drawingCmd === "CLEAR") {
                ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            }
        });
    }, [whiteboardClient.drawingData, props.width, props.height]); // eslint-disable-line
    return (
        <div style={{ width: "100%", height: "100%" }}>
            <canvas id={canvasId} width={props.width} height={props.height} style={{ width: "100%", height: "100%" }} />
        </div>
    );
};
