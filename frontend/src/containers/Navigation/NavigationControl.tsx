// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import Navigation from '.';
import { useNavigation } from '../../providers/NavigationProvider';
import ChatView from '../ChatView/ChatView';
import MeetingRoster from '../MeetingRoster';
import WhiteboardView from '../WhiteboardView/WhiteboardView';

const NavigationControl = () => {
  const { showNavbar, naviShowTarget } = useNavigation();

  return (
    <>
      {showNavbar ? <Navigation /> : null}
      {naviShowTarget === "ROSTER" ? <MeetingRoster /> : null}
      {naviShowTarget === "CHAT" ? <ChatView />: null}
      {naviShowTarget === "WHITEBOARD" ? <WhiteboardView />: null}
    </>
  );
};

export default NavigationControl;
