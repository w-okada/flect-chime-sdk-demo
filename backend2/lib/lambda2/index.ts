import * as DynamoDB from "@aws-sdk/client-dynamodb"
// import { deleteMeeting, getMeetingInfoFromDB } from "./001_meeting_common";
import { createMeeting, listMeetings } from "./002_meetings";
import { deleteMeeting, getMeetingInfo } from "./003_meeting";
import { joinMeeting } from "./004_attendees";
import { getAttendeeInfo } from "./005_attendee";
import { startTranscribe, stopTranscribe } from "./006_misc";
import { BackendCreateMeetingRequest, BackendGetAttendeeInfoException, BackendGetAttendeeInfoExceptionType, BackendJoinMeetingException, BackendJoinMeetingExceptionType, BackendJoinMeetingRequest, BackendListMeetingsRequest } from "./backend_request";
import { Codes, HTTPCreateMeetingRequest, HTTPCreateMeetingResponse, HTTPGetAttendeeInfoResponse, HTTPGetMeetingInfoResponse, HTTPJoinMeetingRequest, HTTPJoinMeetingResponse, HTTPListMeetingsRequest, HTTPListMeetingsResponse, HTTPResponseBody, StartTranscribeRequest, StopTranscribeRequest } from "./http_request";

import { generateResponse, getEmailFromAccessToken } from "./util";
// @ts-ignore
var meetingTableName = process.env.MEETING_TABLE_NAME!;
// @ts-ignore
var attendeesTableName = process.env.ATTENDEE_TABLE_NAME!;
var ddb = new DynamoDB.DynamoDB({ region: process.env.AWS_REGION });

const Methods = {
    GET: "GET",
    POST: "POST",
    DELETE: "DELETE",
} as const;
type Methods = typeof Methods[keyof typeof Methods];

const Resources = {
    Root: "/",
    Meetings: "/meetings",
    Meeting: "/meetings/{meetingName}",
    Attendees: "/meetings/{meetingName}/attendees",
    Attendee: "/meetings/{meetingName}/attendees/{attendeeId}",
    Operation: "/meetings/{meetingName}/attendees/{attendeeId}/operations/{operation}",
} as const;
type Resources = typeof Resources[keyof typeof Resources];

const Operations = {
    StartTranscribe: "start-transcribe",
    StopTranscribe: "stop-transcribe",
} as const;
type Operations = typeof Operations[keyof typeof Operations];




/**
 * ■ ざっくり処理の流れ
 * このハンドラーでは、resource(path)でサブハンドラーに振り分けを行う。
 * サブハンドラーでは、methodで実処理用パラメータ作成処理に振り分けを行う。
 * 実処理用パラメータ作成処理では、パラメータを作成して実処理を実行する。
 * 　実処理は別ファイルとなっている場合がある。
 * ■ ログ
 * 共通のログはこのハンドラーで行う。
 * 対象はresource, pathParameters, method, body
 */
export const handler = (event: any, context: any, callback: any) => {
    console.log(event);
    console.log("resource:", event.resource);
    console.log("pathParameters:", event.pathParameters);
    console.log("method", event.httpMethod);
    console.log("body", event.body);

    const resource = event.resource;
    const pathParams = event.pathParameters;
    const method = event.httpMethod;
    const body = event.body;
    const accessToken = event.headers["x-flect-access-token"];

    console.log("pathParams", pathParams);

    switch (resource) {
        case Resources.Root:
            handleRoot(accessToken, method, pathParams, body, callback);
            break;
        case Resources.Meetings:
            handleMeetings(accessToken, method, pathParams, body, callback);
            break;
        case Resources.Meeting:
            handleMeeting(accessToken, method, pathParams, body, callback);
            break;
        case Resources.Attendees:
            handleAttendees(accessToken, method, pathParams, body, callback);
            break;
        case Resources.Attendee:
            handleAttendee(accessToken, method, pathParams, body, callback);
            break;
        case Resources.Operation:
            handleOperation(accessToken, method, pathParams, body, callback);
            break;
        default:
            console.log(`Unknwon resource name: ${resource}`);
            const response = generateResponse({ success: false, code: Codes.UNKNOWN_RESOURCE });
            callback(null, response);
    }
};

