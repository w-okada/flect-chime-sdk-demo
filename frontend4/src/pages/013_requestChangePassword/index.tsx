import { Avatar, Box, Button, CircularProgress, Container, CssBaseline, Grid, Link, Typography } from "@material-ui/core";
import React, { useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { Lock } from "@material-ui/icons";
import { Copyright } from "../000_common/Copyright";
import { CustomTextField } from "../000_common/CustomTextField";
import { useAmongUsStyles, useStyles } from "../000_common/Style";

export const RequestChangePassword = () => {
    const { cognitoClient, setMessage, setStage, mode } = useAppState();
    const [userId, setUserId] = useState(cognitoClient.userId || "");
    const [isLoading, setIsLoading] = useState(false);

    const classes_normal = useStyles();
    const classes_among = useAmongUsStyles();
    const classes = mode === "amongus" ? classes_among : classes_normal;

    const onSendVerificationCodeForChangePasswordClicked = async () => {
        setIsLoading(true);
        try {
            await cognitoClient.sendVerificationCodeForChangePassword(userId);
            console.log("send verify code fo changing password");
            setMessage("Info", "Send Verification Code success ", [`Verification is accepted.`]);
            setIsLoading(false);
            setStage("NEW_PASSWORD");
        } catch (e: any) {
            console.log(e);
            setMessage("Exception", "request change password error", [`${e.message}`, `(code: ${e.code})`]);
            setIsLoading(false);
        }
    };

    return (
        <Container maxWidth="xs" className={classes.root}>
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <Lock />
                </Avatar>

                <Typography variant="h4" className={classes.title}>
                    Send Verification Code
                </Typography>
                <Typography variant="h4" className={classes.title}>
                    for Change Password
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

                    <Grid container direction="column" alignItems="center">
                        {isLoading ? (
                            <CircularProgress />
                        ) : (
                            <Button fullWidth variant="contained" color="primary" className={classes.submit} onClick={onSendVerificationCodeForChangePasswordClicked}>
                                Send verification code
                            </Button>
                        )}
                    </Grid>
                    <Grid container direction="column">
                        <Grid item xs>
                            <Link
                                onClick={(e: any) => {
                                    setStage("SIGNIN");
                                }}
                            >
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
    );
};
