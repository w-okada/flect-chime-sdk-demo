import { useContext, useState, ReactNode, useReducer, Reducer } from "react"
import { useAppState } from "./AppStateProvider"
import React from "react"
import { DEFAULT_REGION } from "../constants";
import { ConsoleLogger, DefaultActiveSpeakerPolicy, DefaultDeviceController, DefaultMeetingSession, LogLevel, MeetingSessionConfiguration, VideoTileState } from "amazon-chime-sdk-js";
import * as api from '../api/api'
import { DeviceChangeObserverImpl } from "../observers/DeviceChangeObserverImpl";
import AudioVideoObserverTemplate from "../observers/AudioVideoObserver";
import { showDiff } from "../utils";
import { AudioInputDeviceSetting } from "./helper/AudioInputDeviceSetting";
import { VideoInputDeviceSetting } from "./helper/VideoInputDeviceSetting";
import { AudioOutputDeviceSetting } from "./helper/AudioOutputDeviceSetting";
import { Recorder } from "./helper/Recorder";

type Props = {
    children: ReactNode;
};

export interface AttendeeState {
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


interface MeetingStateValue {
    isLoading: boolean
    newTileState: VideoTileState | null
    stateCounter: number
    meetingSession: DefaultMeetingSession | null
    attendees: { [attendeeId: string]: AttendeeState }
    videoTileStates: { [attendeeId: string]: VideoTileState }

    meetingName: string | null
    userName: string | null
    region: string
    userAttendeeId: string
    setMeetingName: (val: string) => void
    setUserName: (val: string) => void
    setRegion: (val: string) => void
    setUserAttendeeId: (val: string) => void

    createMeeting: (meetingName: string, userName: string, region: string, userId: string, idToken: string, accessToken: string, refreshToken: string) => Promise<void>
    joinMeeting: (meetingName: string, userName: string, userId: string, idToken: string, accessToken: string, refreshToken: string) => Promise<void>

    enterMeetingRoom: () => Promise<void>
    leaveMeeting: () => void


    shareScreen: () => Promise<void>
    stopShareScreen: () => Promise<void>
    isScreenSharing: boolean
    inMeeting: boolean

    getUserNameByAttendeeIdFromList: (attendeeId: string) => string

