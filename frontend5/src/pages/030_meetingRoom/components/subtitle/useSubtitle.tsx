import React, { useMemo } from "react";
import { useAppState } from "../../../../providers/AppStateProvider";

export const useSubtitle = () => {
    const { chimeClientState } = useAppState();

    const subtitle = useMemo(() => {
        if (chimeClientState.transcribeEnable === false) {
            return <></>;
        }

        if (chimeClientState.transcriptionScripts.length > 0) {
            const lastScript = chimeClientState.transcriptionScripts.slice(-1)[0];
            const partialScript = chimeClientState.transcriptionPartialScript;
            return (
                <div style={{ width: "100%", height: "100%", background: "#eeeeeedd", display: "flex", flexDirection: "column", justifyItems: "center" }}>
                    <div>{lastScript.script}</div>
                    <div>{partialScript?.script}</div>
                </div>
            );
        } else {
            return <></>;
        }
    }, [chimeClientState.transcriptionScripts, chimeClientState.transcriptionPartialScript]);
    return { subtitle };
};
