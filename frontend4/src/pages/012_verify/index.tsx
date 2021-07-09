import { Avatar, Box, Button, CircularProgress, Container, CssBaseline, Grid, Link, Typography } from "@material-ui/core";
import { Person } from '@material-ui/icons';
import React, { useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { Copyright } from "../000_common/Copyright";
import { CustomTextField } from "../000_common/CustomTextField";
import { useAmongUsStyles, useStyles } from "../000_common/Style";

export const Verify = () => {
    const { cognitoClient, setMessage, setStage, mode } = useAppState()
    const [userId, setUserId] = useState(cognitoClient.userId || "")
    const [verifyCode, setVerifyCode] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    
    const classes_normal = useStyles()
    const classes_among = useAmongUsStyles()
    const classes = mode === "amongus" ? classes_among : classes_normal

    const onVerifyCodeClicked = async () => {
        setIsLoading(true)
        try{
            await cognitoClient.verify(userId, verifyCode)
            setMessage("Info", "Verification success ", [`Verification is accepted.`] )
            setIsLoading(false)
            setStage("SIGNIN")
        }catch(e){
            console.log(".....",e)
            setMessage("Exception", "Verification error", [`${e.message}`, `(code: ${e.code})`] )
            setIsLoading(false)
        }
    }

    
    const onResendVerifyCodeClicked = async () => {
        setIsLoading(true)
        try{
            await cognitoClient.resendVerification(userId)
            console.log("resend")
            setMessage("Info", "Resend Verification ", [`Verification code is resent to your mail address. Please input into next form.`] )    
            setIsLoading(false)
        }catch(e){
            console.log("resend fail")
            setMessage("Exception", "Resend Verification error", [`${e.message}`, `(code: ${e.code})`] )            
            setIsLoading(false)
        }
    }    

    return (
        <Container maxWidth="xs" className={classes.root}>
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <Person />
                </Avatar>

                <Typography variant="h4" className={classes.title} >
                    Sign up
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
                        id="code"
                        name="code"
                        label="Verification Code"
                        autoComplete="email"
                        autoFocus
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value)}
                        InputProps={{
                            className: classes.input,
                        }}
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

