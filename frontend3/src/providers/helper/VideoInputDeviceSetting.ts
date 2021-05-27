import { ConsoleLogger, DefaultVideoTransformDevice, LogLevel, MeetingSession } from "amazon-chime-sdk-js"
import { VirtualBackground, VirtualBackgroundSegmentationType } from "../../frameProcessors/VirtualBackground"

export class VideoInputDeviceSetting {
    private meetingSession: MeetingSession
    private virtualBackgroundProcessor: VirtualBackground | null = null
    private videoTransformDevice: DefaultVideoTransformDevice | null = null
    private deviceMediaStream: MediaStream|null = null
    private currentVideoDevice: string = ""

    private stateChanging:boolean = false
    videoInput: MediaStream | string | null = null
    videoInputEnable: boolean = true
    virtualBackgroundEnable:boolean=false
    virtualForeGroundEnable:boolean=false
    virtualBackgroundSegmentationType:VirtualBackgroundSegmentationType="None"


    previewVideoElement: HTMLVideoElement|null = null

    constructor(meetingSession: MeetingSession) {
        this.meetingSession = meetingSession
    }


    ///////////////
    // VideoInput
    ///////////////
    private setVideoInputCommon = async (device: MediaStream | string | null, enable: boolean, vbgEnable: boolean, vfgEnable: boolean,) => {
        console.log("setVideoInput", device, enable, vbgEnable, vfgEnable)
        // if(this.deviceMediaStream){
        //     this.deviceMediaStream.getVideoTracks().forEach(x=>{
        //         x.stop()
        //     })
        // }
        // this.deviceMediaStream = null

        // if(this.videoTransformDevice){
        //     this.videoTransformDevice.chooseNewInnerDevice(null)
        // }
        // await this.meetingSession.audioVideo.chooseVideoInputDevice(null)
        /// no use video input
        if (device === null || enable === false) {
            console.log("[DeviceSetting] VideoInput is null or disabled.")
            await this.meetingSession.audioVideo.chooseVideoInputDevice(null)
            return
        }

        /// for standard video input
        if (vbgEnable === false && vfgEnable === false) {
            console.log("[DeviceSetting] VideoInput doesn't use virtual background. 11")
            // if(this.currentVideoDevice !== device){
            //     await this.meetingSession.audioVideo.chooseVideoInputDevice(device)
            //     if(typeof device === "string"){
            //         this.currentVideoDevice = device
            //     }
            // }

                await this.meetingSession.audioVideo.chooseVideoInputDevice(device)

            console.log("[DeviceSetting] VideoInput doesn't use virtual background. 2")
            return
        }

        /// Setup VirtualBackground or VirtualForeGround
        //// If VirtualBackgrounProcessor is null, create it.(singleton)
        if (this.virtualBackgroundProcessor === null) {
            console.log("[DeviceSetting] VirtualBackgroundProcessor is null. New one is created.")
            this.virtualBackgroundProcessor = new VirtualBackground()
        } else {
            console.log("[DeviceSetting] Existing VirtualBackgroundProcessor is used.")
        }

        /// create TransformDevice
        let newTransformDeviceCreated = false
        if (this.videoTransformDevice === null) {
            console.log("[DeviceSetting] VideoTransformDevice is null. New one is created.")
            this.videoTransformDevice = new DefaultVideoTransformDevice(
                new ConsoleLogger('MeetingLogs', LogLevel.OFF),
                device, // device id string
                [this.virtualBackgroundProcessor])
            newTransformDeviceCreated = true
            this.videoInput = device
        } else {
            console.log("[DeviceSetting] Existing VideoTransformDevice is used.")
        }

        //// change inner device if it is changed
        ///// IF newTransformDevice is created, already set the new device. 
        if (device !== this.videoInput || newTransformDeviceCreated === false) {
            this.videoTransformDevice = await this.videoTransformDevice.chooseNewInnerDevice(device)
            this.videoInput = device
        }

        //// choose VideoInput
        await this.meetingSession.audioVideo.chooseVideoInputDevice(this.videoTransformDevice)

    }

    private applyAttributes = () =>{
        this.virtualBackgroundProcessor?.setVirtualBackgroundType(this.virtualBackgroundSegmentationType)

    }


