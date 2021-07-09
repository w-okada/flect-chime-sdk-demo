import React, { useContext, useMemo, useState } from "react";
import { ReactNode } from "react";
// import { AttendeeState } from "./helper/ChimeClient";
// import { useCredentials } from "./hooks/useCredentials";
// import { useMeetingState } from "./hooks/useMeetingState";
import { MessageType, useMessageState } from "./hooks/useMessageState";
import { STAGE, useStageManager } from "./hooks/useStageManager";
// import { useWindowSizeChangeListener } from "./hooks/useWindowSizeChange";
// import { DefaultMeetingSession, VideoTileState } from "amazon-chime-sdk-js";
// import { useDeviceState } from "./hooks/useDeviceState";
// import { DeviceInfo } from "../utils";
// import { AudioInputDeviceSetting } from "./helper/AudioInputDeviceSetting";
// import { VideoInputDeviceSetting } from "./helper/VideoInputDeviceSetting";
// import { AudioOutputDeviceSetting } from "./helper/AudioOutputDeviceSetting";
// import { useRealtimeSubscribeChat } from "./hooks/RealtimeSubscribers/useRealtimeSubscribeChat";
// import { RealtimeData } from "./hooks/RealtimeSubscribers/const";
// import { DrawingMode, useWebSocketWhiteBoard } from "./hooks/WebSocketApp/useWebSocketWhiteBoard";
// import { DrawingData } from "./hooks/WebSocketApp/helper/WebSocketWhiteBoardClient";
// import { Recorder } from "./helper/Recorder";
// import { OnetimeCodeInfo, OnetimeCodeSigninResult } from "../api/api";
// import { HMMMessage, HMMStatus, useRealtimeSubscribeHMM } from "./hooks/RealtimeSubscribers/useRealtimeSubscribeHMM";
// import { awsConfiguration, DEFAULT_PASSWORD, DEFAULT_USERID } from "../Config";
// import { GameState } from "./hooks/RealtimeSubscribers/useAmongUs";



import { CognitoClient, FlectChimeClient, WebSocketWhiteboardClient } from "@dannadori/flect-chime-lib"
import { RestAPIEndpoint, UserPoolClientId, UserPoolId, WebSocketEndpoint } from "../BackendConfig";
import { DeviceInfo, useDeviceState } from "./hooks/useDeviceState";
import { useWindowSizeChangeListener } from "./hooks/useWindowSizeChange";
import { AttendeeState } from "@dannadori/flect-chime-lib/dist/chime/FlectChimeClient";
import { VideoTileState } from "amazon-chime-sdk-js";

type Props = {
    children: ReactNode;
};

type APP_MODE = "chime" | "amongus"


interface AppStateValue {
    mode: APP_MODE,
    /** For Credential */
    cognitoClient: CognitoClient,
    chimeClient: FlectChimeClient | null,
    whiteBoardClient: WebSocketWhiteboardClient | null,
    // userId?: string,
    // password?: string,
    // idToken?: string,
    // accessToken?: string,
    // refreshToken?: string,
    // handleSignIn: (inputUserId: string, inputPassword: string) => Promise<void>
    // handleSignUp: (inputUserId: string, inputPassword: string) => Promise<void>
    // handleVerify: (inputUserId: string, inputVerifyCode: string) => Promise<void>
    // handleResendVerification: (inputUserId: string) => Promise<void>
    // handleSendVerificationCodeForChangePassword: (inputUserId: string) => Promise<void>
    // handleNewPassword: (inputUserId: string, inputVerifycode: string, inputPassword: string) => Promise<void>
    // handleSignOut: (inputUserId: string) => Promise<void>
    // onetimeCodeInfo: OnetimeCodeInfo | null,
    // handleSinginWithOnetimeCodeRequest: (meetingName: string, attendeeId: string, uuid: string) => Promise<OnetimeCodeInfo>,
    // handleSinginWithOnetimeCode: (meetingName: string, attendeeId: string, uuid: string, code: string) => Promise<OnetimeCodeSigninResult>
    // // handleSinginWithOnetimeCodeRequest_dummy: (meetingName: string, attendeeId: string, uuid: string) => Promise<OnetimeCodeInfo>,