// (0) Root
const handleRoot = (accessToken: string, method: string, pathParams: { [key: string]: string }, body: any, callback: any) => {
    console.log(`HANDLE ROOT: ${method} ${body}`);
    const response = generateResponse({ success: true, code: Codes.SUCCESS });
    callback(null, response);
};

// (1) meetings
const handleMeetings = (accessToken: string, method: string, pathParams: { [key: string]: string }, body: any, callback: any) => {
    console.log(`HANDLE Meetings: ${method} ${body}`);
    switch (method) {
        case Methods.GET:
            handleGetMeetings(accessToken, pathParams, body, callback);
            break;
        case Methods.POST:
            handlePostMeetings(accessToken, pathParams, body, callback);
            break;
        default:
            console.log(`Unknwon method: ${method}`);
            const response = generateResponse({ success: false, code: Codes.UNKNOWN_METHOD });
            callback(null, response);
            break;
    }
};
//// (1-1) list meetings
const handleGetMeetings = async (accessToken: string, pathParams: { [key: string]: string }, body: any, callback: any) => {
    const params = JSON.parse(body) as HTTPListMeetingsRequest;
    let email;
    try {
        email = await getEmailFromAccessToken(accessToken);
    } catch (e) {
        console.log(e);
    }
    let res: HTTPResponseBody;
    if (email) {
        const backendParams: BackendListMeetingsRequest = {
            email: email,
            ...params
        }
        const result = await listMeetings(backendParams);
        const httpRes: HTTPListMeetingsResponse = result;
        res = {
            success: true,
            code: Codes.SUCCESS,
            data: httpRes,
        };
    } else {
        res = {
            success: false,
            code: Codes.TOKEN_ERROR,
        };
    }
    const response = generateResponse(res);
    callback(null, response);
};
//// (1-2) post meetings
const handlePostMeetings = async (accessToken: string, pathParams: { [key: string]: string }, body: any, callback: any) => {
    const params = JSON.parse(body) as HTTPCreateMeetingRequest;
    let email;
    try {
        email = await getEmailFromAccessToken(accessToken);
    } catch (e) {
        console.log(e);
    }
    let res: HTTPResponseBody;
    if (email) {
        const backendParams: BackendCreateMeetingRequest = {
            email: email,
            ...params
        }
        const result = await createMeeting(backendParams);
        const httpRes: HTTPCreateMeetingResponse = result;
        res = {
            success: true,
            code: Codes.SUCCESS,
            data: httpRes,
        };
    } else {
        res = {
            success: false,
            code: Codes.TOKEN_ERROR,
        };
    }
    const response = generateResponse(res);
    callback(null, response);
};


// (2) meeting
const handleMeeting = (accessToken: string, method: string, pathParams: { [key: string]: string }, body: any, callback: any) => {
    console.log(`HANDLE Meeting: ${method} ${body}`);
    switch (method) {
        case Methods.GET:
            handleGetMeeting(accessToken, pathParams, body, callback);
            break;
        case Methods.DELETE:
            handleDeleteMeeting(accessToken, pathParams, body, callback);
            break;
        default:
            console.log(`Unknwon method: ${method}`);
            const response = generateResponse({ success: false, code: Codes.UNKNOWN_METHOD });
            callback(null, response);
            break;
    }
};
//// (2-1) Get Meeting
const handleGetMeeting = async (accessToken: string, pathParams: { [key: string]: string }, body: any, callback: any) => {
    let res: HTTPResponseBody;
    const meetingName = pathParams["meetingName"];
    let email = "";
    try {
        email = (await getEmailFromAccessToken(accessToken)) || "";
    } catch (e) {
        res = {
            success: false,
            code: Codes.NO_SUCH_AN_ATTENDEE,
        };
        const response = generateResponse(res);
        callback(null, response);
    }
    if (!meetingName) {
        console.log(`parameter error: ${meetingName}`);
        res = {
            success: false,
            code: Codes.PARAMETER_ERROR,
        };
    } else {
        const result = await getMeetingInfo({ email, meetingName, deleteCode: true });
        if (!result) {
            res = {
                success: false,
                code: Codes.NO_SUCH_A_MEETING_ROOM,
            };
        } else {
            const httpRes: HTTPGetMeetingInfoResponse = {
                meetingName: result.meetingName,
                meetingId: result.meetingId,
                meeting: result.meeting,
                metadata: result.metadata,
                hmmTaskArn: result.hmmTaskArn,
            };
            res = {
                success: true,
                code: Codes.SUCCESS,
                data: httpRes,
            };
        }
    }
    const response = generateResponse(res);
    callback(null, response);
};

