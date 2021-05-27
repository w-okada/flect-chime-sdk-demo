
import { ConsoleLogger, DefaultActiveSpeakerPolicy, DefaultDeviceController, DefaultMeetingSession, LogLevel, MeetingSessionConfiguration, VideoTileState } from "amazon-chime-sdk-js";
import * as api from '../../api/api'
import AudioVideoObserverTemplate from "../observers/AudioVideoObserver";
import { DeviceChangeObserverImpl } from "../observers/DeviceChangeObserverImpl";
import { AudioInputDeviceSetting } from "./AudioInputDeviceSetting";
import { AudioOutputDeviceSetting } from "./AudioOutputDeviceSetting";
import { VideoInputDeviceSetting } from "./VideoInputDeviceSetting";



export type AttendeeState = {
    attendeeId: string
    name: string
    active: boolean
    score: number // active score
    volume: number // volume
    muted: boolean
    paused: boolean
    signalStrength: number
    isSharedContent: boolean
    ownerId: string
}


export class ChimeClient {
    private userId?: string
    private idToken?: string
    private accessToken?: string
    private refreshToken?: string

    init = (userId: string, idToken: string, accessToken: string, refreshToken: string) => {
        this.userId = userId
        this.idToken = idToken
        this.accessToken = accessToken
        this.refreshToken = refreshToken
    }
    private userName?:string                                        // Note: update with accessor for update listener
    private attendeeId?:string
    private meetingName?:string                                     // Note: update with accessor for update listener
    private meetingId?:string                                     // Note: update with accessor for update listener
    private joinToken?:string
    private attendees: { [attendeeId: string]: AttendeeState } = {} // Note: update with accessor for update listener
    private videoTileStates: { [attendeeId: string]: VideoTileState } = {} // Note: update with accessor for update listener
    private isShareContent:boolean = false
    private activeSpeakerId:string|null = null

    userNameUpdated:        (val:string)=>void   =  (val:string) => {}
    attendeeIdUpdated:      (val:string)=>void   =  (val:string) => {}
    meetingNameUpdated:     (val:string)=>void   =  (val:string) => {}
    meetingIdUpdated:       (val:string)=>void   =  (val:string) => {}
    joinTokenUpdated:       (val:string)=>void   =  (val:string) => {}
    attendeesUpdated:       (val:{ [attendeeId: string]: AttendeeState } )=>void    = () =>{}
    videoTileStatesUpdated: (val:{ [attendeeId: string]: VideoTileState } )=>void   = () =>{}
    isShareContentUpdated : (val:boolean)=>void = () =>{}
    activeSpeakerIdUpdated: (val:string|null) => void = () =>{}


    set _meetingName(val:string){
        this.meetingName=val
        this.meetingNameUpdated(val)
    }
    set _meetingId(val:string){
        this.meetingId=val
        this.meetingIdUpdated(val)
    }
    set _joinToken(val:string){
        this.joinToken = val
        this.joinTokenUpdated(val)
    }
    set _userName(val:string){
        this.userName = val
        this.userNameUpdated(val)
    }
    set _attendeeId(val:string){
        this.attendeeId = val
        this.attendeeIdUpdated(val)
    }

    get _attendees():{ [attendeeId: string]: AttendeeState }{
        return this.attendees
    }
    set _attendees(val:{ [attendeeId: string]: AttendeeState }){
        this.attendees = val
        this.attendeesUpdated(val)
    }
    get _videoTileStates():{ [attendeeId: string]: VideoTileState }{
        return this.videoTileStates
    }
    set _videoTileStates(val:{ [attendeeId: string]: VideoTileState } ){
        this.videoTileStates = val
        this.videoTileStatesUpdated(val)
    }
    get _isShareContent():boolean{
        return this.isShareContent
    }
    set _isShareContent(val:boolean){
        this.isShareContent = val
        this.isShareContentUpdated(val)
    }
    set _activeSpeakerId(val:string|null){
        this.activeSpeakerId = val
        this.activeSpeakerIdUpdated(val)
    }


