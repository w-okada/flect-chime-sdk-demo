// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect } from 'react';
import { Label } from 'amazon-chime-sdk-component-library-react';


import { StyledDiv, StyledWrapper } from './Styled';
import { SignInForm, SignUpForm, VerifyForm, ResendVerificationForm, ForgotPasswordForm, NewPasswordForm } from '../SigInForm';
import { MODE } from '../../providers/SignInStateProvider';
import { useSignInState } from '../../providers/SignInStateProvider';
import { useHistory } from "react-router-dom"
import routes from '../../constants/routes';

const SignInFormSelector: React.FC = () => {
  const query = new URLSearchParams(window.location.search);
  const {mode, setMode} = useSignInState()
  const history = useHistory()
  useEffect(() => {
    if(query.get('mode') === "VERIFY" && mode !== "VERIFY"){
      setMode(query.get('mode') as MODE)
      history.push(routes.SIGNIN);
    }
  });


  const forms= (() => {
    switch(mode){
      case "SIGNIN":
        return [
          <SignInForm />, 
          <div>
            <Label onClick={()=>setMode("SIGNUP")} style={{textDecoration:"underline", cursor:"pointer"}}>Signup</Label>
            <br/>
            <Label onClick={()=>setMode("VERIFY")} style={{textDecoration:"underline", cursor:"pointer"}}>Verify Code</Label>
            <br/>
            <Label onClick={()=>setMode("RESEND_VERIFICATION")}  style={{textDecoration:"underline", cursor:"pointer"}}>Resend Verification Code</Label>
            <br/>
            <Label onClick={()=>setMode("FORGOT_PASSWORD")}  style={{textDecoration:"underline", cursor:"pointer"}}>Forgot Password or Change Password </Label>
          </div>
        ]
      case "SIGNUP":
        return [
          <SignUpForm />, 
          <div>
            <Label onClick={()=>setMode("SIGNIN")} style={{textDecoration:"underline", cursor:"pointer"}}> Back </Label>
          </div>
        ]
      case "VERIFY":
        return [
          <VerifyForm />, 
          <div>
            <Label onClick={()=>setMode("SIGNIN")} style={{textDecoration:"underline", cursor:"pointer"}}> Back </Label>
            <br/>
            <Label onClick={()=>setMode("RESEND_VERIFICATION")} style={{textDecoration:"underline", cursor:"pointer"}}>Resend Verification Code </Label>
          </div>
        ]
      case "RESEND_VERIFICATION":
        return [
          <ResendVerificationForm />, 
          <div>
            <Label onClick={()=>setMode("SIGNIN")} style={{textDecoration:"underline", cursor:"pointer"}}> Back </Label>
          </div>
        ]
      case "FORGOT_PASSWORD":
        return [
          <ForgotPasswordForm />, 
          <div>
            <Label onClick={()=>setMode("SIGNIN")} style={{textDecoration:"underline", cursor:"pointer"}}> Back </Label>
          </div>
        ]
      case "NEW_PASSWORD":
        return [
          <NewPasswordForm />, 
          <div>
            <Label onClick={()=>setMode("SIGNIN")} style={{textDecoration:"underline", cursor:"pointer"}}> Back </Label>
          </div>
        ]
      }
  })()
  const form = forms[0]
  const links = forms[1]

  return (
      <StyledWrapper>
        <StyledDiv>
          {form}
        </StyledDiv>
        <StyledDiv>
          {links}
        </StyledDiv>
      </StyledWrapper>
  );
};




export default SignInFormSelector
