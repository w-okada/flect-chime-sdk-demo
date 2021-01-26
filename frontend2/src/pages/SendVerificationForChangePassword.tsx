import React from "react"
import { Container, Avatar, Typography, TextField, Button, Grid, Link, Box, CssBaseline, CircularProgress } from '@material-ui/core'
import { Lock } from '@material-ui/icons'
import { Copyright } from "../components/Copyright"
import { makeStyles } from '@material-ui/core/styles';
import routes from "../constants/routes"
import { useHistory } from "react-router-dom"
import { useSignInState } from "../providers/SignInStateProvider"

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


export const SendVerificationForChangePassword = () => {
    const { localUserId, setLocalUserId, handleSendVerificationCodeForChangePassword, isLoading } = useSignInState()
    const classes = useStyles();
    const history = useHistory();

    const onSendVerificationCodeForChangePasswordClicked = () => {
        handleSendVerificationCodeForChangePassword(localUserId || "").then(()=>{
            history.push(routes.NEW_PASSWORD);
        }).catch(e=>{
            console.log(e)
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
                    Send Verification Code for Change Password
                </Typography>
                <form className={classes.form} noValidate>
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
                    {
                        isLoading ?
                            <CircularProgress />
                            :
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                                onClick={onSendVerificationCodeForChangePasswordClicked}
                            >
                                Send verification code
                        </Button>

                    }
                    <Grid container direction="column" >
                        <Grid item xs>
                            <Link onClick={(e: any) => { history.push(routes.HOME) }}>
                                return to home
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