    private meetingSession?: DefaultMeetingSession
    private audioInputDeviceSetting?: AudioInputDeviceSetting
    private videoInputDeviceSetting?: VideoInputDeviceSetting
    private audioOutputDeviceSetting?: AudioOutputDeviceSetting
    get _meetingSession():DefaultMeetingSession | undefined{
        return this.meetingSession
    }
    get _audioInputDeviceSetting():AudioInputDeviceSetting | undefined{
        return this.audioInputDeviceSetting
    }
    get _videoInputDeviceSetting():VideoInputDeviceSetting | undefined{
        return this.videoInputDeviceSetting
    }
    get _audioOutputDeviceSetting():AudioOutputDeviceSetting | undefined{
        return this.audioOutputDeviceSetting
    }

    ///////////////////////////////////////////
    // Feature Management
    ///////////////////////////////////////////
    startShareContent = async (media:MediaStream) =>{
        await this.meetingSession!.audioVideo.startContentShare(media)
        this._isShareContent = true
    }
    stopShareContent = async () =>{
        await this.meetingSession!.audioVideo.stopContentShare()
        this._isShareContent = false
    }

    
    
    ///////////////////////////////////////////
    // Meeting Management
    ///////////////////////////////////////////
    /**
     * Create Meeting Room
     * @param meetingName 
     * @param userName 
     * @param region 
     */
    createMeeting = async (meetingName: string, userName: string, region: string) => {
        const res = await api.createMeeting(meetingName, region, this.idToken!, this.accessToken!, this.refreshToken!)
        if (!res.created) {
            console.log("[createMeeting] meeting create failed", res)
            throw new Error(`Meeting Create Failed`)
        }
        return res
    }

    /**
     * Join Meeting Room
     * @param meetingName 
     * @param userName 
     */
    joinMeeting = async (meetingName: string, userName: string) => {
        if (meetingName === "") {
            throw new Error("Meeting name is invalid")
        }
        if (userName === "") {
            throw new Error("Username is invalid")
        }

        const joinInfo = await api.joinMeeting(meetingName, userName, this.idToken!, this.accessToken!, this.refreshToken!)
        console.log("JoinInfo:", joinInfo)
        if (joinInfo['code']) {
            throw new Error("Failed to join")
        }
        const meetingInfo = joinInfo.Meeting
        const attendeeInfo = joinInfo.Attendee
        console.log("[Join Meeting] ", meetingInfo, attendeeInfo)
        this._meetingName = meetingName
        this._meetingId = meetingInfo.MeetingId
        this._joinToken = attendeeInfo.JoinToken
        this._userName = userName
        this._attendeeId = attendeeInfo.AttendeeId

        // (1) creating meeting session
        //// (1-1) creating configuration
        const configuration = new MeetingSessionConfiguration(meetingInfo, attendeeInfo)
        //// (1-2) creating logger
        const logger = new ConsoleLogger('MeetingLogs', LogLevel.OFF)
        //// (1-3) creating device controller
        const deviceController = new DefaultDeviceController(logger, {
            enableWebAudio: true,
        })
        const deviceChangeObserver = new DeviceChangeObserverImpl()
        deviceController.addDeviceChangeObserver(deviceChangeObserver)
        //// (1-4) create meeting session
        this.meetingSession = new DefaultMeetingSession(configuration, logger, deviceController)

        //// (1-5) create AudioVideoObserver
        const audioVideoOserver = new AudioVideoObserverTemplate()
        audioVideoOserver.videoTileDidUpdate = (tileState: VideoTileState) => {
            if (!tileState.boundAttendeeId) {
                console.log("[AudioVideoObserver] updated tile have no boundAttendeeID", tileState)
                return
            }
            if (!this.videoTileStates[tileState.boundAttendeeId]) {
                console.log("[AudioVideoObserver] new tile added", tileState)
                this.videoTileStates[tileState.boundAttendeeId] = tileState
                this._videoTileStates = this.videoTileStates
                return
            }
            console.log("[AudioVideoObserver] no change?", tileState)
        }
        audioVideoOserver.videoTileWasRemoved = (tileId: number) => {
            // There are the risk to overwrite new commer who is assgined same tileid, but tile id is generally incremented one by one
            // so, the probability to have this problem is very low: TODO: fix
            this.meetingSession?.audioVideo.unbindVideoElement(tileId)
            console.log("[AudioVideoObserver] videoTileWasRemoved", tileId)
            const removedAttendeeId = Object.values(this.videoTileStates).find(x => { return x.tileId === tileId })?.boundAttendeeId
            console.log("[AudioVideoObserver] removedAttendeeId", removedAttendeeId)
            if (removedAttendeeId) {
                delete this.videoTileStates[removedAttendeeId]
                this._videoTileStates = this.videoTileStates
            }
        }
        this.meetingSession.audioVideo.addObserver(audioVideoOserver)

        // (2) DeviceSetting
        this.audioInputDeviceSetting = new AudioInputDeviceSetting(this.meetingSession)
        this.videoInputDeviceSetting = new VideoInputDeviceSetting(this.meetingSession)
        this.audioOutputDeviceSetting = new AudioOutputDeviceSetting(this.meetingSession)

        // (3) List devices
        //// chooseAudioOutputDevice uses the internal cache 
        //// so beforehand, we must get thses information. (auidoinput, videoinput are maybe optional)
        await this.meetingSession?.audioVideo.listAudioInputDevices()
        await this.meetingSession?.audioVideo.listVideoInputDevices()
        await this.meetingSession?.audioVideo.listAudioOutputDevices()
    }

