import React, { useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {  useMeetingState } from '../providers/MeetingStateProvider';
import { Button, TextField, Tooltip, Typography } from '@material-ui/core';
import { useRealitimeSubscribeChatState } from '../providers/realtime/RealtimeSubscribeChatProvider';
import { RadioButtonUnchecked, FiberManualRecord } from '@material-ui/icons'
import { DrawingData, useWebSocketWhiteboardState } from '../providers/websocket/WebScoketWhiteboardProvider';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            height: '100%',

        },
        container: {
            maxHeight: `calc(100% - 10px)`,
        },
        paper: {
            width: '100%',
            marginBottom: theme.spacing(2),
            maxHeight: `calc(100% - 10px)`,
            orverflow: 'scroll',

        },
        margin: {
            margin: theme.spacing(1),
        },
        title: {
            fontSize: 14,
        },
        selectedColor:{
            border: "1px solid",
            borderRadius: "4px",
        },
        color:{
        }
    }),
);

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
    const { chatData, sendChatData } = useRealitimeSubscribeChatState()
    const [message, setMessage] = useState("")
    const {setDrawingMode, setDrawingStroke, drawingStroke, drawingMode, sendDrawingData} = useWebSocketWhiteboardState()
    
    const sendMessage = () => {
        sendChatData(message)
        setMessage("")
    }

    return (
        <div style={{ height: '100%', width: "100%", wordWrap: "break-word", whiteSpace: "normal" }}>
            <Typography className={classes.title} color="textSecondary">
                Color and Erase
            </Typography>
            {colors.map((color) => (
                <Tooltip title={color} key={color} >
                    <FiberManualRecord className={drawingMode==="DRAW" &&drawingStroke===color?classes.selectedColor:classes.color} style={{color:color}} onClick={()=>{
                        setDrawingStroke(color)
                        setDrawingMode("DRAW")
                    }}/>
                </Tooltip>
            ))}
            <span style={{width:"10px"}}> </span>
            <Tooltip title="erase" >
                <RadioButtonUnchecked className={drawingMode==="ERASE"?classes.selectedColor:classes.color} style={{color:"black"}} onClick={()=>{
                        setDrawingMode("ERASE")
                    }}/>
            </Tooltip>

            <Typography className={classes.title} color="textSecondary">
                Clear
            </Typography>
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
                sendDrawingData(drawingData)
            }}>
                Clear
            </Button>

        </div>
    );
}