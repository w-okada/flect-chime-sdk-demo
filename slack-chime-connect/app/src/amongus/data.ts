export type PlayerState = {
    name: string;
    isDead: boolean;
    isDeadDiscovered: boolean;
    disconnected: boolean;
    color: number;
    action: number;
    attendeeId?: string;
    chimeName?: string;
};
export type GameState = {
    hmmAttendeeId: string;
    state: number;
    lobbyCode: string;
    gameRegion: number;
    map: number;
    connectCode: string;
    players: PlayerState[];
};
export const generateInitialGameState = (): GameState => {
    return {
        hmmAttendeeId: "",
        state: 3,
        lobbyCode: "",
        gameRegion: 0,
        map: 0,
        connectCode: "",
        players: [],
    };
};
