import { HTTPPostEnvironmentsRequest, HTTPPostEnvironmentsResponse, HTTPResponseBody } from "../../http_request";
import { InternalRestApiClientContext } from "./001_RestApiClient";



// export type RestGetEnvironmentRequest = HTTPGetEnvironmentRequest
// export type RestGetEnvironmentResponse = HTTPGetEnvironmentResponse

// export const getEnvironment = async (params: RestGetEnvironmentRequest, context: InternalRestApiClientContext): Promise<RestGetEnvironmentResponse> => {
//     console.log("Context:", context)
//     const url = `${context.baseUrl}environment`;
//     const res = await fetch(url, {
//         method: "GET",
//         headers: {
//             Authorization: context.idToken,
//             Accept: "application/json",
//             "Content-Type": "application/json",
//             "X-Flect-Access-Token": context.codeToAccess || context.accessToken,
//         },
//     });
//     const response = (await res.json()) as HTTPResponseBody;
//     if (response.success === false) {
//         console.log(response.code);
//         throw response.code;
//     }
//     const data = response.data as RestGetEnvironmentResponse;
//     return data;
// };



export type RestPostEnvironmentsRequest = HTTPPostEnvironmentsRequest
export type RestPostEnvironmentsResponse = HTTPPostEnvironmentsResponse

export const postEnvironment = async (params: RestPostEnvironmentsRequest, context: InternalRestApiClientContext): Promise<RestPostEnvironmentsResponse> => {
    console.log("Context:", context)
    const url = `${context.baseUrl}environments`;

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
    const data = response.data as RestPostEnvironmentsResponse;
    return data;
};


