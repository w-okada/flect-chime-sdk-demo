// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import Navigation from '.';
import { useNavigation } from '../../providers/NavigationProvider';
import ChatView from '../ChatView/ChatView';
import MeetingRoster from '../MeetingRoster';
import WhiteboardView from '../WhiteboardView/WhiteboardView';

const NavigationControl = () => {
  const { showNavbar, showRoster, showChatView, showWhiteboardView } = useNavigation();

  return (
    <>
      {showNavbar ? <Navigation /> : null}
      {showRoster ? <MeetingRoster /> : null}
      {showChatView? <ChatView />: null}
      {showWhiteboardView? <WhiteboardView />: null}
    </>
  );
};

export default NavigationControl;
