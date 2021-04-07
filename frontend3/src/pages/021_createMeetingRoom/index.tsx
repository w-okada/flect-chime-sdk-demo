import { Avatar, Box, Button, CircularProgress, Container, CssBaseline, FormControl, Grid, InputLabel, Link, makeStyles, MenuItem, Select, TextField, Typography } from '@material-ui/core';
import { MeetingRoom } from '@material-ui/icons'
import React, { useState } from 'react';
import { AVAILABLE_AWS_REGIONS, DEFAULT_REGION } from '../../constants';
import { useAppState } from '../../providers/AppStateProvider';
import { Copyright } from '../000_common/Copyright';

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
}));

export const CreateMeetingRoom = () => {
    const classes = useStyles();
    const { userId, handleSignOut, setStage, setMessage, createMeeting} = useAppState()
    const [meetingName, setMeetingName] = useState("")
    const [region, setRegion] = useState(DEFAULT_REGION)
    const [isLoading, setIsLoading] = useState(false)

    const onCreateMeetingClicked = () => {
        setIsLoading(true)
        createMeeting(meetingName || "", "", region).then(()=>{
            setMessage("Info", "Room created", [`room created, please join.`] )
            
            setIsLoading(false)
            setStage("ENTRANCE")
        }).catch((e:any)=>{
            setMessage("Exception", "Creating meeting room failed", [`room(${e.meetingName}) exist?: ${!e.created}`] )                
            setIsLoading(false)
        })
    }

    return (

        <Container maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper} style={{overflow:'auto'}}>
                <Avatar className={classes.avatar}>
                    <MeetingRoom />
                </Avatar>

                <Typography variant="h4">
                    Create Meeting
                </Typography>
                <form className={classes.form}>
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
                    <Grid container direction="column" alignItems="center" >

                        <FormControl className={classes.formControl} >
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
                    </Grid>

                    <Grid container direction="column" >
                        <Grid item xs>
                            <Link onClick={(e: any) => { setStage("ENTRANCE") }}>
                                Join Room
                            </Link>
                        </Grid>
                        <Grid item xs>
                            <Link onClick={(e: any) => { handleSignOut(userId!); setStage("SIGNIN") }}>
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
