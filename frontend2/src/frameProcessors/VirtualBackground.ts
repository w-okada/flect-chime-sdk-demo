import { CanvasVideoFrameBuffer, VideoFrameBuffer, VideoFrameProcessor } from "amazon-chime-sdk-js";
import { BodypixWorkerManager, generateBodyPixDefaultConfig, generateDefaultBodyPixParams, ModelConfigMobileNetV1_05, SemanticPersonSegmentation } from "@dannadori/bodypix-worker-js"
import { generateGoogleMeetSegmentationDefaultConfig, generateDefaultGoogleMeetSegmentationParams, GoogleMeetSegmentationWorkerManager } from '@dannadori/googlemeet-segmentation-worker-js'



export type VirtualBackgroundType = "None" | "BodyPix" | "GoogleMeet"
export type BackgroundMode = "Image" | "Blur" | "Color"

interface VirtualBackgroundConfig {
    frontPositionX: number, // ratio (position and size of front image)
    frontPositionY: number, // ratio (position and size of front image)
    frontWidth: number,    // ratio (position and size of front image)
    frontHeight: number,   // ratio (position and size of front image)

    width: number,          // pixel (output size. If =<0, fit the background canvas size )
    height: number,         // pixel (output size. If =<0, fit the background canvas size )

    type: VirtualBackgroundType,
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
    bodyPixConfig = (() => {
        const c = generateBodyPixDefaultConfig()
        c.model = ModelConfigMobileNetV1_05
        c.processOnLocal = false
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
        m.init(this.bodyPixConfig)
        return m
    })()
    googlemeetConfig = (() => {
        const c = generateGoogleMeetSegmentationDefaultConfig()
        c.processOnLocal = false
        return c
    })()
    googlemeetParams = (() => {
        const p = generateDefaultGoogleMeetSegmentationParams()
        p.processWidth = 128
        p.processHeight = 128
        p.smoothingR = 1
        p.smoothingS = 0
        p.jbfWidth = 256
        p.jbfHeight = 256
        p.lightWrapping = true
        return p
    })()
    googlemeetManager = (() => {
        console.log("GOOGLE!")
        const m = new GoogleMeetSegmentationWorkerManager()
        m.init(this.googlemeetConfig)
        return m
    })()


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
    setVirtualBackgroundType(type: VirtualBackgroundType) {
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
        if (buffers.length == 0) {
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
                let result: any
                switch (this.config.type) {
                    case "BodyPix":
                        // result = await this.bodyPixManager!.predict(canvas, this.bodyPixParams!)
                        result = await this.bodyPixManager!.predict(canvas, this.bodyPixParams!)
                        this.convert_bodypix(canvas, this.canvasBackground, result, this.config)
                        break
                    case "GoogleMeet":
                        // result = await this.googleMeetManager!.predict(canvas, this.googleMeetParams!)
                        result = await this.googlemeetManager!.predict(canvas, this.googlemeetParams!)
                        this.convert_googlemeet(canvas, this.canvasBackground, result, this.config)
                        break
                    default:
                        result = null
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

        // Background
        // (3) merge Front into Bacground
        const frontPositionX = conf.width * conf.frontPositionX
        const frontPositionY = conf.height * conf.frontPositionY
        const frontWidth = conf.width * conf.frontWidth
        const frontHeight = conf.height * conf.frontHeight
        const targetCtx = this.targetCanvas.getContext("2d")!
        targetCtx.drawImage(this.canvasBackground, 0, 0, this.targetCanvas.width, this.targetCanvas.height)
        // targetCtx.filter = 'blur(2px)';
        // targetCtx.drawImage(this.lightWrapCanvas, 0, 0, this.targetCanvas.width, this.targetCanvas.height)
        // targetCtx.filter = 'none';

        this.targetCanvas.getContext("2d")!.drawImage(this.personCanvas, 0, 0, this.targetCanvas.width, this.targetCanvas.height)


    }

























    // convert = (foreground: HTMLCanvasElement, background: HTMLCanvasElement,
    //     segmentation: any, conf: VirtualBackgroundConfig) => {

    //     // (1) resize output canvas and draw background
    //     if (conf.width <= 0 || conf.height <= 0) {
    //         conf.width = foreground.width > background.width ? foreground.width : background.width
    //         conf.height = foreground.height > background.height ? foreground.height : background.height
    //     }

    //     this.targetCanvas.width = conf.width
    //     this.targetCanvas.height = conf.height
    //     this.targetCanvas.getContext("2d")!.drawImage(background, 0, 0, conf.width, conf.height)
    //     if (conf.type === "None") { // Depends on timing, bodypixResult is null
    //         this.targetCanvas.getContext("2d")!.drawImage(foreground, 0, 0, this.targetCanvas.width, this.targetCanvas.height)
    //         return this.targetCanvas
    //     }

    //     // (2) generate foreground transparent
    //     if (conf.type === "BodyPix") {
    //         const bodypixResult = segmentation as SemanticPersonSegmentation
    //         this.canvasFront.width = bodypixResult.width
    //         this.canvasFront.height = bodypixResult.height
    //         const frontCtx = this.canvasFront.getContext("2d")!
    //         frontCtx.drawImage(foreground, 0, 0, bodypixResult.width, bodypixResult.height)
    //         const imageData = frontCtx.getImageData(0, 0, this.canvasFront.width, this.canvasFront.height)
    //         const pixelData = imageData.data


    //         for (let rowIndex = 0; rowIndex < bodypixResult.height; rowIndex++) {
    //             for (let colIndex = 0; colIndex < bodypixResult.width; colIndex++) {
    //                 const seg_offset = ((rowIndex * bodypixResult.width) + colIndex)
    //                 const pix_offset = ((rowIndex * bodypixResult.width) + colIndex) * 4
    //                 if (bodypixResult.data[seg_offset] === 0) {
    //                     pixelData[pix_offset] = 0
    //                     pixelData[pix_offset + 1] = 0
    //                     pixelData[pix_offset + 2] = 0
    //                     pixelData[pix_offset + 3] = 0
    //                 } else {
    //                     pixelData[pix_offset] = 255
    //                     pixelData[pix_offset + 1] = 255
    //                     pixelData[pix_offset + 2] = 255
    //                     pixelData[pix_offset + 3] = 255
    //                 }
    //             }
    //         }
    //         const fgImageDataTransparent = new ImageData(pixelData, bodypixResult.width, bodypixResult.height);
    //         frontCtx.putImageData(fgImageDataTransparent, 0, 0)
    //         this.canvasFrontResized.width = foreground.width
    //         this.canvasFrontResized.height = foreground.height
    //         this.canvasFrontResized.getContext("2d")!.drawImage(this.canvasFront, 0, 0, this.canvasFrontResized.width, this.canvasFrontResized.height)
    //         this.canvasFrontResized.getContext("2d")!.globalCompositeOperation = 'source-in';
    //         this.canvasFrontResized.getContext("2d")!.drawImage(foreground, 0, 0, this.canvasFrontResized.width, this.canvasFrontResized.height)

    //         // (3) merge Front into Bacground
    //         const frontPositionX = conf.width * conf.frontPositionX
    //         const frontPositionY = conf.height * conf.frontPositionY
    //         const frontWidth = conf.width * conf.frontWidth
    //         const frontHeight = conf.height * conf.frontHeight
    //         this.targetCanvas.getContext("2d")!.drawImage(this.canvasFrontResized, frontPositionX, frontPositionY,
    //             frontWidth, frontHeight)

    //     } else if (conf.type === "GoogleMeet") {
    //         const prediction = segmentation as number[][]
    //         // console.log(prediction)
    //         // Person Canvas Mask
    //         this.personMaskCanvas.width = prediction[0].length
    //         this.personMaskCanvas.height = prediction.length
    //         const maskCtx = this.personMaskCanvas.getContext("2d")!
    //         maskCtx.clearRect(0, 0, this.personMaskCanvas.width, this.personMaskCanvas.height)
    //         const imageData = maskCtx.getImageData(0, 0, this.personMaskCanvas.width, this.personMaskCanvas.height)
    //         const data = imageData.data
    //         for (let rowIndex = 0; rowIndex < this.personMaskCanvas.height; rowIndex++) {
    //             for (let colIndex = 0; colIndex < this.personMaskCanvas.width; colIndex++) {
    //                 const pix_offset = ((rowIndex * this.personMaskCanvas.width) + colIndex) * 4
    //                 if (prediction[rowIndex][colIndex] >= 128) {
    //                     data[pix_offset + 0] = 0
    //                     data[pix_offset + 1] = 0
    //                     data[pix_offset + 2] = 0
    //                     data[pix_offset + 3] = 0
    //                 } else {
    //                     data[pix_offset + 0] = 255
    //                     data[pix_offset + 1] = 255
    //                     data[pix_offset + 2] = 255
    //                     data[pix_offset + 3] = 255
    //                 }
    //             }
    //         }
    //         const imageDataTransparent = new ImageData(data, this.personMaskCanvas.width, this.personMaskCanvas.height);
    //         maskCtx.putImageData(imageDataTransparent, 0, 0)

    //         // Person Canvas
    //         this.personCanvas.width = this.targetCanvas.width
    //         this.personCanvas.height = this.targetCanvas.height
    //         const personCtx = this.personCanvas.getContext("2d")!
    //         personCtx.clearRect(0, 0, this.personCanvas.width, this.personCanvas.height)
    //         personCtx.drawImage(this.personMaskCanvas, 0, 0, this.personCanvas.width, this.personCanvas.height)
    //         personCtx.globalCompositeOperation = "source-atop";
    //         personCtx.drawImage(foreground, 0, 0, this.personCanvas.width, this.personCanvas.height)
    //         this.personCanvas.getContext("2d")!.globalCompositeOperation = "source-over";



    //         // light wrapping
    //         this.lightWrapCanvas.width = prediction[0].length
    //         this.lightWrapCanvas.height = prediction.length
    //         const lightWrapImageData = this.lightWrapCanvas.getContext("2d")!.getImageData(0, 0, this.lightWrapCanvas.width, this.lightWrapCanvas.height)
    //         const lightWrapdata = lightWrapImageData.data

    //         for (let rowIndex = 0; rowIndex < this.lightWrapCanvas.height; rowIndex++) {
    //             for (let colIndex = 0; colIndex < this.lightWrapCanvas.width; colIndex++) {
    //                 const pix_offset = ((rowIndex * this.lightWrapCanvas.width) + colIndex) * 4
    //                 if (prediction[rowIndex][colIndex] > 140) {
    //                     lightWrapdata[pix_offset + 0] = 0
    //                     lightWrapdata[pix_offset + 1] = 0
    //                     lightWrapdata[pix_offset + 2] = 0
    //                     lightWrapdata[pix_offset + 3] = 0
    //                 } else {
    //                     lightWrapdata[pix_offset + 0] = 255
    //                     lightWrapdata[pix_offset + 1] = 255
    //                     lightWrapdata[pix_offset + 2] = 255
    //                     lightWrapdata[pix_offset + 3] = 255
    //                 }
    //             }
    //         }
    //         const lightWrapimageDataTransparent = new ImageData(lightWrapdata, this.lightWrapCanvas.width, this.lightWrapCanvas.height);
    //         this.lightWrapCanvas.getContext("2d")!.putImageData(lightWrapimageDataTransparent, 0, 0)

    //         // Background
    //         // (3) merge Front into Bacground
    //         const frontPositionX = conf.width * conf.frontPositionX
    //         const frontPositionY = conf.height * conf.frontPositionY
    //         const frontWidth = conf.width * conf.frontWidth
    //         const frontHeight = conf.height * conf.frontHeight
    //         const targetCtx = this.targetCanvas.getContext("2d")!
    //         targetCtx.drawImage(this.canvasBackground, 0, 0, this.targetCanvas.width, this.targetCanvas.height)
    //         // targetCtx.filter = 'blur(2px)';
    //         // targetCtx.drawImage(this.lightWrapCanvas, 0, 0, this.targetCanvas.width, this.targetCanvas.height)
    //         // targetCtx.filter = 'none';

    //         this.targetCanvas.getContext("2d")!.drawImage(this.personCanvas, 0, 0, this.targetCanvas.width, this.targetCanvas.height)
    //     }

    // }

}