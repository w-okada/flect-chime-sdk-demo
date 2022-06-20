import { CanvasVideoFrameBuffer, VideoFrameBuffer, VideoFrameProcessor } from "amazon-chime-sdk-js";
// import * as face_detection from "@mediapipe/face_detection";
import { BlazefaceWorkerManager, generateBlazefaceDefaultConfig, generateDefaultBlazefaceParams, BackendTypes } from "@dannadori/blazeface-worker-js";

import * as faceDetection from "@tensorflow-models/face-detection"


export class TrackingCameraImageProcessor implements VideoFrameProcessor {
    private targetCanvas: HTMLCanvasElement = document.createElement('canvas');
    private targetCanvasCtx: CanvasRenderingContext2D = this.targetCanvas.getContext('2d')!;
    private canvasVideoFrameBuffer = new CanvasVideoFrameBuffer(this.targetCanvas);
    private manager = new BlazefaceWorkerManager()
    private config = generateBlazefaceDefaultConfig();
    private params = generateDefaultBlazefaceParams();

    private detector: faceDetection.FaceDetector | null = null

    constructor() {
        this.config.backendType = BackendTypes.wasm
        this.config.processOnLocal = false
        this.manager.init(this.config)

        this.params.processWidth = 300
        this.params.processHeight = 300

        //this.prepairMediapipe()
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


    // MediapipeはWebworkerでは動かない？？
    prepairMediapipe = async () => {
        this.detector = await faceDetection.createDetector(faceDetection.SupportedModels.MediaPipeFaceDetector, {
            runtime: "mediapipe",
            solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection`,
        });

    }
    processWithMediapipe = async (buffers: VideoFrameBuffer[]): Promise<VideoFrameBuffer[]> => {
        if (!buffers[0]) {
            return buffers;
        }
        const canvas = buffers[0].asCanvasElement!()
        if (!canvas) {
            return buffers;
        }
        if (!this.detector) {
            return buffers;
        }
        // const ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
        // console.log("worke on webworker?", ENVIRONMENT_IS_WORKER)
        this.targetCanvas.width = canvas.width
        this.targetCanvas.height = canvas.height

        const faces = await this.detector.estimateFaces(canvas as HTMLCanvasElement)
        console.log(faces)

        return buffers;
    }
    destroy = async (): Promise<void> => {
        throw new Error("Method not implemented.");
    }
}
