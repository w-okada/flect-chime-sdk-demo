import { CanvasVideoFrameBuffer, VideoFrameBuffer, VideoFrameProcessor } from "amazon-chime-sdk-js";
import { BodypixWorkerManager, generateBodyPixDefaultConfig, generateDefaultBodyPixParams, ModelConfigMobileNetV1_05, SemanticPersonSegmentation } from "@dannadori/bodypix-worker-js"
import { generateGoogleMeetSegmentationDefaultConfig, generateDefaultGoogleMeetSegmentationParams, GoogleMeetSegmentationWorkerManager, GoogleMeetSegmentationSmoothingType } from '@dannadori/googlemeet-segmentation-worker-js'
import { generateDefaultGoogleMeetSegmentationTFLiteParams, generateGoogleMeetSegmentationTFLiteDefaultConfig, GoogleMeetSegmentationTFLiteWorkerManager } from "@dannadori/googlemeet-segmentation-tflite-worker-js"
import { VirtualBackgroundGoogleMeetTFLite } from "./VirtualBackgroundGoogleMeetTFLite";
import { VirtualBackgroundGoogleMeetTFJS } from "./VirtualBackgroundGoogleMeetTFJS";
import { VirtualBackgroundBodyPix } from "./VirtualBackgroundBodyPix";


export type VirtualBackgroundSegmentationType = "None" | "BodyPix" | "GoogleMeet" | "GoogleMeetTFLite"
export type BackgroundMode = "Image" | "Blur" | "Color"

export interface VirtualBackgroundConfig {
    frontPositionX: number, // ratio (position and size of front image)
    frontPositionY: number, // ratio (position and size of front image)
    frontWidth: number,    // ratio (position and size of front image)
    frontHeight: number,   // ratio (position and size of front image)

    width: number,          // pixel (output size. If =<0, fit the background canvas size )
    height: number,         // pixel (output size. If =<0, fit the background canvas size )

    type: VirtualBackgroundSegmentationType,
    backgroundMode: BackgroundMode,
    backgroundImage: HTMLCanvasElement | HTMLImageElement | null,
    backgroundColor: string,
}

export class VirtualBackground implements VideoFrameProcessor {
    BodyPix = new VirtualBackgroundBodyPix()
    GMTfjs = new VirtualBackgroundGoogleMeetTFJS()
    GMTflite = new VirtualBackgroundGoogleMeetTFLite()



    canvasFront = document.createElement('canvas')
    canvasFrontResized = document.createElement("canvas")
    canvasBackground = document.createElement("canvas")

    // inputCanvas = document.createElement("canvas")
    personCanvas = document.createElement("canvas")
    personMaskCanvas = document.createElement("canvas")
    lightWrapCanvas = document.createElement("canvas")

    private config: VirtualBackgroundConfig = {
        frontPositionX: 0, // ratio (position and size of front image)
        frontPositionY: 0, // ratio (position and size of front image)
        frontWidth: 1,     // ratio (position and size of front image)
        frontHeight: 1,    // ratio (position and size of front image)
        width: -1,         // pixel (output size. If =<0, fit the background canvas size )
        height: -1,        // pixel (output size. If =<0, fit the background canvas size )

        type: "None",
        backgroundMode: "Color",
        backgroundImage: null,
        backgroundColor: "#000000"
    }

    //////////////////////////////
    // Video Processing API RSC  //
    //////////////////////////////
    targetCanvas = document.createElement('canvas')
    targetCanvasCtx = this.targetCanvas!.getContext('2d')
    canvasVideoFrameBuffer = new CanvasVideoFrameBuffer(this.targetCanvas!);

    /////////////////////
    // WorkerManagers  //
    /////////////////////

    
    ////////////////////////////
    // constructor & destory ///
    ////////////////////////////
    constructor() {
        console.log(`[VirtualBackground][constructor] initializing.`)
        const bg = new Image();
        bg.src = "/bg1.jpg"
        bg.onload = () => {
            this.canvasBackground.getContext("2d")!.drawImage(bg, 0, 0, this.canvasBackground.width, this.canvasBackground.height)
        }
    }

    async destroy() {
        this.targetCanvasCtx = null;
        this.canvasVideoFrameBuffer.destroy();
        return;
    }


    ///////////////////////
    // Parameter Setter ///
    ///////////////////////
    setVirtualBackgroundType(type: VirtualBackgroundSegmentationType) {
        this.config.type = type
    }

    setBackgroundMode(mode: BackgroundMode) {
        this.config.backgroundMode = mode
    }
    setBackgroundImage(path: string) {
        const bg = new Image();
        bg.src = path
        bg.onload = () => {
            this.canvasBackground.getContext("2d")!.drawImage(bg, 0, 0, this.canvasBackground.width, this.canvasBackground.height)
        }
    }

    setBackgroundColor(color: string) {
        this.config.backgroundColor = color
    }


    ////////////////
    // Processor  //
    ////////////////

    async process(buffers: VideoFrameBuffer[]) {
        if (buffers.length === 0) {
            return Promise.resolve(buffers);
        }
        // @ts-ignore
        const canvas = buffers[0].asCanvasElement()
        const frameWidth = canvas!.width;
        const frameHeight = canvas!.height;
        if (frameWidth === 0 || frameHeight === 0) {
            return Promise.resolve(buffers);
        }

        for (const f of buffers) {
            try {
                // @ts-ignore
                const canvas = f.asCanvasElement() as HTMLCanvasElement
                // let result: any
                switch (this.config.type) {
                    case "BodyPix":
                        // result = await this.bodyPixManager!.predict(canvas, this.bodyPixParams!)
                        // if(this.bodyPixModelReady){
                            // const result = await this.bodyPixManager!.predict(canvas, this.bodyPixParams!)
                            // this.convert_bodypix(canvas, this.canvasBackground, result, this.config)
                            this.BodyPix.predict(canvas, this.canvasBackground, this.targetCanvas, this.config)
                        // }
                        break
                    case "GoogleMeet":
                        // result = await this.googleMeetManager!.predict(canvas, this.googleMeetParams!)
                        // if(this.googlemeetModelReady){
                            // const result = await this.googlemeetManager!.predict(canvas, this.googlemeetParams!)
                            // this.convert_googlemeet(canvas, this.canvasBackground, result, this.config)
                            this.GMTfjs.predict(canvas, this.canvasBackground, this.targetCanvas, this.config)
                        // }
                        break
                    case "GoogleMeetTFLite":
                        // result = await this.googleMeetManager!.predict(canvas, this.googleMeetParams!)
                        // if(this.googlemeetTFLiteModelReady){
                            // const result = await this.googlemeetTFLiteManager!.predict(canvas, this.googlemeetTFLiteParams!)
                            // this.convert_googlemeet_tflite(canvas, this.canvasBackground, result, this.config)
                            this.GMTflite.predict(canvas, this.canvasBackground, this.targetCanvas, this.config)
                        // }
                        break
                    default:
                        this.convert_none(canvas)
                }
            } catch (err) {
                console.log("Exception:: ", err)
            }
        }
        buffers[0] = this.canvasVideoFrameBuffer;
        return Promise.resolve(buffers)
    }







    convert_none = (foreground: HTMLCanvasElement) => {
        // TODO: Width and Height
        this.targetCanvas.getContext("2d")!.drawImage(foreground, 0, 0, this.targetCanvas.width, this.targetCanvas.height)
    }
}