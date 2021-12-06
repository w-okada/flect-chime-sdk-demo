import { Button, CircularProgress } from "@material-ui/core";
import { Lock } from "@material-ui/icons";
import React, { useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { CustomTextField } from "../000_common/CustomTextField";
import { Questionnaire } from "../000_common/Questionnaire";
import { useStyles } from "../000_common/Style";

export const NewPassword = () => {
    const { cognitoClientState, setMessage, setStage } = useAppState();
    const [userId, setUserId] = useState(cognitoClientState.userId || "");
    const [verifyCode, setVerifyCode] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const classes = useStyles();

    const onChangePasswordClicked = async () => {
        setIsLoading(true);
        try {
            await cognitoClientState.changePassword(userId, verifyCode, password);
            setMessage("Info", "password changed ", [`Verification is accepted. New password ready.`]);
            setIsLoading(false);
            setStage("SIGNIN");
        } catch (e: any) {
            console.log(e);
            setMessage("Exception", "change password error", [`${e.message}`, `(code: ${e.code})`]);
            setIsLoading(false);
        }
    };
    const forms = (
        <>
            <div className={classes.loginField}>
                <CustomTextField onChange={(e) => setUserId(e.target.value)} label="email" secret={false} height={20} fontsize={16} defaultValue={cognitoClientState.userId || undefined} autofocus />
                <CustomTextField onChange={(e) => setPassword(e.target.value)} label="password" secret={true} height={20} fontsize={16} />
                <CustomTextField onChange={(e) => setVerifyCode(e.target.value)} label="verifiction code" secret={true} height={20} fontsize={16} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginRight: 0 }}>
                {isLoading ? (
                    <CircularProgress />
                ) : (
                    <Button variant="contained" color="primary" className={classes.submit} onClick={onChangePasswordClicked}>
                        Change Password
                    </Button>
                )}
            </div>
        </>
    );
    const links = [
        {
            title: "return to home",
            onClick: () => {
                setStage("SIGNIN");
            },
        },
    ];
    return (
        <>
            <Questionnaire avatorIcon={<Lock />} title="New Password" forms={forms} links={links} />
        </>
    );
};
