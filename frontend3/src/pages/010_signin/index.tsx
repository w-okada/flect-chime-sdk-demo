import { Avatar, Box, Button, CircularProgress, Container, CssBaseline, Grid, Link, makeStyles, TextField, Typography } from "@material-ui/core";
import { Lock } from '@material-ui/icons';
import React, { useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { Copyright } from "../000_common/Copyright";

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
}));

export const SignIn = () => {
    const classes = useStyles();
    const { userId: curUserId, password: curPassword, handleSignIn, setMessage, setStage } = useAppState()
    const [userId, setUserId] = useState(curUserId || "")
    const [password, setPassword] = useState(curPassword || "")
    const [isLoading, setIsLoading] = useState(false)

    const onSignInClicked = () => {
        setIsLoading(true)
        handleSignIn(userId || "", password || "").then(() => {
            console.log("sign in!!!")
            setIsLoading(false)
            setStage("ENTRANCE")
        }).catch((e) => {
            console.log("sign in error:::", e)
            setMessage("Exception", "Signin error", [`${e.message}`, `(code: ${e.code})`] )            
            setIsLoading(false)            
        })
    }

    return (
        <Container maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <Lock />
                </Avatar>

                <Typography variant="h4">
                    Sign in
            </Typography>
                <form className={classes.form} noValidate>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        name="email"
                        label="Email Address"
                        autoComplete="email"
                        autoFocus
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                    />

                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="password"
                        name="password"
                        label="Password"
                        inputProps={{
                            type: "password",
                            autoComplete: 'new-password'
                        }}

                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Grid container direction="column" alignItems="center" >
                    {
                        isLoading ?
                            <CircularProgress />
                            :
                            <Button
                                id="submit"
                                // type="submit" // Avoid screen transition.
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                                onClick={onSignInClicked}
                            >
                                Sign in
                            </Button>

                    }
                    </Grid>
                    <Grid container direction="column" >
                        <Grid item xs>
                            <Link onClick={(e: any) => { setStage("REQUEST_NEW_PASSWORD") }}>
                                Forgot or chnage password
                            </Link>
                        </Grid>
                        <Grid item xs>
                            <Link onClick={(e: any) => { setStage("SIGNUP") }}>
                                Sign up
                            </Link>
                        </Grid>
                        <Grid item xs>
                            <Link onClick={(e: any) => { setStage("VERIFY") }}>
                                Verify code
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
