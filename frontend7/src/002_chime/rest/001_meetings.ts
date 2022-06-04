import { RestApiClientContext } from "./RestApiClient";
import { Chime } from "aws-sdk";
import { HTTPResponseBody } from "./common";
import { HTTPCreateMeetingRequest, HTTPCreateMeetingResponse, HTTPListMeetingsRequest, HTTPListMeetingsResponse } from "../../http_request";

// (1) List Meetings (GET)
export const listMeetings = async (params: HTTPListMeetingsRequest, context: RestApiClientContext): Promise<HTTPListMeetingsResponse> => {
    const url = `${context.baseUrl}meetings`;
    const res = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: context.idToken,
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Flect-Access-Token": context.codeToAccess || context.accessToken,
        },
    });
    const response = (await res.json()) as HTTPResponseBody;
    if (response.success === false) {
        console.log(response.code);
        throw response.code;
    }
    const data = response.data as HTTPListMeetingsResponse;
    return data;
};

// (2) Create Meeting (POST)
export const createMeeting = async (params: HTTPCreateMeetingRequest, context: RestApiClientContext): Promise<HTTPCreateMeetingResponse> => {
    const url = `${context.baseUrl}meetings`;
    params.meetingName = encodeURIComponent(params.meetingName);

    const requestBody = JSON.stringify(params);
    const res = await fetch(url, {
        method: "POST",
        body: requestBody,
        headers: {
            Authorization: context.idToken,
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Flect-Access-Token": context.codeToAccess || context.accessToken,
        },
    });
    const response = (await res.json()) as HTTPResponseBody;
    console.log("createMeeting:", response)
    if (response.success === false) {
        console.log(response.code);
        throw response.code;
    }
    const data = response.data as HTTPCreateMeetingResponse;
    return data;
};


