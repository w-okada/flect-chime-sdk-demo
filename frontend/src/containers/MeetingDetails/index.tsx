// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import {
  Flex,
  Heading,
  useMeetingManager
} from 'amazon-chime-sdk-component-library-react';

import { useAppState } from '../../providers/AppStateProvider';
import { StyledList } from './Styled';

const MeetingDetails = () => {
  const { meetingName, meetingId } = useAppState();
  const manager = useMeetingManager();

  return (
    <Flex container layout="fill-space-centered">
      <Flex >
        <Heading level={4} tag="h1">
          Meeting information
        </Heading>
        <StyledList>
        <div>
            <dt>Meeting ID</dt>
            <dd>{meetingId}</dd>
          </div>
          <div>
            <dt>Meeting Name</dt>
            <dd>{meetingName}</dd>
          </div>
          <div>
            <dt>Hosted region</dt>
            <dd>{manager.meetingRegion}</dd>
          </div>
        </StyledList>
      </Flex>
    </Flex>
  );
};

export default MeetingDetails;
