import { Failure, Result, Success } from "../exception";
import fetch from "node-fetch";
import { HTTPResponseBody, SlackHTTPGetUserInformationResponse } from "../http_request";

export type SlackRestApiContext = {
    restApiBaseURL: string;
    token: string;
};

// export type SlackGetUserInformationRequest = {
//     dummy:string
// };
export type SlackGetUserInformationResponse = {
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

// export const createMeeting = async (context: SlackRestApiContext): Promise<Result<SlackGetUserInformationResponse, Error>> => {
export const getUserInformation = async (context: SlackRestApiContext): Promise<Result<SlackGetUserInformationResponse, Error>> => {
    const url = `${context.restApiBaseURL}api/decodeInformation`;
    const httpRequest = {
        token: `${context.token}`,
    };
    const requestBody = JSON.stringify(httpRequest);
    const res = await fetch(url, {
        method: "POST",
        body: requestBody,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    });
    const response = (await res.json()) as HTTPResponseBody;
    if (response.success) {
        const httpResponse = response.data as SlackHTTPGetUserInformationResponse;
        const returnValue: SlackGetUserInformationResponse = { ...httpResponse };
        return new Success(returnValue);
    } else {
        return new Failure(new Error("slack federation failed..."));
    }
};
