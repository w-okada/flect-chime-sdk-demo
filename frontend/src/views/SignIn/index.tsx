// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import MeetingFormSelector from '../../containers/MeetingFormSelector';
import { StyledLayout } from './Styled';
import { VersionLabel } from '../../utils/VersionLabel';
import SignInFormSelector from '../../containers/SignInSelector';
import { SignInStateProvider } from '../../providers/SignInStateProvider';

const SignIn = () => (
  <SignInStateProvider>
    <StyledLayout>
      <SignInFormSelector />
      <VersionLabel />
    </StyledLayout>
  </SignInStateProvider>
);

export default SignIn;
