import { DefaultBrowserBehavior, DefaultDeviceController, MeetingSession, VoiceFocusDeviceTransformer, VoiceFocusSpec, VoiceFocusTransformDevice } from "amazon-chime-sdk-js";

export const NoiseSuppressionType = {
    None: "None",
    c100: "c100",
    c50: "c50",
    c20: "c20",
    c10: "c10",
    auto: "auto",
} as const;
export type NoiseSuppressionType = typeof NoiseSuppressionType[keyof typeof NoiseSuppressionType];

export class AudioInputDeviceSetting {
    private meetingSession: MeetingSession;
    private voiceFocusDeviceTransformer: VoiceFocusDeviceTransformer | null = null;
    private voiceFocusTransformDevice: VoiceFocusTransformDevice | null = null;
    private midNode: AudioNode | null = null;
    private mixNode: AudioNode | null = null;
    private mixSoundeVolume: number = 0.3;
    private mixGainNode: GainNode | null = null;
    private outputNode: MediaStreamAudioDestinationNode | null = null;
    private deviceMediaStream: MediaStream | null = null;

    audioInput: MediaStream | string | null = null;
    audioInputEnable: boolean = true;
    audioSuppressionEnable: boolean = true;
    voiceFocusSpec: VoiceFocusSpec = { variant: "c10" };

    audioInputForRecord: MediaStream | null = null;

    constructor(meetingSession: MeetingSession) {
        this.meetingSession = meetingSession;
    }

    ///////////////
    // AudioInput
    ///////////////
    private setAudioInputCommon = async (device: MediaStream | string | null, enable: boolean, suppression: boolean, suppressionSpec?: VoiceFocusSpec) => {
        if (this.deviceMediaStream) {
            this.deviceMediaStream.getAudioTracks().forEach((x) => {
                x.stop();
            });
        }
        this.deviceMediaStream = null;

        /// no use audio input
        if (device === null || enable === false) {
            console.log("[DeviceSetting] AudioInput is null or disabled.");
            this.audioInputForRecord = null; // this is for record. if not recorder doesn't work...
            if (this.outputNode) {
                this.midNode?.disconnect();
                // await this.meetingSession.audioVideo.chooseAudioInputDevice(this.outputNode.stream)  // not needed??
            }
            return;
        }

        let inputMediaStream;
        if (device instanceof MediaStream) {
            inputMediaStream = device;
        } else if (device === "dummy") {
            const audioContext = DefaultDeviceController.getAudioContext();
            const dummyOutputNode = audioContext.createMediaStreamDestination();
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0.0;
            gainNode.connect(dummyOutputNode);
            const oscillatorNode = audioContext.createOscillator();
            oscillatorNode.frequency.value = 440;
            oscillatorNode.connect(gainNode);
            oscillatorNode.start();
            inputMediaStream = dummyOutputNode.stream;
        } else {
            const proposedConstraints: MediaStreamConstraints | null = this.calculateAudioMediaStreamConstraints(device);
            console.log(proposedConstraints);
            inputMediaStream = await navigator.mediaDevices.getUserMedia(proposedConstraints!);
            this.deviceMediaStream = inputMediaStream;
            // inputMediaStream = await navigator.mediaDevices.getUserMedia({audio:{deviceId:device}});
        }

        if (suppression === true) {
            /// suppression enable
            let newTransformerCreated = false;
            if (this.voiceFocusDeviceTransformer === null || suppressionSpec) {
                /// create new transformer
                if (await VoiceFocusDeviceTransformer.isSupported()) {
                    this.voiceFocusDeviceTransformer = await VoiceFocusDeviceTransformer.create(suppressionSpec);
                    newTransformerCreated = true;
                    console.log("[DeviceSetting] Transformer for suppression is created.");
                    if (this.voiceFocusDeviceTransformer.isSupported() === false) {
                        console.log("[DeviceSetting] Transformer for suppression is created, but not supported.");
                        this.voiceFocusDeviceTransformer = null;
                    }
                }
            } else {
                /// reuse exsiting transformer
                console.log("[DeviceSetting] Existing transformer for suppression is used.");
            }

            /// createTransformDevice
            if (this.voiceFocusDeviceTransformer === null) {
                if (this.voiceFocusTransformDevice) {
                    this.voiceFocusTransformDevice.stop();
                }
                this.voiceFocusTransformDevice = null; /// equals to no-op
            } else if (newTransformerCreated === true || !this.voiceFocusTransformDevice) {
                console.log("[DeviceSetting] new TransformDevice Device.");
                this.voiceFocusTransformDevice = (await this.voiceFocusDeviceTransformer.createTransformDevice(inputMediaStream)) || null;
            } else {
                console.log("[DeviceSetting] reuse TransformDevice Device.");
                this.voiceFocusTransformDevice = await this.voiceFocusTransformDevice!.chooseNewInnerDevice(inputMediaStream);
            }
            console.log("[DeviceSetting]  ", this.voiceFocusTransformDevice);
        } else {
            /// suppression disable
            if (this.voiceFocusTransformDevice) {
                this.voiceFocusTransformDevice.stop();
            }
            this.voiceFocusTransformDevice = null;
        }

        const audioContext = DefaultDeviceController.getAudioContext();
        this.midNode?.disconnect();

        if (this.voiceFocusTransformDevice) {
            const nodeToVF = audioContext.createMediaStreamSource(inputMediaStream);
            const nodeOfVF = await this.voiceFocusTransformDevice.createAudioNode(audioContext);
            nodeToVF.connect(nodeOfVF.start);
            this.midNode = nodeOfVF.end;
        } else {
            this.midNode = audioContext.createMediaStreamSource(inputMediaStream);
        }

        // this.outputNode?.disconnect()
        if (!this.outputNode) {
            this.outputNode = audioContext.createMediaStreamDestination();
        }

        this.midNode.connect(this.outputNode);
        await this.meetingSession.audioVideo.chooseAudioInputDevice(this.outputNode.stream);
        this.audioInputForRecord = this.outputNode.stream;
    };

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
            // googEchoCancellation: true,
            // googEchoCancellation2: true,
            // googAutoGainControl: true,
            // googAutoGainControl2: true,
            // googNoiseSuppression: true,
            // googNoiseSuppression2: true,
            // googHighpassFilter: true,

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

