import { FrontEffect, BackgroundEffect, VideoQuality, VirtualBackgroundQuality, VirtualBackgroundQualityResolution } from "./VideoEffectProvider"
import { AsciiArtWorkerManager, generateAsciiArtDefaultConfig, AsciiConfig, generateDefaultAsciiArtParams } from "@dannadori/asciiart-worker-js"
import { BodypixWorkerManager, generateBodyPixDefaultConfig, generateDefaultBodyPixParams } from "@dannadori/bodypix-worker-js"
import { BodyPixConfig } from "@dannadori/bodypix-worker-js/dist/const"
import { FacemeshWorkerManager, generateFacemeshDefaultConfig, FacemeshConfig, generateDefaultFacemeshParams } from "@dannadori/facemesh-worker-js"
import { OpenCVWorkerManager, generateOpenCVDefaultConfig, OpenCVConfig, generateDefaultOpenCVParams, OpenCVFunctionType } from "@dannadori/opencv-worker-js"
import { VirtualBackground } from "./VirtualBackground"

export class VideoEffector {
  private backgroundVideo = document.createElement("video")
  private backgroundCanvas = document.createElement("canvas")
  private frontVideo = document.createElement("video")
  private frontCanvas = document.createElement("canvas")
  private tempCanvas = document.createElement("canvas")
  private asyncBackgroundImageCanvas = document.createElement("canvas")


  private _backgroundImage = document.createElement("img")
  frontColor = "black"
  backgroundColor = "black"

  private vb = new VirtualBackground()

  private _frontEffect: FrontEffect = "None"
  private _backgroundEffect: BackgroundEffect = "None"
  private _quality = '360p' as VideoQuality
  private _syncBackground = true


  // Constructor and Singleton pattern
  private static _instance: VideoEffector;
  public static getInstance(): VideoEffector {
    if (!this._instance) {
      this._instance = new VideoEffector()
    }
    return this._instance
  }
  constructor() {
    console.log("video effector !!!!!!")
  }


  // Set Attribute
  set frontEffect(val: FrontEffect) { this._frontEffect = val }
  get frontEffect() { return this._frontEffect }

  set backgroundEffect(val: BackgroundEffect) {
    this.backgroundVideo.pause()
    this._backgroundEffect = val
  }
  get backgroundEffect() { return this._backgroundEffect }

  set quality(val: VideoQuality) { this._quality = val }
  get quality() { return this._quality }

  set virtaulBackgroundQuality(val: VirtualBackgroundQuality) {
    const params = [
      this.asciiArtParamsForF,
      this.asciiArtParamsForB,
      this.bodyPixParams,
      this.facemeshParams,
      this.opencvParamsForF,
      this.opencvParamsForB,
    ]
    for (const param of params) {
      param.processWidth = VirtualBackgroundQualityResolution[val]
      param.processHeight = VirtualBackgroundQualityResolution[val]
    }
  }


  set backgroundImage(val: HTMLImageElement) { this._backgroundImage = val }
  set syncBackground(val: boolean) { this._syncBackground = val }
  get syncBackground() { return this._syncBackground }


  set frontMediaStream(stream: MediaStream | null) {
    if (stream === null) {
      this.frontVideo.pause()
      this.frontVideo.srcObject = null
      return
    }
    const videoWidth = stream.getVideoTracks()[0].getSettings().width
    const videoHeight = stream.getVideoTracks()[0].getSettings().height
    for (let comp of [this.frontVideo, this.frontCanvas, this.backgroundCanvas, this.tempCanvas, this.asyncBackgroundImageCanvas]) {
      comp.width = videoWidth!
      comp.height = videoHeight!
    }

    this.frontVideo.srcObject = stream
    this.frontVideo.play()
    console.log("video resolution", videoWidth, videoHeight)
  }

  get convertedMediaStream(): MediaStream {
    //@ts-ignore
    return this.tempCanvas.captureStream() as MediaStream
  }

  set backgroundMediaStream(stream: MediaStream | null) {
    if (stream === null) {
      this.backgroundVideo.pause()
      return
    }
    const videoWidth = stream.getVideoTracks()[0].getSettings().width
    const videoHeight = stream.getVideoTracks()[0].getSettings().height
    for (let comp of [this.backgroundVideo]) {
      comp.width = videoWidth!
      comp.height = videoHeight!
    }

    this.backgroundVideo.srcObject = stream
    this.backgroundVideo.play()
    console.log("set background mediastream", videoWidth, videoHeight)
  }



