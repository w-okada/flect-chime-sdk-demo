import { Button, CircularProgress } from "@material-ui/core";
import { Lock } from "@material-ui/icons";
import React, { useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { STAGE } from "../../providers/hooks/useStageManager";
import { CustomTextField } from "../000_common/CustomTextField";
import { Questionnaire } from "../000_common/Questionnaire";
import { useStyles } from "../000_common/Style";

export const RequestChangePassword = () => {
    const { cognitoClientState, setMessage, setStage } = useAppState();
    const [userId, setUserId] = useState(cognitoClientState.userId || "");
    const [isLoading, setIsLoading] = useState(false);

    const classes = useStyles();

    const onSendVerificationCodeForChangePasswordClicked = async () => {
        setIsLoading(true);
        try {
            await cognitoClientState.sendVerificationCodeForChangePassword(userId);
            console.log("send verify code fo changing password");
            setMessage("Info", "Send Verification Code success ", [`verift your code.`]);
            setIsLoading(false);
            setStage(STAGE.NEW_PASSWORD);
        } catch (e: any) {
            console.log(e);
            setMessage("Exception", "request change password error", [`${e.message}`, `(code: ${e.code})`]);
            setIsLoading(false);
        }
    };
    const forms = (
        <>
            <div className={classes.loginField}>
                <CustomTextField onChange={(e) => setUserId(e.target.value)} label="email" secret={false} height={20} fontsize={16} defaultValue={cognitoClientState.userId || undefined} autofocus />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginRight: 0 }}>
                {isLoading ? (
                    <CircularProgress />
                ) : (
                    <Button variant="contained" color="primary" className={classes.submit} onClick={onSendVerificationCodeForChangePasswordClicked}>
                        Send verification code
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
            <Questionnaire avatorIcon={<Lock />} title="Send Verification Code for Change Password" forms={forms} links={links} />
        </>
    );
};
