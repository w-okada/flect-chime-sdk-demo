import { RestApiClientContext } from "./RestApiClient";
import { HTTPResponseBody } from "./common";
import { HTTPCreateMeetingRequest, HTTPCreateMeetingResponse, HTTPListMeetingsRequest, HTTPListMeetingsResponse } from "../http_request";

// (1) Create Meeting (POST)
export type RestCreateMeetingRequest = HTTPCreateMeetingRequest
export type RestCreateMeetingResponse = HTTPCreateMeetingResponse
export const createMeeting = async (params: RestCreateMeetingRequest, context: RestApiClientContext): Promise<RestCreateMeetingResponse> => {
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
    const data = response.data as RestCreateMeetingResponse;
    return data;
};



// (2) List Meetings (GET)
export type RestListMeetingsRequest = HTTPListMeetingsRequest
export type RestListMeetingsResponse = HTTPListMeetingsResponse
export const listMeetings = async (params: RestListMeetingsRequest, context: RestApiClientContext): Promise<RestListMeetingsResponse> => {
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
    const data = response.data as RestListMeetingsResponse;
    return data;
};

// (3)  (PUT) -> no support
// (4)  (DELETE) -> no support
