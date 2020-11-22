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

type SHOW_NAVI_TARGET =  "NONE" | "ROSTER" | "CHAT" | "WHITEBOARD" | "FILE_TRANSFER"

export type NavigationContextType = {
  showNavbar: boolean;
  toggleNavbar: () => void;
  openNavbar: () => void;
  closeNavbar: () => void;

  showMetrics: boolean;
  toggleMetrics: () => void;

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



  const openNavbar = (): void => {
    setShowNavbar(true);
  };

  const closeNavbar = (): void => {
    setShowNavbar(false);
  };


  const providerValue = {
    showNavbar,
    showMetrics,

    toggleNavbar,
    toggleMetrics,

    openNavbar,
    closeNavbar,
    
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