  //// workers
  // Ascii Art
  asciiArtWorkerManagerForF = (() => {
    const w = new AsciiArtWorkerManager()
    w.init(generateAsciiArtDefaultConfig())
    return w
  })()
  asciiArtWorkerManagerForB = (() => {
    const w = new AsciiArtWorkerManager()
    w.init(generateAsciiArtDefaultConfig())
    return w
  })()
  _asciiArtConfig = generateAsciiArtDefaultConfig()
  set asciiArtConfig(val: AsciiConfig) {
    this.asciiArtWorkerManagerForF.init(val)
    this.asciiArtWorkerManagerForB.init(val)
    this._asciiArtConfig = val
  }
  asciiArtParamsForF = generateDefaultAsciiArtParams()
  asciiArtParamsForB = generateDefaultAsciiArtParams()
  // BodyPix
  bodyPixWorkerManager = (() => {
    const w = new BodypixWorkerManager()
    w.init(generateBodyPixDefaultConfig())
    return w
  })()
  _bodyPixConfig = generateBodyPixDefaultConfig()
  set bodyPixConfig(val: BodyPixConfig) {
    this.bodyPixWorkerManager.init(val)
    this._bodyPixConfig = val
  }
  bodyPixParams = generateDefaultBodyPixParams()
  // Facemesh
  facemeshWorkerManager = (() => {
    const w = new FacemeshWorkerManager()
    w.init(generateFacemeshDefaultConfig())
    return w
  })()
  _facemeshConfig = generateFacemeshDefaultConfig()
  set facemeshConfig(val: FacemeshConfig) {
    this.facemeshWorkerManager.init(val)
    this._facemeshConfig = val
  }
  facemeshParams = generateDefaultFacemeshParams()
  // OpenCV
  opencvManagerForF = (() => {
    const w = new OpenCVWorkerManager()
    w.init(generateOpenCVDefaultConfig())
    return w
  })()
  opencvManagerForB = (() => {
    const w = new OpenCVWorkerManager()
    w.init(generateOpenCVDefaultConfig())
    return w
  })()
  _opencvConfig = generateOpenCVDefaultConfig()
  set opencvConfig(val: OpenCVConfig) {
    this.opencvManagerForF.init(val)
    this.opencvManagerForB.init(val)
    this._opencvConfig = val
  }
  opencvParamsForF = generateDefaultOpenCVParams()
  opencvParamsForB = generateDefaultOpenCVParams()


  // Operation
  copyFrame = () => {
    // If virtual background is disabled, return here
    if (this.frontEffect === "None" && this._backgroundEffect === "None") {
      this.tempCanvas.getContext("2d")!.drawImage(this.frontVideo, 0, 0, this.tempCanvas.width, this.tempCanvas.height)
      requestAnimationFrame(this.copyFrame)
      return
    }

    // from here, for virtual background is enabled.    
    this.frontCanvas.getContext("2d")!.drawImage(this.frontVideo, 0, 0, this.frontCanvas.width, this.frontCanvas.height)
    // Copy background. if effects of background and front are same, this is skipped.
    if (this._backgroundEffect !== this._frontEffect) {
      // console.log("background copied")
      switch (this._backgroundEffect) {
        case "Image":
          this.backgroundCanvas.getContext("2d")!.drawImage(this._backgroundImage, 0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height)
          break
        case "Window":
          this.backgroundCanvas.getContext("2d")!.drawImage(this.backgroundVideo, 0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height)
          break
        case "Color":
          this.backgroundCanvas.getContext("2d")!.fillStyle = this.backgroundColor
          this.backgroundCanvas.getContext("2d")!.fillRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height)
          break
        default:
          this.backgroundCanvas.getContext("2d")!.drawImage(this.frontVideo, 0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height)
          break
      }
    }

    const promises = []
    // edit background. if effects of background and front are same, this is set null(not promise).
    if (this._backgroundEffect !== this._frontEffect && this._syncBackground === true) {
      switch (this._backgroundEffect) {
        case "Ascii":
          promises.push(this.asciiArtWorkerManagerForB.predict(this.backgroundCanvas, this.asciiArtParamsForB))
          break
        case "Canny":
          this.opencvParamsForB.type = OpenCVFunctionType.Canny
          promises.push(this.opencvManagerForB.predict(this.backgroundCanvas, this.opencvParamsForB))
          break
        case "Blur":
          this.opencvParamsForB.type = OpenCVFunctionType.Blur
          promises.push(this.opencvManagerForB.predict(this.backgroundCanvas, this.opencvParamsForB))
          break
        default:
          promises.push(null)
      }
    } else {
      promises.push(null)
    }

