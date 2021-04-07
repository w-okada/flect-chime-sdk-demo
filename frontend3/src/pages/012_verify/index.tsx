import { Avatar, Box, Button, CircularProgress, Container, CssBaseline, Grid, Link, makeStyles, TextField, Typography } from "@material-ui/core";
import { Person } from '@material-ui/icons';
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

export const Verify = () => {
    const classes = useStyles();
    const { userId: curUserId, handleVerify, handleResendVerification, setMessage, setStage } = useAppState()
    const [userId, setUserId] = useState(curUserId || "")
    const [verifyCode, setVerifyCode] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const onVerifyCodeClicked = () => {
        setIsLoading(true)
        handleVerify(userId || "", verifyCode).then(()=>{
            setMessage("Info", "Verification success ", [`Verification is accepted.`] )
            setIsLoading(false)
            setStage("SIGNIN")
        }).catch(e=>{
            console.log(".....",e)
            setMessage("Exception", "Verification error", [`${e.message}`, `(code: ${e.code})`] )
            setIsLoading(false)
        })
    }

    
    const onResendVerifyCodeClicked = () => {
        setIsLoading(true)
        handleResendVerification(userId || "").then(()=>{
            console.log("resend")
            setMessage("Info", "Resend Verification ", [`Verification code is resent to your mail address. Please input into next form.`] )    
            setIsLoading(false)
        }).catch(e=>{
            console.log("resend fail")
            setMessage("Exception", "Resend Verification error", [`${e.message}`, `(code: ${e.code})`] )            
            setIsLoading(false)
        })

    }    

    return (
        <Container maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <Person />
                </Avatar>

                <Typography variant="h4">
                    Sign up
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
                        id="code"
                        name="code"
                        label="Verification Code"
                        autoComplete="code"
                        onChange={(e) => setVerifyCode(e.target.value)}
                    />

                    <Grid container direction="column" alignItems="center" >
                    {
                        isLoading ?
                            <CircularProgress />
                            :
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                                onClick={onVerifyCodeClicked}
                            >
                                Verify code
                        </Button>

                    }
                    </Grid>
                    <Grid container direction="column" >
                        <Grid item xs>
                            <Link onClick={(e: any) => { setStage("SIGNIN") }}>
                                return to home
                            </Link>
                        </Grid>
                        <Grid item xs>
                            <Link onClick={onResendVerifyCodeClicked}>
                                resend code
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

