import React from 'react';
import './App.css';
import { MessageDialog } from './pages/000_common/MessageDialg';
import { SignIn } from './pages/010_signin';
import { SignUp } from './pages/011_signup';
import { Verify } from './pages/012_verify';
import { RequestChangePassword } from './pages/013_requestChangePassword';
import { NewPassword } from './pages/014_newPassword';
import { Entrance } from './pages/020_entrance';
import { CreateMeetingRoom } from './pages/021_createMeetingRoom';
import { WaitingRoom } from './pages/022_waitingRoom/WaitingRoom';
import { MeetingRoom } from './pages/023_meetingRoom/MeetingRoom';
import { AppStateProvider, useAppState } from './providers/AppStateProvider';


const Router = () => {
    const { stage} = useAppState()
    const page = (()=>{
        switch(stage){
            case "SIGNIN":
                return <SignIn />
            case "SIGNUP":
                return <SignUp />
            case "VERIFY":
                return <Verify />
            case "REQUEST_NEW_PASSWORD":
                return <RequestChangePassword />
            case "NEW_PASSWORD":
                return <NewPassword />
            case "ENTRANCE":
                return <Entrance />
            case "CREATE_MEETING_ROOM":
                return <CreateMeetingRoom />
            case "WAITING_ROOM":
                return <WaitingRoom />
            case "MEETING_ROOM":
                return <MeetingRoom />
        }
    })()
    return (
        <>
        {page}
        </>
    )
}


const App = () => {
    return (
        <div>
            <AppStateProvider>
                <Router />
                <MessageDialog />
            </AppStateProvider>
        </div>
    );
}

export default App;
