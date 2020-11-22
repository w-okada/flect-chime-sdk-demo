import React from 'react';

import {
  Navbar,
  NavbarHeader,
  NavbarItem,
  Attendees,
  Eye,
  Information,
  Chat,
  Document,
  Arrow
} from 'amazon-chime-sdk-component-library-react';

import { useNavigation } from '../../providers/NavigationProvider';
import { useAppState } from '../../providers/AppStateProvider';

const Navigation = () => {
  const { toggleMetrics, closeNavbar, setNaviShowTarget, naviShowTarget } = useNavigation();
  const { theme, toggleTheme } = useAppState();

  return (
    <Navbar className="nav" flexDirection="column" container>
      <NavbarHeader title="Navigation" onClose={closeNavbar} />
      <NavbarItem
        icon={<Attendees />}
        onClick={()=>{
          naviShowTarget === "ROSTER" ? setNaviShowTarget("NONE"): setNaviShowTarget("ROSTER")
        }}
        label="Attendees"
      />
      <NavbarItem
        icon={<Chat />}
        onClick={()=>{
          naviShowTarget === "CHAT" ? setNaviShowTarget("NONE"): setNaviShowTarget("CHAT")
        }}
        label="Chat"
      />      
      <NavbarItem
        icon={<Document />}
        onClick={()=>{
          naviShowTarget === "WHITEBOARD" ? setNaviShowTarget("NONE"): setNaviShowTarget("WHITEBOARD")
        }}
        label="Draw"
      />      
      <NavbarItem
        icon={<Arrow />}
        onClick={()=>{
          naviShowTarget === "FILE_TRANSFER" ? setNaviShowTarget("NONE"): setNaviShowTarget("FILE_TRANSFER")
        }}
        label="Draw"
      />      
      <NavbarItem
        icon={<Eye />}
        onClick={toggleTheme}
        label={theme === 'light' ? 'Dark mode' : 'Light mode'}
      />
      <NavbarItem
        icon={<Information />}
        onClick={toggleMetrics}
        label="Meeting metrics"
      />

    </Navbar>
  );
};

export default Navigation;
