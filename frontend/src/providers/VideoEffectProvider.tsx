import { ReactNode, useContext, useState, useEffect } from "react";
import React from "react";

import { AsciiArtWorkerManager, AsciiConfig, AsciiOperatipnParams, generateAsciiArtDefaultConfig, generateDefaultAsciiArtParams } from '@dannadori/asciiart-worker-js'
import { BodypixWorkerManager, generateBodyPixDefaultConfig, generateDefaultBodyPixParams } from '@dannadori/bodypix-worker-js'
import { FacemeshWorkerManager, generateFacemeshDefaultConfig, FacemeshConfig, generateDefaultFacemeshParams} from '@dannadori/facemesh-worker-js'
import { OpenCVWorkerManager, generateOpenCVDefaultConfig, OpenCVConfig, generateDefaultOpenCVParams } from '@dannadori/opencv-worker-js'

import { BodyPixConfig } from "@dannadori/bodypix-worker-js/dist/const";
import { VirtualBackground } from "../VirtualBackground/VirtualBackground";
import { useAudioVideo } from "amazon-chime-sdk-component-library-react";
import { DefaultBrowserBehavior } from "amazon-chime-sdk-js";

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

class VideoEffector {
  private backgroundVideo  = document.createElement("video")
  private backgroundCanvas = document.createElement("canvas")
  private frontVideo       = document.createElement("video")
  private frontCanvas      = document.createElement("canvas")
  private tempCanvas       = document.createElement("canvas")

  private _backgroundImage  = document.createElement("img")
  
  private vb = new VirtualBackground()
  
  private _frontEffect: FrontEffect = "None"
  private _backgroundEffect: BackgroundEffect = "None"
  private _quality = '360p' as VideoQuality 


  // Constructor and Singleton pattern
  private static _instance:VideoEffector;
  public static getInstance():VideoEffector{
    if(!this._instance){
      this._instance= new VideoEffector()
    }
    return this._instance
  }
  constructor(){
    console.log("video effector !!!!!!")
  }


  // Set Attribute
  set frontEffect(val:FrontEffect){this._frontEffect = val} 
  get frontEffect(){return this._frontEffect}

  set backgroundEffect(val:BackgroundEffect){
    this.backgroundVideo.pause()
    this._backgroundEffect=val
  }
  get backgroundEffect(){return this._backgroundEffect}

  set quality(val:VideoQuality){this._quality = val} 
  get quality(){return this._quality}
  

  set backgroundImage(val:HTMLImageElement){this._backgroundImage=val}


  set frontMediaStream(stream:MediaStream|null){
    if(stream===null){
      this.frontVideo.pause()
      this.frontVideo.srcObject = null
      return
    }
    const videoWidth = stream.getVideoTracks()[0].getSettings().width
    const videoHeight = stream.getVideoTracks()[0].getSettings().height
    for(let comp of [this.frontVideo, this.frontCanvas, this.backgroundCanvas, this.tempCanvas]){
      comp.width  = videoWidth!
      comp.height = videoHeight!
    }    

    this.frontVideo.srcObject = stream
    this.frontVideo.play()
    console.log("video resolution",videoWidth, videoHeight)    
  }

  get convertedMediaStream():MediaStream{
    //@ts-ignore
    return this.tempCanvas.captureStream() as MediaStream
  }

  set backgroundMediaStream(stream:MediaStream|null){
    if(stream === null){
      this.backgroundVideo.pause()
      return
    }
    const videoWidth = stream.getVideoTracks()[0].getSettings().width
    const videoHeight = stream.getVideoTracks()[0].getSettings().height    
    for(let comp of [this.backgroundVideo]){
      comp.width  = videoWidth!
      comp.height = videoHeight!
    }    

    this.backgroundVideo.srcObject=stream
    this.backgroundVideo.play()
    console.log("set background mediastream", videoWidth, videoHeight)
  }

  //// workers
  // Ascii Art
  asciiArtWorkerManagerForF = (()=>{
    const w = new AsciiArtWorkerManager()
    w.init(generateAsciiArtDefaultConfig())
    return w
  })()
  asciiArtWorkerManagerForB = (()=>{
    const w = new AsciiArtWorkerManager()
    w.init(generateAsciiArtDefaultConfig())
    return w
  })()
  _asciiArtConfig = generateAsciiArtDefaultConfig()
  set asciiArtConfig(val:AsciiConfig) {
    this.asciiArtWorkerManagerForF.init(val)
    this.asciiArtWorkerManagerForB.init(val)
    this._asciiArtConfig = val
  }
  asciiArtParams = generateDefaultAsciiArtParams()
  // BodyPix
  bodyPixWorkerManager = (()=>{
    const w = new BodypixWorkerManager()    
    w.init(generateBodyPixDefaultConfig())
    return w
  })()
  _bodyPixConfig = generateBodyPixDefaultConfig()
  set bodyPixConfig(val:BodyPixConfig) {
    this.bodyPixWorkerManager.init(val)
    this._bodyPixConfig = val
  }
  bodyPixParams = generateDefaultBodyPixParams()
  // Facemesh
  facemeshWorkerManager = (()=>{
    const w = new FacemeshWorkerManager()
    w.init(generateFacemeshDefaultConfig())
    return w
  })()
  _facemeshConfig = generateFacemeshDefaultConfig()
  set facemeshConfig(val:FacemeshConfig){
    this.facemeshWorkerManager.init(val)
    this._facemeshConfig=val
  }
  facemeshParams = generateDefaultFacemeshParams()
  // OpenCV
  opencvManagerForF = (()=>{
    const w = new OpenCVWorkerManager()
    w.init(generateOpenCVDefaultConfig())
    return w
  })()
  opencvManagerForB = (()=>{
    const w = new OpenCVWorkerManager()
    w.init(generateOpenCVDefaultConfig())
    return w
  })()
  _opencvConfig = generateOpenCVDefaultConfig()
  set opencvConfig(val:OpenCVConfig){
    this.opencvManagerForF.init(val)
    this.opencvManagerForB.init(val)
    this._opencvConfig=val
  }
  opencvParams = generateDefaultOpenCVParams()
  

