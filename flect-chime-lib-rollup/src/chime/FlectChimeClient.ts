import { RestApiClient } from "../flect-amazon-chime-lib"
import { ConsoleLogger, DefaultActiveSpeakerPolicy, DefaultDeviceController, DefaultMeetingSession, LogLevel, MeetingSessionConfiguration, VideoTileState } from "amazon-chime-sdk-js"
import { DeviceChangeObserverImpl } from "./observer/DeviceChangeObserverImpl"
import AudioVideoObserverTemplate from "./observer/AudioVideoObserverTemplate"
import { AudioInputDeviceSetting } from "./io/AudioInputDeviceSetting"
import { VideoInputDeviceSetting } from "./io/VideoInputDeviceSetting"
import { AudioOutputDeviceSetting } from "./io/AudioOutputDeviceSetting"
import { RealtimeSubscribeChatClient } from "./realtime/RealtimeSubscribeChatClient"
import { RealtimeData } from "./realtime/const"

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
    isVideoPaused:boolean
}

export class FlectChimeClient {
    private _restApiClient: RestApiClient

    /**
    * creadentials
    */
    private _userId: string
    private _idToken: string
    private _accessToken: string
    private _refreshToken: string

    constructor(userId: string, idToken: string, accessToken: string, refreshToken: string, restEndPoint:string) {
        this._userId = userId
        this._idToken = idToken
        this._accessToken = accessToken
        this._refreshToken = refreshToken
        this._restApiClient = new RestApiClient(restEndPoint, idToken, accessToken, refreshToken)
    }

    /**
    * meeting infos
    */
    private _meetingName: string | null = null
    get meetingName():string|null{
        return this._meetingName
    }
    private _meetingId: string | null = null
    get meetingId():string|null{
        return this._meetingId
    }
    private _joinToken: string | null = null
    get joinToken():string|null{
        return this._joinToken
    }
    private _userName: string | null = null
    get userName():string|null{
        return this._userName
    }
    private _attendeeId: string | null = null
    get attendeeId():string|null{
        return this._attendeeId
    }
    private _meetingSession: DefaultMeetingSession|null = null
    get meetingSession():DefaultMeetingSession|null{
        return this._meetingSession
    }
    private _videoTileStates: { [attendeeId: string]: VideoTileState } = {}
    get videoTileStates():{ [attendeeId: string]: VideoTileState }{
        return this._videoTileStates
    }
    private _attendees: { [attendeeId: string]: AttendeeState } = {} 
    get attendees(): { [attendeeId: string]: AttendeeState }{
        return this._attendees
    }
    private _isShareContent:boolean = false
    get isShareContent():boolean{
        return this._isShareContent
    }
    private _activeSpeakerId:string|null = null
    get activeSpeakerId():string|null{
        return this._activeSpeakerId
    }

    //// I/O
    private _audioInputDeviceSetting: AudioInputDeviceSetting|null = null
    private _videoInputDeviceSetting: VideoInputDeviceSetting|null = null
    private _audioOutputDeviceSetting: AudioOutputDeviceSetting|null = null
    get audioInputDeviceSetting():AudioInputDeviceSetting | null{
        return this._audioInputDeviceSetting
    }
    get videoInputDeviceSetting():VideoInputDeviceSetting | null{
        return this._videoInputDeviceSetting
    }
    get audioOutputDeviceSetting():AudioOutputDeviceSetting | null{
        return this._audioOutputDeviceSetting
    }    

    ///////////////////////////////////////////////////////////
    // Tools
    // Note: whiteboard is independent from ChimeClient (use websocket)
    ///////////////////////////////////////////////////////
    private _chatClient:RealtimeSubscribeChatClient|null = null
    sendMessage = (text: string) =>{
        this._chatClient?.sendChatData(text)
    }
    get chatData():RealtimeData[]{
        return this._chatClient? this._chatClient.chatData : []
    }


    ///////////////////////////////////////////
    // Listener
    ///////////////////////////////////////////
    private _activeSpekaerUpdateListener = (activeSpeakerId:string|null)=>{}
    setActiveSpekaerUpdateListener = (l:(activeSpeakerId:string|null)=>void) =>{
        this._activeSpekaerUpdateListener = l
    }
    private _attendeesUpdateListener = (list:{ [attendeeId: string]: AttendeeState } )=>{}
    setAttendeesUpdateListener = ( l:((list:{ [attendeeId: string]: AttendeeState } )=>void) )  => {
        this._attendeesUpdateListener = l
    }
    private _videoTileStateUpdateListener = (list:{ [attendeeId: string]: VideoTileState }) =>{}
    setVideoTileStateUpdateListener = ( l: ((list:{ [attendeeId: string]: VideoTileState }) =>void)) =>{
        this._videoTileStateUpdateListener = l
    }

