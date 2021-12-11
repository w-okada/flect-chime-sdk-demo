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
import { SigninFromSlack } from "./pages/100_federattion/101_slack/101_SigninFromSlack";
import { AppStateProvider, useAppState } from "./providers/AppStateProvider";
import { FOR_FEDERATION, STAGE } from "./providers/hooks/useStageManager";

const Router = () => {
    const { stage } = useAppState();
    console.log("STAGE:::", stage);
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

            case FOR_FEDERATION.SLACK_SIGNUP:
                return <SigninFromSlack />;
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
