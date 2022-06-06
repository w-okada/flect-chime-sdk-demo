import { DefaultVideoTransformDevice, VoiceFocusTransformDevice } from "amazon-chime-sdk-js";
import { useEffect, useMemo, useRef, useState } from "react";
import { DeviceInfo, Devicemanager } from "../001_clients_and_managers/004_devices/001_DeviceManager";
import { AudioInputCustomDeviceList, AudioInputCustomDevices, NoiseSuppressionTypeList, NoiseSuppressionTypes } from "../001_clients_and_managers/004_devices/io/AudioInputDeviceSetting";
import { AudioOutputCustomDeviceList, AudioOutputCustomDevices } from "../001_clients_and_managers/004_devices/io/AudioOutputDeviceGenerator";
import { BlurStrength, VideoInputCustomDeviceList, VideoInputCustomDevices, VirtualBackgroundTypeList, VirtualBackgroundTypes } from "../001_clients_and_managers/004_devices/io/VideoInputDeviceGenerator";
import { useFileInput } from "./901_useFileInput";
export { NoiseSuppressionTypeList, VirtualBackgroundTypeList, NoiseSuppressionTypes, VirtualBackgroundTypes };
//////////////////////////////
// Types
//////////////////////////////
export type ChimeAudioInputDevice = string | MediaStream | VoiceFocusTransformDevice | null;
export type ChimeVoiceInputDevice = string | DefaultVideoTransformDevice | MediaStream | null;
export type ChimeAudioOutputDevice = string | null;
export type ChimeAudioOutputElement = HTMLAudioElement | null;

export type DeviceInfoState = {
    audioInputDevices: DeviceInfo[];
    videoInputDevices: DeviceInfo[];
    audioOutputDevices: DeviceInfo[];

    // auido input
    audioInput: string | AudioInputCustomDevices;
    noiseSuppretionType: NoiseSuppressionTypes;
    chimeAudioInputDevice: ChimeAudioInputDevice;
    // video input
    videoInput: string | VideoInputCustomDevices;
    virtualBackgroundType: VirtualBackgroundTypes;
    virtualBackgroundImageDataURL: string | null;
    videoDataURL: string | null;
    chimeVideoInputDevice: ChimeVoiceInputDevice;
    // audio output
    audioOutput: string | AudioOutputCustomDevices;
    chimeAudioOutputDevice: ChimeAudioOutputDevice;
    audioOutputElement: ChimeAudioOutputElement;
};

export type DeviceInfoStateAndMethods = DeviceInfoState & {
    reloadDevices: () => Promise<void>;
    setAudioInputDevice: (device: string) => void;
    // setVideoInputDevice: (device: string) => void
    setVideoInputDevice: (device: string) => Promise<void>;
    setAudioOutputDevice: (device: string) => void;
    setAudioOutputElement: (elem: HTMLAudioElement) => void;
    setNoiseSuppressionType: (val: NoiseSuppressionTypes) => void;
    setVirtualBackgroundType: (val: VirtualBackgroundTypes) => void;
};

