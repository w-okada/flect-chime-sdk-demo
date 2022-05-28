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
import { SignInDialog, SignInDialogProps } from "./100_components/001_dialogs/010_SignInDialog";
import { Header } from "./100_components/002_header/010_Header";
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

    const [h, setH] = useState(false);

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
    return (
        <>
            <Header userName={frontendState.username}></Header>
            <Sidebar></Sidebar>
            <SignInDialog {...singInProps}></SignInDialog>
        </>
    );
};

const App = () => {
    /**
     * components
     */
    // (1) Header Buttons
    //// (1-1) Left space
    ////// (1-1-1) Sidebar Button
    const sidebarButton = (
        <div className="rotate-button-container">
            <input type="checkbox" className="open-sidebar-checkbox rotate-button" id="open-sidebar-checkbox-primary" />
            <label htmlFor="open-sidebar-checkbox-primary" className="rotate-lable">
                <div className="spinner">
                    <FontAwesomeIcon icon={["fas", "bars"]} className="spin-off" />
                    <FontAwesomeIcon icon={["fas", "xmark"]} className="spin-on" />
                </div>
            </label>
        </div>
    );

    //// (1-2) Center space
    // None....

    //// (1-3) Right space

    ///// (1-3-1) Microphone
    const micButton = (
        <div className="rotate-button-container tooltip-bottom" data-tooltip="mic on/off">
            <input type="checkbox" className="mic-enable-checkbox rotate-button" id="mic-enable-checkbox-primary" />
            <label htmlFor="mic-enable-checkbox-primary" className="rotate-lable">
                <div className="colored">
                    <FontAwesomeIcon icon={["fas", "microphone"]} className="spin-on" />
                    <FontAwesomeIcon icon={["fas", "microphone-slash"]} className="spin-off" />
                </div>
            </label>
        </div>
    );

    ///// (1-3-2) Camera
    const cameraButton = (
        <div className="rotate-button-container tooltip-bottom" data-tooltip="camera on/off">
            <input type="checkbox" className="camera-enable-checkbox rotate-button" id="camera-enable-checkbox-primary" />
            <label htmlFor="camera-enable-checkbox-primary" className="rotate-lable">
                <div className="colored">
                    <FontAwesomeIcon icon={["fas", "video"]} className="spin-on" />
                    <FontAwesomeIcon icon={["fas", "video-slash"]} className="spin-off" />
                </div>
            </label>
        </div>
    );

    ///// (1-3-3) Speaker
    const speakerButton = (
        <div className="rotate-button-container tooltip-bottom" data-tooltip="speaker on/off">
            <input type="checkbox" className="speaker-enable-checkbox rotate-button" id="speaker-enable-checkbox-primary" />
            <label htmlFor="speaker-enable-checkbox-primary" className="rotate-lable">
                <div className="colored">
                    <FontAwesomeIcon icon={["fas", "volume-high"]} className="spin-on" />
                    <FontAwesomeIcon icon={["fas", "volume-mute"]} className="spin-off" />
                </div>
            </label>
        </div>
    );

    ///// (1-3-4) Bottom Nav
    const bottomNavButton = (
        <div className="rotate-button-container tooltip-bottom" data-tooltip="show attendee's video">
            <input type="checkbox" className="open-bottom-nav-checkbox rotate-button" id="open-bottom-nav-checkbox-primary" />
            <label htmlFor="open-bottom-nav-checkbox-primary" className="rotate-lable">
                <div className="colored">
                    <FontAwesomeIcon icon={["fas", "users-rectangle"]} className="spin-on" />
                    <FontAwesomeIcon icon={["fas", "users-rectangle"]} className="spin-off" />
                </div>
            </label>
        </div>
    );
    ///// (1-3-5) Right Sidebar
    const rightSidebarButton = (
        <div className="rotate-button-container tooltip-bottom" data-tooltip="open utility area(attendee-list, chat...)">
            <input type="checkbox" className="open-right-sidebar-checkbox rotate-button" id="open-right-sidebar-checkbox-primary" />
            <label htmlFor="open-right-sidebar-checkbox-primary" className="rotate-lable">
                <div className="colored">
                    <div className="spin-on" style={{ position: "relative", width: "100%" }}>
                        <FontAwesomeIcon icon={["fas", "chart-line"]} style={{ width: "45%", height: "65%", top: "-2px", position: "absolute" }} />
                        <FontAwesomeIcon icon={["fas", "comment"]} style={{ width: "35%", height: "35%", right: 0, position: "absolute" }} />

                        <FontAwesomeIcon icon={["fas", "user-group"]} style={{ width: "85%", height: "80%", right: 0, bottom: "-1px", position: "absolute" }} />
                    </div>
                    <div className="spin-off" style={{ position: "relative", width: "100%" }}>
                        <FontAwesomeIcon icon={["fas", "chart-line"]} style={{ width: "45%", height: "65%", top: "-2px", position: "absolute" }} />
                        <FontAwesomeIcon icon={["fas", "comment"]} style={{ width: "35%", height: "35%", right: 0, position: "absolute" }} />

                        <FontAwesomeIcon icon={["fas", "user-group"]} style={{ width: "85%", height: "80%", right: 0, bottom: "-1px", position: "absolute" }} />
                    </div>
                </div>
            </label>
        </div>
    );

    ///// (1-3-6) share screen
    const shareScreenButton = (
        <div className="rotate-button-container tooltip-bottom" data-tooltip="share screen">
            <input type="checkbox" className="share-screen-checkbox rotate-button" id="share-screen-checkbox-primary" />
            <label htmlFor="share-screen-checkbox-primary" className="rotate-lable">
                <div className="colored">
                    <FontAwesomeIcon icon={["fas", "share-from-square"]} className="spin-on" />
                    <FontAwesomeIcon icon={["fas", "share-from-square"]} className="spin-off" />
                </div>
            </label>
        </div>
    );

    ///// (1-3-7) start transcribe
    const startTranscribeButton = (
        <div className="rotate-button-container tooltip-bottom" data-tooltip="transcribe">
            <input type="checkbox" className="start-transcribe-checkbox rotate-button" id="start-transcribe-checkbox-primary" />
            <label htmlFor="start-transcribe-checkbox-primary" className="rotate-lable">
                <div className="colored">
                    <FontAwesomeIcon icon={["fas", "t"]} className="spin-on" />
                    <FontAwesomeIcon icon={["fas", "t"]} className="spin-off" />
                </div>
            </label>
        </div>
    );
    ///// (1-3-8) setting
    const settingButton = (
        <div className="rotate-button-container tooltip-bottom" data-tooltip="setting">
            <input type="checkbox" className="setting-checkbox rotate-button" id="setting-checkbox-primary" />
            <label htmlFor="setting-checkbox-primary" className="rotate-lable">
                <div className="colored">
                    <FontAwesomeIcon icon={["fas", "gear"]} className="spin-on" />
                    <FontAwesomeIcon icon={["fas", "gear"]} className="spin-off" />
                </div>
            </label>
        </div>
    );
    ///// (1-3-9) leave
    const leaveButton = (
        <div className="rotate-button-container tooltip-bottom" data-tooltip="leave demo">
            <input type="checkbox" className="leave-checkbox rotate-button" id="leave-checkbox-primary" />
            <label htmlFor="leave-checkbox-primary" className="rotate-lable">
                <div className="colored">
                    <FontAwesomeIcon icon={["fas", "right-from-bracket"]} className="spin-on" />
                    <FontAwesomeIcon icon={["fas", "right-from-bracket"]} className="spin-off" />
                </div>
            </label>
        </div>
    );

    // (2) Header
    const header = (
        <div className="header">
            <div className="sidebar-button-area">{sidebarButton}</div>
            <div className="status-area"></div>
            <div className="menu-item-area">
                <div className="group">
                    {micButton}
                    {cameraButton}
                    {speakerButton}
                </div>
                <div className="group">
                    {shareScreenButton}
                    {startTranscribeButton}
                    <div className="spacer"></div>
                    {bottomNavButton}
                    {rightSidebarButton}
                </div>
                <div className="group">
                    {settingButton}
                    <div className="spacer"></div>
                    {leaveButton}
                    <div className="spacer"></div>
                </div>
            </div>
        </div>
    );
    // (3) sidebar

    const sidebar = (
        <>
            <input type="checkbox" className="open-sidebar-checkbox" id="open-sidebar-checkbox-secondary" />
            <div className="sidebar"></div>
        </>
    );

    // (4) right sidebar
    const rightSidebar = (
        <>
            <input type="checkbox" className="open-right-sidebar-checkbox" id="open-right-sidebar-checkbox-secondary" />
            <div className="right-sidebar"></div>
        </>
    );

    // (5) bottom nav (belongs to main area)
    const bottomNav = (
        <>
            <input type="checkbox" className="open-bottom-nav-checkbox" id="open-bottom-nav-checkbox-secondary" />
            <input type="checkbox" className="open-sidebar-checkbox" id="open-sidebar-checkbox-secondary" />
            <input type="checkbox" className="open-right-sidebar-checkbox" id="open-right-sidebar-checkbox-secondary" />
            <div className="bottom-nav"></div>
        </>
    );

    // (6) main vide area (belongs to main area)
    const mainVideoArea = (
        <>
            <input type="checkbox" className="open-bottom-nav-checkbox" id="open-bottom-nav-checkbox-secondary" />
            <div className="main-video-area"></div>
        </>
    );

    // (7) main area
    const mainArea = (
        <>
            <input type="checkbox" className="open-sidebar-checkbox" id="open-sidebar-checkbox-secondary" />
            <input type="checkbox" className="open-right-sidebar-checkbox" id="open-right-sidebar-checkbox-secondary" />

            <div className="main-area">
                {mainVideoArea}
                {bottomNav}
            </div>
        </>
    );

    /**
     * action linking
     */
    // (1) sidebar button
    useEffect(() => {
        const sidebar = document.getElementById("open-sidebar-checkbox-primary") as HTMLInputElement;
        const sidebars = document.querySelectorAll(".open-sidebar-checkbox");
        sidebar.onchange = (ev) => {
            sidebars.forEach((x) => {
                // @ts-ignore
                x.checked = ev.target.checked;
            });
        };
    }, []);

    // (2) right sidebar button
    useEffect(() => {
        const rightSidebar = document.getElementById("open-right-sidebar-checkbox-primary") as HTMLInputElement;
        const rightSidebars = document.querySelectorAll(".open-right-sidebar-checkbox");
        rightSidebar.onchange = (ev) => {
            rightSidebars.forEach((x) => {
                // @ts-ignore
                x.checked = ev.target.checked;
            });
        };
    }, []);
    // (3) bottom nav button
    useEffect(() => {
        const bottomNav = document.getElementById("open-bottom-nav-checkbox-primary") as HTMLInputElement;
        const bottomNavs = document.querySelectorAll(".open-bottom-nav-checkbox");
        console.log(bottomNavs);
        bottomNav.onchange = (ev) => {
            bottomNavs.forEach((x) => {
                // @ts-ignore
                x.checked = ev.target.checked;
            });
        };
    }, []);

    return (
        <div className="application-container">
            {header}
            {sidebar}
            {rightSidebar}
            {mainArea}
        </div>
    );
};

export default App;
