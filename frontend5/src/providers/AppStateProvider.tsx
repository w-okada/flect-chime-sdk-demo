import React, { useContext, useEffect, useMemo, useState } from "react";
import { ReactNode } from "react";
import { MessageState, MessageType, useMessageState } from "./hooks/useMessageState";
import { STAGE, useStageManager } from "./hooks/useStageManager";
import { RestAPIEndpoint, UserPoolClientId, UserPoolId, WebSocketEndpoint } from "../BackendConfig";
import { DeviceState, MediaDeviceInfoList, useDeviceState } from "./hooks/useDeviceState";
import { useWindowSizeChangeListener, WindowSize } from "./hooks/useWindowSizeChange";
import { AttendeeState, CognitoClient, DrawingData, FlectChimeClient, GameState, RealtimeData, useAmongUsServer, VideoTileState, WebSocketWhiteboardClient } from "@dannadori/flect-amazon-chime-lib2";
import { ChimeClientState, useChimeClient } from "./hooks/useChimeClient";
import { CognitoClientState, useCognitoClient } from "./hooks/useCognitoClient";
import { FrontendState, useFrontend } from "./hooks/useFrontend";
import { useWhiteboardClient, WhiteboardClientState } from "./hooks/useWhiteBoardClient";

type Props = {
    children: ReactNode;
};

interface AppStateValue {
    /** GUI Control*/
    /**** For WindowSizeChange */
    windowSize: WindowSize;
    /**** For StageManager */
    stage: STAGE;
    setStage: (stage: STAGE) => void;
    /**** Other GUI Props */
    frontendState: FrontendState;

    /** Clients */
    cognitoClientState: CognitoClientState;
    chimeClientState: ChimeClientState;
    whiteboardClientState: WhiteboardClientState;
    /** For Device State */
    deviceState: DeviceState;

    /** For Message*/
    messageState: MessageState;
    setMessage: (type: MessageType, title: string, detail: string[]) => void;
    resolveMessage: () => void;
}

const AppStateContext = React.createContext<AppStateValue | null>(null);

export const useAppState = (): AppStateValue => {
    const state = useContext(AppStateContext);
    if (!state) {
        throw new Error("useAppState must be used within AppStateProvider");
    }
    return state;
};

const query = new URLSearchParams(window.location.search);

export const AppStateProvider = ({ children }: Props) => {
    /** GUI Control*/
    /**** For WindowSizeChange */
    const { windowSize } = useWindowSizeChangeListener();
    /**** For StageManager */
    const { stage, setStage } = useStageManager({ initialStage: query.get("stage") as STAGE | null });
    /**** Other GUI Props */
    const frontendState = useFrontend();

    /** Clients */
    const chimeClientState = useChimeClient({ RestAPIEndpoint: RestAPIEndpoint });
    const cognitoClientState = useCognitoClient({ userPoolId: UserPoolId, userPoolClientId: UserPoolClientId });
    useEffect(() => {
        if (cognitoClientState.userId && cognitoClientState.idToken && cognitoClientState.accessToken && cognitoClientState.refreshToken) {
            chimeClientState.initialize(cognitoClientState.userId, cognitoClientState.idToken, cognitoClientState.accessToken, cognitoClientState.refreshToken);
        }
    }, [cognitoClientState.userId, cognitoClientState.idToken, cognitoClientState.accessToken, cognitoClientState.refreshToken]);
    const whiteboardClientState = useWhiteboardClient({
        joinToken: chimeClientState.joinToken || "",
        meetingId: chimeClientState.meetingId || "",
        attendeeId: chimeClientState.attendeeId || "",
    });

    /** For Device State */
    const deviceState = useDeviceState();

    /** For Message*/
    const { messageState, setMessage, resolveMessage } = useMessageState();

    // /// whiteboard
    // ///////////////////
    // const [recreateWebSocketWhiteboardClientCount, setRecreateWebSocketWhiteboardClientCount] = useState(0);
    // const recreateWebSocketWhiteboardClient = () => {
    //     console.log("whiteboard client recreate requested...");
    //     setRecreateWebSocketWhiteboardClientCount(recreateWebSocketWhiteboardClientCount + 1);
    // };

    const providerValue = {
        /** GUI Control*/
        /**** For WindowSizeChange */
        windowSize,
        /**** For StageManager */
        stage,
        setStage,
        /**** Other GUI Props */
        frontendState,

        /** For Credential */
        cognitoClientState,
        chimeClientState,
        whiteboardClientState,
        /** For Device State */
        deviceState,

        /** For Message*/
        messageState,
        setMessage,
        resolveMessage,
    };

    return <AppStateContext.Provider value={providerValue}>{children}</AppStateContext.Provider>;
};
