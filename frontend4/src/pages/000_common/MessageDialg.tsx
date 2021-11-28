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
    const { messageActive, messageType, messageTitle, messageDetail, resolveMessage } = useAppState();
    const classes = useStyles();
    return (
        <>
            {messageActive && (
                <>
                    <Dialog open={messageActive} onClose={resolveMessage}>
                        {messageType === "Info" ? (
                            <Avatar className={classes.avatarForInformation}>
                                <Info />
                            </Avatar>
                        ) : (
                            <Avatar className={classes.avatarForException}>
                                <ErrorOutline />
                            </Avatar>
                        )}
                        <DialogTitle>{messageTitle}</DialogTitle>
                        <DialogContent>
                            {messageDetail.map((d, i) => {
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
