import React, { useContext, useState, ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

interface AppStateValue {
  userId: string,
  idToken: string,
  accessToken: string,
  refreshToken: string,
  meetingId: string;
  meetingName: string;
  localUserName: string;
  localUserId: string;
  theme: string;
  region: string;
  toggleTheme: () => void;
  setAppMeetingInfo: (meetingId: string, meetingName: string, attendeeId:string, name: string, region: string) => void;
  setSignInInfo: (userId: string, idToken: string, accessToken:string, refreshToken:string) => void;
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
  const [localUserName, setLocalUserName] = useState('');
  const [localUserId, setLocalUserId] = useState('');
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme || 'light';
  });

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
    region: string
  ) => {
    setRegion(region);
    setMeetingId(meetingId);
    setLocalUserName(name);
    setMeetingName(meetingName)
    setLocalUserId(attendeeId)
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
    theme,
    region,
    toggleTheme,
    setAppMeetingInfo,
    setSignInInfo
  };

  return (
    <AppStateContext.Provider value={providerValue}>
      {children}
    </AppStateContext.Provider>
  );
}