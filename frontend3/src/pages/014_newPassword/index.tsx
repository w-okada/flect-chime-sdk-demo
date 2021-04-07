// import { Avatar, Box, Button, CircularProgress, Container, CssBaseline, Grid, Link, makeStyles, TextField, Typography } from "@material-ui/core";
// import React, { useState } from "react";
// import { useAppState } from "../../providers/AppStateProvider";
// import { Copyright } from "../000_common/Copyright";

import { Avatar, Box, Button, CircularProgress, Container, CssBaseline, Grid, Link, makeStyles, TextField, Typography } from "@material-ui/core";
import React, { useState } from "react";
import { Copyright } from "../000_common/Copyright";
import { Lock } from '@material-ui/icons';
import { useAppState } from "../../providers/AppStateProvider";

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

export const NewPassword  = () => {
    const classes = useStyles();
    const { userId: curUserId, handleNewPassword, setMessage, setStage } = useAppState()
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
        <Container maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <Lock />
                </Avatar>

                <Typography variant="h4">
                    New Password
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
                        label="code"
                        onChange={(e) => setVerifyCode(e.target.value)}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        type="password"
                        id="passwordad"
                        name="password"
                        label="Password"
                        autoComplete="new-password"
                        onChange={(e) => setPassword(e.target.value)}
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
