import { HTTPResponseBody } from "./http_request";
export declare const getResponseTemplate: () => {
    statusCode: number;
    headers: {
        "Access-Control-Allow-Headers": string;
        "Access-Control-Allow-Methods": string;
        "Access-Control-Allow-Origin": string;
    };
    body: string;
    isBase64Encoded: boolean;
};
export declare const getExpireDate: () => number;
export declare const generateResponse: (body: HTTPResponseBody) => {
    statusCode: number;
    headers: {
        "Access-Control-Allow-Headers": string;
        "Access-Control-Allow-Methods": string;
        "Access-Control-Allow-Origin": string;
    };
    body: string;
    isBase64Encoded: boolean;
};
export declare const getEmailFromAccessToken: (accessToken: string) => Promise<string | undefined>;
