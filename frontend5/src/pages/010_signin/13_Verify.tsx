import { Button, CircularProgress } from "@material-ui/core";
import { Lock } from "@material-ui/icons";
import React, { useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { STAGE } from "../../providers/hooks/useStageManager";
import { CustomTextField } from "../000_common/CustomTextField";
import { Questionnaire } from "../000_common/Questionnaire";
import { useStyles } from "../000_common/Style";

export const Verify = () => {
    const { cognitoClientState, setMessage, setStage } = useAppState();
    const [userId, setUserId] = useState(cognitoClientState.userId || "");
    const [verifyCode, setVerifyCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const classes = useStyles();

    const onVerifyCodeClicked = async () => {
        setIsLoading(true);
        try {
            await cognitoClientState.verify(userId, verifyCode);
            setMessage("Info", "Verification success ", [`Verification is accepted.`]);
            setIsLoading(false);
            setStage(STAGE.SIGNIN);
        } catch (e: any) {
            console.log(".....", e);
            setMessage("Exception", "Verification error", [`${e.message}`, `(code: ${e.code})`]);
            setIsLoading(false);
        }
    };

    const onResendVerifyCodeClicked = async () => {
        setIsLoading(true);
        try {
            await cognitoClientState.resendVerification(userId);
            console.log("resend");
            setMessage("Info", "Resend Verification ", [`Verification code is resent to your mail address. Please input into next form.`]);
            setIsLoading(false);
        } catch (e: any) {
            console.log("resend fail");
            setMessage("Exception", "Resend Verification error", [`${e.message}`, `(code: ${e.code})`]);
            setIsLoading(false);
        }
    };
    const forms = (
        <>
            <div className={classes.loginField}>
                <CustomTextField onChange={(e) => setUserId(e.target.value)} label="email" secret={false} height={20} fontsize={16} defaultValue={cognitoClientState.userId || undefined} autofocus />
                <CustomTextField onChange={(e) => setVerifyCode(e.target.value)} label="verifiction code" secret={true} height={20} fontsize={16} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginRight: 0 }}>
                {isLoading ? (
                    <CircularProgress />
                ) : (
                    <Button variant="contained" color="primary" className={classes.submit} onClick={onVerifyCodeClicked}>
                        Verify code
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
        {
            title: "resend code",
            onClick: () => {
                onResendVerifyCodeClicked();
            },
        },
    ];
    return (
        <>
            <Questionnaire avatorIcon={<Lock />} title="Verify Code" forms={forms} links={links} />
        </>
    );
};
