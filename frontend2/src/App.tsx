import React from 'react';
import './App.css';
import { AppStateProvider } from './providers/AppStateProvider';
import { Home } from './pages/Home';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import routes from './constants/routes';
import { Signup } from './pages/Signup';
import { Verify } from './pages/Verirfy';
import { SendVerificationForChangePassword } from './pages/SendVerificationForChangePassword';
import { NewPassword } from './pages/NewPassword';
import { Entrance } from './pages/Entrance';
import { CreateMeetingRoom } from './pages/CreateMeetingRoom';
import { WaitingRoom } from './pages/WaitingRoom';
import { MeetingRoom } from './pages/MeetingRoom';
import { MessageDialog } from './components/MessageDialg';
import { RealitimeSubscribeStateProvider } from './providers/realtime/RealtimeSubscribeProvider';

function App() {
    return (
        <Router>
            <div className="App">
                <AppStateProvider>
                    <RealitimeSubscribeStateProvider>
                        <Switch>
                            <Route exact path={routes.ROOT} component={Home} />
                            <Route exact path={routes.HOME} component={Home} />
                            <Route exact path={routes.SIGNUP} component={Signup} />
                            <Route exact path={routes.VERIFY} component={Verify} />
                            <Route exact path={routes.SEND_VERIFICATION_CODE_FOR_CHANGE_PASSWORD} component={SendVerificationForChangePassword} />
                            <Route exact path={routes.NEW_PASSWORD} component={NewPassword} />


                            <Route exact path={routes.ENTRANCE} component={Entrance} />
                            <Route exact path={routes.CREATE_MEETING_ROOM} component={CreateMeetingRoom} />
                            <Route exact path={routes.WAITING_ROOM} component={WaitingRoom} />
                            <Route exact path={routes.MEETING_ROOM} component={MeetingRoom} />


                            

                            {/* <Route exact path={routes.SIGNIN} component={SignIn} /> */}

                            {/* <Home /> */}
                        </Switch>
                    </RealitimeSubscribeStateProvider> 
                    <MessageDialog />
                </AppStateProvider>
            </div>
        </Router>
    );
}

export default App;
