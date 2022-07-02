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
    generatedDvice: string | MediaStream | VoiceFocusTransformDevice | null = null
    generateAudioInputDeivce = async (params: GenerateAudioInputDeivceParams) => {
        console.log("generate tone device1")
        //// (a) no device selected 
        if (params.device === AudioInputCustomDevices.none) {
            return null
        }

        //// (b) tone device selected 
        if (params.device === AudioInputCustomDevices.tone) {
            console.log("generate tone device2")
            return this.generateToneDevice();
        }

        //// (c) no voice focus
        if (params.noiseSuppressionType === NoiseSuppressionTypes.none) {
            return params.device
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
            const d = await this.voiceFocusDeviceTransformer.createTransformDevice(params.device)
            this.generatedDvice = d || params.device
        } else {
            this.generatedDvice = params.device
        }

        return this.generatedDvice
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

