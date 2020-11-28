// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
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


const MeetingView = () => {
  useMeetingEndRedirect();
  const { showNavbar, naviShowTarget } = useNavigation();
  const meetingManager = useMeetingManager();
  const { setDeviceId } = useVideoEffectState()


  // Hook!!!
  meetingManager.selectVideoInputDevice = async (deviceId: string) => {
    console.log("Update Video Input")
    try {
      const receivedDevice = await setDeviceId(deviceId);
      if (receivedDevice === null) {
        await meetingManager.audioVideo?.chooseVideoInputDevice(null);
        meetingManager.selectedVideoInputDevice = null;
      } else {
        await meetingManager.audioVideo?.chooseVideoInputDevice(receivedDevice);
        meetingManager.selectedVideoInputDevice = deviceId;
      }
      for (let i = 0; i < meetingManager.selectedVideoInputDeviceObservers.length; i += 1) {
        const callback = meetingManager.selectedVideoInputDeviceObservers[i];
        callback(meetingManager.selectedVideoInputDevice);
      }
    } catch (error) {
      console.error(`Error setting video input - ${error}`);
    }
  }



  return (
    // <UserActivityProvider>
    <StyledLayout showNav={showNavbar} showRoster={naviShowTarget!=="NONE"}>
      <RealitimeSubscribeStateProvider>
        <WebSocketStateProvider>
          <StyledContent>

            <MeetingMetrics />
            <CustomVideoTileGrid
              className="videos"
              noRemoteVideoView={<MeetingDetails />}
            />
            <MeetingControls />

          </StyledContent>
          <NavigationControl />
        </WebSocketStateProvider>
      </RealitimeSubscribeStateProvider>
    </StyledLayout>
    // </UserActivityProvider>
  );
};

export default MeetingView;
