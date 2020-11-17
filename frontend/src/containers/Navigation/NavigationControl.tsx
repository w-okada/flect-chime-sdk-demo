// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import Navigation from '.';
import { useNavigation } from '../../providers/NavigationProvider';
import ChatView from '../ChatView/ChatView';
import MeetingRoster from '../MeetingRoster';

const NavigationControl = () => {
  const { showNavbar, showRoster, showChatView } = useNavigation();

  return (
    <>
      {showNavbar ? <Navigation /> : null}
      {showRoster ? <MeetingRoster /> : null}
      {showChatView? <ChatView />: null}
    </>
  );
};

export default NavigationControl;
