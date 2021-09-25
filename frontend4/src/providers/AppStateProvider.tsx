import React, { useContext, useEffect, useMemo, useState } from "react";
import { ReactNode } from "react";
import { MessageType, useMessageState } from "./hooks/useMessageState";
import { STAGE, useStageManager } from "./hooks/useStageManager";
import { RestAPIEndpoint, UserPoolClientId, UserPoolId, WebSocketEndpoint } from "../BackendConfig";
import { DeviceInfo, useDeviceState } from "./hooks/useDeviceState";
import { useWindowSizeChangeListener } from "./hooks/useWindowSizeChange";
import {AttendeeState, CognitoClient, DrawingData, FlectChimeClient, GameState, HMMStatus, RealtimeData, useAmongUsServer, VideoTileState, WebSocketWhiteboardClient} from '@dannadori/flect-amazon-chime-lib'


type Props = {
    children: ReactNode;
};

type APP_MODE = "chime" | "amongus"


interface AppStateValue {
    mode: APP_MODE,
    setLastUpdateTime: (t:number)=>void
    lastUpdateTime: number,
    chimeClient: FlectChimeClient | null,
    /** Clients */
    cognitoClient: CognitoClient,
    whiteboardClient: WebSocketWhiteboardClient | null,
    amongusGameState: GameState | null,
    
    /** For Device State */
    audioInputList: DeviceInfo[] | null
    videoInputList: DeviceInfo[] | null
    audioOutputList: DeviceInfo[] | null
    reloadDevices: () => void

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

    /** For HMM */
    startRecordRequestCounter: number
    stopRecordRequestCounter: number
    startShareTileviewRequestCounter: number
    stopShareTileviewRequestCounter: number
    terminateHMMRequestCounter: number    
    setStopRecordRequestCounter: (d:number)=>void

    updateGameState: (ev: string, data: string) => void
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
    const [ mode, setMode ] = useState(query.get("mode") as APP_MODE| "chime" )  // eslint-disable-line
    const { stage, setStage } = useStageManager({initialStage:query.get("stage") as STAGE|null})
    const [ lastUpdateTime, setLastUpdateTime ] = useState(0) // eslint-disable-line

    const cognitoClient = useMemo(()=>{
        return new CognitoClient(UserPoolId, UserPoolClientId)
        // return new CognitoClient(UserPoolId, UserPoolClientId, "mail2wokada@gmail.com", "test22")
    },[])

    /////////
    // Chime Client 
    /////////
    //// (A) triggers
    const [ amongusGameState, setAmongusGameState] = useState<GameState|null>(null)
    const [ startRecordRequestCounter, setStartRecordRequestCounter ] = useState(0)
    const [ stopRecordRequestCounter, setStopRecordRequestCounter ] = useState(0)
    const [ startShareTileviewRequestCounter, setStartShareTileviewRequestCounter ] = useState(0)
    const [ stopShareTileviewRequestCounter, setStopShareTileviewRequestCounter ] = useState(0)
    const [ terminateHMMRequestCounter, setTerminateHMMRequestCounter ] = useState(0)
    const { updateGameState, setChimeClient:amongUsSetChimeClient } = useAmongUsServer()

