import { useContext, useState, ReactNode } from "react"
import { useAppState } from "./AppStateProvider"
// import { getErrorContext } from "./ErrorProvider"
import { CognitoUser, AuthenticationDetails, CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import React from "react"
import { awsConfiguration, DEFAULT_USERID, DEFAULT_PASSWORD } from "../Config";

type Props = {
    children: ReactNode;
};

const userPool = new CognitoUserPool({
    UserPoolId: awsConfiguration.userPoolId,
    ClientId: awsConfiguration.clientId,
})

interface SignInStateValue {
    isLoading: boolean,

    localUserId: string | null,
    localPassword: string | null,
    localVerifyCode: string,
    setLocalUserId: (val: string) => void,
    setLocalPassword: (val: string) => void,
    setLocalVerifyCode: (val: string) => void,

    handleSignIn: (localUserId: string, localPassword: string) => Promise<void>
    handleSignUp: (localUserId: string, localPassword: string) => Promise<void>
    handleVerify: (localUserId: string, locaoVerifyCode: string) => Promise<void>
    handleResendVerification: (localUserId: string) => Promise<void>
    handleSendVerificationCodeForChangePassword: (localUserId: string) => Promise<void>
    handleNewPassword: (localUserId: string, localVerifyCode: string, localPassword: string) => Promise<void>
    handleSignOut: (localUserId: string) => Promise<void>

}

const SignInStateContext = React.createContext<SignInStateValue | null>(null)

export const useSignInState = (): SignInStateValue => {
    const state = useContext(SignInStateContext)
    if (!state) {
        throw new Error("Error using sign in context!")
    }
    return state
}

export const SignInStateProvider = ({ children }: Props) => {
    const [isLoading, setIsLoading] = useState(false)

    const { setSignInInfo, userId } = useAppState()
    const [localUserId, setLocalUserId] = useState((userId || DEFAULT_USERID) as string | null)
    const [localPassword, setLocalPassword] = useState((DEFAULT_PASSWORD) as string | null)
    const [localVerifyCode, setLocalVerifyCode] = useState("")

    // (1) Sign in
    const handleSignIn = async (localUserId: string, localPassword: string):Promise<void> => {
        setIsLoading(true);

        const authenticationDetails = new AuthenticationDetails({
            Username: localUserId,
            Password: localPassword
        })
        const cognitoUser = new CognitoUser({
            Username: localUserId,
            Pool: userPool
        })

        const p = new Promise<void>((resolve, reject)=>{
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: (result) => {
                    const accessToken = result.getAccessToken().getJwtToken()
                    const idToken = result.getIdToken().getJwtToken()
                    const refreshToken = result.getRefreshToken().getToken()
                    setSignInInfo(localUserId, idToken, accessToken, refreshToken)
                    setIsLoading(false)
                    resolve()
                },
                onFailure: (err) => {
                    console.log("signin error:", err)
                    setIsLoading(false);
                    reject(err)
                }
            })
        })
        return p
    }

    // (2) Sign up
    const handleSignUp = async (localUserId: string, localPassword: string):Promise<void>  => {
        setIsLoading(true)
        const attributeList = [
            new CognitoUserAttribute({
                Name: 'email',
                Value: localUserId
            })
        ]
        const p = new Promise<void>((resolve, reject)=>{
            userPool.signUp(localUserId, localPassword, attributeList, [], (err, result) => {
                setIsLoading(false)
                if (err) {
                    reject(err)
                    return
                }
                resolve()
            })
        })
        return p
    }

    // (3) Verify Code
    const handleVerify = async (localUserId: string, localVerifyCode: string):Promise<void> => {
        setIsLoading(true)
        const cognitoUser = new CognitoUser({
            Username: localUserId,
            Pool: userPool
        })

        const p = new Promise<void>((resolve, reject)=>{
            cognitoUser.confirmRegistration(localVerifyCode, true, (err: any) => {
                setIsLoading(false)
                if (err) {
                    reject(err)
                    return
                }
                resolve()
            })
        })
        return p
    }

    // (4) Resend Verify Code
    const handleResendVerification = async (localUserId: string):Promise<void> => {
        setIsLoading(true);
        const cognitoUser = new CognitoUser({
            Username: localUserId,
            Pool: userPool
        })
        const p = new Promise<void>((resolve, reject)=>{
            cognitoUser.resendConfirmationCode((err: any) => {
                setIsLoading(false);
                if (err) {
                    reject(err)
                    return
                }
                resolve()
            })
        })
        return p
    }

    // (5) Forgot Password
    const handleSendVerificationCodeForChangePassword = async (localUserId: string):Promise<void> => {
        setIsLoading(true);
        const cognitoUser = new CognitoUser({
            Username: localUserId,
            Pool: userPool
        })

        const p = new Promise<void>((resolve, reject)=>{
            cognitoUser.forgotPassword({
                onSuccess: (data) => {
                    setIsLoading(false);
                    resolve()
                },
                onFailure: (err) => {
                    setIsLoading(false);
                    reject(err)
                }
            })
        })
        return p
    }

    // (6) New Password
    const handleNewPassword = async (localUserId: string, localVerifycode: string, localPassword: string):Promise<void> => {
        setIsLoading(true);
        const cognitoUser = new CognitoUser({
            Username: localUserId,
            Pool: userPool
        })

        const p = new Promise<void>((resolve, reject)=>{
            cognitoUser.confirmPassword(localVerifycode, localPassword, {
                onSuccess: () => {
                    setIsLoading(false);
                    resolve()
                },
                onFailure: (err) => {
                    setIsLoading(false);
                    reject(err)
                }
            })
        })
        return p
    }


    // (x) Sign out
    const handleSignOut = async (localUserId: string):Promise<void> => {
        setIsLoading(true);
        const cognitoUser = new CognitoUser({
            Username: localUserId,
            Pool: userPool
        })
        cognitoUser.signOut()
        setSignInInfo("", "", "", "")
        setIsLoading(false)
        const p = new Promise<void>((resolve, reject)=>{
            resolve()
        })
    }


    const providerValue = {
        isLoading,

        localUserId,
        localPassword,
        localVerifyCode,
        setLocalUserId,
        setLocalPassword,
        setLocalVerifyCode,

        handleSignIn,
        handleSignUp,
        handleVerify,
        handleResendVerification,
        handleSendVerificationCodeForChangePassword,
        handleNewPassword,
        handleSignOut,
    }

    return (
        <SignInStateContext.Provider value={providerValue}>
            {children}
        </SignInStateContext.Provider>
    )
}