    // /** For MeetingState */
    // meetingName?:string, 
    // userName?:string,
    // attendeeId?:string,
    // attendees: {[attendeeId: string]: AttendeeState}
    // videoTileStates: {[attendeeId: string]: VideoTileState}
    
    // createMeeting: (meetingName: string, userName: string, region: string) => Promise<{created: boolean, meetingName: string, meetingId: string}>
    // joinMeeting: (meetingName: string, userName: string) => Promise<void>
    // enterMeeting: () => Promise<void>
    // leaveMeeting: () => Promise<void>
    // startShareScreen: () => Promise<void>
    // stopShareScreen: () => Promise<void>
    // getUserNameByAttendeeIdFromList: (attendeeId: string) => string
    // meetingSession: DefaultMeetingSession | undefined
    // activeRecorder: Recorder
    // allRecorder: Recorder
    // audioInputDeviceSetting: AudioInputDeviceSetting | undefined
    // videoInputDeviceSetting: VideoInputDeviceSetting | undefined
    // audioOutputDeviceSetting: AudioOutputDeviceSetting | undefined
    // isShareContent:boolean
    // activeSpeakerId:string|null

    // countAttendees:()=>void

    // updateMeetingInfo: ()=>void
    // ownerId:string
    // isOwner:boolean
    // setPauseVideo: (attendeeId: string, pause: boolean) => void
    
    /** For Device State */
    audioInputList: DeviceInfo[] | null
    videoInputList: DeviceInfo[] | null
    audioOutputList: DeviceInfo[] | null
    reloadDevices: () => void

    screenWidth: number
    screenHeight: number


    // /** For Chat */
    // chatData: RealtimeData[],
    // sendChatData: (text: string) => void,
    // /** For HMM(Headless Meeting Manager) */
    // sendHMMCommand: (mess: HMMMessage) => void,
    // hMMCommandData: RealtimeData[],
    // startHMM:()=>void,
    // updateHMMInfo:()=>void,
    // publicIp:string,

    // sendStartRecord:()=>void, 
    // sendStopRecord:()=>void, 
    // sendStartShareTileView:()=>void, 
    // sendStopShareTileView:()=>void, 
    // sendTerminate:()=>void, 
    // sendHMMStatus:(active: boolean, recording: boolean, shareTileView: boolean)=>void,
    
    // sendRegisterAmongUsUserName: (userName: string, attendeeId: string) => void
    // // recordingEnable: boolean, 
    // // shareTileViewEnable: boolean, 
    // // terminateTriggerd: boolean, 
    // startRecordingCounter:number, 
    // stopRecordingCounter:number, 
    // startShareTileViewCounter:number, 
    // stopShareTileViewCounter:number, 
    // terminateCounter:number,
    // hMMStatus: HMMStatus,
    // stateLastUpdate: number,

    // updateGameState: (ev: string, data: string) => void
    // currentGameState: GameState
    // gameState: GameState
    // lastHMMStatus: string
    // /** For WhiteBoard */
    // addDrawingData: ((data: DrawingData) => void) | undefined
    // drawingData: DrawingData[]
    // lineWidth: number
    // setLineWidth: (val:number) => void,
    // drawingStroke: string
    // setDrawingStroke: (val:string) => void,
    // drawingMode: keyof typeof DrawingMode
    // setDrawingMode: (val: keyof typeof DrawingMode) => void





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

    // // /** For Scheduler*/
    // // tenSecondsTaskTrigger:number,
    // // uploadFileToS3: (key: string, data: Uint8Array) => Promise<void>

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

    const [lastUpdateTime, setLastUpdateTime] = useState(0)

