import { Button, Slider, Tooltip, Typography } from "@material-ui/core";
import React from "react";
import {FiberManualRecord, RadioButtonUnchecked } from '@material-ui/icons'
import { useAppState } from "../../../../providers/AppStateProvider";
import { useStyles } from "./css";

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
    // const classes = useStyles();
    // const {setDrawingStroke, setDrawingMode, setLineWidth, drawingMode, drawingStroke, lineWidth, addDrawingData} = useAppState()
    
    

    // return (
    //     <div className={classes.root}>
    //         <Typography className={classes.title} color="textSecondary">
    //             This feature can be used currently only in 'Feature View'.
    //         </Typography>
    //         <Typography className={classes.title} color="textSecondary">
    //             Color and Erase
    //         </Typography>
    //         {colors.map((color) => (
    //             <Tooltip title={color} key={color} >
    //                 <FiberManualRecord className={drawingMode==="DRAW" &&drawingStroke===color?classes.selectedColor:classes.color} style={{color:color}} onClick={()=>{
    //                     setDrawingStroke(color)
    //                     setDrawingMode("DRAW")
    //                 }}/>
    //             </Tooltip>
    //         ))}
    //         <span className={classes.margin} />
    //         <Tooltip title="erase" >
    //             <RadioButtonUnchecked className={drawingMode==="ERASE"?classes.selectedColor:classes.color} style={{color:"black"}} onClick={()=>{
    //                     setDrawingMode("ERASE")
    //                 }}/>
    //         </Tooltip>
    //         <div className={classes.volumeControl}>
    //             linewidth
    //             <div className={classes.margin} />
    //             <Slider value={lineWidth} onChange={(e,v)=>{setLineWidth( Array.isArray(v) ? v[0] : v)}} min={1} max={20} step={1} />
    //             <div className={classes.margin} />
    //         </div>
    //         <Button variant="outlined" size="small" color="primary" className={classes.margin}  onClick={() => {
    //         const drawingData: DrawingData = {
    //                 drawingCmd: "CLEAR",
    //                 startXR: 0,
    //                 startYR: 0,
    //                 endXR: 0,
    //                 endYR: 0,
    //                 stroke: "black",
    //                 lineWidth: 2
    //             }
    //             if(addDrawingData){
    //                 addDrawingData(drawingData)
    //             }else{
    //                 console.log("[WhiteboardPanel] addDrawingData is undefined",addDrawingData)
    //             }
    //         }}>
    //             Clear
    //         </Button>
    //     </div>
    // );

    return(<></>)
}