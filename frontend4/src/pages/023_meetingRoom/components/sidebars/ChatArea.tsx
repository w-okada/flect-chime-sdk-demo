import React, { useMemo, useState } from 'react';
import { Button, TextField, Typography } from '@material-ui/core';
import { useAppState } from '../../../../providers/AppStateProvider';
import { useStyles } from './css';



export const ChatArea = () => {
    const classes = useStyles();
    // const { chatData, sendChatData, getUserNameByAttendeeIdFromList } = useAppState()
    const [message, setMessage] = useState("")

    const { chimeClient } = useAppState()

    const sendMessage = () => {
        chimeClient?.sendMessage(message)
        setMessage("")
    }

    const chatViewArea = useMemo(()=>{
        return(
            <div className={classes.messageArea}>
                {
                    chimeClient?.chatData.map((d, i) => {
                        return (
                            <div key={`mes${i}`} className={classes.message}>
                                <Typography className={classes.title} color="textSecondary">
                                    {chimeClient.getUserNameByAttendeeIdFromList(d.senderId)}, {new Date(d.createdDate).toLocaleTimeString()}
                                </Typography>
                                {(d.data as string).split("\n").map((l,j) => { return <div key={`detail${j}`}>{l}</div> })}
                            </div>
                        )
                    })
                }
            </div>            
        )
    },[chimeClient?.chatData]) // eslint-disable-line



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