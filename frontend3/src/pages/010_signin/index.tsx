import { Avatar, Box, Button, CircularProgress, Container, CssBaseline, Divider, Grid, Link, makeStyles, TextField, Typography, withStyles } from "@material-ui/core";
import { Lock } from '@material-ui/icons';
import React, { useRef, useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { useScheduler } from "../../providers/hooks/useScheduler";
import { Copyright } from "../000_common/Copyright";

const useStyles = makeStyles((theme) => ({
    root: {
        background: 'white',
    },
    root_amongus: {
        background: 'black'
    },
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
    margin: {
        margin: theme.spacing(1),
    },
    input: {
        color: 'black',
    },
    input_amongus: {
        color: 'blue',
    }

}));

const CustomTextField = withStyles({
    root: {
        '& input:valid + fieldset': {
            borderColor: 'blue',
            borderWidth: 1,
        },
        '& input:invalid + fieldset': {
            borderColor: 'blue',
            borderWidth: 1,
        },
        '& input:valid:focus + fieldset': {
            borderColor: 'blue',
            borderLeftWidth: 6,
            // padding: '4px !important', 
        },
        '& input:valid:hover + fieldset': {
            borderColor: 'blue',
            borderLeftWidth: 6,
            // padding: '4px !important', 
        },
        '& input:invalid:hover + fieldset': {
            borderColor: 'blue',
            borderLeftWidth: 6,
            color: 'blue'
            // padding: '4px !important', 
        },
        '& label.Mui-focused': {
            color: 'blue',
        },
        '& label.MuiInputLabel-root': {
            color: 'blue',
        },
    },
})(TextField);


export const SignIn = () => {
    const classes = useStyles();
    const { userId: curUserId, password: curPassword, handleSignIn, setMessage, setStage, mode } = useAppState()
    console.log("singine...")
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
            setMessage("Exception", "Signin error", [`${e.message}`, `(code: ${e.code})`])
            setIsLoading(false)
        })
    }




    return (
        <Container maxWidth="xs" className={mode == "amongus" ? classes.root_amongus : classes.root}>
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <Lock />
                </Avatar>

                <Typography variant="h4" color={mode == "amongus" ? "secondary":"primary"} >
                    Sign in
                </Typography>
                <form className={classes.form} noValidate>
                    <CustomTextField
                        required
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        id="email"
                        name="email"
                        label="Email Address"
                        autoComplete="email"
                        autoFocus
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        InputProps={{
                            className: mode == "amongus" ? classes.input_amongus : classes.input,
                        }}
                    />

                    <CustomTextField
                        required
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        id="password"
                        name="password"
                        label="Password"
                        autoComplete="email"
                        autoFocus
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        InputProps={{
                            className: mode == "amongus" ? classes.input_amongus : classes.input,
                            type: "password",
                            autoComplete: 'new-password'
                        }}
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
                    <Divider variant="middle" />
                    <Grid container direction="row" alignItems="center">
                        <div style={{ width: "33%", margin: "5px" }} >
                            <a href="index.html"><img src='/resources/chime/title.png' style={{ width: "100%" }} /></a>
                        </div>
                        <div style={{ width: "33%", margin: "5px" }} >
                            <a href="index.html?mode=amongus"><img src='/resources/amongus/title.png' style={{ width: "100%", background: "black" }} /></a>
                        </div>
                    </Grid>


                    <Box mt={8}>
                        <Copyright />
                    </Box>
                </form>
            </div>
        </Container>
    )
}
