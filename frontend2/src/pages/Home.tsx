import React from "react"
import { Container, Avatar, Typography, TextField, Button, Grid, Link, Box, CssBaseline, CircularProgress, FormControlLabel, Checkbox, Dialog, DialogTitle, DialogContent, FormControl, InputLabel, Select, MenuItem, Input, DialogActions } from '@material-ui/core'
import { Lock } from '@material-ui/icons'
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

export const Home = () => {
    const { localUserId, localPassword, setLocalUserId, setLocalPassword, handleSignIn, isLoading } = useSignInState()
    const classes = useStyles();
    const history = useHistory();
    const {setMessage} = useMessageState()
    const [open, setOpen] = React.useState(false);

    const onSignInClicked = () => {
        handleSignIn(localUserId || "", localPassword || "").then(()=>{
            history.push(routes.ENTRANCE)
        }).catch((e)=>{
            console.log("sign in error:::", e)
            setMessage("Exception", "Signin error", [`${e.message}`, `(code: ${e.code})`] )            
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
                        inputProps={{
                            type: "password",
                            autoComplete: 'new-password'
                        }}

                        label="Password"
                        // type="password"
                        // id="password"
                        // autoComplete="off"
                        value={localPassword}
                        onChange={(e) => setLocalPassword(e.target.value)}
                    />
                    {/* <FormControlLabel
                        control={<Checkbox value="remember" color="primary" />}
                        label="Remember me"
                    /> */}
                    {
                        isLoading ?
                            <CircularProgress />
                            :
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                                onClick={onSignInClicked}
                            >
                                Sign in
                        </Button>

                    }
                    <Grid container direction="column" >
                        <Grid item xs>
                            <Link onClick={(e: any) => { history.push(routes.SEND_VERIFICATION_CODE_FOR_CHANGE_PASSWORD) }}>
                                Forgot or chnage password
                            </Link>
                        </Grid>
                        <Grid item xs>
                            <Link onClick={(e: any) => { history.push(routes.SIGNUP) }}>
                                Sign up
                            </Link>
                        </Grid>
                        <Grid item xs>
                            <Link onClick={(e: any) => { history.push(routes.VERIFY) }}>
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
