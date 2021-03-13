import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, makeStyles } from "@material-ui/core";
import { ErrorOutline, Info} from "@material-ui/icons";
import React from "react";
import { useMessageState } from "../providers/MessageStateProvider";



const useStyles = makeStyles((theme) => ({
  avatarForInformation: {
    marginTop: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    //color: theme.palette.primary.main,
    margin: "auto",
  },
  avatarForException: {
    marginTop: theme.spacing(2),
    backgroundColor: theme.palette.secondary.main,
    margin: "auto",
  },
}));


export const MessageDialog = () =>{
    const { messageActive, message, resolve } = useMessageState()
    const classes = useStyles();
    return(
      <>
        {messageActive && (
          <>
            <Dialog open={messageActive} onClose={resolve}>
              {
                message?.type==="Info"?
                <Avatar className={classes.avatarForInformation}> 
                  <Info />
                </Avatar>              
                :
                <Avatar className={classes.avatarForException}> 
                  <ErrorOutline />
                </Avatar>              

              }
              <DialogTitle >
 
                {message?.title }

              </DialogTitle>
              <DialogContent>
                {
                  message?.detail.map((d,i)=>{
                    return(
                      <DialogContentText key={i}>
                        {d}
                      </DialogContentText>

                    )
                })}
              </DialogContent>
              <DialogActions>
                <Button onClick={resolve} color="primary">
                  OK
                </Button>
              </DialogActions>
            </Dialog>          
          
          </>
        )}
      </>
    )
  }
  