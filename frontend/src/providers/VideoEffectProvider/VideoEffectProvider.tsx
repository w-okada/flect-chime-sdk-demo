import { ReactNode, useContext, useState, useEffect } from "react";
import React from "react";


import { VideoEffector } from "./VideoEffector"
import { useAudioVideo } from "amazon-chime-sdk-component-library-react";
import { DefaultBrowserBehavior } from "amazon-chime-sdk-js";

type Props = {
  children: ReactNode;
};

export type FrontEffect = "None" | "Ascii" | "Canny" | "Blur" | "Color" 
export type BackgroundEffect = "None" | "Ascii" | "Canny" | "Blur" | "Color" | "Image" | "Window"
export type VideoQuality = '360p' | '540p' | '720p';

export type VirtualBackgroundQuality = 0 | 1 | 2 | 3 | 4;
const VirtualBackgroundQualityOptions:VirtualBackgroundQuality[] = [0, 1, 2, 3, 4];
export const VirtualBackgroundQualityResolution = [300, 450, 600, 750, 900]

const FrontEffectOptions: FrontEffect[] = ["None", "Ascii", "Canny", "Blur", "Color"]
const BackgroundEffectOptions: BackgroundEffect[] = ["None", "Ascii", "Canny", "Blur", "Color", "Image", "Window"]
const VideoQualityOptions: VideoQuality[] = ['360p', '540p', '720p']
const VideoQualityDetails:{[key in VideoQuality]:number[]} = {
  '360p':[ 640, 360, 15, 6000],
  '540p':[ 960, 540, 15, 14000],
  '720p':[1280, 720, 15, 14000],
}


export interface VideoEffectStateValue {
  counter: number
  setCounter: (val:number) => void
  //Input Device
  deviceId: string
  setDeviceId: (deviceId: string) => MediaStream
  stopDevice: () => void
  selectQuality: (quality: VideoQuality) => void
  videoQuality: VideoQuality
  virtualBackgroundQuality: VirtualBackgroundQuality
  syncBackground: boolean
  setSyncBackground: (val:boolean) => void
  // Effect
  frontEffect: FrontEffect,
  backgroundEffect: BackgroundEffect
  backgroundMediaStream: MediaStream | null
  FrontEffectOptions: FrontEffect[]
  BackgroundEffectOptions: BackgroundEffect[]
  VideoQualityOptions: VideoQuality[]
  VirtualBackgroundQualityOptions:VirtualBackgroundQuality[]
  setVirtualBackgroundQuality: (val: VirtualBackgroundQuality) => void
  setFrontEffect: (e: FrontEffect) => void
  setBackgroundEffect: (e: BackgroundEffect) => void
  setBackgroundImage: (p: HTMLImageElement) => void
  setBackgroundMediaStream: (m: MediaStream | null) => void

  // worker
  //// asciiart
  asciiArtFontSizeForF: number
  setAsciiArtFontSizeForF: (val: number) => void
  asciiArtFontSizeForB: number
  setAsciiArtFontSizeForB: (val: number) => void
  //// canny
  cannyThreshold1ForF: number
  setCannyThreshold1ForF: (val: number) => void
  cannyThreshold2ForF: number
  setCannyThreshold2ForF: (val: number) => void
  cannyBitwiseNotForF: boolean
  setCannyBitwiseNotForF: (val: boolean) => void
  cannyThreshold1ForB: number
  setCannyThreshold1ForB: (val: number) => void
  cannyThreshold2ForB: number
  setCannyThreshold2ForB: (val: number) => void
  cannyBitwiseNotForB: boolean
  setCannyBitwiseNotForB: (val: boolean) => void
  //// blur
  bularKernelSizeForF: number
  setBularKernelSizeForF: (val_w: number, val_h: number) => void
  bularKernelSizeForB: number
  setBularKernelSizeForB: (val_w: number, val_h: number) => void
  //// color
  colorColorForF: string
  setColorColorForF: (color: string) => void
  colorColorForB: string
  setColorColorForB: (color: string) => void

  
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
  const [counter, setCounter] = useState(0) // for state change publish
  const [deviceId, setDeviceIdInternal] = useState("blue")
  const audioVideo = useAudioVideo();
  const [frontMediaStream, setFrontMediaStream] = useState(null as MediaStream | null)

  const [frontEffect, _setFrontEffect] = useState("None" as FrontEffect)
  const [backgroundEffect, _setBackgroundEffect] = useState("None" as BackgroundEffect)
  const [backgroundMediaStream] = useState(null as MediaStream | null)
  // const frontEffectOptions = FrontEffectOoptions
  // const backgroundEffectOptions = BackgroundEffectOoptions

  const [videoQuality, setVideoQuality] = useState('360p' as VideoQuality);
  const [virtualBackgroundQuality, _setVirtualBackgroundQuality] = useState(0 as VirtualBackgroundQuality)

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


  const setVirtualBackgroundQuality = (val:VirtualBackgroundQuality) => {
    videoEffector.virtaulBackgroundQuality = val
    _setVirtualBackgroundQuality(val)
  }

