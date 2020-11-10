// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {
  ControlBar,
  AudioInputControl,
  VideoInputControl,
  ContentShareControl,
  AudioOutputControl,
  ControlBarButton,
  useUserActivityState,
  Dots
} from 'amazon-chime-sdk-component-library-react';

import EndMeetingControl from '../EndMeetingControl';
import { useNavigation } from '../../providers/NavigationProvider';
import { StyledControls } from './Styled';
import EffectedVideoInputControl from './EffectedVideoInputControl';
import VideoEffectControl from '../VideoEffectControl';
import CustomizedVideoInputControl from './CustomizedVideoIputControle';

const MeetingControls = () => {
  const { toggleNavbar, closeRoster, showRoster } = useNavigation();
  const { isUserActive } = useUserActivityState();

  const handleToggle = () => {
    if (showRoster) {
      closeRoster();
    }

    toggleNavbar();
  };

  return (
    <StyledControls className="controls" active={!!isUserActive}>
      <ControlBar
        className="controls-menu"
        layout="undocked-horizontal"
        showLabels
      >
        <ControlBarButton
          className="mobile-toggle"
          icon={<Dots />}
          onClick={handleToggle}
          label="Menu"
        />
        <AudioInputControl />
        {/* <VideoInputControl /> */}
        {/* <EffectedVideoInputControl /> */}
        <CustomizedVideoInputControl />
        <ContentShareControl />
        <AudioOutputControl />
        <EndMeetingControl />
        <VideoEffectControl />
      </ControlBar>
    </StyledControls>
  );
};

export default MeetingControls;
