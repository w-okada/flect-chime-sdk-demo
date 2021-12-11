export const HTTPResponseCode = {
    SUCCESS: "SUCCESS",
    INVALID_TOKEN_EXCEPTION: "INVALID_TOKEN_EXCEPTION",
} as const;

type HTTPResponseCode = typeof HTTPResponseCode[keyof typeof HTTPResponseCode];

export type HTTPResponseBody = {
    success: boolean;
    code: string;
    data?: any;
};

export type SlackHTTPGetUserInformationRequest = {
    token: string;
};
export type SlackHTTPGetUserInformationResponse = {
    roomKey: string;
    roomName: string;
    channelId: string;
    channelName: string;
    userId: string;
    userName: string;
    imageUrl: string;
    chimeInfo: {
        attendeeName: string;
        useDefault: boolean;
    };
};
