import React, { useContext, useState } from "react";
import { ReactNode } from "react";
import { AttendeeState } from "./helper/ChimeClient";
import { useCredentials } from "./hooks/useCredentials";
import { useMeetingState } from "./hooks/useMeetingState";
import { MessageType, useMessageState } from "./hooks/useMessageState";
import { STAGE, useStageManager } from "./hooks/useStageManager";
import { useWindowSizeChangeListener } from "./hooks/useWindowSizeChange";
import { DefaultMeetingSession, VideoTileState } from "amazon-chime-sdk-js";
import { useDeviceState } from "./hooks/useDeviceState";
import { DeviceInfo } from "../utils";
import { AudioInputDeviceSetting } from "./helper/AudioInputDeviceSetting";
import { VideoInputDeviceSetting } from "./helper/VideoInputDeviceSetting";
import { AudioOutputDeviceSetting } from "./helper/AudioOutputDeviceSetting";
import { useRealtimeSubscribeChat } from "./hooks/RealtimeSubscribers/useRealtimeSubscribeChat";
import { RealtimeData } from "./hooks/RealtimeSubscribers/const";
import { DrawingMode, useWebSocketWhiteBoard } from "./hooks/WebSocketApp/useWebSocketWhiteBoard";
import { DrawingData } from "./hooks/WebSocketApp/helper/WebSocketWhiteBoardClient";
import { Recorder } from "./helper/Recorder";
import { OnetimeCodeInfo, OnetimeCodeSigninResult } from "../api/api";
import { AmongUsStatus, HMMMessage, HMMStatus, useRealtimeSubscribeHMM } from "./hooks/RealtimeSubscribers/useRealtimeSubscribeHMM";
import { useScheduler } from "./hooks/useScheduler";
import { awsConfiguration, DEFAULT_PASSWORD, DEFAULT_USERID } from "../Config";
import { GameState } from "./hooks/RealtimeSubscribers/useAmongUs";


type Props = {
    children: ReactNode;
};

type APP_MODE = "chime" | "amongus"


interface AppStateValue {
    mode: APP_MODE,
    /** For Credential */
    userId?: string,
    password?: string,
    idToken?: string,
    accessToken?: string,
    refreshToken?: string,
    handleSignIn: (inputUserId: string, inputPassword: string) => Promise<void>
    handleSignUp: (inputUserId: string, inputPassword: string) => Promise<void>
    handleVerify: (inputUserId: string, inputVerifyCode: string) => Promise<void>
    handleResendVerification: (inputUserId: string) => Promise<void>
    handleSendVerificationCodeForChangePassword: (inputUserId: string) => Promise<void>
    handleNewPassword: (inputUserId: string, inputVerifycode: string, inputPassword: string) => Promise<void>
    handleSignOut: (inputUserId: string) => Promise<void>
    onetimeCodeInfo: OnetimeCodeInfo | null,
    handleSinginWithOnetimeCodeRequest: (meetingName: string, attendeeId: string, uuid: string) => Promise<OnetimeCodeInfo>,
    handleSinginWithOnetimeCode: (meetingName: string, attendeeId: string, uuid: string, code: string) => Promise<OnetimeCodeSigninResult>
    // handleSinginWithOnetimeCodeRequest_dummy: (meetingName: string, attendeeId: string, uuid: string) => Promise<OnetimeCodeInfo>,

    /** For MeetingState */
    meetingName?:string, 
    userName?:string,
    attendeeId?:string,
    attendees: {[attendeeId: string]: AttendeeState}
    videoTileStates: {[attendeeId: string]: VideoTileState}
    
    createMeeting: (meetingName: string, userName: string, region: string) => Promise<{created: boolean, meetingName: string, meetingId: string}>
    joinMeeting: (meetingName: string, userName: string) => Promise<void>
    enterMeeting: () => Promise<void>
    leaveMeeting: () => Promise<void>
    startShareScreen: () => Promise<void>
    stopShareScreen: () => Promise<void>
    getUserNameByAttendeeIdFromList: (attendeeId: string) => string
    meetingSession: DefaultMeetingSession | undefined
    activeRecorder: Recorder
    allRecorder: Recorder
    audioInputDeviceSetting: AudioInputDeviceSetting | undefined
    videoInputDeviceSetting: VideoInputDeviceSetting | undefined
    audioOutputDeviceSetting: AudioOutputDeviceSetting | undefined
    isShareContent:boolean
    activeSpeakerId:string|null

