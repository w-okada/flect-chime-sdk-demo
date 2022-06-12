import { HTTPJoinMeetingRequest, HTTPJoinMeetingResponse, HTTPResponseBody } from "../../http_request";
import { InternalRestApiClientContext } from "./001_RestApiClient";

// (1) Join Meeting (POST)
export type RestJoinMeetingRequest = HTTPJoinMeetingRequest
export type RestJoinMeetingResponse = HTTPJoinMeetingResponse
export const joinMeeting = async (params: RestJoinMeetingRequest, context: InternalRestApiClientContext): Promise<RestJoinMeetingResponse> => {
    const url = `${context.baseUrl}meetings/${encodeURIComponent(params.meetingName)}/attendees`;
    params.meetingName = encodeURIComponent(params.meetingName);
    params.attendeeName = encodeURIComponent(params.attendeeName);
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
    if (response.success === false) {
        console.log(response.code);
        throw response.code;
    }
    const data = response.data as RestJoinMeetingResponse;
    return data;
};

// (2) List Attendees (GET)
//// TODO: APIを作成してI/Fを合わせる
export type GetAttendeeListRequest = {
    meetingName: string;
};
export type GetAttendeeListResponse = {
    attendees: [
        {
            ExternalUserId: string;
            AttendeeId: string;
            JoinToken: string;
        }
    ];
    result: string;
};

export const getAttendeeList = async (params: GetAttendeeListRequest, context: InternalRestApiClientContext): Promise<GetAttendeeListResponse> => {
    const attendeeUrl = `${context.baseUrl}meetings/${encodeURIComponent(params.meetingName)}/attendees`;
    const res = await fetch(attendeeUrl, {
        method: "GET",
        headers: {
            Authorization: context.idToken,
            "X-Flect-Access-Token": context.codeToAccess || context.accessToken,
        },
    });
    if (!res.ok) {
        throw new Error("Invalid server response");
    }

    const data = await res.json();
    return {
        attendees: data.Attendees,
        result: data.result,
    };
};



// (3)  (PUT) -> no support
// (4)  (DELETE) -> no support

