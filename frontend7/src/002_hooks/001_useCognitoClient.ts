import { CognitoClient } from "../001_clients_and_managers/001_cognito/CognitoClient";
import { useMemo, useState } from "react";

export type UseCognitoClientProps = {};

export type CognitoClientState = {
    // cognitoClient: CognitoClient;
    userId: string | null;
    idToken: string | null;
    accessToken: string | null;
    refreshToken: string | null;
    signInCompleted: boolean
}

export type CognitoClientStateAndMethods = CognitoClientState & {
    signIn: (userId: string, password: string) => Promise<void>;
    signUp: (userId: string, password: string) => Promise<void>;
    verify: (userId: string, verifyCode: string) => Promise<void>;
    resendVerification: (userId: string) => Promise<void>;
    sendVerificationCodeForChangePassword: (userId: string) => Promise<void>;
    changePassword: (userId: string, verifycode: string, password: string) => Promise<void>;
    signOut: (userId: string) => Promise<void>;
}

export const useCognitoClient = (props: UseCognitoClientProps): CognitoClientStateAndMethods => {
    const [_lastUpdateTime, setLastUpdateTime] = useState(0);
    const [state, setState] = useState<CognitoClientState>({
        userId: null,
        idToken: null,
        accessToken: null,
        refreshToken: null,
        signInCompleted: false
        // signInCompleted: true // for debug
    })


    const cognitoClient = useMemo(() => {
        const c = new CognitoClient();
        return c;
    }, []);

    const signIn = async (userId: string, password: string) => {
        const res = await cognitoClient.signIn(userId, password);
        setState({ ...state, ...res, signInCompleted: true })
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
    const returnValue: CognitoClientStateAndMethods = {
        ...state,
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
