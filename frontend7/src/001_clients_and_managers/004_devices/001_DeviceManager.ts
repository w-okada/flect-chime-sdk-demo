
//////////////////////////////
// Types

import { AudioInputDeviceGenerator, NoiseSuppressionTypes } from "./io/AudioInputDeviceSetting"
import { BlurStrength, VideoInputDeviceGenerator, VirtualBackgroundTypes } from "./io/VideoInputDeviceGenerator"

//////////////////////////////
export type DeviceInfo = {
    label: string,
    deviceId: string,
}

export type DevicemanagerInitialParams = {
    customAudioInputDevices?: DeviceInfo[],
    customVideoInputDevices?: DeviceInfo[],
    customAudioOutputDevices?: DeviceInfo[],
}
export type DeviceLists = {
    audioInputDevices: DeviceInfo[],
    videoInputDevices: DeviceInfo[],
    audioOutputDevices: DeviceInfo[],
}


// (4) Params

export type GenerateAudioInputDeivceParams = {
    device: string,
    noiseSuppressionType: NoiseSuppressionTypes,
}


export type GenerateVideoInputDeivceParams = {
    device: string | MediaStream,
    virtualBackgroundType: VirtualBackgroundTypes,
    blurStrength?: BlurStrength,
    enableTracking: boolean,
    enableAvatar: boolean,
    // imageBlob?: Blob,
    imageURL: string
}


export type GenerateAudioOutputDeivceParams = {
    device: string,
}
//////////////////////////////
// Class
//////////////////////////////
export class Devicemanager {
    realAudioInputDevices: DeviceInfo[] = []
    realVideoInputDevices: DeviceInfo[] = []
    realAudioOutputDevices: DeviceInfo[] = []

    customAudioInputDevices: DeviceInfo[] = []
    customVideoInputDevices: DeviceInfo[] = []
    customAudioOutputDevices: DeviceInfo[] = []

    audioInputDeviceGenerator = new AudioInputDeviceGenerator()
    videoInputDeviceGenerator = new VideoInputDeviceGenerator()

    constructor(props: DevicemanagerInitialParams) {
        if (props.customAudioInputDevices) {
            this.customAudioInputDevices = [...props.customAudioInputDevices]
        }
        if (props.customVideoInputDevices) {
            this.customVideoInputDevices = [...props.customVideoInputDevices]
        }
        if (props.customAudioOutputDevices) {
            this.customAudioOutputDevices = [...props.customAudioOutputDevices]
        }
    }

    // (A) Device List生成
    reloadDevices = async () => {
        console.log("reload device2.1")
        await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        console.log("reload device2.2")
        const mediaDeviceInfos = await navigator.mediaDevices.enumerateDevices();
        console.log("reload device2.3", mediaDeviceInfos)

        this.realAudioInputDevices = mediaDeviceInfos.filter(x => { return x.kind === "audioinput" }).map(x => { return { label: x.label, deviceId: x.deviceId } })
        this.realVideoInputDevices = mediaDeviceInfos.filter(x => { return x.kind === "videoinput" }).map(x => { return { label: x.label, deviceId: x.deviceId } })
        this.realAudioOutputDevices = mediaDeviceInfos.filter(x => { return x.kind === "audiooutput" }).map(x => { return { label: x.label, deviceId: x.deviceId } })
    }
    addCustomAudioInputDevice = (label: string, deviceId: string) => {
        this.customAudioInputDevices.push({ label, deviceId })
    }
    addCustomVideoInputDevice = (label: string, deviceId: string) => {
        this.customVideoInputDevices.push({ label, deviceId })
    }
    addCustomAudioOutputDevice = (label: string, deviceId: string) => {
        this.customAudioOutputDevices.push({ label, deviceId })
    }

    removeCustomAudioInputDevice = (deviceId: string) => {
        this.customAudioInputDevices = this.customAudioInputDevices.filter(x => { return x.deviceId !== deviceId })
    }
    removeCustomVideoInputDevice = (deviceId: string) => {
        this.customVideoInputDevices = this.customVideoInputDevices.filter(x => { return x.deviceId !== deviceId })
    }
    removeCustomAudioOutputDevice = (deviceId: string) => {
        this.customAudioOutputDevices = this.customAudioOutputDevices.filter(x => { return x.deviceId !== deviceId })
    }
    getDeviceLists = (): DeviceLists => {
        return {
            audioInputDevices: [...this.realAudioInputDevices, ...this.customAudioInputDevices],
            videoInputDevices: [...this.realVideoInputDevices, ...this.customVideoInputDevices],
            audioOutputDevices: [...this.realAudioOutputDevices, ...this.customAudioOutputDevices],
        }
    }
    // (B) Chime Device生成
    generateAudioInputDeivce = async (params: GenerateAudioInputDeivceParams) => {
        return await this.audioInputDeviceGenerator.generateAudioInputDeivce(params)
    }
    generateVideoInputDeivce = async (params: GenerateVideoInputDeivceParams) => {
        return await this.videoInputDeviceGenerator.generateVideoInputDeivce(params)
    }
    generateAudioOutputDeivce = async (params: GenerateAudioOutputDeivceParams) => {
        return params.device
    }

}