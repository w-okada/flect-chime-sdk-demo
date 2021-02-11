import { DefaultDeviceController, MeetingSession, VoiceFocusDeviceTransformer, VoiceFocusSpec, VoiceFocusTransformDevice } from "amazon-chime-sdk-js"



export class AudioInputDeviceSetting {
    private meetingSession: MeetingSession
    private voiceFocusDeviceTransformer: VoiceFocusDeviceTransformer | null = null
    private voiceFocusTransformDevice: VoiceFocusTransformDevice | null = null

    audioInput: MediaStream | string | null = null
    audioInputEnable: boolean = true
    audioSuppressionEnable: boolean = true
    voiceFocusSpec: VoiceFocusSpec | null = { variant: "auto" }

    audioInputForRecord: MediaStream | string | null = null


    constructor(meetingSession: MeetingSession) {
        this.meetingSession = meetingSession
    }
    ///////////////
    // AudioInput
    ///////////////
    private setAudioInputCommon = async (device: MediaStream | string | null, enable: boolean, suppression: boolean, suppressionSpec?: VoiceFocusSpec) => {
        /// no use audio input
        if (device === null || enable === false) {
            console.log("[DeviceSetting] AudioInput is null or disabled.")
            await this.meetingSession.audioVideo.chooseAudioInputDevice(null)
            this.audioInputForRecord = null
            return
        }

        /// for standard audio input
        if (suppression === false) {
            console.log("[DeviceSetting] AudioInput doesn't use suppression.")
            //// Background music mixin!!! 
            // if(typeof (device) == "string"){
            //     const stream = await navigator.mediaDevices.getUserMedia({audio:{deviceId:device}});

            // const audioContext = DefaultDeviceController.getAudioContext();
            // var sourceNode = audioContext.createMediaStreamSource(stream); 
            // const outputNode = audioContext.createMediaStreamDestination();
            // sourceNode.connect(outputNode)
            // const gainNode = audioContext.createGain();
            // gainNode.gain.value = 0.1;
            // gainNode.connect(outputNode);
            // const oscillatorNode = audioContext.createOscillator();
            // oscillatorNode.frequency.value = 440;
            // oscillatorNode.connect(gainNode);
            // oscillatorNode.start();
            // console.log("[DeviceSetting] AudioInput doesn't use suppression2.")
            // await this.meetingSession.audioVideo.chooseAudioInputDevice(outputNode.stream)


            // }else{
            //     console.log("[DeviceSetting] AudioInput doesn't use suppression3.")
            // }
            this.audioInputForRecord = device
            await this.meetingSession.audioVideo.chooseAudioInputDevice(device)
            return
        }

        /// suppression enable
        let newTransformerCreated = false
        if (this.voiceFocusDeviceTransformer === null || suppressionSpec) {
            /// create new transformer
            if (await VoiceFocusDeviceTransformer.isSupported(suppressionSpec)) {
                this.voiceFocusDeviceTransformer = await VoiceFocusDeviceTransformer.create(suppressionSpec)
                newTransformerCreated = true
                console.log("[DeviceSetting] Transformer for suppression is created.")
                if (this.voiceFocusDeviceTransformer.isSupported() === false) {
                    console.log("[DeviceSetting] Transformer for suppression is created, but not supported.")
                    this.voiceFocusDeviceTransformer = null
                }
            }
        } else {
            /// reuse exsiting transformer
            console.log("[DeviceSetting] Existing transformer for suppression is used.")
        }

        /// createTransformDevice
        if (this.voiceFocusDeviceTransformer === null) {
            this.voiceFocusTransformDevice = null /// equals to no-op
        } else if (this.voiceFocusDeviceTransformer && newTransformerCreated === true) {
            /// transformer is created or exsiting 
            this.voiceFocusTransformDevice = await this.voiceFocusDeviceTransformer.createTransformDevice(device) || null
        } else if (this.voiceFocusDeviceTransformer && newTransformerCreated === false) {
            this.voiceFocusTransformDevice = await this.voiceFocusTransformDevice!.chooseNewInnerDevice(device)
        }

        /// set transformDevice
        if (this.voiceFocusTransformDevice) {
            console.log("[DeviceSetting] AudioInput use suppression.")
            await this.meetingSession.audioVideo.chooseAudioInputDevice(this.voiceFocusTransformDevice)

            const audioContext = DefaultDeviceController.getAudioContext();
            const outputNode = audioContext.createMediaStreamDestination();
            let nodes;
            try {
                //////
                // TBD: Suppression for record is not supported. following sentence doesn't work...
                //////
                //   nodes = await this.voiceFocusTransformDevice.createAudioNode(audioContext) 
                //   nodes.end.connect(outputNode)
                //   this.audioInputForRecord = outputNode.stream
                ///// instedof suppression audio, we use original input...
                this.audioInputForRecord = device
                console.log("[DeviceSetting] [Debug] ", nodes, this.audioInputForRecord)
            } catch (e) {
                console.log("[DeviceSetting] Generate audioInputForRecord failed. ", e)
                this.audioInputForRecord = device
            }
        } else {
            console.log("[DeviceSetting] Transformer can not create transfomrm device.")
            await this.meetingSession.audioVideo.chooseAudioInputDevice(device)
            this.audioInputForRecord = device
        }
    }


    setAudioInput = async (val: MediaStream | string | null) => {
        this.audioInput = val
        await this.setAudioInputCommon(this.audioInput, this.audioInputEnable, this.audioSuppressionEnable)
    }
    setAudioInputEnable = async (val: boolean) => {
        this.audioInputEnable = val
        await this.setAudioInputCommon(this.audioInput, this.audioInputEnable, this.audioSuppressionEnable)
    }
    setAudioSuppressionEnable = async (val: boolean) => {
        this.audioSuppressionEnable = val
        await this.setAudioInputCommon(this.audioInput, this.audioInputEnable, this.audioSuppressionEnable)
    }
    setVoiceFocusSpec = async (val: VoiceFocusSpec) => {
        this.voiceFocusSpec = val
        await this.setAudioInputCommon(this.audioInput, this.audioInputEnable, this.audioSuppressionEnable, this.voiceFocusSpec)
    }
}