    audioInputDeviceSetting: AudioInputDeviceSetting | null
    videoInputDeviceSetting: VideoInputDeviceSetting | null
    audioOutputDeviceSetting: AudioOutputDeviceSetting | null
    recorder: Recorder | null

}

const MeetingStateContext = React.createContext<MeetingStateValue | null>(null)

export const useMeetingState = (): MeetingStateValue => {
    const state = useContext(MeetingStateContext)
    if (!state) {
        throw new Error("Error using meeting in context!")
    }
    return state
}

type ChangeAttenndeeActionType = "ADD"|"DEL"|"CLEAR"
type ChangeAttenndeeAction = {type:ChangeAttenndeeActionType, attendeeId?:string, info?:AttendeeState}
const changeAttendeeReducer:Reducer<{ [attendeeId: string]: AttendeeState }, ChangeAttenndeeAction>  = (state:{ [attendeeId: string]: AttendeeState }, action:ChangeAttenndeeAction) =>{
    console.log("CHANGE ATENDEE", action)
    switch (action.type){        
        case 'ADD':
            state[action.attendeeId!]=action.info!
            return {...state}
        case 'DEL':
            delete state[action.attendeeId!]
            return {...state}
        case 'CLEAR':
            return {}
        default:
            return state
    }
}

export const MeetingStateProvider = ({ children }: Props) => {
    const [isLoading, setIsLoading] = useState(false)
    const { userId, idToken, accessToken, refreshToken } = useAppState()
    const [stateCounter, setStateCounter] = useState(0)

    // (3) InPreview(in waiting room), LocalVideoTile cannot be started...?
    // so we must manage flag whether user is in meeting or in waiting room.
    const [inMeeting, setInMeeting] = useState(false)


    const [meetingName, setMeetingName] = useState("")
    const [userName, setUserName] = useState("")
    const [region, setRegion] = useState(DEFAULT_REGION)
    const [userAttendeeId, setUserAttendeeId] = useState("")
    const [meetingSession, setMeetingSession] = useState(null as DefaultMeetingSession | null)
    // const [attendees, setAttendees] = useState({} as { [attendeeId: string]: AttendeeState })

    const [attendees, changeAttendees] = useReducer(changeAttendeeReducer, {})

    const [videoTileStates, setVideoTileStates] = useState({} as { [attendeeId: string]: VideoTileState })
    const [newTileState, setNewTileState] = useState(null as VideoTileState | null)

    const [isScreenSharing, setIsScreenSharing] = useState(false) // used for gui. toggle button.


    const [audioInputDeviceSetting, setAudioInputDeviceSetting] = useState(null as AudioInputDeviceSetting | null)
    const [videoInputDeviceSetting, setVideoInputDeviceSetting] = useState(null as VideoInputDeviceSetting | null)
    const [audioOutputDeviceSetting, setAudioOutputDeviceSetting] = useState(null as AudioOutputDeviceSetting | null)
    const [recorder, setRecorder] = useState(null as Recorder|null)
    if(!recorder){
        setRecorder(new Recorder())
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
    const stopShareScreen = async () => {
        meetingSession!.audioVideo.stopContentShare()
        setIsScreenSharing(false)
    }

    //////////////////////////////
    // Util
    //////////////////////////
    const getUserNameByAttendeeIdFromList = (attendeeId: string) => {
        return attendees[attendeeId] ? attendees[attendeeId].name : attendeeId
    }

    ////////////////////////
    // Attendee Management
    ///////////////////////
    const newAttendee = async (attendeeId: string) => {
        const attendeeName = await api.getUserNameByAttendeeId(meetingName, attendeeId, idToken, accessToken, refreshToken)
        let userName = ""
        if (attendeeName.result === "success") {
            userName = attendeeName.name
        } else {
            userName = attendeeId
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

        // Add Subscribe volume Indicator
        meetingSession?.audioVideo.realtimeSubscribeToVolumeIndicator(attendeeId,
            async (
                attendeeId: string,
                volume: number | null,
                muted: boolean | null,
                signalStrength: number | null
            ) => {
                new_attendee.volume = volume || 0
                new_attendee.muted = muted || false
                new_attendee.signalStrength = signalStrength || 0

                changeAttendees({
                    type:"ADD",
                    attendeeId:attendeeId,
                    info:new_attendee
                })
            }
        )
        return new_attendee
    }


    ////////////////////////
    // Meeting Operation
    ///////////////////////

    const createMeeting = async (meetingName: string, userName: string, region: string, userId: string, idToken: string, accessToken: string, refreshToken: string): Promise<void> => {
        setIsLoading(true)
        const p = new Promise<void>(async (resolve, reject) => {
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

    const joinMeeting = async (meetingName: string, userName: string, userId: string, idToken: string, accessToken: string, refreshToken: string): Promise<void> => {
        console.log("joining!!!!")
        setIsLoading(true)
        const p = new Promise<void>(async (resolve, reject) => {
            if (meetingName === "") {
                reject({ message: "Meeting name is invalid", code: "INVALID_MEETING_NAME" })
                setIsLoading(false)
                return
            }
            if (userName === "") {
                reject({ message: "Username is invalid", code: "INVALID_USER_NAME" })
                setIsLoading(false)
                return
            }

            const joinInfo = await api.joinMeeting(meetingName, userName, userId, idToken, accessToken, refreshToken)
            console.log("JoinInfo:", joinInfo)
            if (joinInfo['code']) {
                reject(joinInfo)
                setIsLoading(false)
                return
            }
            const meetingInfo = joinInfo.Meeting
            const attendeeInfo = joinInfo.Attendee

            const logger = new ConsoleLogger('MeetingLogs', LogLevel.OFF)
            const deviceController = new DefaultDeviceController(logger,{
                enableWebAudio: true,
              })
            const deviceChangeObserver = new DeviceChangeObserverImpl()
            deviceController.addDeviceChangeObserver(deviceChangeObserver)
            const configuration = new MeetingSessionConfiguration(meetingInfo, attendeeInfo)
            const meetingSession = new DefaultMeetingSession(configuration, logger, deviceController)
            class AudioVideoObserverImpl extends AudioVideoObserverTemplate {
                videoTileDidUpdate(tileState: VideoTileState) {
                    if (!tileState.boundAttendeeId) {
                        return
                    }
                    if (!videoTileStates[tileState.boundAttendeeId]) {
                        console.log("NEW TILE-", tileState)
                        videoTileStates[tileState.boundAttendeeId] = tileState
                        setNewTileState(tileState)
                        return
                    }

                    const prev_videoTileState = videoTileStates[tileState.boundAttendeeId]
                    showDiff(prev_videoTileState, tileState)

                    if (prev_videoTileState.tileId !== tileState.tileId) {
                        videoTileStates[tileState.boundAttendeeId] = tileState
                        setNewTileState(tileState)
                    } else {
                        videoTileStates[tileState.boundAttendeeId] = tileState
                    }
                }
                videoTileWasRemoved(tileId: number): void {
                    // There are the risk to overwrite new commer who is assgined same tileid, but tile id is generally incremented one by one
                    // so, the probability to have this problem is very low: TODO: fix
                    meetingSession?.audioVideo.unbindVideoElement(tileId)
                    setNewTileState(null)
                }
            }
            const audioVideoOserver = new AudioVideoObserverImpl()
            meetingSession.audioVideo.addObserver(audioVideoOserver)
            setMeetingSession(meetingSession)
            setUserAttendeeId(attendeeInfo.AttendeeId)

            setAudioInputDeviceSetting(new AudioInputDeviceSetting(meetingSession))
            setVideoInputDeviceSetting(new VideoInputDeviceSetting(meetingSession))
            setAudioOutputDeviceSetting(new AudioOutputDeviceSetting(meetingSession))


            //// chooseAudioOutputDevice uses the internal cache 
            //// so beforehand, we must get thses information. (auidoinput, videoinput are maybe optional)
            await meetingSession?.audioVideo.listAudioInputDevices()
            await meetingSession?.audioVideo.listVideoInputDevices()
            await meetingSession?.audioVideo.listAudioOutputDevices()


            setIsLoading(false)
            resolve()
        })
        return p
    }


    // const startPreview = (val: HTMLVideoElement) => {
    //     meetingSession?.audioVideo.startVideoPreviewForVideoInput(val)
    //     internal_setPreviewVideoElement(val)
    // }
    // const stopPreview = () => {
    //     if (previewVideoElement) {
    //         meetingSession?.audioVideo.stopVideoPreviewForVideoInput(previewVideoElement)
    //     }
    // }

    // const setAudioOutputElement = (val:HTMLAudioElement|null) => {
    //     if(val){
    //         meetingSession?.audioVideo.bindAudioElement(val);
    //     }
    //     internal_setAudioOutputElement(val)
    // }

    const enterMeetingRoom = async (): Promise<void> => {
        setIsLoading(true)

        const p = new Promise<void>(async (resolve, reject) => {
            if (!meetingSession) {
                console.log("meetingsession is null?", meetingSession)
                reject("meetingsession is null?")
                return
            }

            //https://github.com/aws/amazon-chime-sdk-js/issues/502#issuecomment-652665492
            // When stop preview, camera stream is terminated!!? So when enter meeting I rechoose Devices as workaround. (2)
            videoInputDeviceSetting?.stopPreview()


            let internalCounter = 0
            meetingSession.audioVideo.realtimeSubscribeToAttendeeIdPresence(async (attendeeId: string, present: boolean) => {
                console.log(`${attendeeId} present = ${present}`);
                if (!present) {
                    // Delete Subscribe volume Indicator   
                    meetingSession.audioVideo.realtimeUnsubscribeFromVolumeIndicator(attendeeId)
                    changeAttendees({
                        type:"DEL",
                        attendeeId: attendeeId
                    })
                    internalCounter += 1
                    setStateCounter(internalCounter)
                    return;
                } else {
                    if (attendeeId in attendees === false) {
                        const new_attendee = await newAttendee(attendeeId)
                        changeAttendees({
                            type:"ADD",
                            attendeeId: attendeeId,
                            info:new_attendee
                        })
                    }
                    return;
                }
            })

            meetingSession.audioVideo.subscribeToActiveSpeakerDetector(
                new DefaultActiveSpeakerPolicy(),
                (activeSpeakers: string[]) => {
                    for (const attendeeId in attendees) {
                        attendees[attendeeId].active = false;
                    }
                    for (const attendeeId of activeSpeakers) {
                        if (attendees[attendeeId]) {
                            attendees[attendeeId].active = true;
                            break
                        }
                    }
                    // internalCounter += 1
                    // setStateCounter(internalCounter)
                },
                (scores: { [attendeeId: string]: number }) => {
                    for (const attendeeId in scores) {
                        if (attendees[attendeeId]) {
                            attendees[attendeeId].score = scores[attendeeId];
                        }
                    }
                    // internalCounter += 1
                    // setStateCounter(internalCounter)
                }, 5000)

            meetingSession?.audioVideo.start()
            //meetingSession?.audioVideo.startLocalVideoTile()
            await videoInputDeviceSetting!.setVideoInputEnable(true)
            await audioInputDeviceSetting!.setAudioInputEnable(true)
            await audioOutputDeviceSetting!.setAudioOutputEnable(true)
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
        await audioInputDeviceSetting!.setAudioInput(null)
        await videoInputDeviceSetting!.setVideoInput(null)
        await audioOutputDeviceSetting!.setAudioOutput(null)

        videoInputDeviceSetting!.stopPreview()
        meetingSession?.audioVideo.stopLocalVideoTile()
        meetingSession?.audioVideo.stop()
        // virtualBackgroundProcessor?.destroy()
        setMeetingSession(null)
        changeAttendees({
            type: "CLEAR",
        })
        // (3)
        setInMeeting(false)
    }

    // console.log("ATENDEES_1", attendees)

    const providerValue = {
        meetingSession,
        stateCounter,
        attendees,
        videoTileStates,
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

        audioInputDeviceSetting,
        videoInputDeviceSetting,
        audioOutputDeviceSetting,
        recorder,

        createMeeting,
        joinMeeting,
        enterMeetingRoom,
        leaveMeeting,


        shareScreen,
        stopShareScreen,
        isScreenSharing,
        inMeeting,

        getUserNameByAttendeeIdFromList,
    }

    return (
        <MeetingStateContext.Provider value={providerValue}>
            {children}
        </MeetingStateContext.Provider>
    )
}
