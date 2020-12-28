// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect } from 'react';
import { useMeetingManager } from 'amazon-chime-sdk-component-library-react';

import { StyledLayout, StyledContent } from './Styled';
import NavigationControl from '../../containers/Navigation/NavigationControl';
import { useNavigation } from '../../providers/NavigationProvider';
import MeetingDetails from '../../containers/MeetingDetails';
import MeetingControls from '../../containers/MeetingControls';
import useMeetingEndRedirect from '../../hooks/useMeetingEndRedirect';
import MeetingMetrics from '../../containers/MeetingMetrics';
import { useVideoEffectState } from '../../providers/VideoEffectProvider/VideoEffectProvider';
import { RealitimeSubscribeStateProvider } from '../../providers/RealtimeSubscribeProvider';
import CustomVideoTileGrid from '../../containers/CustomVideoTileGrid';
import { WebSocketStateProvider } from '../../providers/WebScoketProvider';
import CustomWhiteboardTileGrid from '../../containers/CustomWhiteboardTileGrid';
import { useAppState } from '../../providers/AppStateProvider';


const SecondWhiteboardView = () => {
  useMeetingEndRedirect();
  const { showNavbar, naviShowTarget, setNaviShowTarget } = useNavigation();
  const { setMode } = useAppState()
  setNaviShowTarget("WHITEBOARD")
  setMode("Whiteboard")


  return (
    // <UserActivityProvider>
    <StyledLayout showNav={showNavbar} showRoster={naviShowTarget!=="NONE"}>
      <RealitimeSubscribeStateProvider>
        <WebSocketStateProvider>
          <StyledContent>
            <CustomWhiteboardTileGrid
              className="videos"
              noRemoteVideoView={<MeetingDetails />}
            />
          </StyledContent>
          <NavigationControl />
        </WebSocketStateProvider>
      </RealitimeSubscribeStateProvider>
    </StyledLayout>
    // </UserActivityProvider>
  );
};

export default SecondWhiteboardView;
