import { ReactNode, useContext, useState, useEffect } from "react";
import React from "react";

import { AsciiArtWorkerManager, AsciiConfig, AsciiOperatipnParams, generateAsciiArtDefaultConfig, generateDefaultAsciiArtParams } from '@dannadori/asciiart-worker-js'
import { BodypixWorkerManager, generateBodyPixDefaultConfig, generateDefaultBodyPixParams } from '@dannadori/bodypix-worker-js'
import { FacemeshWorkerManager, generateFacemeshDefaultConfig, FacemeshConfig, generateDefaultFacemeshParams} from '@dannadori/facemesh-worker-js'
import { OpenCVWorkerManager, generateOpenCVDefaultConfig, OpenCVConfig, generateDefaultOpenCVParams } from '@dannadori/opencv-worker-js'

import { BodyPixConfig } from "@dannadori/bodypix-worker-js/dist/const";
import { VirtualBackground } from "../VirtualBackground/VirtualBackground";

type Props = {
  children: ReactNode;
};

export type FrontEffect = "None" | "Ascii" | "Canny" | "Black"
export type BackgroundEffect = "None" | "Ascii" | "Canny" | "Black" | "Image" | "Window"

const FrontEffectOoptions: FrontEffect[] = ["None", "Ascii", "Canny", "Black"]
const BackgroundEffectOoptions: BackgroundEffect[] = ["None", "Ascii", "Canny", "Black", "Image", "Window"]

const backgroundVideo = document.createElement("video")
const backgroundCanvas = document.createElement("canvas")
const frontVideo = document.createElement("video")
const frontCanvas = document.createElement("canvas")
const tempCanvas = document.createElement("canvas")

export interface VideoEffectStateValue {
  //Input Device
  deviceId: string
  setDeviceId: (deviceId: string) => MediaStream

  // Effect
  frontEffect: FrontEffect,
  backgroundEffect: BackgroundEffect
  backgroundMediaStream: MediaStream | null
  frontEffectOptions: FrontEffect[]
  backgroundEffectOptions: BackgroundEffect[]
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
  vb = new VirtualBackground()
  frontEffect: FrontEffect = "None"
  _backgroundEffect: BackgroundEffect = "None"
  backgroundImage = (()=>{
    const i = document.createElement("img")
    return i
  })()

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

  set backgroundEffect(val:BackgroundEffect){
    backgroundVideo.pause()
    this._backgroundEffect=val
  }
  // _backgroundMediaStream: MediaStream | null = null
  set backgroundMediaStream(val:MediaStream|null){
    if(val === null){
      backgroundVideo.pause()
      // this._backgroundMediaStream=null
      return
    }

    backgroundVideo.width = val.getVideoTracks()[0].getSettings().width!
    backgroundVideo.height = val.getVideoTracks()[0].getSettings().height!
    backgroundVideo.srcObject=val
    backgroundVideo.play()
    console.log("set background mediastream")
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
  
  copyFrame = () =>{
    frontCanvas.getContext("2d")!.drawImage(frontVideo, 0, 0, frontCanvas.width, frontCanvas.height)
    switch(this._backgroundEffect){
      case "Image":
        backgroundCanvas.getContext("2d")!.drawImage(this.backgroundImage, 0, 0, backgroundCanvas.width, backgroundCanvas.height)
        break
      case "Window":
        backgroundCanvas.getContext("2d")!.drawImage(backgroundVideo, 0, 0, backgroundCanvas.width, backgroundCanvas.height)
        break
      default:
        backgroundCanvas.getContext("2d")!.drawImage(frontVideo, 0, 0, backgroundCanvas.width, backgroundCanvas.height)
        break
    }

    const promises = []
    switch(this._backgroundEffect){
      case "Ascii":
        promises.push(this.asciiArtWorkerManagerForB.predict(backgroundCanvas, this.asciiArtParams))
        break
      case "Canny":
        promises.push(this.opencvManagerForB.predict(backgroundCanvas, this.opencvParams))
        break
      default:
        promises.push(null)
    }

    switch(this.frontEffect){
      case "Ascii":
        promises.push(this.asciiArtWorkerManagerForF.predict(frontCanvas, this.asciiArtParams))
        break
      case "Canny":
        promises.push(this.opencvManagerForF.predict(frontCanvas, this.opencvParams))
        break
      default:
        promises.push(null)
    }

    if(this.frontEffect == "None" && this._backgroundEffect == "None"){
      // Don't use virtual background
      promises.push(null)
    }else{
      promises.push(this.bodyPixWorkerManager.predict(frontCanvas, this.bodyPixParams))
    }
    
    Promise.all(promises).then(([back, front, segment])=>{
      //console.log(back, front, segment)
      if(!front){
        front = frontCanvas
      }
      if(!back){
        back = backgroundCanvas
      }

      if(segment){
        // Use Virtual Background
        const f = this.vb.convert(front, back, segment)
        tempCanvas.getContext("2d")!.drawImage(f, 0, 0, tempCanvas.width, tempCanvas.height)
        requestAnimationFrame(this.copyFrame)
      }else{
        // Not use Virtual Background
        tempCanvas.getContext("2d")!.drawImage(front, 0, 0, tempCanvas.width, tempCanvas.height)
        requestAnimationFrame(this.copyFrame)
      }
    })
  }
}

export const VideoEffectStateProvider = ({ children }: Props) => {
  const [deviceId, setDeviceIdInternal] = useState("blue")

  // const [videoEffector, _setVideoEffector] = useState(new VideoEffector())
  const [frontEffect, _setFrontEffect] = useState("None" as FrontEffect)
  const [backgroundEffect, _setBackgroundEffect] = useState("None" as BackgroundEffect)
  const [backgroundMediaStream, _setBackgroundMediaStream] = useState(null as MediaStream | null)
  const frontEffectOptions = FrontEffectOoptions
  const backgroundEffectOptions = BackgroundEffectOoptions

  // const [asciiArtWorkerManager, setAsciiArtWorkerManager] = useState(null as AsciiArtWorkerManager|null)
  // const [asciiArtConfig, setAsciiArtConfigInternal] = useState(generateAsciiArtDefaultConfig())
  // const [asciiArtParams, setAsciiArtParams] = useState(generateDefaultAsciiArtParams())

  const setDeviceId = (deviceId: string):MediaStream => {
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { deviceId: deviceId }
    }).then(stream => {
      const videoWidth = stream.getVideoTracks()[0].getSettings().width
      const videoHeight = stream.getVideoTracks()[0].getSettings().height
      console.log(videoHeight, videoWidth)
      frontVideo.width  = videoWidth!
      frontVideo.height = videoHeight!
      frontVideo.srcObject = stream
      frontVideo.play()

      frontCanvas.width       = videoWidth!
      frontCanvas.height      = videoHeight!
      backgroundCanvas.width  = videoWidth!
      backgroundCanvas.height = videoHeight!


      tempCanvas.width = videoWidth!
      tempCanvas.height = videoHeight!
    })