    private _chatDataUpdateListener = (list:RealtimeData[]) =>{console.log("[FlectChimeClient][RealtimeSubscribeChatClient] default listener(chime client)!")}
    setChatDataUpdateListener = ( l: ((list:RealtimeData[]) =>void)) =>{
        this._chatDataUpdateListener = l
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
     * (A) create meeting
     */
    createMeeting = async (meetingName: string, region: string) => {
        const res = await this._restApiClient.createMeeting(meetingName, region)
        if (!res.created) {
            console.log("[FlectChimeClient][createMeeting] meeting create failed", res)
            throw new Error(`Meeting Create Failed`)
        }
        return res
    }

    /**
     * (B) Join Meeting Room
     */
    joinMeeting = async (meetingName: string, userName: string) => {
        if (meetingName === "") {
            throw new Error("Meeting name is invalid")
        }
        if (userName === "") {
            throw new Error("Username is invalid")
        }

        const joinInfo = await this._restApiClient.joinMeeting(meetingName, userName)
        console.log("[FlectChimeClient][joinMeeting] JoinInfo:", joinInfo)
        if (joinInfo['code']) {
            throw new Error("Failed to join")
        }
        const meetingInfo = joinInfo.Meeting
        const attendeeInfo = joinInfo.Attendee
        console.log("[FlectChimeClient][joinMeeting] ", meetingInfo, attendeeInfo)
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
        this._meetingSession = new DefaultMeetingSession(configuration, logger, deviceController)

        //// (1-5) create AudioVideoObserver
        const audioVideoOserver = new AudioVideoObserverTemplate()
        audioVideoOserver.videoTileDidUpdate = (tileState: VideoTileState) => {
            if (!tileState.boundAttendeeId) {
                console.log("[FlectChimeClient][AudioVideoObserver] updated tile have no boundAttendeeID", tileState)
                return
            }
            if (!this._videoTileStates[tileState.boundAttendeeId]) {
                console.log("[FlectChimeClient][AudioVideoObserver] new tile added", tileState)
                this._videoTileStates[tileState.boundAttendeeId] = tileState
                this._videoTileStateUpdateListener(this._videoTileStates)
                return
            }
            console.log("[FlectChimeClient][AudioVideoObserver] no change?", tileState)
        }
        audioVideoOserver.videoTileWasRemoved = (tileId: number) => {
            // There are the risk to overwrite new commer who is assgined same tileid, but tile id is generally incremented one by one
            // so, the probability to have this problem is very low: TODO: fix
            this._meetingSession!.audioVideo.unbindVideoElement(tileId)
            console.log("[FlectChimeClient][AudioVideoObserver] videoTileWasRemoved", tileId)
            const removedAttendeeId = Object.values(this._videoTileStates).find(x => { return x.tileId === tileId })?.boundAttendeeId
            console.log("[FlectChimeClient][AudioVideoObserver] removedAttendeeId", removedAttendeeId)
            if (removedAttendeeId) {
                delete this._videoTileStates[removedAttendeeId]
                this._videoTileStateUpdateListener(this._videoTileStates)
            }
        }
        this._meetingSession.audioVideo.addObserver(audioVideoOserver)

        // (2) DeviceSetting
        this._audioInputDeviceSetting = new AudioInputDeviceSetting(this._meetingSession)
        this._videoInputDeviceSetting = new VideoInputDeviceSetting(this._meetingSession)
        this._audioOutputDeviceSetting = new AudioOutputDeviceSetting(this._meetingSession)

        // (3) List devices
        //// chooseAudioOutputDevice uses the internal cache 
        //// so beforehand, we must get thses information. (auidoinput, videoinput are maybe optional)
        await this.meetingSession?.audioVideo.listAudioInputDevices()
        await this.meetingSession?.audioVideo.listVideoInputDevices()
        await this.meetingSession?.audioVideo.listAudioOutputDevices()
    }

    /**
     * (C) Enter Meeting Room
     */
    enterMeeting = async () => {
        if (!this.meetingSession) {
            console.log("[FlectChimeClient][enterMeeting] meetingsession is null?", this.meetingSession)
            throw new Error("meetingsession is null?")
        }

        // (1) prepair
        //// https://github.com/aws/amazon-chime-sdk-js/issues/502#issuecomment-652665492
        //// When stop preview, camera stream is terminated!!? So when enter meeting I rechoose Devices as workaround. (2)
        this.videoInputDeviceSetting?.stopPreview()

        // (2) subscribe AtttendeeId presence
        this.meetingSession.audioVideo.realtimeSubscribeToAttendeeIdPresence(async (attendeeId: string, present: boolean) => {
            console.log(`[FlectChimeClient][AttendeeIdPresenceSubscriber] ${attendeeId} present = ${present}`);
            if (present) {
                if (attendeeId in this._attendees === false) {
                    let userName = ""
                    if(attendeeId.indexOf("#")>0){                        
                        userName = attendeeId
                    }else{
                        try{
                            const result = await this._restApiClient.getUserNameByAttendeeId(this._meetingName!, attendeeId)
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
                        isVideoPaused:false,
                    }
                    if (attendeeId.split("#").length === 2) {
                        new_attendee.isSharedContent = true
                        new_attendee.ownerId = attendeeId.split("#")[0]
                    }
                    this._attendees[attendeeId] = new_attendee
                    

                    // Add Subscribe volume Indicator
                    this.meetingSession!.audioVideo.realtimeSubscribeToVolumeIndicator(attendeeId,
                        async (
                            attendeeId: string,
                            volume: number | null,
                            muted: boolean | null,
                            signalStrength: number | null
                        ) => {
                            this._attendees[attendeeId].volume = volume || 0
                            this._attendees[attendeeId].muted = muted || false
                            this._attendees[attendeeId].signalStrength = signalStrength || 0
                        }
                    )
                    this._attendeesUpdateListener(this._attendees)
                } else {
                    console.log(`[FlectChimeClient][AttendeeIdPresenceSubscriber]  ${attendeeId} is already in attendees`);
                }
                return;
            } else {
                // Delete Subscribe volume Indicator   
                this.meetingSession!.audioVideo.realtimeUnsubscribeFromVolumeIndicator(attendeeId)
                delete this._attendees[attendeeId]
                this._attendeesUpdateListener(this._attendees)
                return;
            }
        })

        // (3) subscribe ActiveSpeakerDetector
        this.meetingSession.audioVideo.subscribeToActiveSpeakerDetector(
            new DefaultActiveSpeakerPolicy(),
            (activeSpeakers: string[]) => {
                console.log("[FlectChimeClient][AttendeeIdPresenceSubscriber] Active Speaker::::::::::::::::::::", activeSpeakers)
                let activeSpeakerId:string|null = null
                for (const attendeeId in this._attendees) {
                    this._attendees[attendeeId].active = false;
                }
                for (const attendeeId of activeSpeakers) {
                    if (this._attendees[attendeeId]) {
                        this._attendees[attendeeId].active = true;
                        activeSpeakerId = attendeeId
                        break
                    }
                }
                if(this._activeSpeakerId !== activeSpeakerId){
                    this._activeSpeakerId = activeSpeakerId
                    this._activeSpekaerUpdateListener(this._activeSpeakerId)
                }
            },
            (scores: { [attendeeId: string]: number }) => {
                for (const attendeeId in scores) {
                    if (this._attendees[attendeeId]) {
                        this._attendees[attendeeId].score = scores[attendeeId];
                    }
                }
                this._attendeesUpdateListener(this._attendees)
            }, 5000)

        // (4) start 
        this.meetingSession?.audioVideo.start()
        await this.videoInputDeviceSetting!.setVideoInputEnable(true)
        await this.audioInputDeviceSetting!.setAudioInputEnable(true)
        await this.audioOutputDeviceSetting!.setAudioOutputEnable(true)

        // (5) enable chat
        this._chatClient = new RealtimeSubscribeChatClient(this)
        this._chatClient.setChatDataUpdateListener(this._chatDataUpdateListener)

    }

    /**
     * (D) leave meeting
     */
    leaveMeeting = async () => {
        if (!this.meetingSession) {
            console.log("[FlectChimeClient][leaveMeeting] meetingsession is null?", this.meetingSession)
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

    ///////////////////////////////////////////
    // Utility
    ///////////////////////////////////////////
    getContentTiles = () => {
        return Object.values(this._videoTileStates).filter(tile=>{return tile.isContent})
    }
    getActiveSpeakerTile = () => {
        if(this._activeSpeakerId && this._videoTileStates[this._activeSpeakerId]){
            return this._videoTileStates[this._activeSpeakerId] 
        }else{
            return null
        }
    }
    getTilesWithFilter = (excludeSpeaker:boolean, excludeSharedContent:boolean) =>{
        let targetTiles = Object.values(this._videoTileStates).filter(tile =>{
            if( excludeSharedContent && tile.isContent === true){
                return false
            }
            if(excludeSpeaker && tile.boundAttendeeId === this._activeSpeakerId){
                return false
            }

            if(!this._attendees[tile.boundAttendeeId!]){ // if attendees not found, show tile.
                return true
            }

            return this._attendees[tile.boundAttendeeId!].isVideoPaused === false
        })
        return targetTiles
    }

    setPauseVideo = async (attendeeId:string, pause:boolean) =>{
        if(this._attendees[attendeeId]){
            this._attendees[attendeeId].isVideoPaused = pause
            if(pause){
                if(this.meetingSession?.audioVideo.getVideoTile(this._videoTileStates[attendeeId].tileId!)?.state().localTile === false){
                    await this.meetingSession!.audioVideo.unbindVideoElement(this._videoTileStates[attendeeId].tileId!)
                    await this.meetingSession!.audioVideo.pauseVideoTile(this._videoTileStates[attendeeId].tileId!)
                }
            }else{
                await this.meetingSession!.audioVideo.unpauseVideoTile(this._videoTileStates[attendeeId].tileId!)
            }
            this._attendeesUpdateListener(this._attendees)
        }else{
        }
    }

    getUserNameByAttendeeIdFromList = (attendeeId: string) => {
        return this._attendees[attendeeId] ? this._attendees[attendeeId].name : attendeeId
    }    
}