import { useEffect, useState } from "react";

export type DeviceInfo = {
    label: string,
    deviceId: string,
}
export type DeviceInfoState = {
    realAudioInputDevices: DeviceInfo[]
    realVideoInputDevices: DeviceInfo[]
    realAudioOutputDevices: DeviceInfo[]

    customAudioInputDevices: DeviceInfo[]
    customVideoInputDevices: DeviceInfo[]
    customAudioOutputDevices: DeviceInfo[]

    audioInputDevices: DeviceInfo[]
    videoInputDevices: DeviceInfo[]
    audioOutputDevices: DeviceInfo[]

}
const initialState: DeviceInfoState = {
    realAudioInputDevices: [],
    realVideoInputDevices: [],
    realAudioOutputDevices: [],

    customAudioInputDevices: [],
    customVideoInputDevices: [],
    customAudioOutputDevices: [],

    audioInputDevices: [],
    videoInputDevices: [],
    audioOutputDevices: [],
}

export type DeviceInfoStateAndMethods = DeviceInfoState & {
    reloadRealDevices: () => Promise<void>

    addCustomAudioInputDevice: (label: string, deviceId: string) => void,
    addCustomVideoInputDevice: (label: string, deviceId: string) => void,
    addCustomAudioOutputDevice: (label: string, deviceId: string) => void

    removeCustomAudioInputDevice: (deviceId: string) => void,
    removeCustomVideoInputDevice: (deviceId: string) => void,
    removeCustomAudioOutputDevice: (deviceId: string) => void

}

export const useDeviceState = (): DeviceInfoStateAndMethods => {
    const [state, setState] = useState<DeviceInfoState>(initialState)

    const reloadRealDevices = async () => {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const mediaDeviceInfos = await navigator.mediaDevices.enumerateDevices();
        const audioInputDevices: DeviceInfo[] = mediaDeviceInfos.filter(x => { return x.kind === "audioinput" }).map(x => { return { label: x.label, deviceId: x.deviceId } })
        const videoInputDevices: DeviceInfo[] = mediaDeviceInfos.filter(x => { return x.kind === "videoinput" }).map(x => { return { label: x.label, deviceId: x.deviceId } })
        const audioOutputDevices: DeviceInfo[] = mediaDeviceInfos.filter(x => { return x.kind === "audiooutput" }).map(x => { return { label: x.label, deviceId: x.deviceId } })
        setState({
            ...state,
            realAudioInputDevices: audioInputDevices,
            realVideoInputDevices: videoInputDevices,
            realAudioOutputDevices: audioOutputDevices,
            audioInputDevices: [...audioInputDevices, ...state.customAudioInputDevices],
            videoInputDevices: [...videoInputDevices, ...state.customVideoInputDevices],
            audioOutputDevices: [...audioOutputDevices, ...state.customAudioOutputDevices],
        })
    }

    const addCustomAudioInputDevice = (label: string, deviceId: string) => {
        state.customAudioInputDevices.push({ label, deviceId })
        setState({
            ...state,
            customAudioInputDevices: [...state.customAudioInputDevices],
            audioInputDevices: [...state.realAudioInputDevices, ...state.customAudioInputDevices],
        })
    }
    const addCustomVideoInputDevice = (label: string, deviceId: string) => {
        state.customVideoInputDevices.push({ label, deviceId })
        setState({
            ...state,
            customVideoInputDevices: [...state.customVideoInputDevices],
            videoInputDevices: [...state.realVideoInputDevices, ...state.customVideoInputDevices],
        })
    }
    const addCustomAudioOutputDevice = (label: string, deviceId: string) => {
        state.customAudioOutputDevices.push({ label, deviceId })
        setState({
            ...state,
            customAudioOutputDevices: [...state.customAudioOutputDevices],
            audioOutputDevices: [...state.realAudioOutputDevices, ...state.customAudioOutputDevices],
        })
    }

    const removeCustomAudioInputDevice = (deviceId: string) => {
        state.customAudioInputDevices = state.customAudioInputDevices.filter(x => { return x.deviceId !== deviceId })
        setState({
            ...state,
            customAudioInputDevices: [...state.customAudioInputDevices],
            audioInputDevices: [...state.realAudioInputDevices, ...state.customAudioInputDevices],
        })
    }
    const removeCustomVideoInputDevice = (deviceId: string) => {
        state.customVideoInputDevices = state.customVideoInputDevices.filter(x => { return x.deviceId !== deviceId })
        setState({
            ...state,
            customVideoInputDevices: [...state.customVideoInputDevices],
            videoInputDevices: [...state.realVideoInputDevices, ...state.customVideoInputDevices],
        })
    }

    const removeCustomAudioOutputDevice = (deviceId: string) => {
        state.customAudioOutputDevices = state.customAudioOutputDevices.filter(x => { return x.deviceId !== deviceId })
        setState({
            ...state,
            customAudioOutputDevices: [...state.customAudioOutputDevices],
            audioOutputDevices: [...state.realAudioOutputDevices, ...state.customAudioOutputDevices],
        })
    }
    return {
        ...state,
        reloadRealDevices,
        addCustomAudioInputDevice,
        addCustomVideoInputDevice,
        addCustomAudioOutputDevice,
        removeCustomAudioInputDevice,
        removeCustomVideoInputDevice,
        removeCustomAudioOutputDevice,
    }
}
