import React from "react"
import { Container, Avatar, Typography, TextField, Button, Grid, Link, Box, CssBaseline, CircularProgress } from '@material-ui/core'
import { Person } from '@material-ui/icons'
import { Copyright } from "../components/Copyright"
import { makeStyles } from '@material-ui/core/styles';
import routes from "../constants/routes"
import { useHistory } from "react-router-dom"
import { useSignInState } from "../providers/SignInStateProvider"
import { useMessageState } from "../providers/MessageStateProvider";

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
    const { localUserId, localVerifyCode,
        setLocalUserId, setLocalVerifyCode,
        handleVerify, handleResendVerification, isLoading } = useSignInState()
    const classes = useStyles();
    const history = useHistory();
    const {setMessage} = useMessageState()

    const onVerifyCodeClicked = () => {
        handleVerify(localUserId || "", localVerifyCode).then(()=>{
            history.push(routes.HOME)
            setMessage("Info", "Verification success ", [`Verification is accepted.`] )    

        }).catch(e=>{
            console.log(".....",e)
            setMessage("Exception", "Verification error", [`${e.message}`, `(code: ${e.code})`] )    
        })
    }

    const onResendVerifyCodeClicked = () => {
        handleResendVerification(localUserId || "").then(()=>{
            console.log("resend")
            setMessage("Info", "Resend Verification ", [`Verification code is resent to your mail address. Please input into next form.`] )    
        }).catch(e=>{
            console.log("resend fail")
            setMessage("Exception", "Resend Verification error", [`${e.message}`, `(code: ${e.code})`] )            

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
                    Verify code
                </Typography>
                <form className={classes.form}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={localUserId}
                        onChange={(e) => setLocalUserId(e.target.value)}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="code"
                        label="Verification Code"
                        name="code"
                        autoComplete="code"
                        autoFocus
                        // value={localVerifyCode}
                        onChange={(e) => setLocalVerifyCode(e.target.value)}
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
                                onClick={onVerifyCodeClicked}
                            >
                                Verify code
                        </Button>

                    }
                    <Grid container direction="column" >
                        <Grid item xs>
                            <Link onClick={(e: any) => { history.push(routes.HOME) }}>
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