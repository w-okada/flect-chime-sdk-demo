// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import {
  Flex,
  SecondaryButton,
  Label
} from 'amazon-chime-sdk-component-library-react';

import { CreateMeetingForm, JoinMeetingForm, CreatedMeetingForm } from '../MeetingForm';
import { StyledDiv, StyledWrapper } from './Styled';
import { useMeetingFormState } from '../../providers/MeetingFormStateProvider';


const MeetingFormSelector: React.FC = () => {
  const {mode, setMode} = useMeetingFormState()


  const forms= (() => {
    switch(mode){
      case "CREATE_MEETING":
        return [
          // <></>,
          <CreateMeetingForm />, 
          <div>
            <Label onClick={()=>setMode("JOIN_MEETING")}><a href="#" style={{color: '#989da5'}}>switch to join meeting</a> </Label>
          </div>
        ]
      case "JOIN_MEETING":
        return [
          <JoinMeetingForm />,
          <div>
            <Label onClick={()=>setMode("CREATE_MEETING")}><a href="#" style={{color: '#989da5'}}>switch to create meeting</a> </Label>
          </div>
        ]

      case "CREATED_MEETING":
        return [
          <CreatedMeetingForm />,
          <div>
            <Label onClick={()=>setMode("JOIN_MEETING")}><a href="#" style={{color: '#989da5'}}>join meeting</a> </Label>
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

export default MeetingFormSelector;