  const syncBackground = videoEffector.syncBackground
  const setSyncBackground = (val:boolean) => {
    videoEffector.syncBackground = val
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

  // Worker setting
  //// AsciiArt
  const asciiArtFontSizeForF = videoEffector.asciiArtParamsForF.fontSize
  const setAsciiArtFontSizeForF = (val: number) =>{
    videoEffector.asciiArtParamsForF.fontSize = val
  }
  const asciiArtFontSizeForB = videoEffector.asciiArtParamsForB.fontSize
  const setAsciiArtFontSizeForB = (val: number) =>{
    videoEffector.asciiArtParamsForB.fontSize = val
  }
  //// Canny
  const cannyThreshold1ForF = videoEffector.opencvParamsForF.cannyParams!.threshold1
  const setCannyThreshold1ForF = (val: number) =>{
    videoEffector.opencvParamsForF.cannyParams!.threshold1 = val
  }
  const cannyThreshold2ForF = videoEffector.opencvParamsForF.cannyParams!.threshold2
  const setCannyThreshold2ForF = (val: number) =>{
    videoEffector.opencvParamsForF.cannyParams!.threshold2 = val
  }
  const cannyBitwiseNotForF = videoEffector.opencvParamsForF.cannyParams!.bitwiseNot
  const setCannyBitwiseNotForF = (val: boolean) =>{
    videoEffector.opencvParamsForF.cannyParams!.bitwiseNot = val
  }
  const cannyThreshold1ForB = videoEffector.opencvParamsForB.cannyParams!.threshold1
  const setCannyThreshold1ForB = (val: number) =>{
    videoEffector.opencvParamsForB.cannyParams!.threshold1 = val
  }
  const cannyThreshold2ForB = videoEffector.opencvParamsForB.cannyParams!.threshold2
  const setCannyThreshold2ForB = (val: number) =>{
    videoEffector.opencvParamsForB.cannyParams!.threshold2 = val
  }
  const cannyBitwiseNotForB = videoEffector.opencvParamsForB.cannyParams!.bitwiseNot
  const setCannyBitwiseNotForB = (val: boolean) =>{
    videoEffector.opencvParamsForB.cannyParams!.bitwiseNot = val
  }
  //// Blur
  const bularKernelSizeForF = videoEffector.opencvParamsForF.blurParams!.kernelSize[0]
  const setBularKernelSizeForF = (val_w:number,val_h:number) => {
    videoEffector.opencvParamsForF.blurParams!.kernelSize = [val_w, val_h]
  }
  const bularKernelSizeForB = videoEffector.opencvParamsForB.blurParams!.kernelSize[0]
  const setBularKernelSizeForB = (val_w:number,val_h:number) => {
    videoEffector.opencvParamsForB.blurParams!.kernelSize = [val_w, val_h]
  }
  //// color
  const colorColorForF = videoEffector.frontColor
  const setColorColorForF = (color:string) => {
    videoEffector.frontColor = color
  }
  const colorColorForB = videoEffector.backgroundColor
  const setColorColorForB = (color:string) => {
    videoEffector.backgroundColor = color
  }






  useEffect(()=>{
    setTimeout(videoEffector.copyFrame, 1000*5)
    setTimeout(videoEffector.generateAsyncBackgroundImage, 1000*5)
  },[])



  const providerValue = {
    counter,
    setCounter,

    deviceId,
    setDeviceId,
    stopDevice,
    selectQuality,
    videoQuality,
    virtualBackgroundQuality,
    syncBackground,
    setSyncBackground,

    frontEffect,
    backgroundEffect,
    backgroundMediaStream,

    FrontEffectOptions,
    BackgroundEffectOptions,
    VideoQualityOptions,
    VirtualBackgroundQualityOptions,

    setVirtualBackgroundQuality,
    setFrontEffect,
    setBackgroundEffect,
    setBackgroundImage,
    setBackgroundMediaStream,


    // Workers 
    //// AsciiArt
    asciiArtFontSizeForF,
    setAsciiArtFontSizeForF,
    asciiArtFontSizeForB,
    setAsciiArtFontSizeForB,
    //// Canny
    cannyThreshold1ForF,
    setCannyThreshold1ForF,
    cannyThreshold2ForF,
    setCannyThreshold2ForF,
    cannyBitwiseNotForF,
    setCannyBitwiseNotForF,
    cannyThreshold1ForB,
    setCannyThreshold1ForB,
    cannyThreshold2ForB,
    setCannyThreshold2ForB,
    cannyBitwiseNotForB,
    setCannyBitwiseNotForB,
    //// Blur
    bularKernelSizeForF,
    setBularKernelSizeForF,
    bularKernelSizeForB,
    setBularKernelSizeForB,
    //// Color
    colorColorForF,
    setColorColorForF,
    colorColorForB,
    setColorColorForB,

  }

  return (
    <VideoEffectStateContext.Provider value={providerValue}>
      {children}
    </VideoEffectStateContext.Provider>
  )
}


