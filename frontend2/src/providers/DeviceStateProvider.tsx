import React, { useState, ReactNode, useContext } from 'react';
import { getDeviceLists } from '../utils';

type Props = {
    children: ReactNode;
};

interface DeviceStateValue {
    audioInputList: MediaDeviceInfo[] | null,
    videoInputList: MediaDeviceInfo[] | null,
    audioOutputList: MediaDeviceInfo[] | null,
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
    const [deviceList, setDeviceList] = useState(null as { [key: string]: MediaDeviceInfo[] } | null)

    if (!deviceList) {
        console.log("getDevice List")
        getDeviceLists().then(res => {
            console.log("device list:::", res)
            setDeviceList(res)
        })
    }

    const reloadDeivces = () =>{
        getDeviceLists().then(res => {
            console.log("device list:::", res)
            setDeviceList(res)
        })
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