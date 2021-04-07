import { DeviceChangeObserver } from "amazon-chime-sdk-js"

export class DeviceChangeObserverImpl implements DeviceChangeObserver {


    audioInputsChanged(_freshAudioInputDeviceList: MediaDeviceInfo[]): void {
        console.log("audioInputsChanged", _freshAudioInputDeviceList)
        //this.populateAudioInputList();
    }
    audioOutputsChanged(_freshAudioOutputDeviceList: MediaDeviceInfo[]): void {
        console.log("audioOutputsChanged", _freshAudioOutputDeviceList)
        //this.populateAudioOutputList();
    }
    videoInputsChanged(_freshVideoInputDeviceList: MediaDeviceInfo[]): void {
        console.log("videoInputsChanged", _freshVideoInputDeviceList)
        //this.populateVideoInputList();
    }
}
