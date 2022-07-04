import { DefaultBrowserBehavior, DefaultDeviceController, MeetingSession, VoiceFocusDeviceTransformer, VoiceFocusSpec, VoiceFocusTransformDevice } from "amazon-chime-sdk-js";
import { GenerateAudioInputDeivceParams } from "../001_DeviceManager";
//////////////////////////////
// Types
//////////////////////////////

// (1) Custom Devices
export const AudioInputCustomDevices = {
    "none": "none",
    "tone": "tone",
    "null": "null",
} as const
export type AudioInputCustomDevices = typeof AudioInputCustomDevices[keyof typeof AudioInputCustomDevices]
export const AudioInputCustomDeviceList = Object.entries(AudioInputCustomDevices).map(([key, val]) => {
    return { label: key, deviceId: val, }
})

// (2) Noise Suppression
export const NoiseSuppressionTypes = {
    none: "none",
    c100: "c100",
    c50: "c50",
    c20: "c20",
    c10: "c10",
    auto: "auto",
} as const;
export type NoiseSuppressionTypes = typeof NoiseSuppressionTypes[keyof typeof NoiseSuppressionTypes];
export const NoiseSuppressionTypeList = Object.entries(NoiseSuppressionTypes).map(([key, val]) => {
    return { label: key, val: val }
})


//////////////////////////////
// Class
//////////////////////////////
export class AudioInputDeviceGenerator {
    voiceFocusDeviceTransformer: VoiceFocusDeviceTransformer | null = null
    generatedDvice: VoiceFocusTransformDevice | MediaStream | null = null
    generateAudioInputDeivce = async (params: GenerateAudioInputDeivceParams) => {
        //// (a) no device selected 
        if (params.device === AudioInputCustomDevices.none) {
            return null
        }

        //// (b) tone device selected 
        if (params.device === AudioInputCustomDevices.tone) {
            return this.generateToneDevice();
        }

        const proposedConstraints: MediaStreamConstraints | null = this.calculateAudioMediaStreamConstraints(params.device);
        const inputMediaStream = await navigator.mediaDevices.getUserMedia(proposedConstraints!);
        console.log("generateAudio", inputMediaStream)
        //// (c) no voice focus
        if (params.noiseSuppressionType === NoiseSuppressionTypes.none) {
            return inputMediaStream
        }

        //// (d) voice focus
        const supported = await VoiceFocusDeviceTransformer.isSupported()
        if (supported) {
            const p = await VoiceFocusDeviceTransformer.create({ variant: params.noiseSuppressionType });
            this.voiceFocusDeviceTransformer = p || null
        } else {
            console.error("Voice Focus is not supported.")
            this.voiceFocusDeviceTransformer = null
        }

        if (this.voiceFocusDeviceTransformer) {
            const d = await this.voiceFocusDeviceTransformer.createTransformDevice(inputMediaStream)
            this.generatedDvice = d || null
        } else {
            return inputMediaStream
        }
        if (!this.generatedDvice) {
            return null
        }
        const audioContext = DefaultDeviceController.getAudioContext();
        const outputNode = audioContext.createMediaStreamDestination();
        const nodeToVF = audioContext.createMediaStreamSource(inputMediaStream);
        const nodeOfVF = await this.generatedDvice.createAudioNode(audioContext);
        nodeToVF.connect(nodeOfVF.start);
        nodeOfVF.end.connect(outputNode)
        return outputNode.stream


        // if (this.voiceFocusDeviceTransformer) {
        //     const d = await this.voiceFocusDeviceTransformer.createTransformDevice()
        //     this.generatedDvice = d || params.device
        // } else {
        //     this.generatedDvice = params.device
        // }

        // //// (d-1) choose voice foucs but cannot use
        // if (typeof this.generatedDvice === "string") {
        //     const proposedConstraints: MediaStreamConstraints | null = this.calculateAudioMediaStreamConstraints(params.device);
        //     const inputMediaStream = await navigator.mediaDevices.getUserMedia(proposedConstraints!);
        //     return inputMediaStream
        // }
        // const audioContext = DefaultDeviceController.getAudioContext();
        // const outputNode = audioContext.createMediaStreamDestination();
        // (await this.generatedDvice.createAudioNode(audioContext)).end.connect(outputNode)
        // return outputNode.stream
    }

    private browserBehavior: DefaultBrowserBehavior = new DefaultBrowserBehavior();
    private calculateAudioMediaStreamConstraints(deviceId: string): MediaStreamConstraints | null {
        let trackConstraints: MediaTrackConstraints = {};

        if (this.browserBehavior.requiresNoExactMediaStreamConstraints() && this.browserBehavior.requiresGroupIdMediaStreamConstraints()) {
            // In Samsung Internet browser, navigator.mediaDevices.enumerateDevices()
            // returns same deviceId but different groupdId for some audioinput and videoinput devices.
            // To handle this, we select appropriate device using deviceId + groupId.
            trackConstraints.deviceId = deviceId;
        } else if (this.browserBehavior.requiresNoExactMediaStreamConstraints()) {
            trackConstraints.deviceId = deviceId;
        } else {
            trackConstraints.deviceId = { exact: deviceId };
        }
        const defaultSampleRate = 48000;
        const defaultSampleSize = 16;
        const defaultChannelCount = 1;
        if (this.supportSampleRateConstraint()) {
            trackConstraints.sampleRate = { ideal: defaultSampleRate };
        }
        if (this.supportSampleSizeConstraint()) {
            trackConstraints.sampleSize = { ideal: defaultSampleSize };
        }
        if (this.supportChannelCountConstraint()) {
            trackConstraints.channelCount = { ideal: defaultChannelCount };
        }
        const augmented = {
            echoCancellation: true,
            googEchoCancellation: true,
            googEchoCancellation2: true,
            googAutoGainControl: true,
            googAutoGainControl2: true,
            googNoiseSuppression: true,
            googNoiseSuppression2: true,
            googHighpassFilter: true,
            // We allow the provided constraints to override these sensible defaults.
            ...trackConstraints,
        };
        trackConstraints = augmented as MediaTrackConstraints;
        return { audio: trackConstraints };
    }

    private supportSampleRateConstraint(): boolean {
        return !!navigator.mediaDevices.getSupportedConstraints().sampleRate;
    }

    private supportSampleSizeConstraint(): boolean {
        return !!navigator.mediaDevices.getSupportedConstraints().sampleSize;
    }

    private supportChannelCountConstraint(): boolean {
        // @ts-ignore
        return !!navigator.mediaDevices.getSupportedConstraints().channelCount;
    }

    generateToneDevice = () => {
        const audioContext = DefaultDeviceController.getAudioContext();
        const dummyOutputNode = audioContext.createMediaStreamDestination();
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.3;
        gainNode.connect(dummyOutputNode);
        const oscillatorNode = audioContext.createOscillator();
        oscillatorNode.frequency.value = 440;
        oscillatorNode.connect(gainNode);
        oscillatorNode.start();
        return dummyOutputNode.stream;
    }
}

