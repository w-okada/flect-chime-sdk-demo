import { useEffect, useMemo, useState } from "react"
import { CognitoUser, AuthenticationDetails, CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { OnetimeCodeInfo, singinWithOnetimeCode, singinWithOnetimeCodeRequest } from "../../api/api";
import { useScheduler } from "./useScheduler";


type UseCredentialsProps = {
    UserPoolId: string
    ClientId:   string
    DefaultUserId?: string
    DefaultPassword?: string 
}

type UseCredentialsStates = {
    userId?: string
    password?: string
    idToken?: string
    accessToken?: string
    refreshToken?: string
}


export const useCredentials = (props:UseCredentialsProps) => {
    const userPool = useMemo(()=>{
        return new CognitoUserPool({
            UserPoolId: props.UserPoolId, 
            ClientId: props.ClientId
        })
    },[])// eslint-disable-line

    const [ state, setState] = useState<UseCredentialsStates>({
        userId: props.DefaultUserId,
        password: props.DefaultPassword,
    })

    const [onetimeCodeInfo, setOnetimeCodeInfo] = useState<OnetimeCodeInfo|null>(null)
    const { thirtyMinutesSecondsTaskTrigger } = useScheduler()

    // (1) Sign in
    const handleSignIn = async (inputUserId: string, inputPassword: string)=> {
        const authenticationDetails = new AuthenticationDetails({
            Username: inputUserId,
            Password: inputPassword
        })
        const cognitoUser = new CognitoUser({
            Username: inputUserId,
            Pool: userPool
        })


        const p = new Promise<void>((resolve, reject)=>{
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: (result) => {
                    const accessToken = result.getAccessToken().getJwtToken()
                    const idToken = result.getIdToken().getJwtToken()
                    const refreshToken = result.getRefreshToken().getToken()
                    setState( {...state, userId:inputUserId, idToken:idToken, accessToken:accessToken, refreshToken:refreshToken})
                    resolve()
                },
                onFailure: (err) => {
                    console.log("signin error:", err)
                    reject(err)
                }
            })
        })
        return p
    }


    // (2) Sign up
    const handleSignUp = async (inputUserId: string, inputPassword: string) => {
        const attributeList = [
            new CognitoUserAttribute({
                Name: 'email',
                Value: inputUserId
            })
        ]
        const p = new Promise<void>((resolve, reject)=>{
            userPool.signUp(inputUserId, inputPassword, attributeList, [], (err, result) => {
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
    const handleVerify = async (inputUserId: string, inputVerifyCode: string):Promise<void> => {
        const cognitoUser = new CognitoUser({
            Username: inputUserId,
            Pool: userPool
        })

        const p = new Promise<void>((resolve, reject)=>{
            cognitoUser.confirmRegistration(inputVerifyCode, true, (err: any) => {
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
    const handleResendVerification = async (inputUserId: string)=> {
        const cognitoUser = new CognitoUser({
            Username: inputUserId,
            Pool: userPool
        })
        const p = new Promise<void>((resolve, reject)=>{
            cognitoUser.resendConfirmationCode((err: any) => {
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
    const handleSendVerificationCodeForChangePassword = async (inputUserId: string) => {
        const cognitoUser = new CognitoUser({
            Username: inputUserId,
            Pool: userPool
        })

        const p = new Promise<void>((resolve, reject)=>{
            cognitoUser.forgotPassword({
                onSuccess: (data) => {
                    resolve()
                },
                onFailure: (err) => {
                    reject(err)
                }
            })
        })
        return p
    }

    // (6) New Password
    const handleNewPassword = async (inputUserId: string, inputVerifycode: string, inputPassword: string) => {
        const cognitoUser = new CognitoUser({
            Username: inputUserId,
            Pool: userPool
        })

        const p = new Promise<void>((resolve, reject)=>{
            cognitoUser.confirmPassword(inputVerifycode, inputPassword, {
                onSuccess: () => {
                    resolve()
                },
                onFailure: (err) => {
                    reject(err)
                }
            })
        })
        return p
    }


    // (7) refresh token // not implemented. (hard to handle multiuser of one user id)
    useEffect(()=>{
        if(thirtyMinutesSecondsTaskTrigger===0){
            return
        }

    },[thirtyMinutesSecondsTaskTrigger])


    // (x) Sign out
    const handleSignOut = async (inputUserId: string) => {
        const cognitoUser = new CognitoUser({
            Username: inputUserId,
            Pool: userPool
        })
        cognitoUser.signOut()
        setState( {...state, userId:"", password:"", idToken:"", accessToken:"", refreshToken:""})
    }

    ///////////////////
    ///  Ontime Code signin
    ///////////////

    // (a-1) Signin request
    const handleSinginWithOnetimeCodeRequest = async (meetingName:string, attendeeId:string, uuid:string) =>{
        const res = await singinWithOnetimeCodeRequest(meetingName, attendeeId, uuid)
        setOnetimeCodeInfo(res)
        return res
    }

    // (a-2) Signin
    const handleSinginWithOnetimeCode = async (meetingName:string, attendeeId:string, uuid:string, code:string) =>{
        console.log("Active Speaker::::::: one timecode signin")
        const res = await singinWithOnetimeCode(meetingName, attendeeId, uuid, code)
        console.log("Active Speaker::::::: one time code res:", res)
        setState( {...state, userId:"-", idToken:res.idToken, accessToken:res.accessToken, refreshToken:"-"})
        return res
    }

    // // (a-1) Signin request
    // const handleSinginWithOnetimeCodeRequest_dummy = async (meetingName:string, attendeeId:string, uuid:string) =>{
    //     // const res = await singinWithOnetimeCodeRequest(meetingName, attendeeId, uuid)
    //     const res: OnetimeCodeInfo = {
    //         uuid: "",
    //         codes: [],
    //         status:"",
    //         meetingName:"",
    //         attendeeId:"",
    //     }
    //     setOnetimeCodeInfo(res)
    //     return res
    // }


    return {
        ...state, 
        handleSignIn, 
        handleSignUp, 
        handleVerify, 
        handleResendVerification, 
        handleSendVerificationCodeForChangePassword, 
        handleNewPassword,
        handleSignOut,
        onetimeCodeInfo,
        handleSinginWithOnetimeCodeRequest,
        handleSinginWithOnetimeCode,
        // handleSinginWithOnetimeCodeRequest_dummy,
    }
}

