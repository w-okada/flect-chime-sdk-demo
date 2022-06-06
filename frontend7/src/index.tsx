import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AppStateProvider } from "./003_provider/AppStateProvider";

const container = document.getElementById("app")!;
const root = createRoot(container);
root.render(
    <AppStateProvider>
        <App />
    </AppStateProvider>
);
