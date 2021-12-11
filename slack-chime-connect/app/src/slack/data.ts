//////////////
// Chat Data
//////////////

export const generateInitialRoom = (key: string, teamId: string, channelId: string, channelName: string | null, ts: string, roomName: string, voiceChatTs: string | null, voiceChatId: string | null, enabled: boolean): ROOM => {
    return {
        key,
        teamId,
        channelId,
        channelName,
        ts,
        roomName,
        voiceChatTs,
        voiceChatId,
        enabled,
        words: [],
    };
};

export type ROOM = {
    key: string;
    teamId: string;
    channelId: string;
    channelName: string;
    ts: string;
    roomName: string;
    voiceChatTs: string | null;
    voiceChatId: string | null;
    enabled: boolean;
    words: {
        userId: string;
        userName: string;
        word: string;
        timestamp: number;
        imageUrl: string;
    }[];
};

export type ROOMS = {
    [key: string]: ROOM;
};

///////////////
// User Data
//////////////
export type UserInformation = {
    roomKey: string;
    roomName: string;
    teamId: string;
    channelId: string;
    channelName: string;
    userId: string;
    userName: string;
    imageUrl: string;
    chimeInfo?: ChimeInfo;
};

export type ChimeInfo = {
    attendeeName: string;
    useDefault: boolean;
};
