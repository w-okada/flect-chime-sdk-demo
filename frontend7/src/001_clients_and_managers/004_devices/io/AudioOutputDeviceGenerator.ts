
//////////////////////////////
// Types
//////////////////////////////
// (1) Custom Devices
export const AudioOutputCustomDevices = {
    "none": "none",
} as const
export type AudioOutputCustomDevices = typeof AudioOutputCustomDevices[keyof typeof AudioOutputCustomDevices]
export const AudioOutputCustomDeviceList = Object.entries(AudioOutputCustomDevices).map(([key, val]) => {
    return { label: key, deviceId: val, }
})


//////////////////////////////
// Class
//////////////////////////////
export class AudioOutputDeviceGenerator {

}