//////////////////////////////
// Hook
//////////////////////////////
export const useDeviceState = (): DeviceInfoStateAndMethods => {
    const fileInputState = useFileInput();
    const videoElem = useMemo(() => {
        return document.createElement("video");
    }, []);
    // (1) State
    const stateRef = useRef<DeviceInfoState>({
        audioInputDevices: [],
        videoInputDevices: [],
        audioOutputDevices: [],

        // auido input
        audioInput: localStorage.audioInputDevice || AudioInputCustomDevices.none,
        noiseSuppretionType: localStorage.noiseSuppressionType || NoiseSuppressionTypes.auto,
        chimeAudioInputDevice: null,
        // video input
        videoInput: localStorage.videoInputDevice || VideoInputCustomDevices.none,
        virtualBackgroundType: localStorage.virtualBackgroundType || VirtualBackgroundTypes.none,
        virtualBackgroundImageDataURL: null,
        videoDataURL: null,
        chimeVideoInputDevice: null,

        // audio output
        audioOutput: localStorage.audioOutputDevice || AudioOutputCustomDevices.none,
        chimeAudioOutputDevice: null,
        audioOutputElement: null,
    });
    const [state, setState] = useState<DeviceInfoState>(stateRef.current);

    // (2) Device Manager
    const deviceManager = useMemo(() => {
        const m = new Devicemanager({
            customAudioInputDevices: AudioInputCustomDeviceList,
            customVideoInputDevices: VideoInputCustomDeviceList,
            customAudioOutputDevices: AudioOutputCustomDeviceList,
        });
        return m;
    }, []);

    // (3) Method
    //// (3-1) reload Devices
    const reloadDevices = async () => {
        await deviceManager.reloadDevices();
        const { audioInputDevices, videoInputDevices, audioOutputDevices } = deviceManager.getDeviceLists();
        stateRef.current = { ...stateRef.current, audioInputDevices, videoInputDevices, audioOutputDevices };
        setState(stateRef.current);
    };

    //// (3-2) set Devices
    const setAudioInputDevice = (device: string) => {
        localStorage.audioInputDevice = device;
        stateRef.current = { ...stateRef.current, audioInput: device };
        setState(stateRef.current);
    };
    const setVideoInputDevice = async (device: string) => {
        localStorage.videoInputDevice = device;
        if (device === VideoInputCustomDevices.file) {
            const url = await fileInputState.click("audio.*|video.*");
            stateRef.current = { ...stateRef.current, videoInput: device, videoDataURL: url };
            setState(stateRef.current);
        } else {
            stateRef.current = { ...stateRef.current, videoInput: device };
            setState(stateRef.current);
        }
    };
    const setAudioOutputDevice = (device: string) => {
        localStorage.audioOutputDevice = device;
        stateRef.current = { ...stateRef.current, audioOutput: device };
        setState(stateRef.current);
    };
    const setAudioOutputElement = (elem: HTMLAudioElement) => {
        stateRef.current = { ...stateRef.current, audioOutputElement: elem };
        setState(stateRef.current);
    };
    //// (3-3) set effects
    const setNoiseSuppressionType = (val: NoiseSuppressionTypes) => {
        localStorage.noiseSuppressionType = val;
        stateRef.current = { ...stateRef.current, noiseSuppretionType: val };
        setState(stateRef.current);
    };
    const setVirtualBackgroundType = (val: VirtualBackgroundTypes) => {
        localStorage.virtualBackgroundType = val;
        stateRef.current = { ...stateRef.current, virtualBackgroundType: val };
        setState(stateRef.current);
    };

    // (4) Internal Method for generate chime devices
    useEffect(() => {
        const generateDevice = async () => {
            let media;
            if (state.videoInput === "file") {
                console.log("URL", state.videoDataURL);
                const p = new Promise<MediaStream>((resolve, reject) => {
                    videoElem.src = "";
                    videoElem.onloadedmetadata = () => {
                        videoElem.height = videoElem.videoHeight;
                        videoElem.width = videoElem.videoWidth;
                        //@ts-ignore
                        const ms = videoElem.captureStream();
                        resolve(ms as MediaStream);
                    };
                    videoElem.src = state.videoDataURL!;
                    videoElem.autoplay = true;
                });
                media = await p;
            } else {
                media = state.videoInput;
            }

            const device = await deviceManager.generateVideoInputDeivce({
                device: media,
                virtualBackgroundType: state.virtualBackgroundType,
                blurStrength: BlurStrength.HIGH_BLUR,
                enableTracking: false,
                enableAvatar: false,
                imageURL: "",
            });
            stateRef.current = { ...stateRef.current, chimeVideoInputDevice: device };
            setState(stateRef.current);
        };

        generateDevice();
    }, [state.videoInput, state.videoDataURL, state.virtualBackgroundType]);

    useEffect(() => {
        const generateDevice = async () => {
            const device = await deviceManager.generateAudioInputDeivce({
                device: state.audioInput,
                noiseSuppressionType: state.noiseSuppretionType,
            });
            stateRef.current = { ...stateRef.current, chimeAudioInputDevice: device };
            setState(stateRef.current);
        };

        generateDevice();
    }, [state.audioInput, state.noiseSuppretionType]);

    useEffect(() => {
        stateRef.current = { ...stateRef.current, chimeAudioOutputDevice: state.audioOutput };
        setState(stateRef.current);
    }, [state.audioOutput]);
    const returnVal: DeviceInfoStateAndMethods = {
        ...state,
        reloadDevices,
        setAudioInputDevice,
        setVideoInputDevice,
        setAudioOutputDevice,
        setAudioOutputElement,
        setNoiseSuppressionType,
        setVirtualBackgroundType,
    };
    return returnVal;
};
