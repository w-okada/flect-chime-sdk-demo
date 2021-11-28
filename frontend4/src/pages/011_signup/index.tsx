import { Avatar, Box, Button, CircularProgress, Container, CssBaseline, Grid, Link, Typography } from "@material-ui/core";
import { Person } from "@material-ui/icons";
import React, { useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { Copyright } from "../000_common/Copyright";
import { CustomTextField } from "../000_common/CustomTextField";
import { useAmongUsStyles, useStyles } from "../000_common/Style";

export const SignUp = () => {
    const { cognitoClient, setMessage, setStage, mode } = useAppState();
    const [userId, setUserId] = useState(cognitoClient.userId || "");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const classes_normal = useStyles();
    const classes_among = useAmongUsStyles();
    const classes = mode === "amongus" ? classes_among : classes_normal;

    const onSignUpClicked = async () => {
        setIsLoading(true);
        try {
            await cognitoClient.signUp(userId, password);
            setMessage("Info", "Signup success", [`User created.`, `Verification code is sent to your mail address. Please input into next form.`]);
            setIsLoading(false);
            setStage("VERIFY");
        } catch (e: any) {
            console.log(e);
            setMessage("Exception", "Signup error", [`${e.message}`, `(code: ${e.code})`]);
            setIsLoading(false);
        }
    };

    return (
        <Container maxWidth="xs" className={classes.root}>
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <Person />
                </Avatar>

                <Typography variant="h4" className={classes.title}>
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
                            autoComplete: "new-password",
                        }}
                    />

                    <Grid container direction="column" alignItems="center">
                        {isLoading ? (
                            <CircularProgress />
                        ) : (
                            <Button fullWidth variant="contained" color="primary" className={classes.submit} onClick={onSignUpClicked}>
                                Sign up
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