    const cognitoClient = useMemo(()=>{
        return new CognitoClient(UserPoolId, UserPoolClientId, "mail2wokada@gmail.com", "test222")
    },[])
    const chimeClient = useMemo(()=>{
        if(cognitoClient.userId && cognitoClient.idToken && cognitoClient.accessToken && cognitoClient.refreshToken){
            const c = new FlectChimeClient(cognitoClient.userId, cognitoClient.idToken, cognitoClient.accessToken, cognitoClient.refreshToken, RestAPIEndpoint)
            c.setActiveSpekaerUpdateListener((activeSpeakerId:string|null)=>{
                setLastUpdateTime(new Date().getTime())
            })
            c.setAttendeesUpdateListener( (attendeeList:{[attendeeId: string]: AttendeeState}) =>{
                setLastUpdateTime(new Date().getTime())
            })
            c.setVideoTileStateUpdateListener( (videoTileStateList: {[attendeeId: string]: VideoTileState})=>{
                setLastUpdateTime(new Date().getTime())
            })
            return c
        }else{
            return null
        }
    },[cognitoClient.userId, cognitoClient.idToken, cognitoClient.accessToken, cognitoClient.refreshToken])


    ///////////////////
    /// whiteboard
    ///////////////////
    const [recreateWebSocketWhiteboardClientCount,  setRecreateWebSocketWhiteboardClientCount] = useState(0)
    const recreateWebSocketWhiteboardClient = () =>{
        console.log("websocket recreate!!!!")
        setRecreateWebSocketWhiteboardClientCount(recreateWebSocketWhiteboardClientCount + 1)
    }
    const whiteBoardClient = useMemo(()=>{
        if(chimeClient && chimeClient.meetingSession){
            const messagingURLWithQuery = `${WebSocketEndpoint}/Prod?joinToken=${chimeClient.joinToken}&meetingId=${chimeClient.meetingId}&attendeeId=${chimeClient.attendeeId}`
            const c = new WebSocketWhiteboardClient(chimeClient.attendeeId!, messagingURLWithQuery, chimeClient.meetingSession!.logger, recreateWebSocketWhiteboardClient)
            return c
        }else{
            return null
        }
    },[chimeClient, chimeClient?.attendeeId, chimeClient?.meetingSession, recreateWebSocketWhiteboardClientCount])

    // const { 
    //     userId, password, idToken, accessToken, refreshToken,
    //     handleSignIn, 
    //     handleSignUp, 
    //     handleVerify, 
    //     handleResendVerification,
    //     handleSendVerificationCodeForChangePassword,
    //     handleNewPassword,
    //     handleSignOut,
    //     onetimeCodeInfo,
    //     handleSinginWithOnetimeCodeRequest,
    //     handleSinginWithOnetimeCode,
    //     // handleSinginWithOnetimeCodeRequest_dummy,
    //  } = useCredentials({
    //     UserPoolId:      awsConfiguration.userPoolId, 
    //     ClientId:        awsConfiguration.clientId,
    //     DefaultUserId:   DEFAULT_USERID,
    //     DefaultPassword: DEFAULT_PASSWORD,
    // })

    // const { meetingName, meetingId, joinToken, userName, attendeeId, attendees, videoTileStates, 
    //         createMeeting, joinMeeting, enterMeeting, leaveMeeting, 
    //         startShareScreen, stopShareScreen, getUserNameByAttendeeIdFromList,
    //         meetingSession, activeRecorder, allRecorder, audioInputDeviceSetting, videoInputDeviceSetting, audioOutputDeviceSetting, isShareContent, activeSpeakerId,countAttendees,
    //         updateMeetingInfo, ownerId, isOwner, setPauseVideo
    //        } = useMeetingState({userId, idToken, accessToken, refreshToken,})
    const { audioInputList, videoInputList, audioOutputList, reloadDevices } = useDeviceState()
    const { screenWidth, screenHeight} = useWindowSizeChangeListener()
    const [ mode, setMode ] = useState(query.get("mode") as APP_MODE| "chime" )  // eslint-disable-line
    const { stage, setStage } = useStageManager({initialStage:query.get("stage") as STAGE|null})
    const { messageActive, messageType, messageTitle, messageDetail, setMessage, resolveMessage } = useMessageState()

