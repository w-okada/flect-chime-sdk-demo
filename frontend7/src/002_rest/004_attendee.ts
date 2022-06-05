import { HTTPGetAttendeeInfoRequest, HTTPGetAttendeeInfoResponse, HTTPJoinMeetingRequest, HTTPJoinMeetingResponse, HTTPResponseBody } from "../http_request";
import { RestApiClientContext } from "./RestApiClient";


// (1) (POST) -> no support
// (2) Get Attendee Info (GET)
export type RestGetAttendeeInfoRequest = HTTPGetAttendeeInfoRequest & {
    meetingName: string,
    attendeeId: string,
}
export type RestGetAttendeeInfoResponse = HTTPGetAttendeeInfoResponse

export const geAttendeeInfo = async (params: RestGetAttendeeInfoRequest, context: RestApiClientContext): Promise<RestGetAttendeeInfoResponse> => {
    const attendeeUrl = `${context.baseUrl}meetings/${encodeURIComponent(params.meetingName)}/attendees/${encodeURIComponent(params.attendeeId)}`;
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
    const data = response.data as RestGetAttendeeInfoResponse;
    return data;
};


// (3)  (PUT) -> no support
// (4)  (DELETE) 
// TODO:

