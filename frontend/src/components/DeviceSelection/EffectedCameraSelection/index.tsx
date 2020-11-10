// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { useMeetingManager, useVideoInputs } from 'amazon-chime-sdk-component-library-react';
import DeviceInput from './DeviceInput';
import { SelectedDeviceId } from 'amazon-chime-sdk-component-library-react/lib/types';

// import { useMeetingManager } from '../../../../providers/MeetingProvider';
// import { useVideoInputs } from '../../../../providers/DevicesProvider';
// import DeviceInput from '../DeviceInput';

interface Props {
  /** The message that will be shown when no camera devices are found. */
  notFoundMsg?: string;
  /** The label that will be shown for camera selection, it defaults to "Camera source". */
  label?: string;
}


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

let selectedDeviceId = ""

export const EffectedCameraSelection: React.FC<Props> = ({
  notFoundMsg = 'No camera devices found',
  label = 'Camera source'
}) => {

  const meetingManager = useMeetingManager();
  const { devices, selectedDevice } = useVideoInputs();
  const [ deviceId, setDeviceId] = useState(devices[0] ? devices[0]:"")

  async function selectVideoInput(deviceId: string) {
    console.log("selectedID::::", deviceId)
    setDeviceId(deviceId)
    // meetingManager.selectVideoInputDevice(deviceId);
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video:{deviceId: deviceId,}
    }).then(stream=>{
      console.log("stream",stream)
      videoElement.srcObject = stream
      videoElement.play()

    })
  }

  canvasElement.getContext("2d")!.fillText("AAAAAAAAAAAAAAAAAAAAAA", 10, 10)
  // @ts-ignore
  // const mediaStream = canvasElement.captureStream() as MediaStream
  // @ts-ignore
  // const mediaStream = videoElement.captureStream() as MediaStream
  // meetingManager.audioVideo?.chooseVideoInputDevice(mediaStream)
  
  const captureVideo = () => {
    // canvasElement.getContext("2d")!.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height)
    canvasElement.getContext("2d")!.fillRect(0, 0, canvasElement.width-10, canvasElement.height-10)
    requestAnimationFrame(captureVideo)
    console.log("capture")
  }
  captureVideo()


  return (
    <DeviceInput
      label={label}
      onChange={selectVideoInput}
      devices={devices}
      // selectedDeviceId={selectedDevice}
      selectedDeviceId={deviceId as SelectedDeviceId}
      notFoundMsg={notFoundMsg}
    />
  );
};

export default EffectedCameraSelection;
