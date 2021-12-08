import { HTTPCreateMeetingRequest, HTTPCreateMeetingResponse, HTTPGetMeetingInfoResponse, HTTPResponseBody } from "../http_request";
import { RestApiClientContext } from "./RestApiClient";
/**
 * Create Meeting
 */

export type CreateMeetingRequest = HTTPCreateMeetingRequest;
export type CreateMeetingResponse = HTTPCreateMeetingResponse;
export const createMeeting = async (params: CreateMeetingRequest, context: RestApiClientContext): Promise<CreateMeetingResponse> => {
    const url = `${context.baseUrl}meetings`;
    params.meetingName = encodeURIComponent(params.meetingName);

    const requestBody = JSON.stringify(params);
    console.log("CREATE MEETING!!");
    const res = await fetch(url, {
        method: "POST",
        body: requestBody,
        headers: {
            Authorization: context.idToken!,
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Flect-Access-Token": context.accessToken!,
        },
    });
    const response = (await res.json()) as HTTPResponseBody;
    if (response.success === false) {
        console.log(response.code);
        throw response.code;
    }
    const data = response.data as CreateMeetingResponse;
    return data;
};

/**
 * End Meeting
 */
export type EndMeetingRequest = {
    meetingName: string;
};
export const endMeeting = async (params: EndMeetingRequest, context: RestApiClientContext) => {
    const encodedMeetingName = encodeURIComponent(params.meetingName);

    const url = `${context.baseUrl}meetings/${encodedMeetingName}`;

    const res = await fetch(url, {
        method: "DELETE",
        headers: {
            Authorization: context.idToken!,
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Flect-Access-Token": context.accessToken!,
        },
    });
    const response = (await res.json()) as HTTPResponseBody;
    if (response.success === false) {
        console.log(response.code);
        throw response.code;
    }
};

/**
 * getMeetingInfo
 */
export type GetMeetingInfoRequest = {
    meetingName: string;
};
export type GetMeetingInfoResponse = HTTPGetMeetingInfoResponse;
export const getMeetingInfo = async (params: GetMeetingInfoRequest, context: RestApiClientContext): Promise<GetMeetingInfoResponse> => {
    const url = `${context.baseUrl}meetings/${encodeURIComponent(params.meetingName)}`;

    const res = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: context.idToken!,
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Flect-Access-Token": context.accessToken!,
        },
    });
    const response = (await res.json()) as HTTPResponseBody;
    if (response.success === false) {
        console.log(response.code);
        throw response.code;
    }
    const data = response.data as GetMeetingInfoResponse;
    return data;
};