    /**
     * Enter Meeting Room
     */
    enterMeeting = async () => {
        if (!this.meetingSession) {
            console.log("meetingsession is null?", this.meetingSession)
            throw new Error("meetingsession is null?")
        }

        // (1) prepair
        //// https://github.com/aws/amazon-chime-sdk-js/issues/502#issuecomment-652665492
        //// When stop preview, camera stream is terminated!!? So when enter meeting I rechoose Devices as workaround. (2)
        this.videoInputDeviceSetting?.stopPreview()

        // (2) subscribe AtttendeeId presence
        this.meetingSession.audioVideo.realtimeSubscribeToAttendeeIdPresence(async (attendeeId: string, present: boolean) => {
            console.log(`[AttendeeIdPresenceSubscriber] ${attendeeId} present = ${present}`);
            if (present) {
                if (attendeeId in this.attendees === false) {
                    let userName = ""
                    if(attendeeId.indexOf("#")>0){                        
                        userName = attendeeId
                    }else{
                        try{
                            const result = await api.getUserNameByAttendeeId(this.meetingName!, attendeeId, this.idToken!, this.accessToken!, this.refreshToken!)
                            userName = result.result === "success" ? result.name : attendeeId
                        }catch{
                            userName = attendeeId
                        }
                    }
                    // Add to Attendee List
                    const new_attendee: AttendeeState = {
                        attendeeId: attendeeId,
                        name: userName,
                        active: false,
                        score: 0,
                        volume: 0,
                        muted: false,
                        paused: false,
                        signalStrength: 0,
                        isSharedContent: false,
                        ownerId: "",
                    }
                    if (attendeeId.split("#").length === 2) {
                        new_attendee.isSharedContent = true
                        new_attendee.ownerId = attendeeId.split("#")[0]
                    }
                    this.attendees[attendeeId] = new_attendee
                    this._attendees = this.attendees
                    

                    // Add Subscribe volume Indicator
                    this.meetingSession!.audioVideo.realtimeSubscribeToVolumeIndicator(attendeeId,
                        async (
                            attendeeId: string,
                            volume: number | null,
                            muted: boolean | null,
                            signalStrength: number | null
                        ) => {
                            this.attendees[attendeeId].volume = volume || 0
                            this.attendees[attendeeId].muted = muted || false
                            this.attendees[attendeeId].signalStrength = signalStrength || 0
                            this._attendees = this.attendees
                        }
                    )
                } else {
                    console.log(`[AttendeeIdPresenceSubscriber] ${attendeeId} is already in attendees`);
                }
                return;
            } else {
                // Delete Subscribe volume Indicator   
                this.meetingSession!.audioVideo.realtimeUnsubscribeFromVolumeIndicator(attendeeId)
                delete this.attendees[attendeeId]
                this._attendees = this.attendees
                return;
            }
        })

        // (3) subscribe ActiveSpeakerDetector
        this.meetingSession.audioVideo.subscribeToActiveSpeakerDetector(
            new DefaultActiveSpeakerPolicy(),
            (activeSpeakers: string[]) => {
                console.log("Active Speaker::::::::::::::::::::", activeSpeakers)
                let activeSpeakerId:string|null = null
                for (const attendeeId in this.attendees) {
                    this.attendees[attendeeId].active = false;
                }
                for (const attendeeId of activeSpeakers) {
                    if (this.attendees[attendeeId]) {
                        this.attendees[attendeeId].active = true;
                        activeSpeakerId = attendeeId
                        break
                    }
                }
                this._attendees = this.attendees
                if(this.activeSpeakerId !== activeSpeakerId){
                    this._activeSpeakerId = activeSpeakerId
                }
            },
            (scores: { [attendeeId: string]: number }) => {
                for (const attendeeId in scores) {
                    if (this.attendees[attendeeId]) {
                        this.attendees[attendeeId].score = scores[attendeeId];
                    }
                }
                this._attendees = this.attendees
            }, 5000)

        // (4) start 
        this.meetingSession?.audioVideo.start()
        await this.videoInputDeviceSetting!.setVideoInputEnable(true)
        await this.audioInputDeviceSetting!.setAudioInputEnable(true)
        await this.audioOutputDeviceSetting!.setAudioOutputEnable(true)
    }


