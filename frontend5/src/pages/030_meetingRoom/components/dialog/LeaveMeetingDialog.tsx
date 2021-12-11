import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@material-ui/core";
import React from "react";
import { useAppState } from "../../../../providers/AppStateProvider";
import { STAGE } from "../../../../providers/hooks/useStageManager";

export const LeaveMeetingDialog = () => {
    const { setStage, chimeClientState, frontendState } = useAppState();
    return (
        <Dialog
            disableBackdropClick
            disableEscapeKeyDown
            open={frontendState.leaveDialogOpen}
            onClose={() => {
                frontendState.setLeaveDialogOpen(false);
            }}
        >
            <DialogTitle>Leave meeting</DialogTitle>
            <DialogContent>You are leaving meeting.</DialogContent>
            <DialogActions>
                <Button
                    onClick={(e) => {
                        chimeClientState.leaveMeeting();
                        frontendState.setLeaveDialogOpen(false);
                        setStage(STAGE.SIGNIN);
                    }}
                    color="primary"
                >
                    Ok
                </Button>
                <Button
                    onClick={() => {
                        frontendState.setLeaveDialogOpen(false);
                    }}
                    color="secondary"
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};
