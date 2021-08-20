import { Button, Slider, Tooltip, Typography } from "@material-ui/core";
import React, { useState } from "react";
import {FiberManualRecord, RadioButtonUnchecked } from '@material-ui/icons'
import { useAppState } from "../../../../providers/AppStateProvider";
import { useStyles } from "./css";
import { DrawingData } from "@dannadori/flect-amazon-chime-lib";

const colors = [
    'red',
    'orange',
    'olive',
    'green',
    'teal',
    'blue',
    'violet',
    'purple',
    'pink',
    'brown',
    'grey',
    'black',
]

export const WhiteboardPanel = () => {
    const classes = useStyles();
    // const {setDrawingStroke, setDrawingMode, setLineWidth, drawingMode, drawingStroke, lineWidth, addDrawingData} = useAppState()
    const [ guiUpdateCount, setGuiUpdateCount] = useState(0)
    const { whiteboardClient } = useAppState()

    return (
        <div className={classes.root}>
            <Typography className={classes.title} color="textSecondary">
                This feature can be used currently only in 'Feature View'.
            </Typography>
            <Typography className={classes.title} color="textSecondary">
                Color and Erase
            </Typography>
            {colors.map((color) => (
                <Tooltip title={color} key={color} >
                    <FiberManualRecord 
                        className={whiteboardClient?.drawingMode === "DRAW" && whiteboardClient.drawingStroke === color ? classes.selectedColor : classes.color}
                        style={{color:color}}
                        onClick={()=>{
                            if(whiteboardClient){
                                whiteboardClient.drawingMode = "DRAW"
                                whiteboardClient.drawingStroke = color
                            }
                            setGuiUpdateCount(guiUpdateCount+1)
                        }
                    }/>
                </Tooltip>
            ))}
            <span className={classes.margin} />
            <Tooltip title="erase" >
                <RadioButtonUnchecked 
                    className={whiteboardClient?.drawingMode === "ERASE" ? classes.selectedColor : classes.color}
                    style={{color:"black"}} onClick={()=>{
                        if(whiteboardClient){
                            whiteboardClient.drawingMode = "ERASE"
                        }
                        setGuiUpdateCount(guiUpdateCount+1)

                    }}/>
            </Tooltip>
            <div className={classes.volumeControl}>
                linewidth
                <div className={classes.margin} />
                <Slider value={whiteboardClient?.lineWidth} 
                onChange={(e,v)=>{
                    if(whiteboardClient){
                        whiteboardClient.lineWidth = Array.isArray(v) ? v[0] : v
                    }
                    setGuiUpdateCount(guiUpdateCount+1)

                }}
                min={1} max={20} step={1} 
                />
                <div className={classes.margin} />
            </div>
            <Button variant="outlined" size="small" color="primary" className={classes.margin}  onClick={() => {
                const drawingData: DrawingData = {
                    drawingCmd: "CLEAR",
                    startXR: 0,
                    startYR: 0,
                    endXR: 0,
                    endYR: 0,
                    stroke: "black",
                    lineWidth: 2
                }
                if(whiteboardClient){
                    whiteboardClient.addDrawingData(drawingData)
                }else{
                    console.log("[WhiteboardPanel] addDrawingData is undefined")
                }
                setGuiUpdateCount(guiUpdateCount+1)

            }}>
                Clear
            </Button>
        </div>
    );

}