import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

import { relative } from "path";

const Sidebar = () => {
    return (
        <>
            <div id="test2">
                <div id="test1">
                    {/* <input type="checkbox" className="openSidebarMenu" id="openSidebarMenu" /> */}
                    <div></div>
                    <div id="sidebarMenu">
                        {/* <ul className="sidebarMenuInner">
                            <li>
                                Jelena Jovanovic <span>Web Developer</span>
                            </li>
                            <li>
                                <a href="https://vanila.io" target="_blank">
                                    Company
                                </a>
                            </li>
                            <li>
                                <a href="https://instagram.com/plavookac" target="_blank">
                                    Instagram
                                </a>
                            </li>
                            <li>
                                <a href="https://twitter.com/plavookac" target="_blank">
                                    Twitter
                                </a>
                            </li>
                            <li>
                                <a href="https://www.youtube.com/channel/UCDfZM0IK6RBgud8HYGFXAJg" target="_blank">
                                    YouTube
                                </a>
                            </li>
                            <li>
                                <a href="https://www.linkedin.com/in/plavookac/" target="_blank">
                                    Linkedin
                                </a>
                            </li>
                        </ul> */}
                    </div>
                </div>
            </div>
            {/* <label htmlFor="openSidebarMenu" className="sidebarIconToggle">
                <div className="spinner diagonal part-1"></div>
                <div className="spinner horizontal"></div>
                <div className="spinner diagonal part-2"></div>
            </label> */}
        </>
    );
};

// @ts-ignore
import logo from "../resources/icons/flect.png";
import { Frame, FrameProps } from "./100_components/100_Frame";
import { SignInDialogProps } from "./100_components/101-1_SignInDialog";

const Router = () => {
    const { stageState, cognitoClientState, frontendState } = useAppState();
    console.log("STAGE:::", stageState);
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

    // const [h, setH] = useState(false);

    // const singInProps: SignInDialogProps = {
    //     signIn: cognitoClientState.signIn,
    //     signUp: cognitoClientState.signUp,
    //     verify: cognitoClientState.verify,
    //     resendVerification: cognitoClientState.resendVerification,
    //     sendVerificationCodeForChangePassword: cognitoClientState.sendVerificationCodeForChangePassword,
    //     changePassword: cognitoClientState.changePassword,

    //     signInSucceeded: (username: string) => {
    //         stageState.setSignInComplete(true);
    //         frontendState.setUserName(username);
    //         console.log("sign in succeeded!!");
    //     },
    // };
    // return (
    //     <>
    //         <Header userName={frontendState.username}></Header>
    //         <Sidebar></Sidebar>
    //         <SignInDialog {...singInProps}></SignInDialog>
    //     </>
    // );
};

const App = () => {
    const { stageState, cognitoClientState, frontendState } = useAppState();
    const singInProps: SignInDialogProps = {
        signIn: cognitoClientState.signIn,
        signUp: cognitoClientState.signUp,
        verify: cognitoClientState.verify,
        resendVerification: cognitoClientState.resendVerification,
        sendVerificationCodeForChangePassword: cognitoClientState.sendVerificationCodeForChangePassword,
        changePassword: cognitoClientState.changePassword,

        signInSucceeded: (username: string) => {
            stageState.setSignInComplete(true);
            frontendState.setUserName(username);
            console.log("sign in succeeded!!");
        },
    };
    const frameProps: FrameProps = {
        signInCompleted: cognitoClientState.signInCompleted,
        signInDialogProps: singInProps,
    };
    const frame = <Frame {...frameProps}></Frame>;

    return <div className="application-container">{frame}</div>;
};

export default App;
