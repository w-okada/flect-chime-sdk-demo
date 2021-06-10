import React, { useMemo, useState } from 'react';
import { Button, makeStyles, TextField, Typography, withStyles } from '@material-ui/core';
import { useAppState } from '../../../providers/AppStateProvider';
import classes from '*.module.sass';
import { blueGrey } from '@material-ui/core/colors';



const useStyles = makeStyles((theme) => ({
    input_amongus: {
        color: blueGrey[400],
    },
    message:{
        width: "100%", 
        textAlign: 'left', 
        wordWrap: "break-word", 
        whiteSpace: "normal",
        color:blueGrey[100]
    },
    sendButton:{
        textAlign: 'right',
    },
}));

const CustomTextField = withStyles({
    root: {
        '& input:valid + fieldset': {
            borderColor: blueGrey[100],
            borderWidth: 1,
        },
        '& input:invalid + fieldset': {
            borderColor: blueGrey[100],
            borderWidth: 1,
        },
        '& input:valid:focus + fieldset': {
            borderColor: blueGrey[100],
            borderLeftWidth: 6,
            // padding: '4px !important', 
        },
        '& input:valid:hover + fieldset': {
            borderColor: blueGrey[100],
            borderLeftWidth: 6,
            // padding: '4px !important', 
        },
        '& input:invalid:hover + fieldset': {
            borderColor: blueGrey[100],
            borderLeftWidth: 6,
            color: blueGrey[300]
            // padding: '4px !important', 
        },
        '& label.Mui-focused': {
            color: blueGrey[100],
        },
        '& label.MuiInputLabel-root': {
            color: blueGrey[100],
        },
    },
})(TextField);


export const ChatArea = () => {
    const classes = useStyles()
    const { chatData, sendChatData, getUserNameByAttendeeIdFromList } = useAppState()
    const [message, setMessage] = useState("")

    const sendMessage = () => {
        setMessage("")
        sendChatData(message)
    }

    const messageList = useMemo(()=>{
        const messages = chatData.slice(-8).map(x=>{
            const name = getUserNameByAttendeeIdFromList(x.senderId)
            const date = new Date(x.createdDate).toLocaleTimeString()
            const mess = (x.data as string).split("\n").map(l =>{return <>{l}</>})
            return(
                <div style={{display:"flex", flexDirection:"column"}}>
                    <div style={{color:blueGrey[300]}}>
                        {name}
                    </div>
                    <div className={classes.message} style={{marginLeft:"5px"}}>
                        {mess}
                    </div>
                </div>
            )
        })
        return(
            <>
                {messages}
            </>
        )
    },[chatData])

    return (
        <> 
            <div style={{color:"burlywood"}}>
                Message...
            </div>
            <div style={{marginLeft:"15pt"}}>

                <div>
                    {messageList}
                    <div>
                        <CustomTextField
                            required
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            label=""
                            autoComplete="email"
                            autoFocus
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            InputProps={{
                                className: classes.input_amongus,
                            }}
                            onKeyPress={e => {
                                if (e.key === 'Enter') {
                                    sendMessage()
                                }
                            }}
                        />
                    </div>
                    <div>
                        <Button variant="outlined" color="primary" size="small" onClick={sendMessage}>
                            send
                        </Button>
                    </div>
                </div>
            </div>
        </>

    );
}