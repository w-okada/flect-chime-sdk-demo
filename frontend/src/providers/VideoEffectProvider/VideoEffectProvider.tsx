import { ReactNode, useContext, useState, useEffect } from "react";
import React from "react";


import { VideoEffector } from "./VideoEffector"
import { useAudioVideo } from "amazon-chime-sdk-component-library-react";
import { DefaultBrowserBehavior } from "amazon-chime-sdk-js";
import { AsciiConfig, AsciiOperatipnParams } from "@dannadori/asciiart-worker-js";

type Props = {
  children: ReactNode;
};

export type FrontEffect = "None" | "Ascii" | "Canny" | "Black"
export type BackgroundEffect = "None" | "Ascii" | "Canny" | "Black" | "Image" | "Window"
export type VideoQuality = '360p' | '540p' | '720p';

const FrontEffectOoptions: FrontEffect[] = ["None", "Ascii", "Canny", "Black"]
const BackgroundEffectOoptions: BackgroundEffect[] = ["None", "Ascii", "Canny", "Black", "Image", "Window"]
const VideoQualityOptions: VideoQuality[] = ['360p', '540p', '720p']
const VideoQualityDetails:{[key in VideoQuality]:number[]} = {
  '360p':[ 640, 360, 15, 6000],
  '540p':[ 960, 540, 15, 14000],
  '720p':[1280, 720, 15, 14000],
}


export interface VideoEffectStateValue {
  //Input Device
  deviceId: string
  setDeviceId: (deviceId: string) => MediaStream
  stopDevice: () => void
  selectQuality: (quality: VideoQuality) => void
  videoQuality: VideoQuality
  // Effect
  frontEffect: FrontEffect,
  backgroundEffect: BackgroundEffect
  backgroundMediaStream: MediaStream | null
  frontEffectOptions: FrontEffect[]
  backgroundEffectOptions: BackgroundEffect[]
  VideoQualityOptions: VideoQuality[]
  setFrontEffect: (e: FrontEffect) => void
  setBackgroundEffect: (e: BackgroundEffect) => void
  setBackgroundImage: (p: HTMLImageElement) => void
  setBackgroundMediaStream: (m: MediaStream | null) => void
}

export const VideoEffectStateContext = React.createContext<VideoEffectStateValue | null>(null)

export const useVideoEffectState = (): VideoEffectStateValue => {
  const state = useContext(VideoEffectStateContext)
  if (!state) {
    throw new Error("Error using video effect in context!")
  }
  return state
}


const browserBehavior: DefaultBrowserBehavior = new DefaultBrowserBehavior();

export const VideoEffectStateProvider = ({ children }: Props) => {
  const [deviceId, setDeviceIdInternal] = useState("blue")
  const audioVideo = useAudioVideo();
  const [frontMediaStream, setFrontMediaStream] = useState(null as MediaStream | null)

  const [frontEffect, _setFrontEffect] = useState("None" as FrontEffect)
  const [backgroundEffect, _setBackgroundEffect] = useState("None" as BackgroundEffect)
  const [backgroundMediaStream] = useState(null as MediaStream | null)
  const frontEffectOptions = FrontEffectOoptions
  const backgroundEffectOptions = BackgroundEffectOoptions

  const [videoQuality, setVideoQuality] = useState('360p' as VideoQuality);

  const videoEffector = VideoEffector.getInstance()

  const setDeviceId = (deviceId: string):MediaStream => {
    return setDevice(deviceId, videoQuality)
  }
  const selectQuality = (quality: VideoQuality) => {
    setVideoQuality(quality);
    videoEffector.quality = quality
    return setDevice(deviceId, quality)
  }  
  const setDevice = (deviceId: string, videoQuality:VideoQuality):MediaStream => {
    const [width, height, fps, bandWidth] = VideoQualityDetails[videoQuality]
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: calculateVideoConstraint(deviceId, width, height)
    }).then(stream => {
      setFrontMediaStream(stream)
      videoEffector.frontMediaStream = stream
    })

    // @ts-ignore
    const mediaStream = VideoEffector.getInstance().convertedMediaStream
    setDeviceIdInternal(deviceId)
    audioVideo!.chooseVideoInputQuality(width, height, fps, bandWidth);
    return mediaStream
  }

  const stopDevice = () =>{
    videoEffector.frontMediaStream = null
    if(frontMediaStream){
      frontMediaStream.getTracks().forEach(function(track) {
        track.stop();
      });
    }
  }

  const calculateVideoConstraint = (
    deviceId: string,
    width: number,
    height: number
  ): MediaTrackConstraints => {
    //const dimension = browserBehavior.requiresResolutionAlignment(width, height);
    const trackConstraints: MediaTrackConstraints = {};
    if (browserBehavior.requiresNoExactMediaStreamConstraints()) {
      trackConstraints.deviceId = deviceId;
      trackConstraints.width = width;
      trackConstraints.height = height;
    } else {
      // trackConstraints.deviceId = { exact: deviceId };
      // trackConstraints.width = { exact: dimension[0] };
      // trackConstraints.height = { exact: dimension[1] };
      trackConstraints.deviceId = deviceId;
      trackConstraints.width = width;
      trackConstraints.height = height;

    }

    return trackConstraints;
  }



  const setFrontEffect = (_frontEffect:FrontEffect) =>{
    videoEffector.frontEffect = _frontEffect
    _setFrontEffect(_frontEffect)
  }

  const setBackgroundEffect = (_backgroundEffect:BackgroundEffect) =>{
    videoEffector.backgroundEffect = _backgroundEffect
    _setBackgroundEffect(_backgroundEffect)
  }

  const setBackgroundImage = (_backgroundImage: HTMLImageElement) => {
    videoEffector.backgroundImage = _backgroundImage
  }

  const setBackgroundMediaStream = (_backgroundMediaStream: MediaStream | null) => {
    videoEffector.backgroundMediaStream = _backgroundMediaStream
  }

  const setAsciiArtConfig = (_asciiArtConfig: AsciiConfig) => {
    videoEffector.asciiArtConfig = _asciiArtConfig
  }
  const setAsciiArtParams = (_asciiArtParams: AsciiOperatipnParams) =>{
    videoEffector.asciiArtParams = _asciiArtParams
  }



  useEffect(()=>{
    setTimeout(videoEffector.copyFrame, 1000*5)
  },[])



  const providerValue = {
    deviceId,
    setDeviceId,
    stopDevice,
    selectQuality,
    videoQuality,

    frontEffect,
    backgroundEffect,
    backgroundMediaStream,

    frontEffectOptions,
    backgroundEffectOptions,
    VideoQualityOptions,

    setFrontEffect,
    setBackgroundEffect,
    setBackgroundImage,
    setBackgroundMediaStream,


    // Workers 
    //// AsciiArt
    setAsciiArtConfig,
    setAsciiArtParams,
  }

  return (
    <VideoEffectStateContext.Provider value={providerValue}>
      {children}
    </VideoEffectStateContext.Provider>
  )
}


