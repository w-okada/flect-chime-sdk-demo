import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, makeStyles } from "@material-ui/core";
import React from "react";
import { ErrorOutline, Info } from "@material-ui/icons";
import { useAppState } from "../../providers/AppStateProvider";

const useStyles = makeStyles((theme) => ({
    avatarForInformation: {
        marginTop: theme.spacing(2),
        backgroundColor: theme.palette.primary.main,
        margin: "auto",
    },
    avatarForException: {
        marginTop: theme.spacing(2),
        backgroundColor: theme.palette.secondary.main,
        margin: "auto",
    },
}));

export const MessageDialog = () => {
    const { messageState, resolveMessage } = useAppState();
    const classes = useStyles();
    return (
        <>
            {messageState.messageActive && (
                <>
                    <Dialog open={messageState.messageActive} onClose={resolveMessage}>
                        {messageState.messageType === "Info" ? (
                            <Avatar className={classes.avatarForInformation}>
                                <Info />
                            </Avatar>
                        ) : (
                            <Avatar className={classes.avatarForException}>
                                <ErrorOutline />
                            </Avatar>
                        )}
                        <DialogTitle>{messageState.messageTitle}</DialogTitle>
                        <DialogContent>
                            {messageState.messageDetail.map((d, i) => {
                                return <DialogContentText key={i}>{d}</DialogContentText>;
                            })}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={resolveMessage} color="primary">
                                OK
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </>
    );
};
