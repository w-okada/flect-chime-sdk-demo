// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { DeviceConfig } from 'amazon-chime-sdk-component-library-react/lib/types';
import { useVideoInputs, useLocalVideo, useSelectVideoInputDevice, ControlBarButton, Camera, useMeetingManager } from 'amazon-chime-sdk-component-library-react';
import { PopOverItemProps } from 'amazon-chime-sdk-component-library-react/lib/components/ui/PopOver/PopOverItem';
// import { ControlBarButton } from '../../ui/ControlBar/ControlBarItem';
// import { Camera } from '../../ui/icons';
// import { useVideoInputs } from '../../../providers/DevicesProvider';
// import { useLocalVideo } from '../../../providers/LocalVideoProvider';
// import { DeviceConfig } from '../../../types';
// import { isOptionActive } from '../../../utils/device-utils';
// import { PopOverItemProps } from '../../ui/PopOver/PopOverItem';
// import useSelectVideoInputDevice from '../../../hooks/sdk/useSelectVideoInputDevice';

interface Props {
  /** The label that will be shown for video input control, it defaults to `Video`. */
  label?: string;
}

const videoInputConfig: DeviceConfig = {
  additionalDevices: true
};


export const isOptionActive = (
  meetingManagerDeviceId: string | null,
  currentDeviceId: string
): boolean => {
  if (currentDeviceId === 'none' && meetingManagerDeviceId === null) {
    return true;
  }
  return currentDeviceId === meetingManagerDeviceId;
};


const videoElement = (() =>{
  const e = document.createElement("video")
  e.width=640
  e.height=480
  return e
})()

const canvasElement =  (() => {
  const e = document.createElement("canvas")
  e.width=640
  e.height=480
  return e
})()


const EffectedVideoInputControl: React.FC<Props> = ({ label = 'Video' }) => {
  const { devices, selectedDevice } = useVideoInputs(videoInputConfig);

  const { isVideoEnabled, toggleVideo } = useLocalVideo();
  const selectDevice = useSelectVideoInputDevice();

  const meetingManager = useMeetingManager();
  
  const dropdownOptions: PopOverItemProps[] = devices.map((device: any) => ({
    children: <span>{device.label}</span>,
    checked: isOptionActive(selectedDevice, device.deviceId),
    onClick: () => selectDevice(device.deviceId)
    // onClick: () => {
    //   canvasElement.getContext("2d")!.fillText("ABCD!!!!",10,10)
    //   // @ts-ignore
    //   const mediaStream = canvasElement.captureStream() as MediaStream

    //   meetingManager.selectVideoInputDevice = async(deviceId:string) => {


    //   }
    //   console.log("STREAM:::: ", mediaStream, device)
    //   // meetingManager.audioVideo?.chooseVideoInputDevice(device.deviceId)
    //   meetingManager.audioVideo?.chooseVideoInputDevice( mediaStream).then(()=>{
    //     meetingManager.audioVideo?.startLocalVideoTile()
    //   })
    // }
  }));

  return (
    <ControlBarButton
      icon={<Camera disabled={!isVideoEnabled} />}
      onClick={toggleVideo}
      label={label}
      popOver={dropdownOptions}
    />
  );
};

export default EffectedVideoInputControl;
