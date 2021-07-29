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

    lightWrappingBlur = 10
    antialiaseBlur    = 4

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
            return
        }

        // (2) generate foreground transparent
        const prediction = segmentation as number[][]
        const res = new ImageData(prediction[0].length, prediction.length)
        for (let rowIndex = 0; rowIndex < this.personMaskCanvas.height; rowIndex++) {
            for (let colIndex = 0; colIndex < this.personMaskCanvas.width; colIndex++) {
                const pix_offset = ((rowIndex * this.personMaskCanvas.width) + colIndex) * 4
                if (prediction[rowIndex][colIndex] >= 128) {
                    res.data[pix_offset + 0] = 0
                    res.data[pix_offset + 1] = 0
                    res.data[pix_offset + 2] = 0
                    res.data[pix_offset + 3] = 0
                } else {
                    res.data[pix_offset + 0] = 255
                    res.data[pix_offset + 1] = 255
                    res.data[pix_offset + 2] = 255
                    res.data[pix_offset + 3] = 255
                }
            }
        }
        this.personMaskCanvas.width = prediction[0].length
        this.personMaskCanvas.height = prediction.length
        this.personMaskCanvas.getContext("2d")!.putImageData(res, 0, 0)

        // (3) generarte Person Canvas
        this.personCanvas.width = conf.width
        this.personCanvas.height = conf.height
        const personCtx = this.personCanvas.getContext("2d")!
        personCtx.clearRect(0, 0, this.personCanvas.width, this.personCanvas.height)
        personCtx.filter = `blur(${this.antialiaseBlur}px)`;
        personCtx.drawImage(this.personMaskCanvas, 0, 0, this.personCanvas.width, this.personCanvas.height) 
        personCtx.filter = `none`;
        personCtx.globalCompositeOperation = "source-atop";
        personCtx.drawImage(foreground, 0, 0, this.personCanvas.width, this.personCanvas.height)
        this.personCanvas.getContext("2d")!.globalCompositeOperation = "source-over";        


        // (4) apply LightWrapping
        const dstCtx = targetCanvas.getContext("2d")!
        dstCtx.filter = `blur(${this.lightWrappingBlur}px)`;
        dstCtx.drawImage(this.personMaskCanvas, 0, 0, targetCanvas.width, targetCanvas.height)
        dstCtx.filter = 'none';

        // (5) draw personcanvas
        dstCtx.drawImage(this.personCanvas, 0, 0, targetCanvas.width, targetCanvas.height)
        return 
    }
}
