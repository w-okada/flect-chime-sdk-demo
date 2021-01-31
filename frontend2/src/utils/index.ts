import { VideoTileState } from "amazon-chime-sdk-js"

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

export function showDiff<T>(before:T, after:T){
    const pre_map:{[key:string]:any}={}
    Object.entries(before).forEach(p=>{
        const key = p[0]
        const value = p[1]
        pre_map[key]=value
    })
    const cur_map:{[key:string]:any}={}
    Object.entries(after).forEach(p=>{
        const key = p[0]
        const value = p[1]
        cur_map[key] =value
    })

    const diffs:{[key:string]:any}={}
    Object.keys(cur_map).forEach(k=>{
        if(pre_map[k] !== cur_map[k]){
            if(!diffs['diffs']){
                diffs['diffs'] =[]
            }
            diffs['diffs'][k]=[pre_map[k], cur_map[k]]
        }else{
            if(!diffs['same']){
                diffs['same'] =[]
            }
            diffs['same'][k]=[pre_map[k], cur_map[k]]
        }
    })
    console.log("DIFFS!GENERICS!!",diffs)
}