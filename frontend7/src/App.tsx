import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./App.css";

import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
library.add(fas, far, fab);

import { useAppState } from "./003_provider/AppStateProvider";

// @ts-ignore
import logo from "../resources/icons/flect.png";
import { Frame, FrameProps } from "./100_components/100_Frame";
import { SignInDialogProps } from "./100_components/101-1_SignInDialog";

const App = () => {
    const { cognitoClientState, chimeClientState, frontendState } = useAppState();
    const singInProps: SignInDialogProps = {
        signInSucceeded: (username: string) => {
            frontendState.setUserName(username);
            console.log("sign in succeeded!!");
        },
        defaultEmail: "mail2wokada@gmail.com",
        defaultPassword: "test22",
        defaultUsername: "wo",
    };
    const frameProps: FrameProps = {
        signInCompleted: cognitoClientState.signInCompleted,
        signInDialogProps: singInProps,
    };
    const frame = <Frame {...frameProps}></Frame>;

    return <div className="application-container">{frame}</div>;
};

export default App;
