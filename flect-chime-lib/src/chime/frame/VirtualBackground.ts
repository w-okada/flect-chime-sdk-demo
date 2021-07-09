import { CanvasVideoFrameBuffer, VideoFrameBuffer, VideoFrameProcessor } from "amazon-chime-sdk-js";
import { BodypixWorkerManager, generateBodyPixDefaultConfig, generateDefaultBodyPixParams, ModelConfigMobileNetV1_05, SemanticPersonSegmentation } from "@dannadori/bodypix-worker-js"
import { generateGoogleMeetSegmentationDefaultConfig, generateDefaultGoogleMeetSegmentationParams, GoogleMeetSegmentationWorkerManager, GoogleMeetSegmentationSmoothingType } from '@dannadori/googlemeet-segmentation-worker-js'
import { generateDefaultGoogleMeetSegmentationTFLiteParams, generateGoogleMeetSegmentationTFLiteDefaultConfig, GoogleMeetSegmentationTFLiteWorkerManager } from "@dannadori/googlemeet-segmentation-tflite-worker-js"


export type VirtualBackgroundSegmentationType = "None" | "BodyPix" | "GoogleMeet" | "GoogleMeetTFLite"
export type BackgroundMode = "Image" | "Blur" | "Color"

interface VirtualBackgroundConfig {
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
    canvasFront = document.createElement('canvas')
    canvasFrontResized = document.createElement("canvas")
    canvasBackground = document.createElement("canvas")

    inputCanvas = document.createElement("canvas")
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
    bodyPixModelReady = false
    bodyPixConfig = (() => {
        const c = generateBodyPixDefaultConfig()
        c.model = ModelConfigMobileNetV1_05
        c.processOnLocal = true
        return c
    })()
    bodyPixParams = (() => {
        const p = generateDefaultBodyPixParams()
        p.processWidth = 640
        p.processHeight = 480
        return p
    })()
    bodyPixManager = (() => {
        const m = new BodypixWorkerManager()
        m.init(this.bodyPixConfig).then(
            ()=>{
                this.bodyPixModelReady=true
            }
        )
        return m
    })()
    
    googlemeetModelReady = false
    googlemeetConfig = (() => {
        const c = generateGoogleMeetSegmentationDefaultConfig()
        c.processOnLocal = true
        return c
    })()
    googlemeetParams = (() => {
        const p = generateDefaultGoogleMeetSegmentationParams()
        p.processWidth = 128
        p.processHeight = 128
        p.smoothingR = 1
        p.smoothingS = 1
        p.jbfWidth = 256
        p.jbfHeight = 256
        p.lightWrapping = true
        p.smoothingType = GoogleMeetSegmentationSmoothingType.JS
        return p
    })()
    googlemeetManager = (() => {
        console.log("GOOGLE!")
        const m = new GoogleMeetSegmentationWorkerManager()
        m.init(this.googlemeetConfig).then(
            ()=>{
                this.googlemeetModelReady=true
            }
        )
        return m
    })()

    googleMeetLightWrappingEnable = true


    googlemeetTFLiteModelReady = false
    googlemeetTFLiteConfig = (() => {
        const c = generateGoogleMeetSegmentationTFLiteDefaultConfig()
        c.processOnLocal = true
        // c.modelPath = `${process.env.PUBLIC_URL}/models/96x160/segm_lite_v681.tflite`
        c.modelPath = `./models/96x160/segm_lite_v681.tflite`
        // c.modelPath = `${process.env.PUBLIC_URL}/models/128x128/segm_lite_v509.tflite`
        // c.modelPath = ${process.env.PUBLIC_URL}/models/144x256/segm_full_v679.tflite`
        return c
    })()
    googlemeetTFLiteParams = (() => {
        const p = generateDefaultGoogleMeetSegmentationTFLiteParams()
        p.processWidth = 256
        p.processHeight = 256
        p.kernelSize    = 0
        p.useSoftmax    = true
        p.usePadding    = false
        p.interpolation = 1
        return p
    })()
    googlemeetTFLiteManager = (() => {
        console.log("GOOGLE!")
        const m = new GoogleMeetSegmentationTFLiteWorkerManager()
        m.init(this.googlemeetTFLiteConfig).then(
            ()=>{
                this.googlemeetTFLiteModelReady=true
            }
        )
        return m
    })()
    lwBlur = 30


