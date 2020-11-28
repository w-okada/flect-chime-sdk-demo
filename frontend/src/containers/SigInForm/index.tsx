// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useContext, ChangeEvent } from 'react';
import {
  Input,
  Flex,
  Heading,
  FormField,
  PrimaryButton,
  Modal,
  ModalBody,
  ModalHeader,
} from 'amazon-chime-sdk-component-library-react';

import { getErrorContext } from '../../providers/ErrorProvider';
import Card from '../../components/Card';
import Spinner from '../../components/Spinner';
import { useSignInState } from '../../providers/SignInStateProvider';


const UserIdField:React.FC = () =>{

  const { userId, setUserId } = useSignInState()
  return (
    <FormField
      field={Input}
      label="User ID (email address)"
      value={userId}
      fieldProps={{
        name: 'userId',
        placeholder: 'Enter email address'
      }}
      onChange={(e: ChangeEvent<HTMLInputElement>)=>setUserId(e.target.value)}
    />)
}

const PasswordField:React.FC = () =>{
  const { password, setPassword } = useSignInState()
  return(
    <FormField
      field={Input}
      label="Password"
      fieldProps={{ type: 'password' }}
      value={password}
      // value={"*".repeat(password.length)}
      onChange={(e: ChangeEvent<HTMLInputElement>)=>{
        // let newPassword = e.target.value
        // if(newPassword.length > password.length){
        //   const lastChar = newPassword.slice(-1)
        //   newPassword = password + lastChar
        // }else if(newPassword.length < password.length){
        //   newPassword = password.slice(0, -1)
        // }else{
        //   newPassword=password
        // }
        setPassword(e.target.value)
      }}
    />
  )
}

const VerifyCodeField:React.FC = () =>{
  const { verifyCode, setVerifyCode } = useSignInState()
  return(
    <FormField
      field={Input}
      label="code"
      value={verifyCode}
      onChange={(e: ChangeEvent<HTMLInputElement>)=>setVerifyCode(e.target.value)}
    />
  )
}

const SubmitButton:React.FC<{isLoading:boolean, onClick:(e:React.MouseEvent<HTMLButtonElement, MouseEvent>)=>{}}> = ({isLoading, onClick}) => {
  return(
    <Flex
      container
      layout="fill-space-centered"
      style={{ marginTop: '2.5rem' }}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <PrimaryButton label="Continue" onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>)=>{ onClick(e)} } />
      )}
    </Flex>    
  )
}


const ErrorModal:React.FC = () =>{
  const { errorMessage, updateErrorMessage } = useContext(getErrorContext());

  return(
    <>
      {errorMessage && (
        <Modal size="md" onClose={ ()=>updateErrorMessage('')}>
          <ModalHeader title={`Error...`} />
          <ModalBody>
            <Card
              title="Unable to signin"
              description={errorMessage}
            />
          </ModalBody>
        </Modal>
      )}
    </>
  )
}


export const SignInForm: React.FC = () => {
  const { isLoading, handleSignIn} = useSignInState()
  return(
    <form>
      <Heading tag="h1" level={4} css="margin-bottom: 1rem">
        SignIn
      </Heading>
      <UserIdField />
      <PasswordField />
      <SubmitButton isLoading={isLoading} onClick={handleSignIn}/>
      <ErrorModal />
    </form>
  )
}


export const SignUpForm: React.FC = () => {
  const { isLoading, handleSignUp} = useSignInState()
  return(
    <form>
      <Heading tag="h1" level={4} css="margin-bottom: 1rem">
        SignUp
      </Heading>
      <UserIdField />
      <PasswordField />
      <SubmitButton isLoading={isLoading} onClick={handleSignUp}/>
      <ErrorModal />
    </form>
  )
}


export const VerifyForm: React.FC = () => {
  const { isLoading, handleVerify} = useSignInState()
  return(
    <form>
      <Heading tag="h1" level={4} css="margin-bottom: 1rem">
        Verify
      </Heading>
      <UserIdField />
      <VerifyCodeField />
      <SubmitButton isLoading={isLoading} onClick={handleVerify}/>
      <ErrorModal />
    </form>
  )
}


export const ResendVerificationForm: React.FC = () => {
  const { isLoading, handleResendVerification} = useSignInState()
  return(
    <form>
      <Heading tag="h1" level={4} css="margin-bottom: 1rem">
        Resend Verification code
      </Heading>
      <UserIdField />
      <SubmitButton isLoading={isLoading} onClick={handleResendVerification}/>
      <ErrorModal />
    </form>
  )
}

export const ForgotPasswordForm: React.FC = () => {
  const { isLoading, handleForgotPassword} = useSignInState()
  return(
    <form>
      <Heading tag="h1" level={4} css="margin-bottom: 1rem">
        Reset Password
      </Heading>
      <UserIdField />
      <SubmitButton isLoading={isLoading} onClick={handleForgotPassword}/>
      <ErrorModal />
    </form>
  )
}


export const NewPasswordForm: React.FC = () => {
  const { isLoading, handleNewPassword} = useSignInState()
  return(
    <form>
      <Heading tag="h1" level={4} css="margin-bottom: 1rem">
        New Password
      </Heading>
      <UserIdField />
      <VerifyCodeField />
      <PasswordField />
      <SubmitButton isLoading={isLoading} onClick={handleNewPassword}/>
      <ErrorModal />
    </form>
  )
}
//export default SignInForm;
