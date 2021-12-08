import { HTTPResponseBody } from "../http_request";
import { RestApiClientContext } from "./RestApiClient";

/**
 * startTranscribe
 */
export type StartTranscribeRequest = {
    meetingName: string;
    attendeeId: string;
    lang: string;
};
export const startTranscribe = async (params: StartTranscribeRequest, context: RestApiClientContext) => {
    const url = `${context.baseUrl}meetings/${encodeURIComponent(params.meetingName)}/attendees/${encodeURIComponent(params.attendeeId)}/operations/start-transcribe`;

    const request = {
        lang: params.lang,
    };

    const requestBody = JSON.stringify(request);

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
};

/**
 *  stopTranscribe
 */
export type StopTranscribeRequest = {
    meetingName: string;
    attendeeId: string;
};
export const stopTranscribe = async (params: StopTranscribeRequest, context: RestApiClientContext) => {
    const url = `${context.baseUrl}meetings/${encodeURIComponent(params.meetingName)}/attendees/${encodeURIComponent(params.attendeeId)}/operations/stop-transcribe`;

    const request = {};

    const requestBody = JSON.stringify(request);

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
};
