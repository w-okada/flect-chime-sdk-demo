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
import { MeetingManagerSignin } from './pages/100_MeetingManagerSignin/MeetingManagerSingin';
import { MeetingManager } from './pages/101_MeetingManager/MeetingManager';
import { HeadlessMeetingManager } from './pages/200_HeadlessMeetingManager/HeadMeetingManager';
import { HeadlessMeetingManager2 } from './pages/201_HeadlessMeetingManager/MeetingManager';
import { MeetingManagerSignin3 } from './pages/300_MeetingManagerSignin3/MeetingManagerSingin';
import { MeetingManager3 } from './pages/301_MeetingManager3/MeetingManager';
import { AppStateProvider, useAppState } from './providers/AppStateProvider';


const Router = () => {
    const { stage } = useAppState()
    console.log(`[App] stage:${stage}`)

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
            case "MEETING_MANAGER_SIGNIN":
                return <MeetingManagerSignin />
            case "MEETING_MANAGER":
                return <MeetingManager />
            case "HEADLESS_MEETING_MANAGER":
                return <HeadlessMeetingManager />
            case "HEADLESS_MEETING_MANAGER2":
                return <HeadlessMeetingManager2 />


            // // case "MEETING_MANAGER_SIGNIN3":
            // case "HEADLESS_MEETING_MANAGER":
            //         return <MeetingManagerSignin3 />
            // case "MEETING_MANAGER3":
            //     return <MeetingManager3 />

            default:
                return <div>no view</div>

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
