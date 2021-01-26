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


export const Signup = () => {
    const { localUserId, localPassword, setLocalUserId, setLocalPassword, handleSignUp, isLoading } = useSignInState()
    const classes = useStyles();
    const history = useHistory();
    const {setMessage} = useMessageState()
    
    const onSignUpClicked = () => {
        handleSignUp(localUserId || "", localPassword || "").then(()=>{
            setMessage("Info", "Signup success", [`User created.`, `Verification code is sent to your mail address. Please input into next form.`] )    
            history.push(routes.VERIFY)
        }).catch(e=>{
            console.log(e)
            setMessage("Exception", "Signup error", [`${e.message}`, `(code: ${e.code})`] )    
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
                        name="password"
                        label="Password"
                        type="password"
                        // id="password"
                        id="passwordadsfsfasdfasdfasdfasdf"
                        autoComplete="new-password"
                        // value={localPassword}
                        onChange={(e) => setLocalPassword(e.target.value)}
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
                                onClick={onSignUpClicked}
                            >
                                Sign up
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