    setVideoInput = async (val: MediaStream | string | null, preview?:boolean) => {
        this.videoInput = val
        await this.setVideoInputCommon(this.videoInput, this.videoInputEnable, this.virtualBackgroundEnable, this.virtualForeGroundEnable)
        await this.applyAttributes()
        this.setVisiblity(preview)
    }

    setVideoInputEnable = async (val: boolean, preview?:boolean) => {
        this.videoInputEnable = val
        await this.setVideoInputCommon(this.videoInput, this.videoInputEnable, this.virtualBackgroundEnable, this.virtualForeGroundEnable)
        await this.applyAttributes()
        this.setVisiblity(preview)
    }
    setVirtualBackgrounEnable = async (val: boolean, preview?:boolean) => {
        this.virtualBackgroundEnable = val
        await this.setVideoInputCommon(this.videoInput, this.videoInputEnable, this.virtualBackgroundEnable, this.virtualForeGroundEnable)
        await this.applyAttributes()
        this.setVisiblity(preview)
    }
    setVirtualForegrounEnable = async (val: boolean, preview?:boolean) => {
        this.virtualForeGroundEnable = val
        await this.setVideoInputCommon(this.videoInput, this.videoInputEnable, this.virtualBackgroundEnable, this.virtualForeGroundEnable)
        await this.applyAttributes()
        this.setVisiblity(preview)
    }
    setVirtualBackgroundSegmentationType = async (val: VirtualBackgroundSegmentationType, preview?:boolean) => {
        this.virtualBackgroundSegmentationType=val
        this.applyAttributes()
        this.setVisiblity(preview)
    }
    setBackgroundImagePath = async (path: string) => {
        if(this.virtualBackgroundProcessor){
            this.virtualBackgroundProcessor.setBackgroundImage(path)
        }
    }

    
    
    setPreviewVideoElement = (val:HTMLVideoElement, preview?:boolean) =>{
        this.previewVideoElement=val
    }

    private setVisiblity = (preview?:boolean) =>{
        if(preview){
            if(this.videoInput && this.videoInputEnable){
                this.startPreview()
            }else{
                this.stopPreview()
            }
        }else{
            if(this.videoInput && this.videoInputEnable){
                this.startLocalVideoTile()
            }else{
                this.stopLocalVideoTile()
            }
        }

    }


    startPreview = () =>{
        if(this.previewVideoElement){
            try{
                this.meetingSession.audioVideo.startVideoPreviewForVideoInput(this.previewVideoElement)
            }catch(e){
                console.log("PREVIEW EXCEPTION:",e)
            }
        }else{
            console.log("[DeviceSetting] Preview VideoElement is not set for start.")
        }
    }
    stopPreview = () =>{
        if(this.previewVideoElement){
            this.meetingSession.audioVideo.stopVideoPreviewForVideoInput(this.previewVideoElement)
        }else{
            console.log("[DeviceSetting] Preview VideoElement is not set for stop.")
        }
    }

    startLocalVideoTile = () =>{
        this.meetingSession.audioVideo.startLocalVideoTile()
    }
    stopLocalVideoTile = () =>{
        this.meetingSession.audioVideo.stopLocalVideoTile()
    }



    ////////
    // VBG Parameter
    ////////
    setJBFSize = (width:number, height:number) =>{
        if(this.virtualBackgroundProcessor){
            this.virtualBackgroundProcessor.googlemeetParams.jbfWidth  = width
            this.virtualBackgroundProcessor.googlemeetParams.jbfHeight = height
        }
    }
    getJBFSize = () =>{
        return (this.virtualBackgroundProcessor?.googlemeetParams.jbfWidth,this.virtualBackgroundProcessor?.googlemeetParams.jbfHeight)
    }
    setLightWrappingEnable = (val:boolean) => {
        if(this.virtualBackgroundProcessor){
            this.virtualBackgroundProcessor.googleMeetLightWrappingEnable = val
        }
    }
    getLightWrappingEnable = () =>{
        return this.virtualBackgroundProcessor?.googleMeetLightWrappingEnable
    }
}