    countAttendees:()=>void

    updateMeetingInfo: ()=>void
    ownerId:string
    isOwner:boolean
    /** For Device State */
    audioInputList: DeviceInfo[] | null
    videoInputList: DeviceInfo[] | null
    audioOutputList: DeviceInfo[] | null
    reloadDevices: () => void

    /** For Chat */
    chatData: RealtimeData[],
    sendChatData: (text: string) => void,
    /** For HMM(Headless Meeting Manager) */
    sendHMMCommand: (mess: HMMMessage) => void,
    hMMCommandData: RealtimeData[],
    startHMM:()=>void,
    updateHMMInfo:()=>void,
    publicIp:string,

    sendStartRecord:()=>void, 
    sendStopRecord:()=>void, 
    sendStartShareTileView:()=>void, 
    sendStopShareTileView:()=>void, 
    sendTerminate:()=>void, 
    sendHMMStatus:(active: boolean, recording: boolean, shareTileView: boolean)=>void,
    
    sendRegisterAmongUsUserName: (userName: string, attendeeId: string) => void
    // recordingEnable: boolean, 
    // shareTileViewEnable: boolean, 
    // terminateTriggerd: boolean, 
    startRecordingCounter:number, 
    stopRecordingCounter:number, 
    startShareTileViewCounter:number, 
    stopShareTileViewCounter:number, 
    terminateCounter:number,
    hMMStatus: HMMStatus,
    stateLastUpdate: number,

    updateGameState: (ev: string, data: string) => void
    currentGameState: GameState
    /** For WhiteBoard */
    addDrawingData: ((data: DrawingData) => void) | undefined
    drawingData: DrawingData[]
    lineWidth: number
    setLineWidth: (val:number) => void,
    drawingStroke: string
    setDrawingStroke: (val:string) => void,
    drawingMode: keyof typeof DrawingMode
    setDrawingMode: (val: keyof typeof DrawingMode) => void




    screenWidth: number
    screenHeight: number

    /** For StageManager */
    stage:STAGE,
    setStage: (stage:STAGE) => void
    


    /** For Message*/
    messageActive: boolean, 
    messageType: MessageType, 
    messageTitle: string,
    messageDetail: string[], 
    setMessage: (type: MessageType, title: string, detail: string[]) => void,
    resolveMessage: () => void,

    // /** For Scheduler*/
    // tenSecondsTaskTrigger:number,

}

const AppStateContext = React.createContext<AppStateValue | null>(null);

export const useAppState = (): AppStateValue => {
    const state = useContext(AppStateContext);
    if (!state) {
        throw new Error('useAppState must be used within AppStateProvider');
    }
    return state;
}


const query = new URLSearchParams(window.location.search);

