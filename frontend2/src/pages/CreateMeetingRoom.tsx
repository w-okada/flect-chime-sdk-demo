import React from "react"
import { Container, Avatar, Typography, TextField, Button, Grid, Link, Box, CssBaseline, CircularProgress, FormControlLabel, Checkbox } from '@material-ui/core'
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@material-ui/core'
import { MeetingRoom } from '@material-ui/icons'
import { Copyright } from "../components/Copyright"
import { makeStyles } from '@material-ui/core/styles';
import routes from "../constants/routes"
import { useHistory } from "react-router-dom"
import { useSignInState } from "../providers/SignInStateProvider"
import { useAppState } from "../providers/AppStateProvider";
import { useMeetingState } from "../providers/MeetingStateProvider";
import { AVAILABLE_AWS_REGIONS, DEFAULT_REGION } from "../constants"
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
        backgroundColor: theme.palette.secondary.main,
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
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },

}));

export const CreateMeetingRoom = () => {
    const { userId, idToken, accessToken, refreshToken } = useAppState()
    const { meetingName, userName, region, setMeetingName, setUserName, setRegion, isLoading, createMeeting } = useMeetingState()
    const { handleSignOut } = useSignInState()
    const classes = useStyles();
    const history = useHistory();
    const {setMessage} = useMessageState()
    
    const onCreateMeetingClicked = () => {
        console.log(meetingName, region, userName)
        createMeeting(meetingName || "", "", region, userId, idToken, accessToken, refreshToken).then(()=>{
            setMessage("Info", "Room created", [`room created, please join.`] )                
            history.push(routes.ENTRANCE)
        }).catch((e:any)=>{
            setMessage("Exception", "Creating meeting room failed", [`room(${e.meetingName}) exist?: ${!e.created}`] )                
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

        <Container maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <MeetingRoom />
                </Avatar>

                <Typography variant="h4">
                    Create Meeting
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

                    <FormControl className={classes.formControl}>
                        <InputLabel>Region</InputLabel>
                        <Select value={region} onChange={(e: any) => setRegion(e.target.value)}>
                            <MenuItem disabled value="Video">
                                <em>Region</em>
                            </MenuItem>
                            {Object.keys(AVAILABLE_AWS_REGIONS).map(key => {
                                return <MenuItem value={key} key={key} >{AVAILABLE_AWS_REGIONS[key]}</MenuItem>
                            })}
                        </Select>
                    </FormControl>


                    {
                        isLoading ?
                            <CircularProgress />
                            :
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                                onClick={onCreateMeetingClicked}
                            >
                                Create Meeting
                        </Button>

                    }
                    <Grid container direction="column" >
                        <Grid item xs>
                            <Link onClick={(e: any) => { history.push(routes.ENTRANCE) }}>
                                Join Room
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