//// (2-2) Delete Meeting
const handleDeleteMeeting = async (accessToken: string, pathParams: { [key: string]: string }, body: any, callback: any) => {
    let res: HTTPResponseBody;
    const meetingName = pathParams["meetingName"];
    if (!meetingName) {
        console.log(`parameter error: ${meetingName}`);
        res = {
            success: false,
            code: Codes.PARAMETER_ERROR,
        };
    } else {
        await deleteMeeting({ meetingName });
        res = {
            success: true,
            code: Codes.SUCCESS,
        };
    }
    const response = generateResponse(res);
    callback(null, response);
};

// (3) attendees
const handleAttendees = (accessToken: string, method: string, pathParams: { [key: string]: string }, body: any, callback: any) => {
    console.log(`HANDLE attendees: ${method} ${body}`);
    switch (method) {
        case Methods.GET:
            handleGetAttendees(accessToken, pathParams, body, callback);
            break;
        case Methods.POST:
            handlePostAttendees(accessToken, pathParams, body, callback);
            break;
        default:
            console.log(`Unknwon method: ${method}`);
            const response = generateResponse({ success: false, code: Codes.UNKNOWN_METHOD });
            callback(null, response);
            break;
    }
};

//// (3-1) Get Attendees
const handleGetAttendees = async (accessToken: string, pathParams: { [key: string]: string }, body: any, callback: any) => {
    // let res: ResponseBody;
    // const response = generateResponse(res);
    // callback(null, response);
};
//// (3-2) Post Attendees
const handlePostAttendees = async (accessToken: string, pathParams: { [key: string]: string }, body: any, callback: any) => {
    let res: HTTPResponseBody;
    const params = JSON.parse(body) as HTTPJoinMeetingRequest;
    const backendParams: BackendJoinMeetingRequest = {
        meetingName: params.meetingName,
        attendeeName: params.attendeeName,
        code: params.code
    }
    const joinInfo = await joinMeeting(backendParams);
    if ("exception" in joinInfo) {
        const exception = joinInfo as BackendJoinMeetingException;
        if (exception.code === BackendJoinMeetingExceptionType.NO_MEETING_FOUND) {
            res = {
                success: false,
                code: Codes.NO_SUCH_A_MEETING_ROOM,
            };
        } else if (exception.code === BackendJoinMeetingExceptionType.INVALID_CODE) {
            res = {
                success: false,
                code: Codes.INVALID_CODE,
            };
        } else {
            res = {
                success: false,
                code: Codes.PARAMETER_ERROR,
            };
        }
    } else {
        const httpRes: HTTPJoinMeetingResponse = {
            meetingName: joinInfo.meetingName,
            meeting: joinInfo.meeting,
            attendee: joinInfo.attendee,
        };
        res = {
            success: true,
            code: Codes.SUCCESS,
            data: httpRes,
        };
    }
    const response = generateResponse(res);
    callback(null, response);
};

// (4) attendee
const handleAttendee = (accessToken: string, method: string, pathParams: { [key: string]: string }, body: any, callback: any) => {
    console.log(`HANDLE attendee: ${method} ${body}`);
    switch (method) {
        case Methods.GET:
            handleGetAttendee(accessToken, pathParams, body, callback);
            break;
        default:
            console.log(`Unknwon method: ${method}`);
            const response = generateResponse({ success: false, code: Codes.UNKNOWN_METHOD });
            callback(null, response);
            break;
    }
};

