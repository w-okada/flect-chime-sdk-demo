import { useContext, useState, ReactNode } from "react"
import { useAppState } from "./AppStateProvider"
import React from "react"
import routes from "../constants/routes";
import { DEFAULT_REGION } from "../constants";
import { ConsoleLogger, DefaultActiveSpeakerPolicy, DefaultDeviceController, DefaultMeetingSession, DefaultVideoTransformDevice, LogLevel, MeetingSessionConfiguration, VideoTileState } from "amazon-chime-sdk-js";
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
    setMeetingName: (val: string) => void
    setUserName: (val: string) => void
    setRegion: (val: string) => void


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

    // meetingSession: DefaultMeetingSession | null
    // joinMeeting: (meetingTitle: string, userName: string) => void

    createMeeting: (meetingName: string, userName: string, region: string, userId: string, idToken: string, accessToken: string, refreshToken: string) =>Promise<void>
    joinMeeting: (meetingName: string, userName: string, userId: string, idToken: string, accessToken: string, refreshToken: string) => Promise<void>

    startPreview: (val: HTMLVideoElement) => void
    enterMeetingRoom: () => Promise<void>
    leaveMeeting: () => void
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

    const [virtualBackgroundProcessor, setVirtualBackgroundProcessor] = useState(null as VirtualBackground | null)
    if (virtualBackgroundProcessor === null) {
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
            if (vbg) {
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
                meetingSession?.audioVideo.startLocalVideoTile()
            }else{
                // stopPreview()
                // if(previewVideoElement){
                //     startPreview(previewVideoElement)
                // }
            }
        } else {
            await meetingSession!.audioVideo.chooseVideoInputDevice(null)
            if(inMeeting){
                meetingSession?.audioVideo.startLocalVideoTile()
            }else{
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
            await meetingSession?.audioVideo.chooseAudioOutputDevice(audioOutput)
        }else{
            await meetingSession?.audioVideo.chooseAudioOutputDevice(null)
        }        
        internal_setAudioOutputEnable(val)
    }
    



    ////////////////////////
    // Meeting Operation
    ///////////////////////

    const createMeeting = async (meetingName: string, userName: string, region: string, userId: string, idToken: string, accessToken: string, refreshToken: string):Promise<void> => {
        const p = new Promise<void>(async(resolve, reject)=>{
            const res = await api.createMeeting(meetingName, userName, region, userId, idToken, accessToken, refreshToken)
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
        const p = new Promise<void>(async (resolve, reject)=>{
            
            const joinInfo = await api.joinMeeting(meetingName, userName, userId, idToken, accessToken, refreshToken)
            console.log("JoinInfo:", joinInfo)
            if(joinInfo['code']){
                reject(joinInfo)
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
        stopPreview()
        meetingSession?.audioVideo.stopLocalVideoTile()
        virtualBackgroundProcessor?.destroy()
        setMeetingSession(null)
        // (3)
        setInMeeting(false)
    }



    const providerValue = {
        meetingSession,
        stateCounter,
        attendees,
        isLoading,
        newTileState,

        meetingName,
        userName,
        region,

        setMeetingName,
        setUserName,
        setRegion,

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


        createMeeting,
        joinMeeting,
        startPreview,
        enterMeetingRoom,
        leaveMeeting,
    }

    return (
        <MeetingStateContext.Provider value={providerValue}>
            {children}
        </MeetingStateContext.Provider>
    )
}
