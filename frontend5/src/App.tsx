import React, { useMemo } from "react";
import { MessageDialog } from "./pages/000_common/MessageDialg";
import { SignIn } from "./pages/010_signin/11_Signin";
import { SignUp } from "./pages/010_signin/12_Signup";
import { Verify } from "./pages/010_signin/13_Verify";
import { RequestChangePassword } from "./pages/010_signin/14_requestChangePassword";
import { NewPassword } from "./pages/010_signin/15_newPassword";
import { Entrance } from "./pages/020_entrance/21_Entrance";
import { WaitingRoom } from "./pages/020_entrance/22_WaitingRoom";
import { CreateMeetingRoom } from "./pages/020_entrance/23_CreateMeetingRoom";
import { MeetingRoom } from "./pages/030_meetingRoom/MeetingRoom";
import { AppStateProvider, useAppState } from "./providers/AppStateProvider";
// import { MessageDialog } from "./pages/000_common/MessageDialg";
// import { SignIn } from "./pages/010_signin";
// import { SignUp } from "./pages/011_signup";
// import { Verify } from "./pages/012_verify";
// import { RequestChangePassword } from "./pages/013_requestChangePassword";
// import { NewPassword } from "./pages/014_newPassword";
// import { Entrance } from "./pages/020_entrance";
// import { CreateMeetingRoom } from "./pages/021_createMeetingRoom";
// import { WaitingRoomAmongUs } from "./pages/022_waitingRoom/WaitingRoomAmongUs";
// import { WaitingRoom } from "./pages/022_waitingRoom/WaitingRoom";
// import { MeetingRoom } from "./pages/023_meetingRoom/MeetingRoom";
// import { MeetingManager } from "./pages/100_MeetingManager/MeetingManager";
// import { MeetingRoomAmongUs } from "./pages/024_meetingRoomAmongUs/MeetingRoomAmongUs";
// import { HeadlessMeetingManager } from "./pages/101_HMeetingManager/HeadlessMeetingManager";

const Router = () => {
    const { stage } = useAppState();
    const page = useMemo(() => {
        switch (stage) {
            case "SIGNIN":
                return <SignIn />;
            case "SIGNUP":
                return <SignUp />;
            case "VERIFY":
                return <Verify />;
            case "REQUEST_NEW_PASSWORD":
                return <RequestChangePassword />;
            case "NEW_PASSWORD":
                return <NewPassword />;
            case "ENTRANCE":
                return <Entrance />;
            case "ENTRANCE_AS_GUEST":
                return <Entrance asGuest />;
            case "WAITING_ROOM":
                return <WaitingRoom />;
            case "CREATE_MEETING_ROOM":
                return <CreateMeetingRoom />;
            case "MEETING_ROOM":
                return <MeetingRoom />;
            // case "MEETING_MANAGER":
            //     return <MeetingManager />;
            // case "HEADLESS_MEETING_MANAGER":
            //     return <HeadlessMeetingManager />;
            default:
                return <div>no view</div>;
        }
    }, [stage]);
    return <div>{page}</div>;
};

const App = () => {
    return (
        <div>
            <AppStateProvider>
                <Router />
                <MessageDialog />
            </AppStateProvider>
        </div>
    );
};

export default App;
