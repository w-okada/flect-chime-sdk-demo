import React, { useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import { AttendeeState, useMeetingState } from '../providers/MeetingStateProvider';
import { Button, Card, CardActions, CardContent, CssBaseline, InputAdornment, Paper, TextField, Typography } from '@material-ui/core';
import { useRealitimeSubscribeChatState } from '../providers/realtime/RealtimeSubscribeChatProvider';
import { Chat } from '@material-ui/icons';


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
        width: '100%',
        height: '100%',

    },
    container:{
        maxHeight: `calc(100% - 10px)`,
    },
    paper: {
      width: '100%',
      marginBottom: theme.spacing(2),
      maxHeight: `calc(100% - 10px)`,
      orverflow:'scroll',

    },
    margin: {
      margin: theme.spacing(1),
    },
    title: {
      fontSize: 14,
    },
  }),
);


export const ChatArea =  () => {
  const classes = useStyles();
  const { chatData, sendChatData} = useRealitimeSubscribeChatState()
  const [ message, setMessage ] = useState("")
  const {getUserNameByAttendeeIdFromList} = useMeetingState()

  const sendMessage = () =>{
    sendChatData(message)
    setMessage("")
  }

  console.log("MESSAGE", chatData)

  return (
    <div style= {{ height: '100%', width: "100%"}}>
      <div style={{ height: '70%', width: "100%", overflow:'auto'}}>
        {
          chatData.map((d,i)=>{
            return(
              <div key={`mes${i}`} style={{ width: "100%", textAlign: 'left', wordWrap:"break-word", whiteSpace:"normal"}}>
                <Typography className={classes.title} color="textSecondary">
                  {getUserNameByAttendeeIdFromList(d.senderId)}
                </Typography>
                <Typography style={{  width: '100%', wordWrap:"break-word", whiteSpace:"normal"}}>
                  {(d.data as string).split("\n").map(l=>{return <div>{l}</div>}) }
                </Typography>
              </div>
            )
          })
        }
      </div>
      <div style={{margin:"10px"}}>
      </div>
      <div>
        <TextField
          id="outlined-multiline-static"
          label="Message"
          multiline
          rows={2}
          value={message}
          onChange={(e)=>{setMessage(e.target.value)}}
          variant="outlined"
        />
      </div>
      <div style={{ textAlign: 'right'}}>
        <Button variant="outlined" color="primary" size="small" onClick={sendMessage}>
          send
        </Button>
      </div>
    </div>
  );
}