import { RestApiClientContext } from "./RestApiClient";
import { Chime } from "aws-sdk";
import { HTTPResponseBody } from "./common";

/**
 * Create Meeting
 */

export type CreateMeetingRequest = {
    meetingName: string;
    region: string;
}
export type CreateMeetingResponse = {
    created: boolean;
    meetingId: string;
    meetingName: string;
    ownerId: string;
};
export const createMeeting = async (params: CreateMeetingRequest, context: RestApiClientContext): Promise<CreateMeetingResponse> => {
    const url = `${context.baseUrl}meetings`;
    params.meetingName = encodeURIComponent(params.meetingName);

    const requestBody = JSON.stringify(params);
    console.log("CREATE MEETING!!");
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
};

/**
 * getMeetingInfo
 */
export type Metadata = {
    OwnerId: string;
    Region: string;
    StartTime: number;
};
export type GetMeetingInfoRequest = {
    meetingName: string;
};
export type GetMeetingInfoResponse = {
    meetingName: string;
    meetingId: string;
    meeting: Chime.Meeting;
    metadata: Metadata;
    hmmTaskArn: string;
    isOwner?: boolean;
};
export const getMeetingInfo = async (params: GetMeetingInfoRequest, context: RestApiClientContext): Promise<GetMeetingInfoResponse> => {
    const url = `${context.baseUrl}meetings/${encodeURIComponent(params.meetingName)}`;

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
    const data = response.data as GetMeetingInfoResponse;
    return data;
};
