import { Avatar, Box, Button, CircularProgress, Container, CssBaseline, Divider, Grid, Link, Typography } from "@material-ui/core";
import { Lock } from '@material-ui/icons';
import React, { useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { Copyright } from "../000_common/Copyright";
import { CustomTextField } from "../000_common/CustomTextField";
import { useAmongUsStyles, useStyles } from "../000_common/Style";



export const SignIn = () => {
    const { cognitoClient, setMessage, setStage, mode } = useAppState()
    const [userId, setUserId] = useState(cognitoClient.userId || "")
    const [password, setPassword] = useState(cognitoClient.password || "")
    const [isLoading, setIsLoading] = useState(false)

    // React hook doesn't allow to use condition....!?
    // const classes = mode === "amongus" ? useAmongUsStyles(): useStyles();
    const classes_normal = useStyles()
    const classes_among = useAmongUsStyles()
    const classes = mode === "amongus" ? classes_among : classes_normal
    
    const onSignInClicked = async () => {
        setIsLoading(true)
        try{
            await cognitoClient.signIn(userId, password)
            console.log("sign in!!!")
            setIsLoading(false)
            setStage("ENTRANCE")
        }catch(e:any){
            console.log("sign in error:::", e)
            setMessage("Exception", "Signin error", [`${e.message}`, `(code: ${e.code})`])
            setIsLoading(false)
        }
    }

    return (
        <Container maxWidth="xs" className={classes.root}>
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <Lock />
                </Avatar>

                <Typography variant="h4" className={classes.title} >
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
                            className: classes.input,
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
                            className: classes.input,
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
                            <a href="index.html"><img src='/resources/chime/title.png' style={{ width: "100%" }} alt="chime" /></a>
                        </div>
                        <div style={{ width: "33%", margin: "5px" }} >
                            <a href="index.html?mode=amongus"><img src='/resources/amongus/title.png' style={{ width: "100%", background: "black" }}  alt="amongus" /></a>
                        </div>
                    </Grid>


                    <Box mt={8}>
                        <Copyright />
                    </Box>
                    <Box mt={8}>
                        v2
                    </Box>
                </form>
            </div>
        </Container>
    )
}
