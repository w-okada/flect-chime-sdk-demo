import React, { useMemo } from 'react';
import './App.css';
import { AppStateProvider, useAppState } from './providers/AppStateProvider';
import { MessageDialog } from './pages/000_common/MessageDialg';
import { SignIn } from './pages/010_signin';
import { SignUp } from './pages/011_signup';
import { Verify } from './pages/012_verify';
import { RequestChangePassword } from './pages/013_requestChangePassword';
import { NewPassword } from './pages/014_newPassword';
import { Entrance } from './pages/020_entrance';
import { CreateMeetingRoom } from './pages/021_createMeetingRoom';
import { WaitingRoomAmongUs } from './pages/022_waitingRoom/WaitingRoomAmongUs';
import { WaitingRoom } from './pages/022_waitingRoom/WaitingRoom';
import { MeetingRoom } from './pages/023_meetingRoom/MeetingRoom';
import { HeadlessMeetingManager } from './pages/200_HeadlessMeetingManager/HeadlessMeetingManager';
import { MeetingManager } from './pages/100_MeetingManager/MeetingManager';
// import { Verify } from './pages/012_verify';
// import { RequestChangePassword } from './pages/013_requestChangePassword';
// import { NewPassword } from './pages/014_newPassword';
// import { Entrance } from './pages/020_entrance';
// import { CreateMeetingRoom } from './pages/021_createMeetingRoom';
// import { WaitingRoom } from './pages/022_waitingRoom/WaitingRoom';
// import { WaitingRoomAmongUs } from './pages/022_waitingRoom/WaitingRoomAmongUs';
// import { MeetingRoom } from './pages/023_meetingRoom/MeetingRoom';
// import { MeetingRoomAmongUs } from './pages/024_meetingRoomAmongUs/MeetingRoomAmongUs';
// import { MeetingManagerSignin } from './pages/100_MeetingManagerSignin/MeetingManagerSingin';
// import { MeetingManager } from './pages/101_MeetingManager/MeetingManager';
// import { HeadlessMeetingManager } from './pages/200_HeadlessMeetingManager/HeadlessMeetingManager';
// import { AppStateProvider, useAppState } from './providers/AppStateProvider';


const Router = () => {
    const { stage, mode } = useAppState()
    console.log(`[App] stage:${stage}`)

    const page = useMemo(()=>{
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
                if(mode === "amongus"){
                    return <WaitingRoomAmongUs />
                }else{
                    return <WaitingRoom />
                }
            case "MEETING_ROOM":
                if(mode === "amongus"){
                    console.log("meeting room among")
                    return <WaitingRoomAmongUs />
                }else {
                    console.log("meeting room ")
                    return <MeetingRoom />
                }
            case "MEETING_MANAGER":
                return <MeetingManager />
            case "HEADLESS_MEETING_MANAGER":
                return <HeadlessMeetingManager />

            default:
                return <div>no view</div>

        }
    },[stage, mode])
    return (
        <div >
          {page}
        </div>
    )
}


const App = () => {
    return (
        <div >
            <AppStateProvider>
                <Router />
                <MessageDialog />
            </AppStateProvider>
        </div>
    );
}

export default App;
