
export const getDeviceLists = async () => {
    const list = await navigator.mediaDevices.enumerateDevices()

    const audioInputDevices = list.filter((x: InputDeviceInfo | MediaDeviceInfo) => {
        return x.kind === "audioinput"
    })
    const videoInputDevices = list.filter((x: InputDeviceInfo | MediaDeviceInfo) => {
        return x.kind === "videoinput"
    })
    const audioOutputDevices = list.filter((x: InputDeviceInfo | MediaDeviceInfo) => {
        return x.kind === "audiooutput"
    })
    return {
        audioinput: audioInputDevices,
        videoinput: videoInputDevices,
        audiooutput: audioOutputDevices,
    }
}
