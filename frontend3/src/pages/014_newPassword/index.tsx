// import { Avatar, Box, Button, CircularProgress, Container, CssBaseline, Grid, Link, makeStyles, TextField, Typography } from "@material-ui/core";
// import React, { useState } from "react";
// import { useAppState } from "../../providers/AppStateProvider";
// import { Copyright } from "../000_common/Copyright";

import { Avatar, Box, Button, CircularProgress, Container, CssBaseline, Grid, Link, makeStyles, TextField, Typography, withStyles } from "@material-ui/core";
import React, { useState } from "react";
import { Copyright } from "../000_common/Copyright";
import { Lock } from '@material-ui/icons';
import { useAppState } from "../../providers/AppStateProvider";

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





export const NewPassword  = () => {
    const classes = useStyles();
    const { userId: curUserId, handleNewPassword, setMessage, setStage, mode } = useAppState()
    const [userId, setUserId] = useState(curUserId || "")
    const [verifyCode, setVerifyCode] = useState("")
    const [password, setPassword] = useState("")

    const [isLoading, setIsLoading] = useState(false)

    const onChangePasswordClicked = () => {
        setIsLoading(true)
        handleNewPassword(userId || "", verifyCode || "", password || "").then(()=>{
            console.log("change password")
            setIsLoading(false)
            setStage("SIGNIN")
        }).catch(e=>{
            console.log(e)
            setMessage("Exception", "change password error", [`${e.message}`, `(code: ${e.code})`] )
            setIsLoading(false)
        })
    }

    return (
        <Container maxWidth="xs" className={mode === "amongus" ? classes.root_amongus : classes.root}>
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <Lock />
                </Avatar>

                <Typography variant="h4" color={mode === "amongus" ? "secondary":"primary"} >
                    New Password
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
                            className: mode === "amongus" ? classes.input_amongus : classes.input,
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
                            className: mode === "amongus" ? classes.input_amongus : classes.input,
                            type: "password",
                            autoComplete: 'new-password'
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
                            className: mode === "amongus" ? classes.input_amongus : classes.input,
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
                                onClick={onChangePasswordClicked}
                            >
                                Change Password
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