    //// (B) initialization
    const chimeClient = useMemo(()=>{
        if(cognitoClient.userId && cognitoClient.idToken && cognitoClient.accessToken && cognitoClient.refreshToken){
            const c = new FlectChimeClient(cognitoClient.userId, cognitoClient.idToken, cognitoClient.accessToken, cognitoClient.refreshToken, RestAPIEndpoint)
            c.setFlectChimeClientListener({
                meetingStateUpdated: () => {
                    setLastUpdateTime(new Date().getTime())
                },
                activeSpekaerUpdated:(activeSpeakerId:string|null)=>{
                    setLastUpdateTime(new Date().getTime())
                },
                attendeesUpdated: (attendeeList:{[attendeeId: string]: AttendeeState}) =>{
                    setLastUpdateTime(new Date().getTime())
                }, 
                videoTileStateUpdated:(videoTileStateList: {[attendeeId: string]: VideoTileState})=>{
                    setLastUpdateTime(new Date().getTime())
                }
            })

            c.setRealtimeSubscribeChatClientListener({
                chatDataUpdated: (list:RealtimeData[])=>{
                    setLastUpdateTime(new Date().getTime())
                }
            })
            c.setRealtimeSubscribeTranscriptionClientListener({
                transcriptionStatusUpdated:()=>{
                    setLastUpdateTime(new Date().getTime())
                }
            })

            c.setRealtimeSubscribeHMMClientListener({
                startRecordRequestReceived: () => {
                    if(stage === "HEADLESS_MEETING_MANAGER"){
                        setStartRecordRequestCounter(new Date().getTime())
                    }
                },
                stopRecordRequestReceived: () => {
                    if(stage === "HEADLESS_MEETING_MANAGER"){
                        setStopRecordRequestCounter(new Date().getTime())
                    }
                 },
                startShareTileviewRequestReceived: () => {
                    if(stage === "HEADLESS_MEETING_MANAGER"){
                        setStartShareTileviewRequestCounter(new Date().getTime())
                    }
                },
                stopShareTileviewRequestReceived: () => {
                    if(stage === "HEADLESS_MEETING_MANAGER"){
                        setStopShareTileviewRequestCounter(new Date().getTime())
                    }
                },
                terminateRequestReceived: () => {
                    if(stage === "HEADLESS_MEETING_MANAGER"){
                        setTerminateHMMRequestCounter(new Date().getTime())
                    }
                },
                notificationReceived: (status: HMMStatus) => {
                    if(stage !== "HEADLESS_MEETING_MANAGER"){
                        // setHmmStatus(status)
                        setLastUpdateTime(new Date().getTime())
                    }
                },
                amongusNotificationReceived: (gameState: GameState) => {
                    if(stage !== "HEADLESS_MEETING_MANAGER"){
                        setAmongusGameState(gameState)
                    }
                },
                hMMStateUpdated: ()=>{
                    setLastUpdateTime(new Date().getTime())
                },
            })
            return c
        }else{
            console.log("[AppStateProvider] can not create chime client yet. ", cognitoClient.userId, cognitoClient.idToken, cognitoClient.accessToken, cognitoClient.refreshToken)
            return null
        }
    },[cognitoClient.userId, cognitoClient.idToken, cognitoClient.accessToken, cognitoClient.refreshToken]) // eslint-disable-line

    useEffect(()=>{
        amongUsSetChimeClient(chimeClient)
    },[chimeClient]) // eslint-disable-line


    ///////////////////
    /// whiteboard
    ///////////////////
    const [recreateWebSocketWhiteboardClientCount,  setRecreateWebSocketWhiteboardClientCount] = useState(0)
    const recreateWebSocketWhiteboardClient = () =>{
        console.log("whiteboard client recreate requested...")
        setRecreateWebSocketWhiteboardClientCount(recreateWebSocketWhiteboardClientCount + 1)
    }
    const whiteboardClient = useMemo(()=>{
        if(chimeClient && chimeClient.meetingSession){
            console.log("[AppStateProvider] recreate whiteboard client!")
            const messagingURLWithQuery = `${WebSocketEndpoint}/Prod?joinToken=${chimeClient.joinToken}&meetingId=${chimeClient.meetingId}&attendeeId=${chimeClient.attendeeId}`
            const c = new WebSocketWhiteboardClient(chimeClient.attendeeId!, messagingURLWithQuery, chimeClient.meetingSession!.logger, recreateWebSocketWhiteboardClient)
            c.addWhiteboardDataUpdateListener((data: DrawingData[] ) =>{
                setLastUpdateTime(new Date().getTime())
            })
            return c
        }else{
            return null
        }
    },[chimeClient, chimeClient?.attendeeId, chimeClient?.meetingSession, recreateWebSocketWhiteboardClientCount]) // eslint-disable-line


    //////////
    // etc
    //////////
    const { audioInputList, videoInputList, audioOutputList, reloadDevices } = useDeviceState()
    const { screenWidth, screenHeight} = useWindowSizeChangeListener()
    const { messageActive, messageType, messageTitle, messageDetail, setMessage, resolveMessage } = useMessageState()



    //////////
    // return value
    //////////

    const providerValue = {
        mode,
        setLastUpdateTime,
        lastUpdateTime,
        /** For Credential */
        cognitoClient,
        chimeClient,
        whiteboardClient,
        amongusGameState,
        
        /** For Device State */
        audioInputList,
        videoInputList,
        audioOutputList,
        reloadDevices,

        screenWidth,
        screenHeight,

        /** For StageManager */
        stage,
        setStage,

        /** For Message*/
        messageActive, 
        messageType, 
        messageTitle,
        messageDetail, 
        setMessage,
        resolveMessage,

        /** For HMM */
        startRecordRequestCounter,
        stopRecordRequestCounter,
        startShareTileviewRequestCounter,
        stopShareTileviewRequestCounter,
        terminateHMMRequestCounter,    
        setStopRecordRequestCounter,
        updateGameState, 
    };

    return (
        <AppStateContext.Provider value={providerValue} >
            {children}
        </AppStateContext.Provider>
    )
}