    // const { chatData, sendChatData} = useRealtimeSubscribeChat({meetingSession, attendeeId})
    // const { sendHMMCommand, hMMCommandData, startHMM, updateHMMInfo, publicIp, 
    //         sendStartRecord, sendStopRecord, sendStartShareTileView, sendStopShareTileView, sendTerminate, sendHMMStatus, sendRegisterAmongUsUserName,
    //         startRecordingCounter, stopRecordingCounter, startShareTileViewCounter, stopShareTileViewCounter, terminateCounter, hMMStatus, stateLastUpdate,
    //         updateGameState, currentGameState, gameState, lastHMMStatus
    //       } = useRealtimeSubscribeHMM({meetingSession, attendeeId, meetingName, idToken, accessToken, refreshToken})

    // const logger = meetingSession?.logger
    // const { addDrawingData, drawingData, lineWidth, setLineWidth, drawingStroke, setDrawingStroke, drawingMode, setDrawingMode } = useWebSocketWhiteBoard({meetingId, attendeeId, joinToken, logger})
    

    // // const { tenSecondsTaskTrigger } = useScheduler()
    // // const { uploadFileToS3 } = useS3FileUploader({idToken, accessToken, refreshToken})


    const providerValue = {
        mode,
        /** For Credential */
        cognitoClient,
        chimeClient,
        whiteBoardClient,
    //     userId,
    //     password, 
    //     idToken, 
    //     accessToken, 
    //     refreshToken,
    //     handleSignIn,
    //     handleSignUp,
    //     handleVerify,
    //     handleResendVerification,
    //     handleSendVerificationCodeForChangePassword,
    //     handleNewPassword,
    //     handleSignOut,
    //     onetimeCodeInfo,
    //     handleSinginWithOnetimeCodeRequest,
    //     handleSinginWithOnetimeCode,
    //     // handleSinginWithOnetimeCodeRequest_dummy,

    //     /** For MeetingState */
    //     meetingName, 
    //     userName,
    //     attendeeId,
    //     attendees,
    //     videoTileStates,
    //     createMeeting,
    //     joinMeeting,
    //     enterMeeting,
    //     leaveMeeting,
    //     startShareScreen,
    //     stopShareScreen,
    //     getUserNameByAttendeeIdFromList,
    //     meetingSession,
    //     activeRecorder,
    //     allRecorder,
    //     audioInputDeviceSetting, 
    //     videoInputDeviceSetting, 
    //     audioOutputDeviceSetting,
    //     isShareContent,
    //     activeSpeakerId,

    //     countAttendees,

    //     updateMeetingInfo,
    //     ownerId,
    //     isOwner,
    //     setPauseVideo,
        
        /** For Device State */
        audioInputList,
        videoInputList,
        audioOutputList,
        reloadDevices,


        screenWidth,
        screenHeight,

    //     /** For Chat */
    //     chatData, 
    //     sendChatData,
    //     /** For HMM(Headless Meeting Manager) */
    //     sendHMMCommand,
    //     hMMCommandData,
    //     startHMM,
    //     updateHMMInfo,
    //     publicIp,

    //     sendStartRecord, 
    //     sendStopRecord, 
    //     sendStartShareTileView, 
    //     sendStopShareTileView, 
    //     sendTerminate, 
    //     sendHMMStatus,

    //     sendRegisterAmongUsUserName,
    //     updateGameState,
    //     currentGameState,
    //     gameState,
    //     lastHMMStatus,
    //     // recordingEnable, 
    //     // shareTileViewEnable, 
    //     // terminateTriggerd, 
    //     startRecordingCounter, 
    //     stopRecordingCounter, 
    //     startShareTileViewCounter, 
    //     stopShareTileViewCounter, 
    //     terminateCounter,
    //     hMMStatus,
    //     stateLastUpdate,
        /** For StageManager */
        stage,
        setStage,
    //     /** For WhiteBoard */
    //     addDrawingData, 
    //     drawingData, 
    //     lineWidth, 
    //     setLineWidth, 
    //     drawingStroke, 
    //     setDrawingStroke, 
    //     drawingMode, 
    //     setDrawingMode,

        /** For Message*/
        messageActive, 
        messageType, 
        messageTitle,
        messageDetail, 
        setMessage,
        resolveMessage,

    //     // /** For Scheduler */
    //     // tenSecondsTaskTrigger,
    //     // uploadFileToS3,

    };

    return (
        <AppStateContext.Provider value={providerValue} >
            {children}
        </AppStateContext.Provider>
    )
}
