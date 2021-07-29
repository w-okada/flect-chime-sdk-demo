import { generateDefaultGoogleMeetSegmentationTFLiteParams, generateGoogleMeetSegmentationTFLiteDefaultConfig, GoogleMeetSegmentationTFLiteWorkerManager } from "@dannadori/googlemeet-segmentation-tflite-worker-js"
import { VirtualBackgroundConfig } from "./VirtualBackground"



export class VirtualBackgroundGoogleMeetTFLite{

    personCanvas = document.createElement("canvas")
    personMaskCanvas = document.createElement("canvas")

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
        p.kernelSize    = 1
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

    lightWrappingBlur = 10
    antialiaseBlur    = 4

    predict = async (frontCanvas:HTMLCanvasElement, backCanvas:HTMLCanvasElement, targetCanvas:HTMLCanvasElement, config:VirtualBackgroundConfig) => {
        const result = await this.googlemeetTFLiteManager!.predict(frontCanvas, this.googlemeetTFLiteParams!)
        return this.convert_googlemeet_tflite(frontCanvas, backCanvas, targetCanvas, result, config)
    }



    convert_googlemeet_tflite = (foreground: HTMLCanvasElement, background: HTMLCanvasElement, targetCanvas:HTMLCanvasElement,
        prediction: number[]|Uint8Array|null, conf: VirtualBackgroundConfig) => {

        // (1) resize output canvas and draw background
        if (conf.width <= 0 || conf.height <= 0) {
            conf.width = foreground.width > background.width ? foreground.width : background.width
            conf.height = foreground.height > background.height ? foreground.height : background.height
        }

        targetCanvas.width = conf.width
        targetCanvas.height = conf.height
        targetCanvas.getContext("2d")!.drawImage(background, 0, 0, conf.width, conf.height)
        if (conf.type === "None") { // Depends on timing, result is null
            targetCanvas.getContext("2d")!.drawImage(foreground, 0, 0, targetCanvas.width, targetCanvas.height)
            // return targetCanvas
            return
        }

        // (2) generate foreground transparent
        if(!prediction){
            // return targetCanvas
            return
        }

        const res = new ImageData(this.googlemeetTFLiteParams.processWidth, this.googlemeetTFLiteParams.processHeight)
        for(let i = 0;i < this.googlemeetTFLiteParams.processWidth * this.googlemeetTFLiteParams.processHeight; i++){
            // res.data[i * 4 + 0] = prediction![i] >128 ? 255 : prediction![i]
            // res.data[i * 4 + 1] = prediction![i] >128 ? 255 : prediction![i]
            // res.data[i * 4 + 2] = prediction![i] >128 ? 255 : prediction![i]
            // res.data[i * 4 + 3] = prediction![i] > 128 ? 255 : prediction![i]
            res.data[i * 4 + 0] = prediction![i] > 128 ? 255 : 0
            res.data[i * 4 + 1] = prediction![i] > 128 ? 255 : 0
            res.data[i * 4 + 2] = prediction![i] > 128 ? 255 : 0
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
