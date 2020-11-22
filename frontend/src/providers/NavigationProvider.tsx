// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  ReactNode
} from 'react';
import { useLocation } from 'react-router-dom';
import { useMeetingManager } from 'amazon-chime-sdk-component-library-react';

import routes from '../constants/routes';

type SHOW_NAVI_TARGET =  "NONE" | "ROSTER" | "CHAT" | "WHITEBOARD"

export type NavigationContextType = {
  showNavbar: boolean;
  showMetrics: boolean;
  // showRoster: boolean;
  // showChatView: boolean;
  // showWhiteboardView: boolean
  toggleNavbar: () => void;
  // toggleRoster: () => void;
  // toggleChatView: () => void;
  // toggleWhiteboardView: () => void;
  
  openNavbar: () => void;
  closeNavbar: () => void;
  toggleMetrics: () => void;

  // openRoster: () => void;
  // closeRoster: () => void;
  // openChatView: () => void;
  // closeChatView: () => void;
  // openWhiteboardView: () => void;
  // closeWhiteboardView: () => void;
  naviShowTarget: SHOW_NAVI_TARGET
  setNaviShowTarget: (target: SHOW_NAVI_TARGET) => void
};

type Props = {
  children: ReactNode;
};

const NavigationContext = React.createContext<NavigationContextType | null>(
  null
);

const isDesktop = () => window.innerWidth > 768;

const NavigationProvider = ({ children }: Props) => {
  const [showNavbar, setShowNavbar] = useState(() => isDesktop());
  const [showMetrics, setShowMetrics] = useState(false);
  // const [showRoster, setShowRoster] = useState(() => isDesktop());
  // const [showChatView, setShowChatView] = useState(false)
  // const [showWhiteboardView, setShowWhiteboardView] = useState(false)

  const [naviShowTarget, setNaviShowTarget] = useState("ROSTER" as SHOW_NAVI_TARGET)

  const isDesktopView = useRef(isDesktop());
  const location = useLocation();
  const meetingManager = useMeetingManager();

  useEffect(() => {
    if (location.pathname.includes(routes.MEETING)) {
      return () => { 
        meetingManager.leave();
      }
    }
  }, [location.pathname])

  useEffect(() => {
    const handler = () => {
      const isResizeDesktop = isDesktop();
      if (isDesktopView.current === isResizeDesktop) {
        return;
      }

      isDesktopView.current = isResizeDesktop;

      if (!isResizeDesktop) {
        setShowNavbar(false);
        setNaviShowTarget("NONE")
        // setShowRoster(false);
        // setShowChatView(false)
        // setShowWhiteboardView(false)
      } else {
        setShowNavbar(true);
      }
    };

    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const toggleNavbar = (): void => {
    setShowNavbar(!showNavbar);
  };
  const toggleMetrics = () => {
    setShowMetrics(currentState => !currentState);
  };

  // const toggleRoster = (): void => {
  //   setNaviShowTarget("ROSTER")
  //   // setShowRoster(!showRoster);

  //   // setShowChatView(false)
  //   // setShowWhiteboardView(false)
  // };


  // const toggleChatView = () =>{
  //   setNaviShowTarget("CHAT")
  //   // setShowChatView(!showChatView)

  //   // setShowRoster(false)
  //   // setShowWhiteboardView(false)
  // }

  // const toggleWhiteboardView = () =>{
  //   setNaviShowTarget("WHITEBOARD")
  //   // setShowWhiteboardView(!showWhiteboardView)
 
  //   // setShowRoster(false)
  //   // setShowChatView(false)
  // }


  const openNavbar = (): void => {
    setShowNavbar(true);
  };

  const closeNavbar = (): void => {
    setShowNavbar(false);
  };

  // const openRoster = (): void => {
  //   setShowRoster(true);
  // };

  // const closeRoster = (): void => {
  //   setShowRoster(false);
  // };
  // const openChatView = () =>{
  //   setShowChatView(true)
  // }
  // const closeChatView = () =>{
  //   setShowChatView(false)
  // }

  // const openWhiteboardView = () =>{
  //   setShowWhiteboardView(true)
  // }
  // const closeWhiteboardView = () =>{
  //   setShowWhiteboardView(false)
  // }

  const providerValue = {
    showNavbar,
    showMetrics,
    // showRoster,
    // showChatView,
    // showWhiteboardView,

    toggleNavbar,
    toggleMetrics,
    // toggleRoster,
    // toggleChatView,
    // toggleWhiteboardView,

    openNavbar,
    closeNavbar,
    // openRoster,
    // closeRoster,
    // openChatView,
    // closeChatView,
    // openWhiteboardView,
    // closeWhiteboardView,
    naviShowTarget, 
    setNaviShowTarget
  };
  return (
    <NavigationContext.Provider value={providerValue}>
      {children}
    </NavigationContext.Provider>
  );
};

const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw Error('Use useNavigation in NavigationProvider');
  }
  return context;
};

export { NavigationProvider, useNavigation };
