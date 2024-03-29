import { HTTPGetAttendeeInfoRequest, HTTPGetAttendeeInfoResponse, HTTPResponseBody } from "../../http_request";
import { InternalRestApiClientContext } from "./001_RestApiClient";


// (1) (POST) -> no support
// (2) Get Attendee Info (GET)
export type RestGetAttendeeInfoRequest = HTTPGetAttendeeInfoRequest & {
    exMeetingId: string
    attendeeId: string,
}
export type RestGetAttendeeInfoResponse = HTTPGetAttendeeInfoResponse

export const getAttendeeInfo = async (params: RestGetAttendeeInfoRequest, context: InternalRestApiClientContext): Promise<RestGetAttendeeInfoResponse> => {
    const attendeeUrl = `${context.baseUrl}meetings/${params.exMeetingId}/attendees/${params.attendeeId}`;
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

