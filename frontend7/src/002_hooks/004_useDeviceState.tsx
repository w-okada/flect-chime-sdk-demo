import { faL } from "@fortawesome/free-solid-svg-icons";
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
export type ChimeVideoInputDevice = string | DefaultVideoTransformDevice | MediaStream | null;
export type ChimeAudioOutputDevice = string | null;
export type ChimeAudioOutputElement = HTMLAudioElement | null;

export const MAX_VIRTUAL_BACKGROUND_IMAGE_NUM = 3;

export type DeviceInfoState = {
    audioInputDevices: DeviceInfo[];
    videoInputDevices: DeviceInfo[];
    audioOutputDevices: DeviceInfo[];

    // auido input
    audioInput: string | AudioInputCustomDevices;
    audioInputEnable: boolean;
    noiseSuppretionType: NoiseSuppressionTypes;
    chimeAudioInputDevice: ChimeAudioInputDevice;
    // video input
    videoInput: string | VideoInputCustomDevices;
    videoInputEnable: boolean;
    virtualBackgroundType: VirtualBackgroundTypes;
    videoDataURL: string | null;
    virtualBackgroundImageCurrentIndex: number;
    virtualBackgroundImageDataURLs: string[];
    chimeVideoInputDevice: ChimeVideoInputDevice;
    videoEnableCenterStage: boolean;
    videoEnableAvatar: boolean;

    // audio output
    audioOutput: string | AudioOutputCustomDevices;
    audioOutputEnable: boolean;
    chimeAudioOutputDevice: ChimeAudioOutputDevice;
    audioOutputElement: ChimeAudioOutputElement;

    // for Recorder
    audioInputMediaStreamForRecorder: MediaStream | null;
};

