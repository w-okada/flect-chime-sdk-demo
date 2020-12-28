import { useContext, useState, ReactNode } from "react"
import { useHistory } from "react-router-dom"
import { useAppState } from "./AppStateProvider"
import { getErrorContext } from "./ErrorProvider"
import { CognitoUser, AuthenticationDetails, CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import React from "react"
import { awsConfiguration, DEFAULT_USERID, DEFAULT_PASSWORD } from "../Config";
import routes from "../constants/routes";

export type MODE = "SIGNIN" | "SIGNUP" | "VERIFY" | "RESEND_VERIFICATION" | "FORGOT_PASSWORD" | "NEW_PASSWORD"

type Props = {
  children: ReactNode;
};

const userPool = new CognitoUserPool({
  UserPoolId: awsConfiguration.userPoolId,
  ClientId: awsConfiguration.clientId,
})



interface SignInStateValue {
  userId: string,
  password: string,
  verifyCode: string,
  isLoading: boolean,
  cognitoErrorCode: string,
  cognitoErrorName: string,
  cognitoErrorMessage: string,
  setError: (errorCode: string, errorName: string, errorMessage: string) => void,
  setUserId: (userId: string) => void,
  setPassword: (password: string) => void,
  setVerifyCode: (verifyCode: string) => void,
  setIsLoading: (isLoading: boolean) => void,

  handleSignIn: (e: React.FormEvent<Element>) => Promise<void>
  handleSignUp: (e: React.FormEvent<Element>) => Promise<void>
  handleVerify: (e: React.FormEvent<Element>) => Promise<void>
  handleResendVerification: (e: React.FormEvent<Element>) => Promise<void>
  handleForgotPassword: (e: React.FormEvent<Element>) => Promise<void>
  handleNewPassword: (e: React.FormEvent<Element>) => Promise<void>

  mode: MODE,
  setMode: (mode: MODE) => void

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
  const { setSignInInfo } = useAppState()
  const history = useHistory()
  const { updateErrorMessage } = useContext(getErrorContext());

  const [userId, setUserId] = useState(DEFAULT_USERID)
  const [password, setPassword] = useState(DEFAULT_PASSWORD)
  // const [userId, setUserId] = useState("")
  // const [password, setPassword] = useState("")

  const [verifyCode, setVerifyCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [cognitoErrorCode, setErrorCode] = useState("")
  const [cognitoErrorName, setErrorName] = useState("")
  const [cognitoErrorMessage, setErrorMessage] = useState("")

  const [mode, setMode] = useState("SIGNIN" as MODE)

  const setError = (errorCode: string, errorName: string, errorMessage: string) => {
    setErrorCode(errorCode)
    setErrorName(errorName)
    setErrorMessage(errorMessage)
  }


  // (1) Sign in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const authenticationDetails = new AuthenticationDetails({
      Username: userId,
      Password: password
    })
    const cognitoUser = new CognitoUser({
      Username: userId,
      Pool: userPool
    })

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        // console.log('result: ' + result)
        const accessToken = result.getAccessToken().getJwtToken()
        const idToken = result.getIdToken().getJwtToken()
        const refreshToken = result.getRefreshToken().getToken()
        // console.log(accessToken, idToken, refreshToken)
        setSignInInfo(userId, idToken, accessToken, refreshToken)
        history.push(routes.HOME);
      },
      onFailure: (err) => {
        console.log("signin error:", err)
        updateErrorMessage(err.message);
        setErrorCode(err.code)
        setErrorName(err.name)
        setErrorMessage(err.message)
        setIsLoading(false);
      }
    })
  }

  // (2) Sign up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const attributeList = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: userId
      })
    ]
    userPool.signUp(userId, password, attributeList, [], (err, result) => {
      setIsLoading(false);
      if (err) {
        console.error(err)
        updateErrorMessage(err.message);
        setErrorCode("")
        setErrorName(err.name)
        setErrorMessage(err.message)
        return
      }
      history.push(routes.SIGNIN);
      setMode("VERIFY")
    })
  }

  // (3) Verify Code
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const cognitoUser = new CognitoUser({
      Username: userId,
      Pool: userPool
    })
    cognitoUser.confirmRegistration(verifyCode, true, (err: any) => {
      setIsLoading(false);
      if (err) {
        console.log(err)
        updateErrorMessage(err.message);
        setErrorCode(err.code)
        setErrorName(err.name)
        setErrorMessage(err.message)
        setIsLoading(false);
        return
      }
      console.log('verification succeeded')
      history.push(routes.SIGNIN);
      setMode("SIGNIN")
    })

  }


  // (4) Resend Verify Code
  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const cognitoUser = new CognitoUser({
      Username: userId,
      Pool: userPool
    })
    cognitoUser.resendConfirmationCode((err: any) => {
      setIsLoading(false);
      if (err) {
        console.log(err)
        updateErrorMessage(err.message);
        setErrorCode(err.code)
        setErrorName(err.name)
        setErrorMessage(err.message)
        setIsLoading(false);
        return
      }
      console.log('verification resned')
      history.push(routes.SIGNIN);
      setMode("VERIFY")
    })
  }

  // (5) Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const cognitoUser = new CognitoUser({
      Username: userId,
      Pool: userPool
    })

    cognitoUser.forgotPassword({
      onSuccess: (data) => {
        setIsLoading(false);
        console.log('forgotPassword success')
        setMode("NEW_PASSWORD")
        history.push(routes.SIGNIN);
      },
      onFailure: (err) =>{
        setIsLoading(false);
        console.log('forgotPassword error')
        updateErrorMessage(err.message);
        setErrorCode("")
        setErrorName(err.name)
        setErrorMessage(err.message)
        setIsLoading(false);
      }

    })

  }

  // (6) New Password
  const handleNewPassword = async (e: React.FormEvent) =>{
    e.preventDefault();
    setIsLoading(true);
    const cognitoUser = new CognitoUser({
      Username: userId,
      Pool: userPool
    })
    cognitoUser.confirmPassword(verifyCode, password, {
      onSuccess:() => {
        setIsLoading(false);
        console.log("password chnaged")
      },
      onFailure:(err) => {
        setIsLoading(false);
        console.log("password chnaged failed")

      }
    })
  }
  
  const providerValue = {
    userId,
    password,
    verifyCode,
    isLoading,
    cognitoErrorCode,
    cognitoErrorName,
    cognitoErrorMessage,
    setError,
    setUserId,
    setPassword,
    setVerifyCode,
    setIsLoading,
    handleSignIn,
    handleSignUp,
    handleVerify,
    handleResendVerification,
    handleForgotPassword,
    handleNewPassword,

    mode,
    setMode,
  }

  return (
    <SignInStateContext.Provider value={providerValue}>
      {children}
    </SignInStateContext.Provider>
  )
}
