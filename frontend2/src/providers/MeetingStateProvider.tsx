import { useContext, useState, ReactNode } from "react"
import { useAppState } from "./AppStateProvider"
import React from "react"
import routes from "../constants/routes";
import { DEFAULT_REGION } from "../constants";
import { Attendee, ConsoleLogger, DefaultActiveSpeakerPolicy, DefaultDeviceController, DefaultMeetingSession, DefaultVideoTransformDevice, LogLevel, MeetingSessionConfiguration, VideoTileState } from "amazon-chime-sdk-js";
import * as api from '../api/api'
import { DeviceChangeObserverImpl } from "../observers/DeviceChangeObserverImpl";
import AudioVideoObserverTemplate from "../observers/AudioVideoObserver";
import { activeSpeakerDetectorSubscriber, attendeeIdPresenceSubscriber } from "../observers/subscriber";
import { VirtualBackground, VirtualBackgroundType } from "../frameProcessors/VirtualBackground";

type Props = {
    children: ReactNode;
};

export interface AttendeeState{
    attendeeId: string
    name: string
    active: boolean
    volume: number
    muted: boolean
    paused: boolean
    signalStrength: number
}


interface MeetingStateValue {
    isLoading: boolean
    newTileState: VideoTileState | null
    stateCounter: number
    meetingSession: DefaultMeetingSession | null
    attendees: { [attendeeId: string]: AttendeeState }

    meetingName: string | null
    userName: string | null
    region: string
    userAttendeeId: string
    setMeetingName: (val: string) => void
    setUserName: (val: string) => void
    setRegion: (val: string) => void
    setUserAttendeeId: (val: string) => void



    audioInput: string | null
    videoInput: string | MediaStream | null
    virtualBG: VirtualBackgroundType | null
    audioOutput: string | null
    setAudioInput: (val: string | null) => void
    setVideoInput: (val: string | MediaStream | null) => void
    setVirtualBG: (val: VirtualBackgroundType | null) => void
    setAudioOutput: (val: string | null) => void


    audioInputEnable:  boolean
    videoInputEnable:  boolean
    audioOutputEnable: boolean
    setAudioInputEnable:  (val:boolean)=>void
    setVideoInputEnable:  (val:boolean)=>void
    setAudioOutputEnable: (val:boolean)=>void
    setAudioOutputElement: (val: HTMLAudioElement | null) => void

    // meetingSession: DefaultMeetingSession | null
    // joinMeeting: (meetingTitle: string, userName: string) => void

    createMeeting: (meetingName: string, userName: string, region: string, userId: string, idToken: string, accessToken: string, refreshToken: string) =>Promise<void>
    joinMeeting: (meetingName: string, userName: string, userId: string, idToken: string, accessToken: string, refreshToken: string) => Promise<void>

    startPreview: (val: HTMLVideoElement) => void
    enterMeetingRoom: () => Promise<void>
    leaveMeeting: () => void


    shareScreen:() => Promise<void>
    stopShareScreen:() => Promise<void>
    isScreenSharing:boolean

    getUserNameByAttendeeIdFromList: (attendeeId:string) => string
}

const MeetingStateContext = React.createContext<MeetingStateValue | null>(null)

export const useMeetingState = (): MeetingStateValue => {
    const state = useContext(MeetingStateContext)
    if (!state) {
        throw new Error("Error using meeting in context!")
    }
    return state
}

