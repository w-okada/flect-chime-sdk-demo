import { Avatar, Box, Button, CircularProgress, Container, CssBaseline, Grid, Link, Typography } from "@material-ui/core";
import React, { useState } from "react";
import { Copyright } from "../000_common/Copyright";
import { Lock } from '@material-ui/icons';
import { useAppState } from "../../providers/AppStateProvider";
import { useAmongUsStyles, useStyles } from "../000_common/Style";
import { CustomTextField } from "../000_common/CustomTextField";


export const NewPassword  = () => {
    const { cognitoClient, setMessage, setStage, mode } = useAppState()
    const [userId, setUserId] = useState(cognitoClient.userId || "")
    const [verifyCode, setVerifyCode] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const classes_normal = useStyles()
    const classes_among = useAmongUsStyles()
    const classes = mode === "amongus" ? classes_among : classes_normal

    const onChangePasswordClicked = async() => {
        setIsLoading(true)
        try{
            await cognitoClient.changePassword(userId, verifyCode, password)
            console.log("change password")
            setIsLoading(false)
            setStage("SIGNIN")
        }catch(e:any){
            console.log(e)
            setMessage("Exception", "change password error", [`${e.message}`, `(code: ${e.code})`] )
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
