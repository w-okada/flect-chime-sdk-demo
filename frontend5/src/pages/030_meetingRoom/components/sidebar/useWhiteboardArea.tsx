import React, { useMemo, useState } from "react";
import { Button, IconButton, Slider, TextField, Tooltip } from "@material-ui/core";
import { useAppState } from "../../../../providers/AppStateProvider";
import { FiberManualRecord, RadioButtonUnchecked } from "@material-ui/icons";
import { DrawingData } from "@dannadori/flect-amazon-chime-lib2";
const colors = ["red", "orange", "olive", "green", "teal", "blue", "violet", "purple", "pink", "brown", "grey", "black"];

export const useWhiteboardArea = () => {
    const { whiteboardClientState } = useAppState();
    const [_lastUpdateTime, setLastUpdateTime] = useState(0);

    const colorSelects = useMemo(() => {
        return colors.map((c) => {
            const selected = whiteboardClientState.whiteboardClient?.drawingMode === "DRAW" && whiteboardClientState.whiteboardClient.drawingStroke === c;
            return (
                <Tooltip title={c} key={c}>
                    <FiberManualRecord
                        style={{ color: c, border: selected ? "1px solid" : "" }}
                        onClick={() => {
                            if (whiteboardClientState.whiteboardClient) {
                                whiteboardClientState.whiteboardClient.drawingMode = "DRAW";
                                whiteboardClientState.whiteboardClient.drawingStroke = c;
                            }
                            setLastUpdateTime(new Date().getTime());
                        }}
                    />
                </Tooltip>
            );
        });
    }, [whiteboardClientState.whiteboardClient?.drawingMode, whiteboardClientState.whiteboardClient?.drawingStroke]);

    const eraseSelect = useMemo(() => {
        const selected = whiteboardClientState.whiteboardClient?.drawingMode === "ERASE";
        return (
            <Tooltip title="erase">
                <RadioButtonUnchecked
                    style={{ color: "black", border: selected ? "1px solid" : "" }}
                    onClick={() => {
                        if (whiteboardClientState.whiteboardClient) {
                            whiteboardClientState.whiteboardClient.drawingMode = "ERASE";
                        }
                        setLastUpdateTime(new Date().getTime());
                    }}
                />
            </Tooltip>
        );
    }, [whiteboardClientState.whiteboardClient?.drawingMode, whiteboardClientState.whiteboardClient?.drawingStroke]);

    const lineWidthSelect = useMemo(() => {
        return (
            <div style={{ display: "flex" }}>
                linewidth
                <Slider
                    value={whiteboardClientState.whiteboardClient?.lineWidth}
                    onChange={(e, v) => {
                        if (whiteboardClientState.whiteboardClient) {
                            whiteboardClientState.whiteboardClient.lineWidth = Array.isArray(v) ? v[0] : v;
                        }
                        setLastUpdateTime(new Date().getTime());
                    }}
                    min={1}
                    max={20}
                    step={1}
                />
            </div>
        );
    }, [whiteboardClientState.whiteboardClient?.lineWidth]);

    const clearButton = useMemo(() => {
        return (
            <Button
                variant="outlined"
                size="small"
                color="primary"
                onClick={() => {
                    const drawingData: DrawingData = {
                        drawingCmd: "CLEAR",
                        startXR: 0,
                        startYR: 0,
                        endXR: 0,
                        endYR: 0,
                        stroke: "black",
                        lineWidth: 2,
                    };
                    if (whiteboardClientState.whiteboardClient) {
                        whiteboardClientState.whiteboardClient.addDrawingData(drawingData);
                    } else {
                        console.log("[WhiteboardPanel] addDrawingData is undefined");
                    }
                    setLastUpdateTime(new Date().getTime());
                }}
            >
                Clear
            </Button>
        );
    }, []);

    const whiteboardArea = useMemo(() => {
        return (
            <div id="whiteboardArea" style={{ display: "flex", flexDirection: "column", width: "100%", maxHeight: "100%", wordBreak: "break-all", overflow: "auto", background: "#ffffffaa" }}>
                <div>{colorSelects}</div>
                <div>{eraseSelect}</div>
                <div>{lineWidthSelect}</div>
                <div>{clearButton}</div>
            </div>
        );
    }, [colorSelects, eraseSelect, lineWidthSelect, clearButton]);

    return { whiteboardArea };
};
