import { InternalRestApiClientContext } from "./001_RestApiClient";
import { HTTPDeleteMeetingRequest, HTTPDeleteMeetingResponse, HTTPGetMeetingInfoRequest, HTTPGetMeetingInfoResponse, HTTPResponseBody } from "../../http_request";

// (1) (POST) -> no support
// (2) Get Meeting Info (GET)
export type Metadata = {
    OwnerId: string;
    Region: string;
    StartTime: number;
};
export type RestGetMeetingInfoRequest = HTTPGetMeetingInfoRequest & {
    meetingName: string;
};
export type RestGetMeetingInfoResponse = HTTPGetMeetingInfoResponse;

export const getMeetingInfo = async (params: RestGetMeetingInfoRequest, context: InternalRestApiClientContext): Promise<RestGetMeetingInfoResponse> => {
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
    const data = response.data as RestGetMeetingInfoResponse;
    return data;
};

// (3) (PUT) -> no support
// (4) Delete Meeting  (DELETE)
export type RestEndMeetingRequest = HTTPDeleteMeetingRequest & {
    meetingName: string;
};
export type RestEndMeetingResponse = HTTPDeleteMeetingResponse

export const endMeeting = async (params: RestEndMeetingRequest, context: InternalRestApiClientContext) => {
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
    return {} as RestEndMeetingResponse
};
