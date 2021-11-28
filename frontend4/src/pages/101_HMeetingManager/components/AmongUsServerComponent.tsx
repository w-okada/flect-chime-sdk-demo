import React, { useMemo } from "react";
import { useAppState } from "../../../providers/AppStateProvider";

export const AmongUsServerComponent = () => {
    const { updateGameState } = useAppState();

    const view = useMemo(() => {
        return (
            <div>
                <input id="io_event" />
                <input id="io_data" />
                <button
                    id="io_click"
                    onClick={() => {
                        const ev = document.getElementById("io_event") as HTMLInputElement;
                        const data = document.getElementById("io_data") as HTMLInputElement;
                        // console.log("RECEIVE DATA:", data.value)
                        updateGameState(ev.value, data.value);
                    }}
                />
            </div>
        );
    }, [updateGameState]); // eslint-disable-line
    return <>{view}</>;
};
