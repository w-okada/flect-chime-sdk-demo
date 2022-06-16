import React, { useMemo } from "react";
import "./100_components/001_css/001_App.css";

import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
library.add(fas, far, fab);

// @ts-ignore
import logo from "../resources/icons/flect.png";
import { Frame } from "./100_components/100_Frame";

const App = () => {
    const frame = useMemo(() => {
        return <Frame />;
    }, []);
    return <div className="application-container">{frame}</div>;
};

export default App;