//// (4-1) Get Attendee
const handleGetAttendee = async (accessToken: string, pathParams: { [key: string]: string }, body: any, callback: any) => {
    let res: HTTPResponseBody;
    const meetingName = pathParams["meetingName"];
    const attendeeId = pathParams["attendeeId"];
    if (!meetingName || !attendeeId) {
        console.log(`parameter error: ${meetingName}, ${attendeeId}`);
        res = {
            success: false,
            code: Codes.PARAMETER_ERROR,
        };
    } else {
        const attendeeInfo = await getAttendeeInfo({ meetingName, attendeeId });

        if ("exception" in attendeeInfo) {
            const exception = attendeeInfo as BackendGetAttendeeInfoException;
            if (exception.code === BackendGetAttendeeInfoExceptionType.NO_ATTENDEE_FOUND) {
                res = {
                    success: false,
                    code: Codes.NO_SUCH_AN_ATTENDEE,
                };
            } else {
                res = {
                    success: false,
                    code: Codes.PARAMETER_ERROR,
                };
            }
        } else {
            const httpRes: HTTPGetAttendeeInfoResponse = {
                attendeeId: attendeeInfo.attendeeId,
                attendeeName: attendeeInfo.attendeeName,
            };
            res = {
                success: true,
                code: Codes.SUCCESS,
                data: httpRes,
            };
        }
    }
    const response = generateResponse(res);
    callback(null, response);
};

// (5) Operation
const handleOperation = (accessToken: string, method: string, pathParams: { [key: string]: string }, body: any, callback: any) => {
    console.log(`HANDLE operation: ${method} ${body}`);
    const meetingName = pathParams["meetingName"];
    const attendeeId = pathParams["attendeeId"];
    const operation = pathParams["operation"];
    switch (method) {
        case Methods.POST:
            if (operation === Operations.StartTranscribe) {
                handlePostStartTranscribe(accessToken, pathParams, body, callback);
            } else if (operation === Operations.StopTranscribe) {
                handlePostStopTranscribe(accessToken, pathParams, body, callback);
            }
            break;
        default:
            console.log(`Unknwon method: ${method}`);
            const response = generateResponse({ success: false, code: Codes.UNKNOWN_METHOD });
            callback(null, response);
            break;
    }
};
//// (5-1) start transcribe
const handlePostStartTranscribe = async (accessToken: string, pathParams: { [key: string]: string }, body: any, callback: any) => {
    let res: HTTPResponseBody;
    const params = JSON.parse(body) as StartTranscribeRequest;
    const meetingName = pathParams["meetingName"];
    const attendeeId = pathParams["attendeeId"];
    //// (1) If there is no meeting, return fai
    let email = "";
    try {
        email = (await getEmailFromAccessToken(accessToken)) || "";
    } catch (e) {
        res = {
            success: false,
            code: Codes.NO_SUCH_AN_ATTENDEE,
        };
        const response = generateResponse(res);
        callback(null, response);
    }
    /// (2)
    startTranscribe({
        email,
        meetingName,
        lang: params.lang,
    });
    res = {
        success: true,
        code: Codes.SUCCESS,
    };
    const response = generateResponse(res);
    callback(null, response);
};
//// (5-2) stop transcribe
const handlePostStopTranscribe = async (accessToken: string, pathParams: { [key: string]: string }, body: any, callback: any) => {
    let res: HTTPResponseBody;
    const params = JSON.parse(body) as StopTranscribeRequest;
    const meetingName = pathParams["meetingName"];
    const attendeeId = pathParams["attendeeId"];
    //// (1) If there is no meeting, return fai
    let email = "";
    try {
        email = (await getEmailFromAccessToken(accessToken)) || "";
    } catch (e) {
        res = {
            success: false,
            code: Codes.NO_SUCH_AN_ATTENDEE,
        };
        const response = generateResponse(res);
        callback(null, response);
    }
    /// (2)
    stopTranscribe({
        email,
        meetingName,
    });
    res = {
        success: true,
        code: Codes.SUCCESS,
    };
    const response = generateResponse(res);
    callback(null, response);
};
