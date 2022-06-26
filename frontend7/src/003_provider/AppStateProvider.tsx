import React, { useContext, useEffect, useMemo } from "react";
import { ReactNode } from "react";
import { UserPoolClientId, UserPoolId } from "../BackendConfig";

import { useWindowSizeChangeListener, WindowSizeState } from "../002_hooks/012_useWindowSizeChange";
import { CognitoClientStateAndMethods, useCognitoClient } from "../002_hooks/001_useCognitoClient";

import { DeviceInfoStateAndMethods, useDeviceState } from "../002_hooks/004_useDeviceState";
import { ChimeClientStateAndMethods, useChimeClient } from "../002_hooks/003_useChimeClient";
import { BackendManagerStateAndMethod, useBackendManager } from "../002_hooks/002_useBackendManager";
import { FrontendState, useFrontend } from "../002_hooks/011_useFrontend";
import { MessagingClientStateAndMethod, useMessagingClient } from "../002_hooks/005_useMessagingClient";
import { Message } from "amazon-chime-sdk-js";

type Props = {
    children: ReactNode;
};

interface AppStateValue {
    /** (000) Clients */
    cognitoClientState: CognitoClientStateAndMethods;
    backendManagerState: BackendManagerStateAndMethod;
    chimeClientState: ChimeClientStateAndMethods;
    deviceState: DeviceInfoStateAndMethods;
    messagingClientState: MessagingClientStateAndMethod;

    frontendState: FrontendState;

    // /** Federation */
    // slackToken: string | null;
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
    const cognitoClientState = useCognitoClient({ userPoolId: UserPoolId, userPoolClientId: UserPoolClientId });

    const backendManagerState = useBackendManager({
        idToken: cognitoClientState.idToken,
        accessToken: cognitoClientState.accessToken,
        refreshToken: cognitoClientState.refreshToken,
    });

    const chimeClientState = useChimeClient({
        getAttendeeInfo: backendManagerState.getAttendeeInfo,
    });

    const deviceState = useDeviceState();

    const messagingClientState = useMessagingClient();

    /** (020) App State*/
    //// (020) stage
    const slackToken = useMemo(() => {
        return query.get("slack_token") || null;
    }, []);

    // (2) useEffect
    /** (000) Clients */
    useEffect(() => {
        if (cognitoClientState.signInCompleted) {
            backendManagerState.reloadMeetingList({});
            deviceState.reloadDevices(true);
        }
    }, [cognitoClientState.signInCompleted]);

    useEffect(() => {
        if (backendManagerState.environment) {
            console.log("env", backendManagerState.environment);
            messagingClientState.connect({
                credentials: backendManagerState.environment.credential,
                userArn: backendManagerState.environment.userInfoInServer.appInstanceUserArn,
                globalChannelArn: backendManagerState.environment.globalChannelArn,
            });
            messagingClientState.setMessageControlLsiterner({
                roomRegistered: () => {
                    backendManagerState.reloadMeetingList({});
                },
                roomStarted: () => {
                    console.log("room started");
                },
                roomEnded: () => {
                    console.log("room ended");
                },
                roomDeleted: () => {
                    backendManagerState.reloadMeetingList({});
                },
            });
        } else {
            console.log("env not::", backendManagerState.environment);
        }
    }, [backendManagerState.environment]);

    /** (010) Environment State */
    //// (010) device

    /** GUI Control*/
    /**** For WindowSizeChange */
    /**** For StageManager */
    /**** Other GUI Props */

    /// FrontendStateは全てのバックエンド情報を使用して作成する
    const frontendState = useFrontend({ cognitoClientState, backendManagerState, chimeClientState, deviceState, messagingClientState });

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

    // /// whiteboard
    // ///////////////////
    // const [recreateWebSocketWhiteboardClientCount, setRecreateWebSocketWhiteboardClientCount] = useState(0);
    // const recreateWebSocketWhiteboardClient = () => {
    //     console.log("whiteboard client recreate requested...");
    //     setRecreateWebSocketWhiteboardClientCount(recreateWebSocketWhiteboardClientCount + 1);
    // };

    useEffect(() => {
        chimeClientState.setAudioInput(deviceState.chimeAudioInputDevice);
    }, [deviceState.chimeAudioInputDevice]);
    useEffect(() => {
        chimeClientState.setVideoInput(deviceState.chimeVideoInputDevice);
    }, [deviceState.chimeVideoInputDevice]);
    useEffect(() => {
        chimeClientState.setAudioOutput(deviceState.chimeAudioOutputDevice);
    }, [deviceState.chimeAudioOutputDevice]);

    const providerValue = {
        /** (000) Clients */
        cognitoClientState,
        backendManagerState,
        chimeClientState,
        messagingClientState,
        /** (010) Environment State */
        deviceState,

        frontendState,

        /** Federation */
        slackToken,
    };

    return <AppStateContext.Provider value={providerValue}>{children}</AppStateContext.Provider>;
};