    // edit front
    switch (this.frontEffect) {
      case "Ascii":
        promises.push(this.asciiArtWorkerManagerForF.predict(this.frontCanvas, this.asciiArtParamsForF))
        break
      case "Canny":
        this.opencvParamsForF.type = OpenCVFunctionType.Canny
        promises.push(this.opencvManagerForF.predict(this.frontCanvas, this.opencvParamsForF))
        break
      case "Blur":
        this.opencvParamsForF.type = OpenCVFunctionType.Blur
        promises.push(this.opencvManagerForF.predict(this.frontCanvas, this.opencvParamsForF))
        break
      default:
        promises.push(null)
    }

    // segment body.  if effects of background and front are same, this is set null(not promise).
    if (this._backgroundEffect !== this._frontEffect) {
      promises.push(this.bodyPixWorkerManager.predict(this.frontCanvas, this.bodyPixParams))
    } else {
      promises.push(null)
    }


    Promise.all(promises).then(([back, front, segment]) => {
      //console.log(back, front, segment)
      if (!front) {
        if (this.frontEffect === "Color") {
          this.frontCanvas.getContext("2d")!.fillStyle = this.frontColor
          this.frontCanvas.getContext("2d")!.fillRect(0, 0, this.frontCanvas.width, this.frontCanvas.height)
        }
        front = this.frontCanvas
      }
      
      if (!this._syncBackground) {
        back = this.asyncBackgroundImageCanvas
      } else if (this._syncBackground && !back) {
        back = this.backgroundCanvas
      }

      if (segment) {
        const f = this.vb.convert(front, back, segment)
        // console.log("virtual:::",front.width, back.width, this.backgroundCanvas.width, f.width)
        this.tempCanvas.getContext("2d")!.drawImage(f, 0, 0, this.tempCanvas.width, this.tempCanvas.height)
        requestAnimationFrame(this.copyFrame)
      } else {
        this.tempCanvas.getContext("2d")!.drawImage(front, 0, 0, this.tempCanvas.width, this.tempCanvas.height)
        requestAnimationFrame(this.copyFrame)
      }
    })
  }

  // experimental ...
  generateAsyncBackgroundImage = () =>{
//    console.log("async start")
    if(this._syncBackground){//when sync, this process is noop
      setTimeout(this.generateAsyncBackgroundImage, 2*1000)
      return
    }

    let promiss = null
    switch (this._backgroundEffect) {
      ///////////////////
      case "Image":
        this.asyncBackgroundImageCanvas.getContext("2d")!.drawImage(this._backgroundImage, 0, 0, this.asyncBackgroundImageCanvas.width, this.asyncBackgroundImageCanvas.height)
        break
      case "Window":
        this.asyncBackgroundImageCanvas.getContext("2d")!.drawImage(this.backgroundVideo, 0, 0, this.asyncBackgroundImageCanvas.width, this.asyncBackgroundImageCanvas.height)
        break
      case "Color":
        this.asyncBackgroundImageCanvas.getContext("2d")!.fillStyle = this.backgroundColor
        this.asyncBackgroundImageCanvas.getContext("2d")!.fillRect(0, 0, this.asyncBackgroundImageCanvas.width, this.asyncBackgroundImageCanvas.height)
        break
      ////////////////// promise
      case "Ascii":
        promiss = this.asciiArtWorkerManagerForB.predict(this.backgroundCanvas, this.asciiArtParamsForB)
        break
      case "Canny":
        this.opencvParamsForB.type = OpenCVFunctionType.Canny
        promiss = this.opencvManagerForB.predict(this.backgroundCanvas, this.opencvParamsForB)
        break
      case "Blur":
        this.opencvParamsForB.type = OpenCVFunctionType.Blur
        promiss = this.opencvManagerForB.predict(this.backgroundCanvas, this.opencvParamsForB)
        break
    }

    if(promiss===null){
      console.log("async not promise")
      setTimeout(this.generateAsyncBackgroundImage,2*1000)
    }else{
//      console.log("async promise")
      promiss.then(res=>{
//        console.log("async promise done")
        this.asyncBackgroundImageCanvas.getContext("2d")!.drawImage(res, 0, 0, this.asyncBackgroundImageCanvas.width, this.asyncBackgroundImageCanvas.height)
        setTimeout(this.generateAsyncBackgroundImage,2*1000)
      })
    }
  }


}
