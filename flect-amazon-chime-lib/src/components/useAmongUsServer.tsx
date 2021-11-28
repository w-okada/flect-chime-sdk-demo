import { useState } from "react";

import { FlectChimeClient } from "../chime/FlectChimeClient";

export const useAmongUsServer = () => {
    const [chimeClient, setChimeClient] = useState<FlectChimeClient | null>(null);

    const updateGameState = (ev: string, data: string) => {
        // console.log(`[useAmongUsServer] update gamestate ${data}`)
        try {
            chimeClient?.hmmClient?.amongUsServer?.updateGameState(ev, data);
        } catch (exception) {
            console.log(`[useAmongUsServer][updateGameState] exception!!!!!`, exception);
        }
        // console.log(`[useAmongUsServer] ${chimeClient} ${chimeClient ? chimeClient.hmmClient : "hmm none"} ${chimeClient?.hmmClient ? chimeClient.hmmClient.amongUsServer:" among none"}`)
    };
    return { updateGameState, setChimeClient };
};
