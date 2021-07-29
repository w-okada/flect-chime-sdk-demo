import { BodypixWorkerManager, generateBodyPixDefaultConfig, generateDefaultBodyPixParams, ModelConfigMobileNetV1_05, SemanticPersonSegmentation } from "@dannadori/bodypix-worker-js"
import { VirtualBackgroundConfig } from "./VirtualBackground"



export class VirtualBackgroundBodyPix{
    canvasFront = document.createElement('canvas')
    canvasFrontResized = document.createElement("canvas")
    canvasBackground = document.createElement("canvas")

    
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

    predict = async (frontCanvas:HTMLCanvasElement, backCanvas:HTMLCanvasElement, targetCanvas:HTMLCanvasElement, config:VirtualBackgroundConfig) => {
        const result = await this.bodyPixManager!.predict(frontCanvas, this.bodyPixParams!)
        this.convert_bodypix(frontCanvas, backCanvas, targetCanvas, result, config)
    }

    convert_bodypix = (foreground: HTMLCanvasElement, background: HTMLCanvasElement, targetCanvas:HTMLCanvasElement,
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
        targetCanvas.getContext("2d")!.drawImage(this.canvasFrontResized, frontPositionX, frontPositionY, frontWidth, frontHeight)

        return
    }
}
