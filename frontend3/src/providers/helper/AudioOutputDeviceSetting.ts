import { MeetingSession } from "amazon-chime-sdk-js"


export class AudioOutputDeviceSetting{
    private meetingSession:MeetingSession

    audioOutput:string|null = null
    audioOutputEnable:boolean = true

    outputAudioElement:HTMLAudioElement|null=null

    constructor(meetingSession:MeetingSession){
        this.meetingSession = meetingSession
    }
    ///////////////
    // AudioOutput
    ///////////////
    private setAudioOutputCommon = async (device: string|null, enable:boolean) => {

        /// no use audio output
        if(device===null || enable===false){
            console.log("[DeviceSetting] AudioOutput is null or disabled.")
            await this.meetingSession.audioVideo.chooseAudioOutputDevice(null)
            return
        }

        /// for standard audio output
        console.log("[DeviceSetting] Change AudioOutput.")
        await this.meetingSession.audioVideo.chooseAudioOutputDevice(device)
    }


    setAudioOutput = async (val: string | null) => {
        this.audioOutput = val
        await this.setAudioOutputCommon(this.audioOutput, this.audioOutputEnable)
        this.setRelationToAudioElement()
    }
    setAudioOutputEnable = async (val:boolean) => {
        this.audioOutputEnable = val
        await this.setAudioOutputCommon(this.audioOutput, this.audioOutputEnable)
        this.setRelationToAudioElement()
    }

    setOutputAudioElement = (val:HTMLAudioElement) =>{
        this.outputAudioElement = val
        this.setRelationToAudioElement()
    }

    private setRelationToAudioElement = () => {
        if(this.audioOutputEnable && this.audioOutput){
            this.bindOutputAudioElement()
        }else{
            this.unbindOutputAudioElement()
        }
    }

    private bindOutputAudioElement = async() =>{
        if(this.outputAudioElement){
            await this.meetingSession.audioVideo.bindAudioElement(this.outputAudioElement)
        }else{
            console.log("[DeviceSetting] OutputAudioElement is not set for bind.")
        }
    }

    private unbindOutputAudioElement = () =>{
        this.meetingSession.audioVideo.unbindAudioElement()
    }


}