  // Operation
  copyFrame = () =>{
    this.frontCanvas.getContext("2d")!.drawImage(this.frontVideo, 0, 0, this.frontCanvas.width, this.frontCanvas.height)
    switch(this._backgroundEffect){
      case "Image":
        this.backgroundCanvas.getContext("2d")!.drawImage(this._backgroundImage, 0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height)
        break
      case "Window":
        this.backgroundCanvas.getContext("2d")!.drawImage(this.backgroundVideo, 0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height)
        break
      default:
        this.backgroundCanvas.getContext("2d")!.drawImage(this.frontVideo, 0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height)
        break
    }

    const promises = []
    switch(this._backgroundEffect){
      case "Ascii":
        promises.push(this.asciiArtWorkerManagerForB.predict(this.backgroundCanvas, this.asciiArtParams))
        break
      case "Canny":
        promises.push(this.opencvManagerForB.predict(this.backgroundCanvas, this.opencvParams))
        break
      default:
        promises.push(null)
    }

    switch(this.frontEffect){
      case "Ascii":
        promises.push(this.asciiArtWorkerManagerForF.predict(this.frontCanvas, this.asciiArtParams))
        break
      case "Canny":
        promises.push(this.opencvManagerForF.predict(this.frontCanvas, this.opencvParams))
        break
      default:
        promises.push(null)
    }

    if(this.frontEffect === "None" && this._backgroundEffect === "None"){
      // Don't use virtual background
      promises.push(null)
    }else{
      promises.push(this.bodyPixWorkerManager.predict(this.frontCanvas, this.bodyPixParams))
    }
    
    Promise.all(promises).then(([back, front, segment])=>{
      //console.log(back, front, segment)
      if(!front){
        front = this.frontCanvas
      }
      if(!back){
        back = this.backgroundCanvas
      }

      if(segment){
        // Use Virtual Background
        const f = this.vb.convert(front, back, segment)
        console.log("virtual:::",front.width, back.width, this.backgroundCanvas.width, f.width)
//        this.tempCanvas.getContext("2d")!.drawImage(f, 0, 0, this.tempCanvas.width, this.tempCanvas.height)
        requestAnimationFrame(this.copyFrame)
      }else{
        // Not use Virtual Background
        this.tempCanvas.getContext("2d")!.drawImage(front, 0, 0, this.tempCanvas.width, this.tempCanvas.height)
        requestAnimationFrame(this.copyFrame)
        //console.log("--------->", frontVideo.width, frontCanvas.width, backgroundCanvas.width, tempCanvas.width)
      }

    })
  }
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

  const setDeviceId = (deviceId: string):MediaStream => {
    return setDevice(deviceId, videoQuality)
  }
  const selectQuality = (quality: VideoQuality) => {
    setVideoQuality(quality);
    VideoEffector.getInstance().quality = quality
    return setDevice(deviceId, quality)
  }  
  const setDevice = (deviceId: string, videoQuality:VideoQuality):MediaStream => {
    const [width, height, fps, bandWidth] = VideoQualityDetails[videoQuality]
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: calculateVideoConstraint(deviceId, width, height)
    }).then(stream => {
      setFrontMediaStream(stream)
      VideoEffector.getInstance().frontMediaStream = stream
    })

    // @ts-ignore
    const mediaStream = VideoEffector.getInstance().convertedMediaStream
    setDeviceIdInternal(deviceId)
    audioVideo!.chooseVideoInputQuality(width, height, fps, bandWidth);
    return mediaStream
  }

  const stopDevice = () =>{
    VideoEffector.getInstance().frontMediaStream = null
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
    VideoEffector.getInstance().frontEffect = _frontEffect
    _setFrontEffect(_frontEffect)
  }

  const setBackgroundEffect = (_backgroundEffect:BackgroundEffect) =>{
    VideoEffector.getInstance().backgroundEffect = _backgroundEffect
    _setBackgroundEffect(_backgroundEffect)
  }

  const setBackgroundImage = (_backgroundImage: HTMLImageElement) => {
    VideoEffector.getInstance().backgroundImage = _backgroundImage
  }

  const setBackgroundMediaStream = (_backgroundMediaStream: MediaStream | null) => {
    VideoEffector.getInstance().backgroundMediaStream = _backgroundMediaStream
  }

  const setAsciiArtConfig = (_asciiArtConfig: AsciiConfig) => {
    VideoEffector.getInstance().asciiArtConfig = _asciiArtConfig
  }
  const setAsciiArtParams = (_asciiArtParams: AsciiOperatipnParams) =>{
    VideoEffector.getInstance().asciiArtParams = _asciiArtParams
  }



  useEffect(()=>{
    setTimeout(VideoEffector.getInstance().copyFrame, 1000*5)
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


