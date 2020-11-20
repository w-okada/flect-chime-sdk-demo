// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { DeviceConfig } from 'amazon-chime-sdk-component-library-react/lib/types';
import { useVideoInputs, useLocalVideo, useSelectVideoInputDevice, ControlBarButton, Camera, useMeetingManager } from 'amazon-chime-sdk-component-library-react';
import { PopOverItemProps } from 'amazon-chime-sdk-component-library-react/lib/components/ui/PopOver/PopOverItem';

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

const CustomizedVideoInputControl: React.FC<Props> = ({ label = 'Video' }) => {
  const { devices, selectedDevice } = useVideoInputs(videoInputConfig);
  const { isVideoEnabled, toggleVideo } = useLocalVideo();
  const selectDevice = useSelectVideoInputDevice();
  const meetingManager = useMeetingManager();

  const dropdownOptions: PopOverItemProps[] = devices.map((device: any) => ({
    children: <span>{device.label}</span>,
    checked: isOptionActive(selectedDevice, device.deviceId),
    onClick: () => selectDevice(device.deviceId)
  }));

  const toggle = () => {
    meetingManager.selectedVideoInputDevice = "blue"
    toggleVideo().then(() => {
      if (selectedDevice) {
        selectDevice(selectedDevice)
      }
    })
  }

  return (
    <ControlBarButton
      icon={<Camera disabled={!isVideoEnabled} />}
      onClick={toggle}
      label={label}
      popOver={dropdownOptions}
    />
  );
};

export default CustomizedVideoInputControl;
