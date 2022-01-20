import { RestAPIEndpoint } from "../../../BackendConfig";
import { Failure, Result, Success } from "../../../common/exception";
import { SlackHTTPGetUserInformationResponse } from "./http_request";

export type SlackRestApiContext = {
    token: string;
};

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
    const url = `${RestAPIEndpoint}slack/api/decodeInformation`;
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
    const response = await res.json();
    console.log(response);
    if (response.success && response.data) {
        // console.log(`getUserInformation success`);
        const httpResponse = response.data as SlackHTTPGetUserInformationResponse;
        const returnValue: SlackGetUserInformationResponse = { ...httpResponse };
        return new Success(returnValue);
    } else {
        // console.log(`getUserInformation fail`);
        return new Failure(response);
    }
};
