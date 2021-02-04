import React, { useContext, useState, ReactNode } from 'react';
import { DeviceStateProvider } from './DeviceStateProvider';
import { EnvironmentStateProvider } from './EvironmentStateProvider';
import { MeetingStateProvider } from './MeetingStateProvider';
import { MessageStateProvider } from './MessageStateProvider';
import { SignInStateProvider } from './SignInStateProvider';
import { WebSocketStateProvider } from './websocket/WebScoketProvider';

type Props = {
    children: ReactNode;
};

type AppMode = "Main" | "Whiteboard"

interface AppStateValue {
    userId: string,
    idToken: string,
    accessToken: string,
    refreshToken: string,
    mode: AppMode;

    setSignInInfo: (userId: string, idToken: string, accessToken: string, refreshToken: string) => void
    setMode: (mode: AppMode) => void
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
    const [userId, setUserId] = useState(query.get('userId') || '');
    const [idToken, setIdToken] = useState(query.get('idToken') || '');
    const [accessToken, setAccessToken] = useState(query.get('accessToken') || '');
    const [refreshToken, setRefreshToken] = useState(query.get('refreshToken') || '');
    const [mode, setMode] = useState('Main' as AppMode)

    const setSignInInfo = (
        userId: string,
        idToken: string,
        accessToken: string,
        refreshToken: string
    ) => {
        setUserId(userId)
        setIdToken(idToken)
        setAccessToken(accessToken)
        setRefreshToken(refreshToken)
    };

    const providerValue = {
        userId,
        idToken,
        accessToken,
        refreshToken,
        mode,
        setSignInInfo,
        setMode,
    };

    return (
        <AppStateContext.Provider value={providerValue} >
            <EnvironmentStateProvider>
                <MessageStateProvider>
                    <SignInStateProvider>
                        <DeviceStateProvider>
                            <MeetingStateProvider>
                                <WebSocketStateProvider>
                                    {children}
                                </WebSocketStateProvider>
                            </MeetingStateProvider>
                        </DeviceStateProvider>
                    </SignInStateProvider>
                </MessageStateProvider>
            </EnvironmentStateProvider>
        </AppStateContext.Provider>
    )
}
