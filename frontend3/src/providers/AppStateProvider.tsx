import React, { useContext, useState } from "react";
import { ReactNode } from "react";
import { awsConfiguration, DEFAULT_PASSWORD, DEFAULT_USERID } from "../Config";
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


type Props = {
    children: ReactNode;
};

interface AppStateValue {
    forceLoadCounter:number
    setForceLoadCounter: (val:number)=>void
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
    recorder: Recorder
    audioInputDeviceSetting: AudioInputDeviceSetting | undefined
    videoInputDeviceSetting: VideoInputDeviceSetting | undefined
    audioOutputDeviceSetting: AudioOutputDeviceSetting | undefined
    isShareContent:boolean
    activeSpeakerId:string|null
    recorderCanvas: HTMLCanvasElement | null
    setRecorderCanvas: (val:HTMLCanvasElement | null) => void

    /** For Device State */
    audioInputList: DeviceInfo[] | null
    videoInputList: DeviceInfo[] | null
    audioOutputList: DeviceInfo[] | null
    reloadDevices: () => void

    /** For Chat */
    chatData: RealtimeData[],
    sendChatData: (text: string) => void,
    
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
     } = useCredentials({
        UserPoolId:      awsConfiguration.userPoolId, 
        ClientId:        awsConfiguration.clientId,
        DefaultUserId:   DEFAULT_USERID,
        DefaultPassword: DEFAULT_PASSWORD,
    })
    const [ forceLoadCounter, setForceLoadCounter] = useState(0)  // If use this, it is not good solution. reconsider it. -> used in onetime code.


    const { meetingName, meetingId, joinToken, userName, attendeeId, attendees, videoTileStates, 
            createMeeting, joinMeeting, enterMeeting, leaveMeeting, 
            startShareScreen, stopShareScreen, getUserNameByAttendeeIdFromList,
            meetingSession, recorder, audioInputDeviceSetting, videoInputDeviceSetting, audioOutputDeviceSetting, isShareContent, activeSpeakerId,
            recorderCanvas, setRecorderCanvas,} = useMeetingState({userId, idToken, accessToken, refreshToken,})
    const { audioInputList, videoInputList, audioOutputList, reloadDevices } = useDeviceState()
    const { screenWidth, screenHeight} = useWindowSizeChangeListener()
    const { stage, setStage } = useStageManager({
        initialStage:query.get("mode") as STAGE|null,
    })
    const { messageActive, messageType, messageTitle, messageDetail, setMessage, resolveMessage } = useMessageState()
    const { chatData, sendChatData} = useRealtimeSubscribeChat({meetingSession, attendeeId})
    const logger = meetingSession?.logger
    const { addDrawingData, drawingData, lineWidth, setLineWidth, drawingStroke, setDrawingStroke, drawingMode, setDrawingMode } = useWebSocketWhiteBoard({meetingId, attendeeId, joinToken, logger})


    const providerValue = {
        forceLoadCounter,
        setForceLoadCounter,
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
        recorder,
        audioInputDeviceSetting, 
        videoInputDeviceSetting, 
        audioOutputDeviceSetting,
        isShareContent,
        activeSpeakerId,
        recorderCanvas, 
        setRecorderCanvas,

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

    };

    return (
        <AppStateContext.Provider value={providerValue} >
            {/* <EnvironmentStateProvider>
                <MessageStateProvider>
                    <SignInStateProvider>
                        <DeviceStateProvider>
                            <MeetingStateProvider>
                                <WebSocketStateProvider> */}
                                    {children}
                                {/* </WebSocketStateProvider>
                            </MeetingStateProvider>
                        </DeviceStateProvider>
                    </SignInStateProvider>
                </MessageStateProvider>
            </EnvironmentStateProvider> */}
        </AppStateContext.Provider>
    )
}