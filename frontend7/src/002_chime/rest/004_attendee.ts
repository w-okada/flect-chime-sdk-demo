import { HTTPGetAttendeeInfoResponse, HTTPJoinMeetingRequest, HTTPJoinMeetingResponse, HTTPResponseBody } from "../../http_request";
import { RestApiClientContext } from "./RestApiClient";

// (1) Get Attendee Info (GET)
export type GetUserNameByAttendeeIdRequest = {
    meetingName: string;
    attendeeId: string;
};

export const getUserNameByAttendeeId = async (meetingName: string,
    attendeeId: string, context: RestApiClientContext): Promise<HTTPGetAttendeeInfoResponse> => {
    const attendeeUrl = `${context.baseUrl}meetings/${encodeURIComponent(meetingName)}/attendees/${encodeURIComponent(attendeeId)}`;
    const res = await fetch(attendeeUrl, {
        method: "GET",
        headers: {
            Authorization: context.idToken,
            "X-Flect-Access-Token": context.codeToAccess || context.accessToken,
        },
    });
    const response = (await res.json()) as HTTPResponseBody;
    if (response.success === false) {
        console.log(response.code);
        throw response.code;
    }
    const data = response.data as HTTPGetAttendeeInfoResponse;
    return data;
};
