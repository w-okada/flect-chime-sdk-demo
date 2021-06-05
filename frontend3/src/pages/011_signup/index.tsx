import { Avatar, Box, Button, CircularProgress, Container, CssBaseline, Grid, Link, makeStyles, TextField, Typography, withStyles } from "@material-ui/core";
import { Person } from '@material-ui/icons';
import React, { useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { Copyright } from "../000_common/Copyright";

// const useStyles = makeStyles((theme) => ({
//     paper: {
//         marginTop: theme.spacing(8),
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//     },
//     avatar: {
//         margin: theme.spacing(1),
//         backgroundColor: theme.palette.primary.main,
//     },
//     form: {
//         width: '100%',
//         marginTop: theme.spacing(1),
//     },
//     submit: {
//         margin: theme.spacing(3, 0, 2),
//     },
// }));


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
        color: 'blue'
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




export const SignUp = () => {
    const classes = useStyles();
    const { userId: curUserId, handleSignUp, setMessage, setStage, mode } = useAppState()
    const [userId, setUserId] = useState(curUserId || "")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)


    const onSignUpClicked = () => {
        setIsLoading(true)
        handleSignUp(userId || "", password || "").then(()=>{
            setMessage("Info", "Signup success", [`User created.`, `Verification code is sent to your mail address. Please input into next form.`] )
            setIsLoading(false)
            setStage("VERIFY")
        }).catch(e=>{
            console.log(e)
            setMessage("Exception", "Signup error", [`${e.message}`, `(code: ${e.code})`] )    
            setIsLoading(false)
        })
    }


    return (
        <Container maxWidth="xs" className={mode == "amongus" ? classes.root_amongus : classes.root}>
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <Person />
                </Avatar>

                <Typography variant="h4" color={mode == "amongus" ? "secondary":"primary"} >
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
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                                onClick={onSignUpClicked}
                            >
                                Sign up
                            </Button>
                    }
                    </Grid>
                    <Grid container direction="column" >
                        <Grid item xs>
                            <Link onClick={(e: any) => { setStage("SIGNIN") }}>
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