export type DeviceInfoStateAndMethods = DeviceInfoState & {
    reloadDevices: (useFirstDevice?: boolean) => Promise<void>;
    setAudioInputDevice: (device: string) => void;
    setAudioInputEnable: (val: boolean) => void;
    setVideoInputDevice: (device: string) => Promise<void>;
    setVideoInputEnable: (val: boolean) => void;
    setAudioOutputDevice: (device: string) => void;
    setAudioOutputEnable: (val: boolean) => void;
    setAudioOutputElement: (elem: HTMLAudioElement) => void;
    setNoiseSuppressionType: (val: NoiseSuppressionTypes) => void;
    setVirtualBackgroundType: (val: VirtualBackgroundTypes, imageIndex?: number) => void;
    setVirtualBackgroundImage: (index: number) => Promise<void>;
    removeVirtualBackgroundImage: (index: number) => Promise<void>;
    enableCenterStage: (val: boolean) => void;
    enableAvatar: (val: boolean) => void;
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
        audioInput: localStorage.audioInputDevice || AudioInputCustomDevices.null,
        audioInputEnable: true,
        noiseSuppretionType: localStorage.noiseSuppressionType || NoiseSuppressionTypes.auto,
        chimeAudioInputDevice: null,
        // video input
        videoInput: localStorage.videoInputDevice || VideoInputCustomDevices.null,
        videoInputEnable: true,
        virtualBackgroundType: localStorage.virtualBackgroundType || VirtualBackgroundTypes.none,
        videoDataURL: null,
        virtualBackgroundImageCurrentIndex: localStorage.virtualBackgroundImageCurrentIndex || 0,
        virtualBackgroundImageDataURLs: [],
        chimeVideoInputDevice: null,
        videoEnableCenterStage: false,
        videoEnableAvatar: false,

        // audio output
        audioOutput: localStorage.audioOutputDevice || AudioOutputCustomDevices.null,
        audioOutputEnable: true,
        chimeAudioOutputDevice: null,
        audioOutputElement: null,

        // for Recorder
        audioInputMediaStreamForRecorder: null,
    });
    const [state, setState] = useState<DeviceInfoState>(stateRef.current);
    // state initializ for background image
    useEffect(() => {
        stateRef.current.virtualBackgroundImageDataURLs = [];
        for (let i = 0; i < MAX_VIRTUAL_BACKGROUND_IMAGE_NUM; i++) {
            stateRef.current.virtualBackgroundImageDataURLs.push(localStorage[`virtualBackgroundImage_${i}`] || "");
        }
        setState(stateRef.current);
    }, []);

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
    const reloadDevices = async (useFirstDevice?: boolean) => {
        await deviceManager.reloadDevices();
        const { audioInputDevices, videoInputDevices, audioOutputDevices } = deviceManager.getDeviceLists();
        if (useFirstDevice) {
            let audioInput;
            if (stateRef.current.audioInput == AudioInputCustomDevices.null && audioInputDevices.length > 0) {
                audioInput = audioInputDevices[0].deviceId;
            } else {
                audioInput = stateRef.current.audioInput;
            }
            let videoInput;
            if (stateRef.current.videoInput == VideoInputCustomDevices.null && videoInputDevices.length > 0) {
                videoInput = videoInputDevices[0].deviceId;
            } else {
                videoInput = stateRef.current.videoInput;
            }

            let audioOutput;
            if (stateRef.current.audioOutput == AudioOutputCustomDevices.null && audioOutputDevices.length > 0) {
                audioOutput = audioOutputDevices[0].deviceId;
            } else {
                audioOutput = stateRef.current.audioOutput;
            }
            stateRef.current = { ...stateRef.current, audioInputDevices, videoInputDevices, audioOutputDevices, audioInput, videoInput, audioOutput };
        } else {
            stateRef.current = { ...stateRef.current, audioInputDevices, videoInputDevices, audioOutputDevices };
        }

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

    //// (3-x) set device enable
    const setAudioInputEnable = (val: boolean) => {
        stateRef.current = { ...stateRef.current, audioInputEnable: val };
        setState(stateRef.current);
    };
    const setVideoInputEnable = (val: boolean) => {
        stateRef.current = { ...stateRef.current, videoInputEnable: val };
        setState(stateRef.current);
    };
    const setAudioOutputEnable = (val: boolean) => {
        stateRef.current = { ...stateRef.current, audioOutputEnable: val };
        if (stateRef.current.audioOutputElement) {
            if (val) {
                stateRef.current.audioOutputElement.volume = 1;
            } else {
                stateRef.current.audioOutputElement.volume = 0;
            }
        }
        setState(stateRef.current);
    };

    //// (3-3) set effects
    const setNoiseSuppressionType = (val: NoiseSuppressionTypes) => {
        localStorage.noiseSuppressionType = val;
        stateRef.current = { ...stateRef.current, noiseSuppretionType: val };
        setState(stateRef.current);
    };
    const setVirtualBackgroundType = (val: VirtualBackgroundTypes, imageIndex?: number) => {
        localStorage.virtualBackgroundType = val;
        stateRef.current = { ...stateRef.current, virtualBackgroundType: val, virtualBackgroundImageCurrentIndex: imageIndex || 0 };
        localStorage.virtualBackgroundImageIndex = imageIndex;
        setState(stateRef.current);
    };
    const setVirtualBackgroundImage = async (index: number) => {
        if (index < 0 || index >= MAX_VIRTUAL_BACKGROUND_IMAGE_NUM) {
            return;
        }
        const url = await fileInputState.click("image.*");

        stateRef.current.virtualBackgroundImageDataURLs[index] = url;
        stateRef.current.virtualBackgroundImageDataURLs = [...stateRef.current.virtualBackgroundImageDataURLs];
        stateRef.current = { ...stateRef.current };
        localStorage[`virtualBackgroundImage_${index}`] = url;

        setState(stateRef.current);
    };
    const removeVirtualBackgroundImage = async (index: number) => {
        stateRef.current.virtualBackgroundImageDataURLs[index] = "";
        stateRef.current.virtualBackgroundImageDataURLs = [...stateRef.current.virtualBackgroundImageDataURLs];
        stateRef.current = { ...stateRef.current };
        localStorage[`virtualBackgroundImage_${index}`] = "";
        setState(stateRef.current);
    };

    const enableCenterStage = (val: boolean) => {
        localStorage.videoEnableCenterStage = val;
        stateRef.current = { ...stateRef.current, videoEnableCenterStage: val };
        setState(stateRef.current);
    };

    const enableAvatar = (val: boolean) => {
        localStorage.videoEnableAvatar = val;
        stateRef.current = { ...stateRef.current, videoEnableAvatar: val };
        setState(stateRef.current);
    };
    // (4) Internal Method for generate chime devices
    useEffect(() => {
        const generateDevice = async () => {
            let media;
            if (state.videoInputEnable === false) {
                stateRef.current = { ...stateRef.current, chimeVideoInputDevice: null };
                setState(stateRef.current);
                return;
            }

            if (state.videoInput === "file") {
                console.log("URL", state.videoDataURL);
                const p = new Promise<MediaStream>((resolve, reject) => {
                    videoElem.src = "";
                    videoElem.onloadedmetadata = () => {
                        videoElem.height = videoElem.videoHeight;
                        videoElem.width = videoElem.videoWidth;
                        videoElem.play();
                        videoElem.loop = true;
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
                enableCenterStage: state.videoEnableCenterStage,
                enableAvatar: state.videoEnableAvatar,
                imageURL: state.virtualBackgroundImageDataURLs[state.virtualBackgroundImageCurrentIndex],
            });
            stateRef.current = { ...stateRef.current, chimeVideoInputDevice: device };
            setState(stateRef.current);
        };

        generateDevice();
    }, [state.videoInput, state.videoInputEnable, state.videoDataURL, state.virtualBackgroundType, state.virtualBackgroundImageDataURLs, state.virtualBackgroundImageCurrentIndex, state.videoEnableCenterStage, state.videoEnableAvatar]);

    useEffect(() => {
        const generateDevice = async () => {
            if (state.audioInputEnable === false) {
                stateRef.current = { ...stateRef.current, chimeAudioInputDevice: null, audioInputMediaStreamForRecorder: null };
                setState(stateRef.current);
                return;
            }

            const device = await deviceManager.generateAudioInputDeivce({
                device: state.audioInput,
                noiseSuppressionType: state.noiseSuppretionType,
            });
            if (!device) {
                // nullの場合
                stateRef.current = { ...stateRef.current, chimeAudioInputDevice: null, audioInputMediaStreamForRecorder: null };
            } else {
                // Media Stream の場合(Voice Focusも内部的にMediaStreamを作成する)
                stateRef.current = { ...stateRef.current, chimeAudioInputDevice: device, audioInputMediaStreamForRecorder: device };
            }
            setState(stateRef.current);
        };

        generateDevice();
    }, [state.audioInput, state.audioInputEnable, state.noiseSuppretionType]);

    useEffect(() => {
        if (state.audioOutputEnable === false) {
            stateRef.current = { ...stateRef.current, chimeAudioOutputDevice: null };
            setState(stateRef.current);
            return;
        }

        stateRef.current = { ...stateRef.current, chimeAudioOutputDevice: state.audioOutput };
        setState(stateRef.current);
    }, [state.audioOutput, state.audioOutputEnable]);
    const returnVal: DeviceInfoStateAndMethods = {
        ...state,
        reloadDevices,
        setAudioInputDevice,
        setAudioInputEnable,
        setVideoInputDevice,
        setVideoInputEnable,
        setAudioOutputDevice,
        setAudioOutputEnable,
        setAudioOutputElement,
        setNoiseSuppressionType,
        setVirtualBackgroundType,
        setVirtualBackgroundImage,
        removeVirtualBackgroundImage,
        enableCenterStage,
        enableAvatar,
    };
    return returnVal;
};