export const AppStateProvider = ({ children }: Props) => {
    const { 
        userId, password, idToken, accessToken, refreshToken,
        handleSignIn, 
        handleSignUp, 
        handleVerify, 
        handleResendVerification,
        handleSendVerificationCodeForChangePassword,
        handleNewPassword,
        handleSignOut,
        onetimeCodeInfo,
        handleSinginWithOnetimeCodeRequest,
        handleSinginWithOnetimeCode,
        // handleSinginWithOnetimeCodeRequest_dummy,
     } = useCredentials({
        UserPoolId:      awsConfiguration.userPoolId, 
        ClientId:        awsConfiguration.clientId,
        DefaultUserId:   DEFAULT_USERID,
        DefaultPassword: DEFAULT_PASSWORD,
    })

    const { meetingName, meetingId, joinToken, userName, attendeeId, attendees, videoTileStates, 
            createMeeting, joinMeeting, enterMeeting, leaveMeeting, 
            startShareScreen, stopShareScreen, getUserNameByAttendeeIdFromList,
            meetingSession, activeRecorder, allRecorder, audioInputDeviceSetting, videoInputDeviceSetting, audioOutputDeviceSetting, isShareContent, activeSpeakerId,countAttendees,
            updateMeetingInfo, ownerId, isOwner
           } = useMeetingState({userId, idToken, accessToken, refreshToken,})
    const { audioInputList, videoInputList, audioOutputList, reloadDevices } = useDeviceState()
    const { screenWidth, screenHeight} = useWindowSizeChangeListener()
    const { stage, setStage } = useStageManager({
        initialStage:query.get("stage") as STAGE|null,
    })
    const { messageActive, messageType, messageTitle, messageDetail, setMessage, resolveMessage } = useMessageState()
    const { chatData, sendChatData} = useRealtimeSubscribeChat({meetingSession, attendeeId})
    const { sendHMMCommand, hMMCommandData, startHMM, updateHMMInfo, publicIp, 
            sendStartRecord, sendStopRecord, sendStartShareTileView, sendStopShareTileView, sendTerminate, sendHMMStatus, sendRegisterAmongUsUserName,
            startRecordingCounter, stopRecordingCounter, startShareTileViewCounter, stopShareTileViewCounter, terminateCounter, hMMStatus, stateLastUpdate,
            updateGameState, currentGameState,
          } = useRealtimeSubscribeHMM({meetingSession, attendeeId, meetingName, idToken, accessToken, refreshToken})

    const logger = meetingSession?.logger
    const { addDrawingData, drawingData, lineWidth, setLineWidth, drawingStroke, setDrawingStroke, drawingMode, setDrawingMode } = useWebSocketWhiteBoard({meetingId, attendeeId, joinToken, logger})
    
    const [ mode, setMode ] = useState(query.get("mode") as APP_MODE| "chime" )

    // const { tenSecondsTaskTrigger } = useScheduler()


    const providerValue = {
        mode,
        /** For Credential */
        userId,
        password, 
        idToken, 
        accessToken, 
        refreshToken,
        handleSignIn,
        handleSignUp,
        handleVerify,
        handleResendVerification,
        handleSendVerificationCodeForChangePassword,
        handleNewPassword,
        handleSignOut,
        onetimeCodeInfo,
        handleSinginWithOnetimeCodeRequest,
        handleSinginWithOnetimeCode,
        // handleSinginWithOnetimeCodeRequest_dummy,

        /** For MeetingState */
        meetingName, 
        userName,
        attendeeId,
        attendees,
        videoTileStates,
        createMeeting,
        joinMeeting,
        enterMeeting,
        leaveMeeting,
        startShareScreen,
        stopShareScreen,
        getUserNameByAttendeeIdFromList,
        meetingSession,
        activeRecorder,
        allRecorder,
        audioInputDeviceSetting, 
        videoInputDeviceSetting, 
        audioOutputDeviceSetting,
        isShareContent,
        activeSpeakerId,

        countAttendees,

        updateMeetingInfo,
        ownerId,
        isOwner,
        /** For Device State */
        audioInputList,
        videoInputList,
        audioOutputList,
        reloadDevices,


        screenWidth,
        screenHeight,

        /** For Chat */
        chatData, 
        sendChatData,
        /** For HMM(Headless Meeting Manager) */
        sendHMMCommand,
        hMMCommandData,
        startHMM,
        updateHMMInfo,
        publicIp,

        sendStartRecord, 
        sendStopRecord, 
        sendStartShareTileView, 
        sendStopShareTileView, 
        sendTerminate, 
        sendHMMStatus,

        sendRegisterAmongUsUserName,
        updateGameState,
        currentGameState,
        // recordingEnable, 
        // shareTileViewEnable, 
        // terminateTriggerd, 
        startRecordingCounter, 
        stopRecordingCounter, 
        startShareTileViewCounter, 
        stopShareTileViewCounter, 
        terminateCounter,
        hMMStatus,
        stateLastUpdate,
        /** For StageManager */
        stage,
        setStage,
        /** For WhiteBoard */
        addDrawingData, 
        drawingData, 
        lineWidth, 
        setLineWidth, 
        drawingStroke, 
        setDrawingStroke, 
        drawingMode, 
        setDrawingMode,

        /** For Message*/
        messageActive, 
        messageType, 
        messageTitle,
        messageDetail, 
        setMessage,
        resolveMessage,

        // /** For Scheduler */
        // tenSecondsTaskTrigger,
    };

    return (
        <AppStateContext.Provider value={providerValue} >
            {children}
        </AppStateContext.Provider>
    )
}
