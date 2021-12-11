import { Button, CircularProgress } from "@material-ui/core";
import { Lock } from "@material-ui/icons";
import React, { useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { STAGE } from "../../providers/hooks/useStageManager";
import { CustomTextField } from "../000_common/CustomTextField";
import { Questionnaire } from "../000_common/Questionnaire";
import { useStyles } from "../000_common/Style";

export const SignUp = () => {
    const { cognitoClientState, setMessage, setStage } = useAppState();
    const [userId, setUserId] = useState(cognitoClientState.userId || "");
    const [password, setPassword] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    const classes = useStyles();

    const onSignUpClicked = async () => {
        setIsLoading(true);
        try {
            await cognitoClientState.signUp(userId, password);
            setMessage("Info", "Signup success", [`User created.`, `Verification code is sent to your mail address. Please input into next form.`]);
            setIsLoading(false);
            setStage(STAGE.VERIFY);
        } catch (e: any) {
            console.log(e);
            setMessage("Exception", "Signup error", [`${e.message}`, `(code: ${e.code})`]);
            setIsLoading(false);
        }
    };
    const forms = (
        <>
            <div className={classes.loginField}>
                <CustomTextField onChange={(e) => setUserId(e.target.value)} label="email" secret={false} height={20} fontsize={16} autofocus defaultValue={cognitoClientState.userId || undefined} />
                <CustomTextField onChange={(e) => setPassword(e.target.value)} label="password" secret={true} height={20} fontsize={16} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginRight: 0 }}>
                {isLoading ? (
                    <CircularProgress />
                ) : (
                    <Button variant="contained" color="primary" className={classes.submit} onClick={onSignUpClicked}>
                        Sign up
                    </Button>
                )}
            </div>
        </>
    );
    const links = [
        {
            title: "return to home",
            onClick: () => {
                setStage(STAGE.SIGNIN);
            },
        },
    ];

    return (
        <>
            <Questionnaire avatorIcon={<Lock />} title="Sign up" forms={forms} links={links} />
        </>
    );
};