    // @ts-ignore
    const mediaStream = tempCanvas.captureStream() as MediaStream
    setDeviceIdInternal(deviceId)
    return mediaStream
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
    console.log("media!!!!!", _backgroundMediaStream)
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

    frontEffect,
    backgroundEffect,
    backgroundMediaStream,

    frontEffectOptions,
    backgroundEffectOptions,

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




// const synthesizeVideoDevice = (colorOrPattern: string): MediaStream | null => {
//   const canvas = document.createElement('canvas') as HTMLCanvasElement;
//   canvas.width = 480;
//   canvas.height = (canvas.width / 16) * 9;
//   const scheduler = new IntervalScheduler(1000);
//   const context = canvas.getContext('2d');
//   // @ts-ignore
//   const stream: MediaStream | null = canvas.captureStream(5) || null;
//   if (stream) {
//     scheduler.start(() => {
//       if (colorOrPattern === 'smpte') {
//         context!.fillStyle = "#00ff00";
//         context!.fillRect(0, 0, canvas.width, canvas.height);
//         context!.fillStyle = "#ff0000";
//         context!.fillText("AASFASDFSAF",10,10)
// //        DefaultDeviceController.fillSMPTEColorBars(canvas, 0);
//       } else {
//         context!.fillStyle = colorOrPattern;
//         context!.fillRect(0, 0, canvas.width, canvas.height);
//       }
//     });
//     stream.getVideoTracks()[0].addEventListener('ended', () => {
//       scheduler.stop();
//     });
//   }
//   return stream;
// }

// const videoInputSelectionToDevice = async (
//   deviceId: string, frontEffect: FrontEffect, backgroundEffect:BackgroundEffect, 
//   backgroundImage:HTMLImageElement|null, backgroundMediaStream?:MediaStream|null
//   ): Promise<Device> => {

//   navigator.mediaDevices.getUserMedia({
//     audio:false,
//     video:{deviceId:deviceId}
//   }).then(stream=>{
//     const videoWidth = stream.getVideoTracks()[0].getSettings().width
//     const videoHeight = stream.getVideoTracks()[0].getSettings().height
//     console.log(videoHeight, videoWidth)
//     v.width=videoWidth!
//     v.height=videoHeight!
//     v.srcObject = stream
//     v.play()

//     c.width = videoWidth!
//     c.height = videoHeight!
//     // c.getContext("2d")!.fillRect(0,0,100,100)
//   })

//   // @ts-ignore
//   const mediaStream = c.captureStream() as MediaStream
//   return mediaStream
// }



