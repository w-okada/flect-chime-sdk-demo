import { DeviceChangeObserver } from "amazon-chime-sdk-js";

export class DeviceChangeObserverImpl implements DeviceChangeObserver {
    audioInputsChanged(_freshAudioInputDeviceList: MediaDeviceInfo[]): void {
        console.log("[FlectChimeClient][DeviceChangeObserverImpl] audioInputsChanged", _freshAudioInputDeviceList);
        //this.populateAudioInputList();
    }
    audioOutputsChanged(_freshAudioOutputDeviceList: MediaDeviceInfo[]): void {
        console.log("[FlectChimeClient][DeviceChangeObserverImpl] audioOutputsChanged", _freshAudioOutputDeviceList);
        //this.populateAudioOutputList();
    }
    videoInputsChanged(_freshVideoInputDeviceList: MediaDeviceInfo[]): void {
        console.log("[FlectChimeClient][DeviceChangeObserverImpl] videoInputsChanged", _freshVideoInputDeviceList);
        //this.populateVideoInputList();
    }
}
