// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import MeetingFormSelector from '../../containers/MeetingFormSelector';
import { StyledLayout } from './Styled';
import { VersionLabel } from '../../utils/VersionLabel';
import { MeetingFormStateProvider } from '../../providers/MeetingFormStateProvider';
import { useAppState } from '../../providers/AppStateProvider';
import routes from '../../constants/routes';
import { useHistory } from 'react-router-dom';

const Home = () => {
  const { userId, idToken} = useAppState();
  const history = useHistory();
  
  if(!userId || !idToken){
    history.push(routes.SIGNIN)
    return <div />
  } 

  return(
    <MeetingFormStateProvider>
      <StyledLayout>
        <MeetingFormSelector />
        <VersionLabel />
      </StyledLayout>
    </MeetingFormStateProvider>
  )
}

export default Home;