    leaveMeeting = async () => {
        if (!this.meetingSession) {
            console.log("meetingsession is null?", this.meetingSession)
            throw new Error("meetingsession is null?")
        }

        await this.audioInputDeviceSetting!.setAudioInput(null)
        await this.videoInputDeviceSetting!.setVideoInput(null)
        await this.audioOutputDeviceSetting!.setAudioOutput(null)

        this.videoInputDeviceSetting!.stopPreview()
        this.meetingSession.audioVideo.stopLocalVideoTile()
        this.meetingSession.audioVideo.stop()
        
        this._userName = ""
        this._meetingName = ""
        this._attendees = {}
        this._videoTileStates = {}
    }





    countAttendees = async() =>{
        console.log("countAttendees")
        const res = await api.getAttendeeList(this.meetingName!,  this.idToken!, this.accessToken!, this.refreshToken!)
        console.log("countAttendees",res)
        // const p = new Promise((resolve, reject)=>{
        //     if(!this.meetingSession){
        //         resolve(0)
        //         return
        //     }
            
        //     let foundAttendees:string[] = []
        //     this.meetingSession.audioVideo.realtimeSubscribeToAttendeeIdPresence((attendeeId: string, present: boolean) => {
        //         console.log(`[AttendeeIdPresenceSubscriber_2nd] ${attendeeId} present = ${present}`);
        //         if (present) {
        //             if (attendeeId in foundAttendees === false) {
        //                 foundAttendees.push(attendeeId)
        //             }
        //         }else{
        //             foundAttendees = foundAttendees.filter(x=>{return x == attendeeId})
        //         }
        //     })
        //     this.meetingSession.audioVideo.start()

        //     setTimeout(()=>{
        //         resolve(foundAttendees.length)
        //     },1000*10)
        // })
        // const num = await p
        // console.log("count!!",num)
    }
}