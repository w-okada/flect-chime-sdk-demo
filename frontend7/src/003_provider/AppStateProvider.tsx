import React, { useContext, useEffect, useMemo } from "react";
import { ReactNode } from "react";
import { MessageState, MessageType, useMessageState } from "../providers/hooks/useMessageState";
import { RestAPIEndpoint, UserPoolClientId, UserPoolId } from "../BackendConfig";

import { useWindowSizeChangeListener, WindowSizeState } from "../providers/hooks/011_useWindowSizeChange";
// import { AttendeeState, CognitoClient, DrawingData, FlectChimeClient, GameState, RealtimeData, useAmongUsServer, VideoTileState, WebSocketWhiteboardClient } from "@dannadori/flect-amazon-chime-lib2";
// import { ChimeClientState, useChimeClient } from "./hooks/useChimeClient";
import { CognitoClientState, CognitoClientStateAndMethods, useCognitoClient } from "../002_hooks/001_useCognitoClient";
import { FrontendState, useFrontend } from "../providers/hooks/021_useFrontend";
import { DeviceInfoStateAndMethods, useDeviceState } from "../002_hooks/004_useDeviceState";
import { SignInType, StageManagerStateAndMethods, useStageManager } from "../providers/hooks/020_useStageManager";
import { ChimeClientState, useChimeClient } from "../002_hooks/003_useChimeClient";
import { BackendManagerStateAndMethod, useBackendManager } from "../002_hooks/002_useBackendManager";

type Props = {
    children: ReactNode;
};

interface AppStateValue {
    /** (000) Clients */
    cognitoClientState: CognitoClientStateAndMethods;
    backendManagerState: BackendManagerStateAndMethod;
    chimeClientState: ChimeClientState;

    /** (010) Environment State */
    deviceState: DeviceInfoStateAndMethods;
    windowSizeState: WindowSizeState;

    /** (020) App State*/
    stageState: StageManagerStateAndMethods;
    frontendState: FrontendState;

    /** GUI Control*/
    /**** For WindowSizeChange */
    /**** Other GUI Props */

    /** Clients */

    // chimeClientState: ChimeClientState;
    // whiteboardClientState: WhiteboardClientState;
    /** For Device State */

    /** For Message*/
    messageState: MessageState;
    setMessage: (type: MessageType, title: string, detail: string[]) => void;
    resolveMessage: () => void;

    /** Federation */
    slackToken: string | null;
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
    // (1) Generate State
    /** (000) Clients */
    //// (000) cognito
    const cognitoClientState = useCognitoClient({ userPoolId: UserPoolId, userPoolClientId: UserPoolClientId });
    const backendManagerState = useBackendManager({
        idToken: cognitoClientState.idToken,
        accessToken: cognitoClientState.accessToken,
        refreshToken: cognitoClientState.refreshToken,
    });
    //// (001) chime
    const chimeClientState = useChimeClient({});

    /** (010) Environment State */
    //// (010) device
    const deviceState = useDeviceState();
    //// (011) window size
    const windowSizeState = useWindowSizeChangeListener();

    /** (020) App State*/
    //// (020) stage
    const slackToken = useMemo(() => {
        return query.get("slack_token") || null;
    }, []);
    const stageState = useStageManager({
        signInType: slackToken ? SignInType.slack : SignInType.normal,
    });

    // (2) useEffect
    /** (000) Clients */
    useEffect(() => {
        if (cognitoClientState.signInCompleted) {
            backendManagerState.reloadMeetingList({});
            deviceState.reloadDevices();
        }
    }, [cognitoClientState.signInCompleted]);
    /** (010) Environment State */
    //// (010) device
    useEffect(() => {
        if (stageState.signInComplete) {
            deviceState.reloadDevices();
        }
    }, [stageState.signInComplete]);

    /** GUI Control*/
    /**** For WindowSizeChange */
    /**** For StageManager */
    /**** Other GUI Props */
    const frontendState = useFrontend();

    /** Clients */
    // const chimeClientState = useChimeClient({ RestAPIEndpoint: RestAPIEndpoint });
    // useEffect(() => {
    //     if (cognitoClientState.userId && cognitoClientState.idToken && cognitoClientState.accessToken && cognitoClientState.refreshToken) {
    //         chimeClientState.initialize(cognitoClientState.userId, cognitoClientState.idToken, cognitoClientState.accessToken, cognitoClientState.refreshToken);
    //     }
    //     if (slackToken) {
    //         chimeClientState.initializeWithCode(`slack,${slackToken}`);
    //     }
    // }, [cognitoClientState.userId, cognitoClientState.idToken, cognitoClientState.accessToken, cognitoClientState.refreshToken, slackToken]);
    // const whiteboardClientState = useWhiteboardClient({
    //     joinToken: chimeClientState.joinToken || "",
    //     meetingId: chimeClientState.meetingId || "",
    //     attendeeId: chimeClientState.attendeeId || "",
    // });

    /** For Device State */

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
        /** (000) Clients */
        cognitoClientState,
        backendManagerState,
        chimeClientState,
        /** (010) Environment State */
        deviceState,
        windowSizeState,

        /** (020) App State*/
        stageState,

        frontendState,

        /** For Message*/
        messageState,
        setMessage,
        resolveMessage,

        /** Federation */
        slackToken,
    };

    return <AppStateContext.Provider value={providerValue}>{children}</AppStateContext.Provider>;
};