    setAudioInput = async (val: MediaStream | string | null) => {
        this.audioInput = val;
        await this.setAudioInputCommon(this.audioInput, this.audioInputEnable, this.audioSuppressionEnable);
    };
    setAudioInputEnable = async (val: boolean) => {
        this.audioInputEnable = val;
        await this.setAudioInputCommon(this.audioInput, this.audioInputEnable, this.audioSuppressionEnable);
    };
    setNoiseSuppressionEnable = async (val: boolean) => {
        this.audioSuppressionEnable = val;
        await this.setAudioInputCommon(this.audioInput, this.audioInputEnable, this.audioSuppressionEnable);
    };
    setNoiseSuppressionType = async (val: NoiseSuppressionType) => {
        //@ts-ignore
        this.voiceFocusSpec = { variant: val };
        await this.setAudioInputCommon(this.audioInput, this.audioInputEnable, this.audioSuppressionEnable, this.voiceFocusSpec);
    };

    setBackgroundMusic = async (stream: MediaStream) => {
        this.mixNode?.disconnect();

        const audioContext = DefaultDeviceController.getAudioContext();
        this.mixNode = audioContext.createMediaStreamSource(stream);
        if (!this.outputNode) {
            this.outputNode = audioContext.createMediaStreamDestination();
        }
        if (!this.mixGainNode) {
            this.mixGainNode = audioContext.createGain();
        }

        this.mixGainNode.gain.value = this.mixSoundeVolume;
        this.mixGainNode.connect(this.outputNode);

        this.mixNode.connect(this.mixGainNode);
    };
    setBackgroundMusicVolume = async (volume: number) => {
        if (this.mixGainNode) {
            this.mixGainNode.gain.value = volume;
        }
        this.mixSoundeVolume = volume;
    };
    getBackgroundMusicVolume = () => {
        return this.mixSoundeVolume;
    };

    mute = () => {
        this.meetingSession.audioVideo.realtimeMuteLocalAudio();
    };
    unmute = () => {
        this.meetingSession.audioVideo.realtimeUnmuteLocalAudio();
    };
}