export const MeetingStateProvider = ({ children }: Props) => {
    const [isLoading, setIsLoading] = useState(false)
    const { userId, idToken, accessToken, refreshToken } = useAppState()
    const [ stateCounter, setStateCounter] = useState(0)

    // (3) InPreview(in waiting room), LocalVideoTile cannot be started...?
    // so we must manage flag whether user is in meeting or in waiting room.
    const [ inMeeting, setInMeeting] = useState(false)


    const [meetingName, setMeetingName] = useState("")
    const [userName, setUserName] = useState("")
    const [region, setRegion] = useState(DEFAULT_REGION)
    const [userAttendeeId, setUserAttendeeId] = useState("")
    const [meetingSession, setMeetingSession] = useState(null as DefaultMeetingSession | null)
    const [attendees, setAttendees] = useState({} as { [attendeeId: string]: AttendeeState })
    const [newTileState, setNewTileState] = useState(null as VideoTileState | null)

    const [audioInput, internal_setAudioInput] = useState(null as string | null)
    const [videoInput, internal_setVideoInput] = useState(null as string | MediaStream | null)
    const [virtualBG, internal_setVirtualBG] = useState(null as VirtualBackgroundType | null)
    const [audioOutput, internal_setAudioOutput] = useState(null as string | null)

    const [audioInputEnable,  internal_setAudioInputEnable]  = useState(true)
    const [videoInputEnable,  internal_setVideoInputEnable]  = useState(true)
    const [audioOutputEnable, internal_setAudioOutputEnable] = useState(true)


    const [isScreenSharing, setIsScreenSharing] = useState(false)


    const [virtualBackgroundProcessor, setVirtualBackgroundProcessor] = useState(null as VirtualBackground | null)
    if (virtualBackgroundProcessor === null) {
        console.log("newVBGP")
        setVirtualBackgroundProcessor(new VirtualBackground())
    }
    const [previewVideoElement, setPreviewVideoElement] = useState(null as HTMLVideoElement | null)
    const [audioOutputElement, internal_setAudioOutputElement] = useState(null as HTMLAudioElement | null)

    ////////////////////////
    // Device Setting
    ///////////////////////
    const setAudioInput = async (val: string | null) => {
        if(audioInputEnable){
            await meetingSession?.audioVideo.chooseAudioInputDevice(val)
        }else{
            await meetingSession?.audioVideo.chooseAudioInputDevice(null)
        }
        internal_setAudioInput(val)
    }
    const setVideoInput = async (val: string | MediaStream | null) => {
        if(videoInputEnable){
            await setupVideoInput(val, virtualBG)
        }else{
            await setupVideoInput(null, virtualBG)
        }
        internal_setVideoInput(val)
    }

    const setVirtualBG = async (val: VirtualBackgroundType | null) => {
        if(videoInputEnable){
            await setupVideoInput(videoInput, val)
        }else{
            await setupVideoInput(null, val)
        }
        internal_setVirtualBG(val)
    }
    const setupVideoInput = async (video: string | MediaStream | null, vbg: VirtualBackgroundType | null) => {
        if (video) {
            console.log("video1, ",video)
            if (vbg) {
                console.log("video2, ",vbg)
                const videoProcessor = new DefaultVideoTransformDevice(
                    new ConsoleLogger('MeetingLogs', LogLevel.OFF),
                    video, // device id string
                    [virtualBackgroundProcessor!])
                await meetingSession?.audioVideo.chooseVideoInputDevice(videoProcessor)
                virtualBackgroundProcessor!.setVirtualBackgroundType(vbg)
            } else {
                await meetingSession?.audioVideo.chooseVideoInputDevice(video)
            }
            // (3)
            if(inMeeting){
                console.log("video3, ")
                meetingSession?.audioVideo.startLocalVideoTile()
            }else{
                console.log("video4, ")
                // stopPreview()
                // if(previewVideoElement){
                //     startPreview(previewVideoElement)
                // }
            }
        } else {
            console.log("video55, ")

            await meetingSession!.audioVideo.chooseVideoInputDevice(null)
            if(inMeeting){
                console.log("video5, ")
                meetingSession?.audioVideo.startLocalVideoTile()
            }else{
                console.log("video6, ")

                stopPreview()
                if(previewVideoElement){
                    startPreview(previewVideoElement)
                }
            }
        }
    }

    const setAudioOutput = async (val: string | null) => {
        if(audioOutputEnable){
            await meetingSession?.audioVideo.chooseAudioOutputDevice(val)
        }else{
            await meetingSession?.audioVideo.chooseAudioOutputDevice(null)
        }
        if(audioOutputElement){
            meetingSession?.audioVideo.bindAudioElement(audioOutputElement);
        }
    internal_setAudioOutput(val)
    }

    const setAudioInputEnable = async (val:boolean) => {
        if(val){
            await meetingSession?.audioVideo.chooseAudioInputDevice(audioInput)
        }else{
            await meetingSession?.audioVideo.chooseAudioInputDevice(null)
        }
        internal_setAudioInputEnable(val)
    }
    const setVideoInputEnable = async (val:boolean) => {
        if(val){
            await setupVideoInput(videoInput, virtualBG)
        }else{
            await setupVideoInput(null, virtualBG)
        }
        internal_setVideoInputEnable(val)
    }
    const setAudioOutputEnable = async (val:boolean) => {
        if(val){
            console.log("audio not null", val, audioOutput)
            if(audioOutputElement){
                await meetingSession?.audioVideo.bindAudioElement(audioOutputElement)
            }
            await meetingSession?.audioVideo.chooseAudioOutputDevice(audioOutput)
        }else{
            console.log("audio null")
            await meetingSession!.audioVideo.chooseAudioOutputDevice(null)
            meetingSession!.audioVideo.unbindAudioElement()
        }        
        internal_setAudioOutputEnable(val)
    }
    

    ////////////////////////
    // Features
    ///////////////////////
    const shareScreen = async () => {
        // meetingSession?.audioVideo.startContentShareFromScreenCapture
        const streamConstraints = {
            frameRate: {
                max: 15,
            },
        }        
        // @ts-ignore https://github.com/microsoft/TypeScript/issues/31821
        navigator.mediaDevices.getDisplayMedia(streamConstraints).then(media => {
            meetingSession!.audioVideo.startContentShare(media)
            setIsScreenSharing(true)
        })        
    }
    const stopShareScreen = async () =>{
        meetingSession!.audioVideo.stopContentShare()
        setIsScreenSharing(false)
    }

    //////////////////////////////
    // Util
    //////////////////////////
    const getUserNameByAttendeeIdFromList = (attendeeId:string) =>{
        return attendees[attendeeId].name
    }

    ////////////////////////
    // Meeting Operation
    ///////////////////////

    const createMeeting = async (meetingName: string, userName: string, region: string, userId: string, idToken: string, accessToken: string, refreshToken: string):Promise<void> => {
        setIsLoading(true)
        const p = new Promise<void>(async(resolve, reject)=>{
            const res = await api.createMeeting(meetingName, userName, region, userId, idToken, accessToken, refreshToken)
            setIsLoading(false)
            if (res.created) {
                resolve()
            } else {
                reject(res)
                return
            }
        })
        return p
    }

    const joinMeeting = async (meetingName: string, userName: string, userId: string, idToken: string, accessToken: string, refreshToken: string):Promise<void> => {
        console.log("joining!!!!")
        setIsLoading(true)
        const p = new Promise<void>(async (resolve, reject)=>{
            
            const joinInfo = await api.joinMeeting(meetingName, userName, userId, idToken, accessToken, refreshToken)
            console.log("JoinInfo:", joinInfo)
            if(joinInfo['code']){
                reject(joinInfo)
                setIsLoading(false)
                return
            }
            const meetingInfo = joinInfo.Meeting
            const attendeeInfo = joinInfo.Attendee

            const logger = new ConsoleLogger('MeetingLogs', LogLevel.OFF)
            const deviceController = new DefaultDeviceController(logger)
            const deviceChangeObserver = new DeviceChangeObserverImpl()
            deviceController.addDeviceChangeObserver(deviceChangeObserver)
            const configuration = new MeetingSessionConfiguration(meetingInfo, attendeeInfo)
            const meetingSession = new DefaultMeetingSession(configuration, logger, deviceController)
            class AudioVideoObserverImpl extends AudioVideoObserverTemplate {
                videoTileDidUpdate(tileState: VideoTileState): void {
                    setNewTileState(tileState)
                }
                videoTileWasRemoved(): void {
                    setNewTileState(null)
                }
            }
            const audioVideoOserver = new AudioVideoObserverImpl()
            meetingSession.audioVideo.addObserver(audioVideoOserver)
            let internalCounter = 0
            meetingSession.audioVideo.realtimeSubscribeToAttendeeIdPresence(async (attendeeId: string, present: boolean)=>{
                console.log(`${attendeeId} present = ${present}`);
                if (!present) {
                    // Delete from Attendee List
                    delete attendees[attendeeId]
                    // Delete Subscribe volume Indicator   
                    meetingSession.audioVideo.realtimeUnsubscribeFromVolumeIndicator(attendeeId)
                    ///// same as (1)
                    // setAttendees(attendees)
                    internalCounter += 1
                    setStateCounter(internalCounter)                    
                    return;
                }else{
                    if(attendeeId in attendees === false){
                        const attendeeName = await api.getUserNameByAttendeeId(meetingName, attendeeId, idToken, accessToken, refreshToken)
                        // Add to Attendee List
                        const new_attendee:AttendeeState = {
                            attendeeId: attendeeId,
                            name: attendeeName.name,
                            active: false,
                            volume: 0,
                            muted: false,
                            paused: false,
                            signalStrength: 0
                        }
                        attendees[attendeeId] = new_attendee

                        // Add Subscribe volume Indicator
                        meetingSession.audioVideo.realtimeSubscribeToVolumeIndicator(attendeeId,
                            async (
                                attendeeId: string,
                                volume: number | null,
                                muted: boolean | null,
                                signalStrength: number | null
                            ) => {
                                attendees[attendeeId].volume = volume || 0
                                attendees[attendeeId].muted = muted || false
                                attendees[attendeeId].signalStrength =  signalStrength ||0
                                //// multiple user join at the same time, there are the risk conflict the timing to update and overwritten.
                                //// -> skip "clone and set the attribute" and only update the contents of array --- (1)
                                // setAttendees(attendees)
                                internalCounter += 1
                                setStateCounter(internalCounter)
                            }
                        )
                        // update attendees
                        ///// same as (1)
                        //setAttendees(attendees)
                        internalCounter += 1
                        setStateCounter(internalCounter)
                    }
                    return;
                }
            })
            meetingSession.audioVideo.subscribeToActiveSpeakerDetector(
                new DefaultActiveSpeakerPolicy(),
                activeSpeakers =>{
                    activeSpeakers.forEach(s =>{
                        // console.log("Active speacker score1:", s)
                    })
                },
                scores => {
                    // console.log("Active speacker score2:", scores)
                }, 
                100)
            setMeetingSession(meetingSession)
            setUserAttendeeId(attendeeInfo.AttendeeId)

            setIsLoading(false)
            resolve()
        })
        return p
    }


    const startPreview = (val: HTMLVideoElement) => {
        meetingSession?.audioVideo.startVideoPreviewForVideoInput(val)
        setPreviewVideoElement(val)
    }
    const stopPreview = () => {
        if (previewVideoElement) {
            meetingSession?.audioVideo.stopVideoPreviewForVideoInput(previewVideoElement)
        }
    }
    const setAudioOutputElement = (val:HTMLAudioElement|null) => {
        if(val){
            meetingSession?.audioVideo.bindAudioElement(val);
        }
        internal_setAudioOutputElement(val)
    }

    const enterMeetingRoom = async ():Promise<void> => {
        setIsLoading(true)

        const p = new Promise<void>(async(resolve, reject)=>{
            if (!meetingSession) {
                console.log("meetingsession is null?", meetingSession)
                reject("meetingsession is null?")
            }

            //https://github.com/aws/amazon-chime-sdk-js/issues/502#issuecomment-652665492
            // When stop preview, camera stream is terminated!!? So when enter meeting I rechoose Devices as workaround. (2)
            stopPreview()
            if(audioOutputElement){
                await meetingSession?.audioVideo.bindAudioElement(audioOutputElement);
            }

            await meetingSession?.audioVideo.chooseAudioInputDevice(audioInput)
            await meetingSession?.audioVideo.chooseAudioOutputDevice(audioOutput)
            await setupVideoInput(videoInput, virtualBG)

            meetingSession?.audioVideo.start()
            meetingSession?.audioVideo.startLocalVideoTile()
            // (3)
            setInMeeting(true)
            setIsLoading(false)
            resolve()

        })
    }

    const leaveMeeting = async () => {
        if (!meetingSession) {
            console.log("meetingsession is null?", meetingSession)
            return
        }
        await meetingSession?.audioVideo.chooseAudioInputDevice(null)
        await meetingSession?.audioVideo.chooseVideoInputDevice(null)
        await meetingSession?.audioVideo.chooseAudioOutputDevice(null)
        internal_setVideoInput(null)
        internal_setAudioOutput(null)
        internal_setAudioInput(null)
        internal_setVirtualBG(null)

        stopPreview()
        meetingSession?.audioVideo.stopLocalVideoTile()
        meetingSession?.audioVideo.stop()
        // virtualBackgroundProcessor?.destroy()
        setMeetingSession(null)
        setAttendees({})        
        // (3)
        setInMeeting(false)
    }



    console.log("ATENDEES", attendees)


    const providerValue = {
        meetingSession,
        stateCounter,
        attendees,
        isLoading,
        newTileState,

        meetingName,
        userName,
        region,
        userAttendeeId,
        setMeetingName,
        setUserName,
        setRegion,
        setUserAttendeeId,

        audioInput,
        videoInput,
        virtualBG,
        audioOutput,
        setAudioInput,
        setVideoInput,
        setVirtualBG,
        setAudioOutput,
        audioInputEnable,
        videoInputEnable,
        audioOutputEnable,
        setAudioInputEnable,
        setVideoInputEnable,
        setAudioOutputEnable,
        setAudioOutputElement,

        createMeeting,
        joinMeeting,
        startPreview,
        enterMeetingRoom,
        leaveMeeting,


        shareScreen,
        stopShareScreen,
        isScreenSharing,


        getUserNameByAttendeeIdFromList,
    }

    return (
        <MeetingStateContext.Provider value={providerValue}>
            {children}
        </MeetingStateContext.Provider>
    )
}
