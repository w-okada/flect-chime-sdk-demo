import { Avatar, Box, Button, CircularProgress, Container, CssBaseline, Grid, Link, Typography } from "@material-ui/core";
import React, { useState } from "react";
import { Copyright } from "../000_common/Copyright";
import { MeetingRoom } from "@material-ui/icons";
import { useAppState } from "../../providers/AppStateProvider";
import { useAmongUsStyles, useStyles } from "../000_common/Style";
import { CustomTextField } from "../000_common/CustomTextField";

export const Entrance = () => {
    const { chimeClient, setMessage, setStage, mode } = useAppState();
    const [meetingName, setMeetingName] = useState(chimeClient?.meetingName || "");
    const [userName, setUserName] = useState(chimeClient?.userName || "");
    const [isLoading, setIsLoading] = useState(false);

    const classes_normal = useStyles();
    const classes_among = useAmongUsStyles();
    const classes = mode === "amongus" ? classes_among : classes_normal;

    const onJoinMeetingClicked = async () => {
        setIsLoading(true);
        try {
            await chimeClient?.joinMeeting(meetingName, userName);
            console.log("joined to meeting..");
            setIsLoading(false);
            setStage("WAITING_ROOM");
        } catch (e: any) {
            console.log(e);
            setMessage("Exception", "Enter Room Failed", [`${e.message}`, `(code: ${e.code})`]);
            setIsLoading(false);
        }
    };

    return (
        <Container maxWidth="xs" className={classes.root}>
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <MeetingRoom />
                </Avatar>

                <Typography variant="h4" className={classes.title}>
                    Join Meeting
                </Typography>
                <form className={classes.form} noValidate>
                    <CustomTextField
                        required
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        id="MeetingName"
                        name="MeetingName"
                        label="MeetingName"
                        autoFocus
                        value={meetingName}
                        onChange={(e) => setMeetingName(e.target.value)}
                        InputProps={{
                            className: classes.input,
                        }}
                    />

                    <CustomTextField
                        required
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        id="UserName"
                        name="UserName"
                        label="UserName"
                        onChange={(e) => setUserName(e.target.value)}
                        InputProps={{
                            className: classes.input,
                        }}
                    />

                    <Grid container direction="column" alignItems="center">
                        {isLoading ? (
                            <CircularProgress />
                        ) : (
                            <Button fullWidth variant="contained" color="primary" className={classes.submit} onClick={onJoinMeetingClicked} id="submit">
                                Join Meeting
                            </Button>
                        )}
                    </Grid>
                    <Grid container direction="column">
                        <Grid item xs>
                            <Link
                                onClick={(e: any) => {
                                    setStage("CREATE_MEETING_ROOM");
                                }}
                            >
                                Create Room
                            </Link>
                        </Grid>
                        <Grid item xs>
                            <Link
                                onClick={(e: any) => {
                                    chimeClient?.leaveMeeting();
                                    setStage("SIGNIN");
                                }}
                            >
                                Sign out
                            </Link>
                        </Grid>
                    </Grid>
                    <Box mt={8}>
                        <Copyright />
                    </Box>
                </form>
            </div>
        </Container>
    );
};
