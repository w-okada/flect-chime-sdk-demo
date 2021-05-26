
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


export const getDeviceLists = async ():Promise<DeviceInfoList> => {
    const list = await navigator.mediaDevices.enumerateDevices()

    const audioInputDevices:DeviceInfo[] = list.filter((x: InputDeviceInfo | MediaDeviceInfo) => {
        return x.kind === "audioinput"
    }).map(x=>{
        return {
            deviceId:x.deviceId,
            groupId:x.groupId,
            kind:x.kind,
            label:x.label
        }
    })
    const videoInputDevices:DeviceInfo[] = list.filter((x: InputDeviceInfo | MediaDeviceInfo) => {
        return x.kind === "videoinput"
    }).map(x=>{
        return {
            deviceId:x.deviceId,
            groupId:x.groupId,
            kind:x.kind,
            label:x.label
        }
    })
    const audioOutputDevices:DeviceInfo[] = list.filter((x: InputDeviceInfo | MediaDeviceInfo) => {
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
    // console.log("DIFFS!GENERICS!!",diffs)
}


export const getDataString = ():string => {
    var dt = new Date();
    var y = dt.getFullYear();
    var m = ("00" + (dt.getMonth()+1)).slice(-2);
    var d = ("00" + dt.getDate()).slice(-2);
    var result = y + "_" + m + "_" + d;
    return result
}