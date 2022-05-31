import { CognitoClient } from "../../001_cognito/CognitoClient";
import { useMemo, useState } from "react";

export type UseCognitoClientProps = {
    userPoolId: string;
    userPoolClientId: string;
    defaultUserId?: string;
    defaultPassword?: string;
};

export type CognitoClientState = {
    // cognitoClient: CognitoClient;
    userId: string | null;
    password: string | null;
    idToken: string | null;
    accessToken: string | null;
    refreshToken: string | null;
    signInCompleted: boolean

    signIn: (userId: string, password: string) => Promise<void>;
    signUp: (userId: string, password: string) => Promise<void>;
    verify: (userId: string, verifyCode: string) => Promise<void>;
    resendVerification: (userId: string) => Promise<void>;
    sendVerificationCodeForChangePassword: (userId: string) => Promise<void>;
    changePassword: (userId: string, verifycode: string, password: string) => Promise<void>;
    signOut: (userId: string) => Promise<void>;
};

export const useCognitoClient = (props: UseCognitoClientProps): CognitoClientState => {
    const [_lastUpdateTime, setLastUpdateTime] = useState(0);

    const cognitoClient = useMemo(() => {
        const c = new CognitoClient(props.userPoolId, props.userPoolClientId, props.defaultUserId, props.defaultPassword);
        return c;
    }, []);

    const signIn = async (userId: string, password: string) => {
        await cognitoClient.signIn(userId, password);
        setLastUpdateTime(new Date().getTime());
    };
    const signUp = async (userId: string, password: string) => {
        await cognitoClient.signUp(userId, password);
        setLastUpdateTime(new Date().getTime());
    };
    const verify = async (userId: string, verifyCode: string) => {
        await cognitoClient.verify(userId, verifyCode);
        setLastUpdateTime(new Date().getTime());
    };
    const resendVerification = async (userId: string) => {
        await cognitoClient.resendVerification(userId);
        setLastUpdateTime(new Date().getTime());
    };
    const sendVerificationCodeForChangePassword = async (userId: string) => {
        await cognitoClient.sendVerificationCodeForChangePassword(userId);
        setLastUpdateTime(new Date().getTime());
    };
    const changePassword = async (userId: string, verifycode: string, password: string) => {
        await cognitoClient.changePassword(userId, verifycode, password);
        setLastUpdateTime(new Date().getTime());
    };
    const signOut = async (userId: string) => {
        await cognitoClient.signOut(userId);
        setLastUpdateTime(new Date().getTime());
    };
    const returnValue: CognitoClientState = {
        // cognitoClient,
        userId: cognitoClient.userId,
        password: cognitoClient.password,
        idToken: cognitoClient.idToken,
        accessToken: cognitoClient.accessToken,
        refreshToken: cognitoClient.refreshToken,
        signInCompleted: cognitoClient.signInCompleted,
        signIn,
        signUp,
        verify,
        resendVerification,
        sendVerificationCodeForChangePassword,
        changePassword,
        signOut,
    };

    return returnValue;
};
