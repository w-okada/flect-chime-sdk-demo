import { BackgroundBlurVideoFrameProcessor, BackgroundReplacementVideoFrameProcessor, ConsoleLogger, DefaultVideoTransformDevice, VideoFrameProcessor } from "amazon-chime-sdk-js";
import { GenerateVideoInputDeivceParams } from "../001_DeviceManager";
import { CenterStageCameraImageProcessor } from "./videoProcessor/001_CenterStageCamera";
// import { VirtualBackground, VirtualBackgroundSegmentationType } from "../frame/VirtualBackground";

//////////////////////////////
// Types
//////////////////////////////
// (1) Custom Devices
export const VideoInputCustomDevices = {
    "none": "none",
    "file": "file",
} as const
export type VideoInputCustomDevices = typeof VideoInputCustomDevices[keyof typeof VideoInputCustomDevices]
export const VideoInputCustomDeviceList = Object.entries(VideoInputCustomDevices).map(([key, val]) => {
    return { label: key, deviceId: val, }
})

// (2) Virtual Background
export const VirtualBackgroundTypes = {
    none: "none",
    blur: "blur",
    track: "track",
    // image: "image",
} as const;
export type VirtualBackgroundTypes = typeof VirtualBackgroundTypes[keyof typeof VirtualBackgroundTypes];
export const VirtualBackgroundTypeList = Object.entries(VirtualBackgroundTypes).map(([key, val]) => {
    return { label: key, val: val }
})

// (3) Blur Strength
export const BlurStrength = {
    HIGH_BLUR: 30,
    MED_BLUR: 15,
    LOW_BLUR: 7,
} as const;
export type BlurStrength = typeof BlurStrength[keyof typeof BlurStrength];
export const BlurStrengthList = Object.entries(BlurStrength).map(([key, val]) => {
    return { label: key, val: val }
})

//////////////////////////////
// Class
//////////////////////////////
export class VideoInputDeviceGenerator {
    backgroundBlurProcessor: VideoFrameProcessor | null = null
    backgroundReplacementProcessor: VideoFrameProcessor | null = null
    videoTransformDevice: DefaultVideoTransformDevice | null = null

    centerStageProcessor = new CenterStageCameraImageProcessor()
    generateVideoInputDeivce = async (params: GenerateVideoInputDeivceParams) => {

        //// (a) no device selected 
        if (params.device === VideoInputCustomDevices.none) {
            return null
        }
        //// (b) no processor selected
        if (
            params.virtualBackgroundType === VirtualBackgroundTypes.none &&
            params.enableAvatar === false &&
            params.enableCenterStage === false) {
            return params.device
        }

        if (params.enableCenterStage) {
            // TODO
        }

        if (params.virtualBackgroundType == VirtualBackgroundTypes.blur) {
            const supported = await BackgroundBlurVideoFrameProcessor.isSupported()
            if (supported) {
                const p = await BackgroundBlurVideoFrameProcessor.create(
                    undefined,
                    {
                        blurStrength: params.blurStrength
                    }
                );
                this.backgroundBlurProcessor = p || null
            } else {
                console.error("Background Blur is not supported.")
                this.backgroundBlurProcessor = null
            }
        }

        // if (params.virtualBackgroundType == VirtualBackgroundTypes.image) {
        //     const supported = await BackgroundReplacementVideoFrameProcessor.isSupported();
        //     if (supported) {
        //         const image = await fetch(params.imageURL);
        //         const imageBlob = await image.blob();
        //         const p = await BackgroundReplacementVideoFrameProcessor.create(undefined, { imageBlob });
        //         this.backgroundReplacementProcessor = p || null
        //     } else {
        //         console.error("Background Replacement is not supported.")
        //         this.backgroundReplacementProcessor = null
        //     }
        // }

        if (params.enableAvatar) {
            // TODO
        }

        // プロセッサーの追加
        const processors: VideoFrameProcessor[] = []
        if (params.enableCenterStage) {
            processors.push(this.centerStageProcessor)
        }
        if (params.virtualBackgroundType == VirtualBackgroundTypes.blur && this.backgroundBlurProcessor) {
            processors.push(this.backgroundBlurProcessor)
        }

        // if (params.virtualBackgroundType == VirtualBackgroundTypes.image && this.backgroundReplacementProcessor) {
        //     // processors.push(this.backgroundReplacementProcessor)
        // }
        // if (params.enableAvatar) {
        //     // processors.push()
        // }


        if (this.videoTransformDevice) {
            await this.videoTransformDevice.stop()
        }
        console.log("device:", params.device)
        this.videoTransformDevice = new DefaultVideoTransformDevice(new ConsoleLogger("FrameProcessor"), params.device, processors);
        return this.videoTransformDevice
    }
}

