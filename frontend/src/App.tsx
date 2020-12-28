
import React, { FC } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import {
  lightTheme,
  MeetingProvider,
  NotificationProvider,
  darkTheme,
  GlobalStyles,
  UserActivityProvider
} from 'amazon-chime-sdk-component-library-react';

import routes from './constants/routes';
import { AppStateProvider, useAppState } from './providers/AppStateProvider';
import Notifications from './containers/Notifications';
import ErrorProvider from './providers/ErrorProvider';
import meetingConfig from './meetingConfig';
import { NavigationProvider } from './providers/NavigationProvider';
import { SignIn, Home, DeviceSetup, Meeting } from './views';
import NoMeetingRedirect from './containers/NoMeetingRedirect';
// import { Meeting, Home, DeviceSetup } from './views';
import { VideoEffectStateProvider } from './providers/VideoEffectProvider/VideoEffectProvider'
import SecondWhiteboardView from './views/SecondWhiteboard';
import * as AWS from 'aws-sdk/global';

const App: FC = () => (
  <Router>
    <AppStateProvider>
      <Theme>
        <NotificationProvider>
          <Notifications />
          <ErrorProvider>
            <MeetingProvider {...meetingConfig}>
              <UserActivityProvider>
                <NavigationProvider>
                  <VideoEffectStateProvider>
                    <Switch>
                      <Route exact path={routes.HOME} component={Home} />
                      <Route exact path={routes.SIGNIN} component={SignIn} />
                      <Route path={routes.DEVICE}>
                        <NoMeetingRedirect>
                          <DeviceSetup />
                        </NoMeetingRedirect>
                      </Route>
                      <Route path={routes.MEETING}>
                        <NoMeetingRedirect>
                          <Meeting />
                        </NoMeetingRedirect>
                      </Route>
                      <Route path={routes.WHITEBOARD}>
                          <SecondWhiteboardView />
                        WHITEBOARD!!!!
                      </Route>
                    </Switch>
                  </VideoEffectStateProvider>
                </NavigationProvider>
              </UserActivityProvider>
            </MeetingProvider>
          </ErrorProvider>
        </NotificationProvider>
      </Theme>
    </AppStateProvider>
  </Router>
);

const Theme: React.FC = ({ children }) => {
  const { theme } = useAppState();

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyles />
      {children}
    </ThemeProvider>
  );
};

export default App;