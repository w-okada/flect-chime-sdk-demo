import React, { useContext, useState, ReactNode } from 'react';

type Props = {
  children: ReactNode;
};
type AppMode = "Main" | "Whiteboard"

interface AppStateValue {
  userId: string,
  idToken: string,
  accessToken: string,
  refreshToken: string,
  meetingId: string;
  meetingName: string;
  localUserName: string;
  localUserId: string;
  mode: AppMode;
  theme: string;
  region: string;
  joinToken: string
  toggleTheme: () => void;
  setAppMeetingInfo: (meetingId: string, meetingName: string, attendeeId:string, name: string, region: string, joinToken:string) => void;
  setSignInInfo: (userId: string, idToken: string, accessToken:string, refreshToken:string) => void;
  setMode: (mode:AppMode) => void
  
  wss: string
}

const AppStateContext = React.createContext<AppStateValue | null>(null);

export function useAppState(): AppStateValue {
  const state = useContext(AppStateContext);

  if (!state) {
    throw new Error('useAppState must be used within AppStateProvider');
  }

  return state;
}


const query = new URLSearchParams(window.location.search);

export function AppStateProvider({ children }: Props) {
  const [userId, setUserId] = useState(query.get('userId') || '');
  const [idToken, setIdToken] = useState(query.get('idToken') || '');
  const [accessToken, setAccessToken] = useState(query.get('accessToken') || '');
  const [refreshToken, setRefreshToken] = useState(query.get('refreshToken') || '');
  const [meetingId, setMeetingId] = useState(query.get('meetingId') || '');
  const [meetingName, setMeetingName] = useState(query.get('meetingName') || '');
  const [region, setRegion] = useState(query.get('region') || '');
  const [joinToken, setJoinToken] = useState("");
  const [localUserName, setLocalUserName] = useState('');
  const [localUserId, setLocalUserId] = useState('');

  const [mode, setMode] = useState('Main' as AppMode)

  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme || 'light';
  });

  const [wss, setWss] = useState(query.get('wss') || '');


  const toggleTheme = (): void => {
    if (theme === 'light') {
      setTheme('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      setTheme('light');
      localStorage.setItem('theme', 'light');
    }
  };

  const setAppMeetingInfo = (
    meetingId: string,
    meetingName: string,
    attendeeId: string,
    name: string,
    region: string,
    joinToken:string
  ) => {
    setRegion(region);
    setMeetingId(meetingId);
    setLocalUserName(name);
    setMeetingName(meetingName)
    setLocalUserId(attendeeId)
    setJoinToken(joinToken)
  };

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
    meetingId,
    meetingName,
    localUserName,
    localUserId,
    mode,
    theme,
    region,
    joinToken,
    toggleTheme,
    setAppMeetingInfo,
    setSignInInfo,
    setMode,

    wss
  };

  return (
    <AppStateContext.Provider value={providerValue}>
      {children}
    </AppStateContext.Provider>
  );
}