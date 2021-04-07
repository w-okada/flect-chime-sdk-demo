import { useState} from 'react';
import { DeviceInfoList, getDeviceLists } from '../../utils';


export const useDeviceState = () =>{
    const [deviceList, setDeviceList] = useState<DeviceInfoList|null>(null)
    if (!deviceList) {
        getDeviceLists().then(res => {
            addtionalDevice(res)
            setDeviceList(res)
        })
    }

    const reloadDevices = () =>{
        getDeviceLists().then(res => {
            addtionalDevice(res)
            setDeviceList(res)
        })
    }

    const addtionalDevice = (l:DeviceInfoList) =>{
        if(l){
            l.audioinput?.push({
                deviceId:"None",
                groupId:"None",
                kind:"audioinput",
                label:"None"
            })
            l.videoinput?.push({
                deviceId:"None",
                groupId:"None",
                kind:"videoinput",
                label:"None"
            })
            l.audiooutput?.push({
                deviceId:"None",
                groupId:"None",
                kind:"audiooutput",
                label:"None"
            })

        }
    }

    return {
        audioInputList: deviceList ? deviceList['audioinput'] : null,
        videoInputList: deviceList ? deviceList['videoinput'] : null,
        audioOutputList: deviceList ? deviceList['audiooutput'] : null,
        reloadDevices
    }
}

