import React, { useMemo, useState } from "react";

import "./App.css";

import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
library.add(fas, far, fab);

// import { MessageDialog } from "./pages/000_common/MessageDialg";
// import { SignIn } from "./pages/010_signin/11_Signin";
// import { SignUp } from "./pages/010_signin/12_Signup";
// import { Verify } from "./pages/010_signin/13_Verify";
// import { RequestChangePassword } from "./pages/010_signin/14_requestChangePassword";
// import { NewPassword } from "./pages/010_signin/15_newPassword";
// import { Entrance } from "./pages/020_entrance/21_Entrance";
// import { WaitingRoom } from "./pages/020_entrance/22_WaitingRoom";
// import { CreateMeetingRoom } from "./pages/020_entrance/23_CreateMeetingRoom";
// import { MeetingRoom } from "./pages/030_meetingRoom/MeetingRoom";
// import { SigninFromSlack } from "./pages/100_federattion/101_slack/101_SigninFromSlack";
import { AppStateProvider, useAppState } from "./providers/AppStateProvider";
import { FOR_FEDERATION, STAGE } from "./providers/hooks/useStageManager";
import { SignInDialog, SignInDialogProps } from "./100_components/001_dialogs/010_SignInDialog";

const Router = () => {
    const { stage, cognitoClientState } = useAppState();
    console.log("STAGE:::", stage);
    // const page = useMemo(() => {
    //     switch (stage) {
    //         case "SIGNIN":
    //             return <SignIn />;
    //         case "SIGNUP":
    //             return <SignUp />;
    //         case "VERIFY":
    //             return <Verify />;
    //         case "REQUEST_NEW_PASSWORD":
    //             return <RequestChangePassword />;
    //         case "NEW_PASSWORD":
    //             return <NewPassword />;
    //         case "ENTRANCE":
    //             return <Entrance />;
    //         case "ENTRANCE_AS_GUEST":
    //             return <Entrance asGuest />;
    //         case "WAITING_ROOM":
    //             return <WaitingRoom />;
    //         case "CREATE_MEETING_ROOM":
    //             return <CreateMeetingRoom />;
    //         case "MEETING_ROOM":
    //             return <MeetingRoom />;

    //         case FOR_FEDERATION.SLACK_SIGNUP:
    //             return <SigninFromSlack />;
    //         // case "MEETING_MANAGER":
    //         //     return <MeetingManager />;
    //         // case "HEADLESS_MEETING_MANAGER":
    //         //     return <HeadlessMeetingManager />;
    //         default:
    //             return <div>no view</div>;
    //     }
    // }, [stage]);
    // return <div>{page}</div>;

    const [h, setH] = useState(false);

    const singInProps: SignInDialogProps = {
        signIn: cognitoClientState.signIn,
        signUp: cognitoClientState.signUp,
        verify: cognitoClientState.verify,
        resendVerification: cognitoClientState.resendVerification,
        sendVerificationCodeForChangePassword: cognitoClientState.sendVerificationCodeForChangePassword,
        changePassword: cognitoClientState.changePassword,

        signInSucceeded: () => {
            console.log("sign in succeeded!!");
        },
    };
    return (
        <>
            <div>Flect Co., Ltd.</div>
            <SignInDialog {...singInProps}></SignInDialog>
        </>
    );
};

const App = () => {
    return (
        <AppStateProvider>
            <Router />
            {/* <MessageDialog /> */}
        </AppStateProvider>
    );
};

export default App;
