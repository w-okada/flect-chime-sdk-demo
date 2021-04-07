import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@material-ui/core";
import React from "react";
import { useAppState } from "../../../../providers/AppStateProvider";




type LeaveMeetingDialogProps = {
    open:boolean,
    onClose:()=>void
}


export const LeaveMeetingDialog = (props:LeaveMeetingDialogProps) =>{
    const {setStage, leaveMeeting} = useAppState()
    return(
        <Dialog disableBackdropClick disableEscapeKeyDown open={props.open} onClose={props.onClose} >
            <DialogTitle>Leave meeting</DialogTitle>
            <DialogContent>
                You are leaving meeting.
            </DialogContent>
            <DialogActions>
                <Button onClick={(e)=>{props.onClose();leaveMeeting();setStage("SIGNIN")}} color="primary">
                    Ok
                </Button>
                <Button onClick={props.onClose} color="secondary">
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    )    
}