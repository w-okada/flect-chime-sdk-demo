// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {
  VideoTileGrid,
  UserActivityProvider,
  useMeetingManager
} from 'amazon-chime-sdk-component-library-react';

import { StyledLayout, StyledContent } from './Styled';
import NavigationControl from '../../containers/Navigation/NavigationControl';
import { useNavigation } from '../../providers/NavigationProvider';
import MeetingDetails from '../../containers/MeetingDetails';
import MeetingControls from '../../containers/MeetingControls';
import useMeetingEndRedirect from '../../hooks/useMeetingEndRedirect';
import MeetingMetrics from '../../containers/MeetingMetrics';
import { DefaultDeviceController, Device, IntervalScheduler } from 'amazon-chime-sdk-js';
import { useVideoEffectState, BackgroundEffect, FrontEffect } from '../../providers/VideoEffectProvider';

const synthesizeVideoDevice = (colorOrPattern: string): MediaStream | null => {
  const canvas = document.createElement('canvas') as HTMLCanvasElement;
  canvas.width = 480;
  canvas.height = (canvas.width / 16) * 9;
  const scheduler = new IntervalScheduler(1000);
  const context = canvas.getContext('2d');
  // @ts-ignore
  const stream: MediaStream | null = canvas.captureStream(5) || null;
  if (stream) {
    scheduler.start(() => {
      if (colorOrPattern === 'smpte') {
        context!.fillStyle = "#00ff00";
        context!.fillRect(0, 0, canvas.width, canvas.height);
        context!.fillStyle = "#ff0000";
        context!.fillText("AASFASDFSAF",10,10)
//        DefaultDeviceController.fillSMPTEColorBars(canvas, 0);
      } else {
        context!.fillStyle = colorOrPattern;
        context!.fillRect(0, 0, canvas.width, canvas.height);
      }
    });
    stream.getVideoTracks()[0].addEventListener('ended', () => {
      scheduler.stop();
    });
  }
  return stream;
}


const v = document.createElement("video")
const c = document.createElement("canvas")

const videoInputSelectionToDevice = async (
  deviceId: string, frontEffect: FrontEffect, backgroundEffect:BackgroundEffect, 
  backgroundImage:HTMLImageElement|null, backgroundMediaStream?:MediaStream|null
  ): Promise<Device> => {

  navigator.mediaDevices.getUserMedia({
    audio:false,
    video:{deviceId:deviceId}
  }).then(stream=>{
    const videoWidth = stream.getVideoTracks()[0].getSettings().width
    const videoHeight = stream.getVideoTracks()[0].getSettings().height
    console.log(videoHeight, videoWidth)
    v.width=videoWidth!
    v.height=videoHeight!
    v.srcObject = stream
    v.play()

    c.width = videoWidth!
    c.height = videoHeight!
    c.getContext("2d")!.fillRect(0,0,100,100)
  })

  // @ts-ignore
  const mediaStream = c.captureStream() as MediaStream
  return mediaStream
}

const MeetingView = () => {
  useMeetingEndRedirect();
  const { showNavbar, showRoster } = useNavigation();
  const meetingManager = useMeetingManager();
  const {backgroundEffect, backgroundImage, backgroundMediaStream, frontEffect} = useVideoEffectState()
  console.log(backgroundEffect)
  
  meetingManager.selectVideoInputDevice = async(deviceId:string) => {
    console.log("SELEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE")
    try {
      const receivedDevice = await videoInputSelectionToDevice(deviceId, frontEffect, backgroundEffect, backgroundImage, backgroundMediaStream);
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
      <StyledLayout showNav={showNavbar} showRoster={showRoster}>
        <StyledContent>
          <MeetingMetrics />
          <VideoTileGrid
            className="videos"
            noRemoteVideoView={<MeetingDetails />}
          />
          <MeetingControls />
        </StyledContent>
        <NavigationControl />
      </StyledLayout>
    // </UserActivityProvider>
  );
};

export default MeetingView;
