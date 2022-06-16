import React, { useMemo } from "react";
import { useAppState } from "../003_provider/AppStateProvider";
import { MainVideoArea } from "./100-4-1_MainVideoArea";
import { BottomNav } from "./100-4-2_BottomNav";

export const MainArea = () => {
    const { frontendState } = useAppState();

    const mainArea = useMemo(() => {
        return (
            <>
                {frontendState.stateControls.openSidebarCheckbox.trigger}
                {frontendState.stateControls.openRightSidebarCheckbox.trigger}
                <div className="main-area">
                    <MainVideoArea></MainVideoArea>
                    <BottomNav></BottomNav>
                </div>
            </>
        );
    }, []);
    return mainArea;
};
