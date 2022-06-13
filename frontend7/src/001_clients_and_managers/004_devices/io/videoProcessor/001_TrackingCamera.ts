import { CanvasVideoFrameBuffer, VideoFrameBuffer, VideoFrameProcessor } from "amazon-chime-sdk-js";
// import * as face_detection from "@mediapipe/face_detection";
import { BlazefaceWorkerManager, generateBlazefaceDefaultConfig, generateDefaultBlazefaceParams, BackendTypes } from "@dannadori/blazeface-worker-js";

export class VideoLoadImageProcessor implements VideoFrameProcessor {
    private targetCanvas: HTMLCanvasElement = document.createElement('canvas');
    private targetCanvasCtx: CanvasRenderingContext2D = this.targetCanvas.getContext('2d')!;
    private canvasVideoFrameBuffer = new CanvasVideoFrameBuffer(this.targetCanvas);
    private manager = new BlazefaceWorkerManager()
    private config = generateBlazefaceDefaultConfig();
    private params = generateDefaultBlazefaceParams();
    constructor() {
        this.config.backendType = BackendTypes.wasm
        this.config.processOnLocal = true
        this.manager.init(this.config)

        this.params.processWidth = 300
        this.params.processHeight = 300
    }


    process = async (buffers: VideoFrameBuffer[]): Promise<VideoFrameBuffer[]> => {
        if (!buffers[0]) {
            return buffers;
        }
        const canvas = buffers[0].asCanvasElement!()
        if (!canvas) {
            return buffers;
        }
        const prediction = await this.manager.predict(this.params, canvas as HTMLCanvasElement)
        const trackingArea = this.manager.fitCroppedArea(prediction, canvas.width, canvas.height, this.params.processWidth, this.params.processHeight, canvas.width, canvas.height, 1, 0.4, 0, 0);

        this.targetCanvasCtx.clearRect(0, 0, this.targetCanvas.width, this.targetCanvas.height)
        this.targetCanvasCtx.drawImage(canvas, trackingArea.xmin, trackingArea.ymin, trackingArea.width, trackingArea.height, 0, 0, this.targetCanvas.width, this.targetCanvas.height);

        buffers[0] = this.canvasVideoFrameBuffer;
        return buffers;
    }

    process2 = async (buffers: VideoFrameBuffer[]): Promise<VideoFrameBuffer[]> => {
        if (!buffers[0]) {
            return buffers;
        }
        const canvas = buffers[0].asCanvasElement!()
        if (!canvas) {
            return buffers;
        }
        const ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
        console.log("worke on webworker?", ENVIRONMENT_IS_WORKER)
        this.targetCanvas.width = canvas.width
        this.targetCanvas.height = canvas.height

        // @ts-ignore
        const faceDetector = new FaceDetection({
            // @ts-ignore
            locateFile: (file) => {
                // return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/${file}`;
            }
        });
        const p = new Promise<void>((resolve, reject) => {
            // @ts-ignore
            faceDetector.onResults((results) => {

                this.targetCanvasCtx.save();
                this.targetCanvasCtx.clearRect(0, 0, this.targetCanvas.width, this.targetCanvas.height);
                this.targetCanvasCtx.drawImage(results.image, 0, 0, this.targetCanvas.width, this.targetCanvas.height);
                console.log(results.detections)
                this.targetCanvasCtx.restore();
                resolve()
            })
        })
        console.log("Face detect", canvas)
        if (canvas instanceof HTMLCanvasElement) {
            faceDetector.send({ image: canvas }) // <--- HERE input type InputImage = HTMLVideoElement | HTMLImageElement | HTMLCanvasElement;            
        }


        await p
        buffers[0] = this.canvasVideoFrameBuffer;
        return buffers;
    }
    destroy = async (): Promise<void> => {
        throw new Error("Method not implemented.");
    }
}
