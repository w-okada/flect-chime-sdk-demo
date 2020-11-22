// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {
  ControlBar,
  AudioInputControl,
  ContentShareControl,
  AudioOutputControl,
  ControlBarButton,
  useUserActivityState,
  Dots
} from 'amazon-chime-sdk-component-library-react';

import EndMeetingControl from '../EndMeetingControl';
import { useNavigation } from '../../providers/NavigationProvider';
import { StyledControls } from './Styled';
import VideoEffectControl from '../VideoEffectControl';
import CustomizedVideoInputControl  from './CustomizedVideoIputControl';

const MeetingControls = () => {
  const { toggleNavbar, setNaviShowTarget } = useNavigation();
  const { isUserActive } = useUserActivityState();

  const handleToggle = () => {
    setNaviShowTarget("NONE")

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
        <CustomizedVideoInputControl />
        <ContentShareControl />
        <AudioOutputControl />
        <VideoEffectControl />
        <EndMeetingControl />
      </ControlBar>
    </StyledControls>
  );
};

export default MeetingControls;
