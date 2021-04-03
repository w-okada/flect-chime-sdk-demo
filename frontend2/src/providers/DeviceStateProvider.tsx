import React, { useState, ReactNode, useContext } from 'react';
import { DeviceInfo, DeviceInfoList, getDeviceLists } from '../utils';

type Props = {
    children: ReactNode;
};

interface DeviceStateValue {
    audioInputList: DeviceInfo[] | null,
    videoInputList: DeviceInfo[] | null,
    audioOutputList: DeviceInfo[] | null,
    reloadDeivces: ()=>void
}

const DeviceStateContext = React.createContext<DeviceStateValue | null>(null)


export const useDeviceState = (): DeviceStateValue => {
    const state = useContext(DeviceStateContext)
    if (!state) {
        throw new Error("Error using device state context!")
    }
    return state
}


export const DeviceStateProvider = ({ children }: Props) => {
    const [deviceList, setDeviceList] = useState<DeviceInfoList|null>(null)

    if (!deviceList) {
        console.log("getDevice List")
        getDeviceLists().then(res => {
            addtionalDevice(res)
            console.log("device list:::", res)
            setDeviceList(res)
        })
    }

    const reloadDeivces = () =>{
        getDeviceLists().then(res => {
            addtionalDevice(res)
            console.log("device list:::", res)
            setDeviceList(res)
        })
    }

    const addtionalDevice = (l:DeviceInfoList) =>{
        if(l){
            l.audioinput?.push({
                deviceId:"dummy",
                groupId:"dummy",
                kind:"audioinput",
                label:"dummy"
            })
        }
    }
    const providerValue: DeviceStateValue = {
        audioInputList: deviceList ? deviceList['audioinput'] : null,
        videoInputList: deviceList ? deviceList['videoinput'] : null,
        audioOutputList: deviceList ? deviceList['audiooutput'] : null,
        reloadDeivces

    }

    return (
        <DeviceStateContext.Provider value={providerValue}>
            {children}
        </DeviceStateContext.Provider>
    )
}