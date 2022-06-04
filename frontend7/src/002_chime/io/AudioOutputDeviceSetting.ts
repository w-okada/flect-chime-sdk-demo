import { MeetingSession } from "amazon-chime-sdk-js";

export class AudioOutputDeviceSetting {
    private meetingSession: MeetingSession;

    audioOutput: string | null = null;
    audioOutputEnable: boolean = true;

    outputAudioElement: HTMLAudioElement | null = null;

    constructor(meetingSession: MeetingSession) {
        this.meetingSession = meetingSession;
    }
    ///////////////
    // AudioOutput
    ///////////////
    private setAudioOutputCommon = async (device: string | null, enable: boolean) => {
        /// no use audio output
        if (device === null) {
            console.log("[DeviceSetting] AudioOutput is null.");
            await this.meetingSession.audioVideo.chooseAudioOutput(null);
            return;
        }

        if (enable === false) {
            console.log("[DeviceSetting] AudioOutput disable -> volume 0. (not null device)");
            if (this.outputAudioElement) {
                this.outputAudioElement.volume = 0;
            }
            return;
        } else {
            console.log("[DeviceSetting] AudioOutput enable -> volume 1.");
            if (this.outputAudioElement) {
                this.outputAudioElement.volume = 1;
            }
        }

        /// for standard audio output
        console.log("[DeviceSetting] Change AudioOutput.");
        try {
            await this.meetingSession.audioVideo.chooseAudioOutput(device);
        } catch (excpetion) {
            console.log(`[DeviceSetting] Change AudioOutput is failed:${excpetion}`);
        }
    };

    setAudioOutput = async (val: string | null) => {
        this.audioOutput = val;
        await this.setAudioOutputCommon(this.audioOutput, this.audioOutputEnable);
        await this.setRelationToAudioElement();
    };
    setAudioOutputEnable = async (val: boolean) => {
        this.audioOutputEnable = val;
        await this.setAudioOutputCommon(this.audioOutput, this.audioOutputEnable);
        await this.setRelationToAudioElement();
    };

    setOutputAudioElement = async (val: HTMLAudioElement) => {
        this.outputAudioElement = val;
        await this.setRelationToAudioElement();
    };

    private setRelationToAudioElement = async () => {
        if (this.audioOutput) {
            await this.bindOutputAudioElement();
        } else {
            await this.unbindOutputAudioElement();
        }
    };

    private bindOutputAudioElement = async () => {
        if (this.outputAudioElement) {
            await this.meetingSession.audioVideo.bindAudioElement(this.outputAudioElement);
        } else {
            console.log("[DeviceSetting] OutputAudioElement is not set for bind.");
        }
    };

    private unbindOutputAudioElement = () => {
        this.meetingSession.audioVideo.unbindAudioElement();
    };
}
