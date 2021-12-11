import { Result } from "../exception";
export declare type SlackRestApiContext = {
    restApiBaseURL: string;
    token: string;
};
export declare type SlackGetUserInformationResponse = {
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
export declare const getUserInformation: (context: SlackRestApiContext) => Promise<Result<SlackGetUserInformationResponse, Error>>;
