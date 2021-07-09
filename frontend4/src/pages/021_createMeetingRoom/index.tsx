import { Avatar, Box, Button, CircularProgress, Container, CssBaseline, FormControl, Grid, InputLabel, Link, MenuItem, Select, Typography } from '@material-ui/core';
import { MeetingRoom } from '@material-ui/icons'
import React, { useState } from 'react';
import { AVAILABLE_AWS_REGIONS, DEFAULT_REGION } from '../../constants';
import { useAppState } from '../../providers/AppStateProvider';
import { Copyright } from '../000_common/Copyright';
import { CustomTextField } from '../000_common/CustomTextField';
import { useAmongUsStyles, useStyles } from '../000_common/Style';




export const CreateMeetingRoom = () => {
    const { chimeClient, setStage, setMessage, mode} = useAppState()
    const [meetingName, setMeetingName] = useState("")
    const [region, setRegion] = useState(DEFAULT_REGION)
    const [isLoading, setIsLoading] = useState(false)

    const classes_normal = useStyles()
    const classes_among = useAmongUsStyles()
    const classes = mode === "amongus" ? classes_among : classes_normal


    const onCreateMeetingClicked = async() => {
        setIsLoading(true)
        try{
            await chimeClient!.createMeeting(meetingName,region)
            setMessage("Info", "Room created", [`room created, please join.`] )
            setIsLoading(false)
            setStage("ENTRANCE")
        }catch(e){
            console.log(e)
            setMessage("Exception", "Creating meeting room failed", [`room(${e.meetingName}) exist?: ${!e.created}`] )                
            setIsLoading(false)
        }
    }

    return (
        <Container maxWidth="xs" className={classes.root}>
            <CssBaseline />
            <div className={classes.paper} style={{overflow:'auto'}}>
                <Avatar className={classes.avatar}>
                    <MeetingRoom />
                </Avatar>

                <Typography variant="h4" color={mode === "amongus" ? "secondary":"primary"} >
                    Create Meeting
                </Typography>
                <form className={classes.form}>

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
                            <Link onClick={(e: any) => { chimeClient?.leaveMeeting(); setStage("SIGNIN") }}>
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
