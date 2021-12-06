import { useEffect, useState } from "react";

export type MediaDeviceInfoList = {
    audioinput: MediaDeviceInfo[];
    videoinput: MediaDeviceInfo[];
    audiooutput: MediaDeviceInfo[];
};

export const MediaDeviceType = {
    audioinput: "audioinput",
    videoinput: "videoinput",
    audiooutput: "audiooutput",
} as const;
export type MediaDeviceType = typeof MediaDeviceType[keyof typeof MediaDeviceType];

const getDeviceLists = async (): Promise<MediaDeviceInfoList> => {
    const list = await navigator.mediaDevices.enumerateDevices();

    const audioInputDevices: MediaDeviceInfo[] = list.filter((x: MediaDeviceInfo) => {
        return x.kind === MediaDeviceType.audioinput;
    });

    const videoInputDevices: MediaDeviceInfo[] = list.filter((x: MediaDeviceInfo) => {
        return x.kind === MediaDeviceType.videoinput;
    });
    const audioOutputDevices: MediaDeviceInfo[] = list.filter((x: MediaDeviceInfo) => {
        return x.kind === MediaDeviceType.audiooutput;
    });

    return {
        audioinput: audioInputDevices,
        videoinput: videoInputDevices,
        audiooutput: audioOutputDevices,
    };
};

const addDummyToMediaDeviceList = (input: MediaDeviceInfo[], deviceKind: MediaDeviceType) => {
    input.push({
        deviceId: "dummy",
        groupId: "dummy",
        kind: deviceKind,
        label: "dummy",
        toJSON: () => {
            return JSON.stringify("dummy");
        },
    });
};

const addNoneToMediaDeviceList = (input: MediaDeviceInfo[], deviceKind: MediaDeviceType) => {
    input.push({
        deviceId: "None",
        groupId: "None",
        kind: deviceKind,
        label: "None",
        toJSON: () => {
            return JSON.stringify("None");
        },
    });
};

export type DeviceState = {
    mediaDeviceList: MediaDeviceInfoList;
    reloadDevices: () => void;
    getDefaultDeviceIds: () => {
        defaultAudioInputDeviceId: string;
        defaultVideoInputDeviceId: string;
        defaultAudioOutputDeviceId: string;
    };
};

export const useDeviceState = () => {
    const [mediaDeviceList, setMediaDeviceList] = useState<MediaDeviceInfoList>({
        audioinput: [],
        videoinput: [],
        audiooutput: [],
    });
    useEffect(() => {
        getDeviceLists().then((res) => {
            addDummyToMediaDeviceList(res.audioinput, MediaDeviceType.audioinput);
            addNoneToMediaDeviceList(res.audioinput, MediaDeviceType.audioinput);
            addNoneToMediaDeviceList(res.videoinput, MediaDeviceType.videoinput);
            addNoneToMediaDeviceList(res.audiooutput, MediaDeviceType.audiooutput);
            setMediaDeviceList(res);
        });
    }, []);

    const reloadDevices = () => {
        getDeviceLists().then((res) => {
            addDummyToMediaDeviceList(res.audioinput, MediaDeviceType.audioinput);
            addNoneToMediaDeviceList(res.audioinput, MediaDeviceType.audioinput);
            addNoneToMediaDeviceList(res.videoinput, MediaDeviceType.videoinput);
            addNoneToMediaDeviceList(res.audiooutput, MediaDeviceType.audiooutput);
            setMediaDeviceList(res);
        });
    };

    ////////////////////////////
    // utility
    ////////////////////////////

    const defaultDeviceId = (deviceList: MediaDeviceInfo[] | null) => {
        if (!deviceList) {
            return "None";
        }
        const defaultDevice = deviceList.find((dev) => {
            return dev.deviceId !== "default";
        });
        return defaultDevice ? defaultDevice.deviceId : "None";
    };
    const getDefaultDeviceIds = () => {
        const defaultAudioInputDeviceId = defaultDeviceId(mediaDeviceList.audioinput);
        const defaultVideoInputDeviceId = defaultDeviceId(mediaDeviceList.videoinput);
        const defaultAudioOutputDeviceId = defaultDeviceId(mediaDeviceList.audiooutput);
        return { defaultAudioInputDeviceId, defaultVideoInputDeviceId, defaultAudioOutputDeviceId };
    };

    const returnValue: DeviceState = {
        mediaDeviceList,
        reloadDevices,
        getDefaultDeviceIds,
    };
    return returnValue;
};
