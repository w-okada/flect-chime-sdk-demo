import { useState } from 'react';

export type DeviceInfo={
    deviceId:string,
    groupId:string,
    kind:string,
    label:string,
}
export type DeviceInfoList = {
    audioinput: DeviceInfo[] | null,
    videoinput: DeviceInfo[] | null,
    audiooutput: DeviceInfo[] | null,
}


const getDeviceLists = async ():Promise<DeviceInfoList> => {
    const list = await navigator.mediaDevices.enumerateDevices()

    const audioInputDevices:DeviceInfo[] = list.filter((x: MediaDeviceInfo) => {
        return x.kind === "audioinput"
    }).map(x=>{
        return {
            deviceId:x.deviceId,
            groupId:x.groupId,
            kind:x.kind,
            label:x.label
        }
    })
    audioInputDevices.push({
        deviceId:"dummy",
        groupId:"dummy",
        kind:"audioinput",
        label:"dummy"
    })
    
    const videoInputDevices:DeviceInfo[] = list.filter((x: MediaDeviceInfo) => {
        return x.kind === "videoinput"
    }).map(x=>{
        return {
            deviceId:x.deviceId,
            groupId:x.groupId,
            kind:x.kind,
            label:x.label
        }
    })
    const audioOutputDevices:DeviceInfo[] = list.filter((x: MediaDeviceInfo) => {
        return x.kind === "audiooutput"
    }).map(x=>{
        return {
            deviceId:x.deviceId,
            groupId:x.groupId,
            kind:x.kind,
            label:x.label
        }
    })
    return {
        audioinput: audioInputDevices,
        videoinput: videoInputDevices,
        audiooutput: audioOutputDevices,
    }
}

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