    ////////////////////////////
    // constructor & destory ///
    ////////////////////////////
    constructor() {
        console.log("NEWVBGP!!!")
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
                        if(this.bodyPixModelReady){
                            const result = await this.bodyPixManager!.predict(canvas, this.bodyPixParams!)
                            this.convert_bodypix(canvas, this.canvasBackground, result, this.config)
                        }
                        break
                    case "GoogleMeet":
                        // result = await this.googleMeetManager!.predict(canvas, this.googleMeetParams!)
                        if(this.googlemeetModelReady){
                            const result = await this.googlemeetManager!.predict(canvas, this.googlemeetParams!)
                            this.convert_googlemeet(canvas, this.canvasBackground, result, this.config)
                        }
                        break
                    case "GoogleMeetTFLite":
                        // result = await this.googleMeetManager!.predict(canvas, this.googleMeetParams!)
                        if(this.googlemeetTFLiteModelReady){
                            const result = await this.googlemeetTFLiteManager!.predict(canvas, this.googlemeetTFLiteParams!)
                            this.convert_googlemeet_tflite(canvas, this.canvasBackground, result, this.config)
                        }
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


    convert_bodypix = (foreground: HTMLCanvasElement, background: HTMLCanvasElement,
        segmentation: any, conf: VirtualBackgroundConfig) => {

        // (1) resize output canvas and draw background
        if (conf.width <= 0 || conf.height <= 0) {
            conf.width = foreground.width > background.width ? foreground.width : background.width
            conf.height = foreground.height > background.height ? foreground.height : background.height
        }

        this.targetCanvas.width = conf.width
        this.targetCanvas.height = conf.height
        this.targetCanvas.getContext("2d")!.drawImage(background, 0, 0, conf.width, conf.height)
        if (conf.type === "None") { // Depends on timing, bodypixResult is null
            this.targetCanvas.getContext("2d")!.drawImage(foreground, 0, 0, this.targetCanvas.width, this.targetCanvas.height)
            return this.targetCanvas
        }

        // (2) generate foreground transparent
        const bodypixResult = segmentation as SemanticPersonSegmentation
        this.canvasFront.width = bodypixResult.width
        this.canvasFront.height = bodypixResult.height
        const frontCtx = this.canvasFront.getContext("2d")!
        frontCtx.drawImage(foreground, 0, 0, bodypixResult.width, bodypixResult.height)
        const imageData = frontCtx.getImageData(0, 0, this.canvasFront.width, this.canvasFront.height)
        const pixelData = imageData.data


        for (let rowIndex = 0; rowIndex < bodypixResult.height; rowIndex++) {
            for (let colIndex = 0; colIndex < bodypixResult.width; colIndex++) {
                const seg_offset = ((rowIndex * bodypixResult.width) + colIndex)
                const pix_offset = ((rowIndex * bodypixResult.width) + colIndex) * 4
                if (bodypixResult.data[seg_offset] === 0) {
                    pixelData[pix_offset] = 0
                    pixelData[pix_offset + 1] = 0
                    pixelData[pix_offset + 2] = 0
                    pixelData[pix_offset + 3] = 0
                } else {
                    pixelData[pix_offset] = 255
                    pixelData[pix_offset + 1] = 255
                    pixelData[pix_offset + 2] = 255
                    pixelData[pix_offset + 3] = 255
                }
            }
        }
        const fgImageDataTransparent = new ImageData(pixelData, bodypixResult.width, bodypixResult.height);
        frontCtx.putImageData(fgImageDataTransparent, 0, 0)
        this.canvasFrontResized.width = foreground.width
        this.canvasFrontResized.height = foreground.height
        this.canvasFrontResized.getContext("2d")!.drawImage(this.canvasFront, 0, 0, this.canvasFrontResized.width, this.canvasFrontResized.height)
        this.canvasFrontResized.getContext("2d")!.globalCompositeOperation = 'source-in';
        this.canvasFrontResized.getContext("2d")!.drawImage(foreground, 0, 0, this.canvasFrontResized.width, this.canvasFrontResized.height)

        // (3) merge Front into Bacground
        const frontPositionX = conf.width * conf.frontPositionX
        const frontPositionY = conf.height * conf.frontPositionY
        const frontWidth = conf.width * conf.frontWidth
        const frontHeight = conf.height * conf.frontHeight
        this.targetCanvas.getContext("2d")!.drawImage(this.canvasFrontResized, frontPositionX, frontPositionY, frontWidth, frontHeight)
        return
    }


    convert_googlemeet = (foreground: HTMLCanvasElement, background: HTMLCanvasElement,
        segmentation: any, conf: VirtualBackgroundConfig) => {

        // (1) resize output canvas and draw background
        if (conf.width <= 0 || conf.height <= 0) {
            conf.width = foreground.width > background.width ? foreground.width : background.width
            conf.height = foreground.height > background.height ? foreground.height : background.height
        }

        this.targetCanvas.width = conf.width
        this.targetCanvas.height = conf.height
        this.targetCanvas.getContext("2d")!.drawImage(background, 0, 0, conf.width, conf.height)
        if (conf.type === "None") { // Depends on timing, bodypixResult is null
            this.targetCanvas.getContext("2d")!.drawImage(foreground, 0, 0, this.targetCanvas.width, this.targetCanvas.height)
            return this.targetCanvas
        }

        // (2) generate foreground transparent
        const prediction = segmentation as number[][]
        // console.log(prediction)
        // Person Canvas Mask
        this.personMaskCanvas.width = prediction[0].length
        this.personMaskCanvas.height = prediction.length
        const maskCtx = this.personMaskCanvas.getContext("2d")!
        maskCtx.clearRect(0, 0, this.personMaskCanvas.width, this.personMaskCanvas.height)
        const imageData = maskCtx.getImageData(0, 0, this.personMaskCanvas.width, this.personMaskCanvas.height)
        const data = imageData.data
        for (let rowIndex = 0; rowIndex < this.personMaskCanvas.height; rowIndex++) {
            for (let colIndex = 0; colIndex < this.personMaskCanvas.width; colIndex++) {
                const pix_offset = ((rowIndex * this.personMaskCanvas.width) + colIndex) * 4
                if (prediction[rowIndex][colIndex] >= 128) {
                    data[pix_offset + 0] = 0
                    data[pix_offset + 1] = 0
                    data[pix_offset + 2] = 0
                    data[pix_offset + 3] = 0
                } else {
                    data[pix_offset + 0] = 255
                    data[pix_offset + 1] = 255
                    data[pix_offset + 2] = 255
                    data[pix_offset + 3] = 255
                }
            }
        }
        const imageDataTransparent = new ImageData(data, this.personMaskCanvas.width, this.personMaskCanvas.height);
        maskCtx.putImageData(imageDataTransparent, 0, 0)

        // Person Canvas
        this.personCanvas.width = this.targetCanvas.width
        this.personCanvas.height = this.targetCanvas.height
        const personCtx = this.personCanvas.getContext("2d")!
        personCtx.clearRect(0, 0, this.personCanvas.width, this.personCanvas.height)
        personCtx.drawImage(this.personMaskCanvas, 0, 0, this.personCanvas.width, this.personCanvas.height)
        personCtx.globalCompositeOperation = "source-atop";
        personCtx.drawImage(foreground, 0, 0, this.personCanvas.width, this.personCanvas.height)
        this.personCanvas.getContext("2d")!.globalCompositeOperation = "source-over";



        // light wrapping
        if(this.googleMeetLightWrappingEnable){
            this.lightWrapCanvas.width = prediction[0].length
            this.lightWrapCanvas.height = prediction.length
            const lightWrapImageData = this.lightWrapCanvas.getContext("2d")!.getImageData(0, 0, this.lightWrapCanvas.width, this.lightWrapCanvas.height)
            const lightWrapdata = lightWrapImageData.data
    
            for (let rowIndex = 0; rowIndex < this.lightWrapCanvas.height; rowIndex++) {
                for (let colIndex = 0; colIndex < this.lightWrapCanvas.width; colIndex++) {
                    const pix_offset = ((rowIndex * this.lightWrapCanvas.width) + colIndex) * 4
                    if (prediction[rowIndex][colIndex] > 140) {
                        lightWrapdata[pix_offset + 0] = 0
                        lightWrapdata[pix_offset + 1] = 0
                        lightWrapdata[pix_offset + 2] = 0
                        lightWrapdata[pix_offset + 3] = 0
                    } else {
                        lightWrapdata[pix_offset + 0] = 255
                        lightWrapdata[pix_offset + 1] = 255
                        lightWrapdata[pix_offset + 2] = 255
                        lightWrapdata[pix_offset + 3] = 255
                    }
                }
            }
            const lightWrapimageDataTransparent = new ImageData(lightWrapdata, this.lightWrapCanvas.width, this.lightWrapCanvas.height);
            this.lightWrapCanvas.getContext("2d")!.putImageData(lightWrapimageDataTransparent, 0, 0)
        }

        // Background
        // (3) merge Front into Bacground
        const targetCtx = this.targetCanvas.getContext("2d")!
        targetCtx.drawImage(this.canvasBackground, 0, 0, this.targetCanvas.width, this.targetCanvas.height)
        if(this.googleMeetLightWrappingEnable){
            targetCtx.filter = 'blur(2px)';
            targetCtx.drawImage(this.lightWrapCanvas, 0, 0, this.targetCanvas.width, this.targetCanvas.height)
            targetCtx.filter = 'none';
        }

        this.targetCanvas.getContext("2d")!.drawImage(this.personCanvas, 0, 0, this.targetCanvas.width, this.targetCanvas.height)
        return
    }


    convert_googlemeet_tflite = (foreground: HTMLCanvasElement, background: HTMLCanvasElement,
        prediction: number[]|Uint8Array|null, conf: VirtualBackgroundConfig) => {

        // (1) resize output canvas and draw background
        if (conf.width <= 0 || conf.height <= 0) {
            conf.width = foreground.width > background.width ? foreground.width : background.width
            conf.height = foreground.height > background.height ? foreground.height : background.height
        }

        this.targetCanvas.width = conf.width
        this.targetCanvas.height = conf.height
        this.targetCanvas.getContext("2d")!.drawImage(background, 0, 0, conf.width, conf.height)
        if (conf.type === "None") { // Depends on timing, result is null
            this.targetCanvas.getContext("2d")!.drawImage(foreground, 0, 0, this.targetCanvas.width, this.targetCanvas.height)
            return this.targetCanvas
        }

        // (2) generate foreground transparent
        if(!prediction){
            return this.targetCanvas
        }

        const res = new ImageData(this.googlemeetTFLiteParams.processWidth, this.googlemeetTFLiteParams.processHeight)
        for(let i = 0;i < this.googlemeetTFLiteParams.processWidth * this.googlemeetTFLiteParams.processHeight; i++){
            // res.data[i * 4 + 0] = prediction![i] >128 ? 255 : prediction![i]
            // res.data[i * 4 + 1] = prediction![i] >128 ? 255 : prediction![i]
            // res.data[i * 4 + 2] = prediction![i] >128 ? 255 : prediction![i]
            // res.data[i * 4 + 3] = prediction![i] > 128 ? 255 : prediction![i]
            res.data[i * 4 + 3] = prediction![i] > 128 ? 255 : 0
            // res.data[i * 4 + 3] = prediction![i] < 64 ? 0 : prediction[i]
        }
        this.personMaskCanvas.width = this.googlemeetTFLiteParams.processWidth
        this.personMaskCanvas.height = this.googlemeetTFLiteParams.processHeight
        this.personMaskCanvas.getContext("2d")!.putImageData(res, 0, 0)

        // (3) generarte Person Canvas
        this.personCanvas.width = conf.width
        this.personCanvas.height = conf.height
        const personCtx = this.personCanvas.getContext("2d")!
        personCtx.clearRect(0, 0, this.personCanvas.width, this.personCanvas.height)
        personCtx.drawImage(this.personMaskCanvas, 0, 0, this.personCanvas.width, this.personCanvas.height)        
        personCtx.globalCompositeOperation = "source-atop";
        personCtx.drawImage(foreground, 0, 0, this.personCanvas.width, this.personCanvas.height)
        this.personCanvas.getContext("2d")!.globalCompositeOperation = "source-over";

        // (4) apply LightWrapping
        const dstCtx = this.targetCanvas.getContext("2d")!
        dstCtx.filter = `blur(${this.lwBlur}px)`;
        dstCtx.drawImage(this.personMaskCanvas, 0, 0, this.targetCanvas.width, this.targetCanvas.height)
        dstCtx.filter = 'none';

        // (5) draw personcanvas
        dstCtx.drawImage(this.personCanvas, 0, 0, this.targetCanvas.width, this.targetCanvas.height)
        return
    }

    convert_none = (foreground: HTMLCanvasElement) => {
        // TODO: Width and Height
        this.targetCanvas.getContext("2d")!.drawImage(foreground, 0, 0, this.targetCanvas.width, this.targetCanvas.height)
    }
















}