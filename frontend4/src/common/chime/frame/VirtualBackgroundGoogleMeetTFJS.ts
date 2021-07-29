import { generateDefaultGoogleMeetSegmentationParams, generateGoogleMeetSegmentationDefaultConfig, GoogleMeetSegmentationSmoothingType, GoogleMeetSegmentationWorkerManager } from "@dannadori/googlemeet-segmentation-worker-js"
import { VirtualBackgroundConfig } from "./VirtualBackground"



export class VirtualBackgroundGoogleMeetTFJS{
    personCanvas = document.createElement("canvas")
    personMaskCanvas = document.createElement("canvas")
    lightWrapCanvas = document.createElement("canvas")
    canvasBackground = document.createElement("canvas")

    
    googleMeetLightWrappingEnable = true
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


    predict = async (frontCanvas:HTMLCanvasElement, backCanvas:HTMLCanvasElement, targetCanvas:HTMLCanvasElement, config:VirtualBackgroundConfig) => {
        const result = await this.googlemeetManager!.predict(frontCanvas, this.googlemeetParams!)
        this.convert_googlemeet(frontCanvas, backCanvas, targetCanvas, result, config)
    }

    convert_googlemeet = (foreground: HTMLCanvasElement, background: HTMLCanvasElement, targetCanvas:HTMLCanvasElement,
        segmentation: any, conf: VirtualBackgroundConfig) => {

        // (1) resize output canvas and draw background
        if (conf.width <= 0 || conf.height <= 0) {
            conf.width = foreground.width > background.width ? foreground.width : background.width
            conf.height = foreground.height > background.height ? foreground.height : background.height
        }

        targetCanvas.width = conf.width
        targetCanvas.height = conf.height
        targetCanvas.getContext("2d")!.drawImage(background, 0, 0, conf.width, conf.height)
        if (conf.type === "None") { // Depends on timing, bodypixResult is null
            targetCanvas.getContext("2d")!.drawImage(foreground, 0, 0, targetCanvas.width, targetCanvas.height)
            return targetCanvas
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
        this.personCanvas.width = targetCanvas.width
        this.personCanvas.height = targetCanvas.height
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
        const targetCtx = targetCanvas.getContext("2d")!
        targetCtx.drawImage(this.canvasBackground, 0, 0, targetCanvas.width, targetCanvas.height)
        if(this.googleMeetLightWrappingEnable){
            targetCtx.filter = 'blur(2px)';
            targetCtx.drawImage(this.lightWrapCanvas, 0, 0, targetCanvas.width, targetCanvas.height)
            targetCtx.filter = 'none';
        }

        targetCanvas.getContext("2d")!.drawImage(this.personCanvas, 0, 0, targetCanvas.width, targetCanvas.height)
        return

    }
}
