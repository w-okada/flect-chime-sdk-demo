import React, { useMemo, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {  useMeetingState } from '../providers/MeetingStateProvider';
import { Button, TextField, Typography } from '@material-ui/core';
import { useRealitimeSubscribeChatState } from '../providers/realtime/RealtimeSubscribeChatProvider';


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            height: '100%',

        },
        margin: {
            margin: theme.spacing(1),
        },
        sendButton:{
            textAlign: 'right',
        },
        title:{
            fontSize: "14"
        }
    }),
);


export const ChatArea = () => {
    const classes = useStyles();
    const { chatData, sendChatData } = useRealitimeSubscribeChatState()
    const [message, setMessage] = useState("")
    const { getUserNameByAttendeeIdFromList } = useMeetingState()

    const sendMessage = () => {
        sendChatData(message)
        setMessage("")
    }

    const chatViewArea = useMemo(()=>{
        return(
            <div style={{ height: '70%', width: "100%", overflow: 'auto' }}>
                {
                    chatData.map((d, i) => {
                        return (
                            <div key={`mes${i}`} style={{ width: "100%", textAlign: 'left', wordWrap: "break-word", whiteSpace: "normal" }}>
                                <Typography className={classes.title} color="textSecondary">
                                    {getUserNameByAttendeeIdFromList(d.senderId)}
                                </Typography>
                                {(d.data as string).split("\n").map((l,j) => { return <div key={`detail${j}`}>{l}</div> })}
                            </div>
                        )
                    })
                }
            </div>            
        )
    },[chatData])



    return (
        <div className={classes.root}>

            <div className={classes.margin}>
                {chatViewArea}
            </div>
            <div>
                <TextField
                    id="outlined-multiline-static"
                    label="Message"
                    multiline
                    rows={2}
                    value={message}
                    onChange={(e) => { setMessage(e.target.value) }}
                    variant="outlined"
                />
            </div>
            <div className={classes.sendButton}>
                <Button variant="outlined" color="primary" size="small" onClick={sendMessage}>
                    send
                </Button>
            </div>
        </div>
    );
}