import { HTTPGetEnvironmentRequest, HTTPGetEnvironmentResponse, HTTPResponseBody } from "../../http_request";
import { InternalRestApiClientContext } from "./001_RestApiClient";



export type RestGetEnvironmentRequest = HTTPGetEnvironmentRequest
export type RestGetEnvironmentResponse = HTTPGetEnvironmentResponse

export const getEnvironment = async (params: RestGetEnvironmentRequest, context: InternalRestApiClientContext): Promise<RestGetEnvironmentResponse> => {
    console.log("Context:", context)
    const attendeeUrl = `${context.baseUrl}environment`;
    const res = await fetch(attendeeUrl, {
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
    const data = response.data as RestGetEnvironmentResponse;
    return data;
};


