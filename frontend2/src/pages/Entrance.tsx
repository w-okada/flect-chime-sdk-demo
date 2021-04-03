import React from "react"
import { Container, Avatar, Typography, TextField, Button, Grid, Link, Box, CssBaseline, CircularProgress } from '@material-ui/core'
import { MeetingRoom } from '@material-ui/icons'
import { Copyright } from "../components/Copyright"
import { makeStyles } from '@material-ui/core/styles';
import routes from "../constants/routes"
import { useHistory } from "react-router-dom"
import { useSignInState } from "../providers/SignInStateProvider"
import { useAppState } from "../providers/AppStateProvider";
import { useMeetingState } from "../providers/MeetingStateProvider";
import { useMessageState } from "../providers/MessageStateProvider"

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
    },
    form: {
        width: '100%',
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },

    formControl: {
        margin: theme.spacing(1),
        width: '100%'
        // minWidth: 120,
    },

    cameraPreview: {
        width: '50%'
    },
}));

export const Entrance = () => {
    const { userId, idToken, accessToken, refreshToken } = useAppState()
    const { meetingName, userName, setMeetingName, setUserName, isLoading, joinMeeting } = useMeetingState()
    const { handleSignOut } = useSignInState()
    const classes = useStyles()
    const history = useHistory()
    const {setMessage} = useMessageState()


    const onJoinMeetingClicked = () => {
        joinMeeting(meetingName || "", userName || "", userId, idToken, accessToken, refreshToken).then(()=>{
            history.push(routes.WAITING_ROOM)
        }).catch(e=>{
            console.log(e)
            setMessage("Exception", "Enter Room Failed", [`${e.message}`, `(code: ${e.code})`] )     
        })
    }

    const onSignOutClicked = () => {
        handleSignOut(userId).then(()=>{
            history.push(routes.HOME)
        }).catch(e=>{
            history.push(routes.HOME)
        })
    }

    return (
        <Container maxWidth="xs" >
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <MeetingRoom />
                </Avatar>

                <Typography variant="h4">
                    Join Meeting
                </Typography>
                <form className={classes.form} noValidate>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="MeetingName"
                        label="MeetingName"
                        name="MeetingName"
                        autoFocus
                        value={meetingName}
                        onChange={(e) => setMeetingName(e.target.value)}
                    />

                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="UserName"
                        label="UserName"
                        name="UserName"
                        // value={localUserId}
                        onChange={(e) => setUserName(e.target.value)}
                    />

                    {
                        isLoading ?
                            <CircularProgress />
                            :
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                                onClick={onJoinMeetingClicked}
                                id="submit"
                            >
                                Join Meeting
                        </Button>

                    }
                    <Grid container direction="column" >
                        <Grid item xs>
                            <Link onClick={(e: any) => { history.push(routes.CREATE_MEETING_ROOM) }}>
                                Create Room
                            </Link>
                        </Grid>
                        <Grid item xs>
                            <Link onClick={onSignOutClicked}>
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
    )
}
