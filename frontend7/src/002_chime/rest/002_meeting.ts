import { RestApiClientContext } from "./RestApiClient";
import { Chime } from "aws-sdk";
import { HTTPResponseBody } from "./common";
import { HTTPCreateMeetingRequest, HTTPCreateMeetingResponse, HTTPListMeetingsRequest, HTTPListMeetingsResponse } from "../../http_request";


// (1) Get Meeting Info (GET)

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


// (2) Delete Meeting  (DELETE)
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
