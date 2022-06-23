
import { BackendCreateMeetingRequest, BackendGetAttendeeInfoException, BackendGetAttendeeInfoExceptionType, BackendJoinMeetingException, BackendJoinMeetingExceptionType, BackendJoinMeetingRequest, BackendListMeetingsRequest, BackendPostEnvironmentRequest } from "./backend_request";
import { Codes, HTTPCreateMeetingRequest, HTTPCreateMeetingResponse, HTTPGetAttendeeInfoResponse, HTTPGetEnvironmentResponse, HTTPGetMeetingInfoResponse, HTTPJoinMeetingRequest, HTTPJoinMeetingResponse, HTTPListMeetingsRequest, HTTPListMeetingsResponse, HTTPPostEnvironmentRequest, HTTPPostEnvironmentResponse, HTTPResponseBody, StartTranscribeRequest, StopTranscribeRequest } from "./http_request";
import { generateResponse, getUserInfoFromCognitoWithAccessToken, UserInfoFromCognito } from "./util";



import { createMeeting, listMeetings } from "./002_sub-handler/002_meetings"
import { deleteMeeting, getMeetingInfo } from "./002_sub-handler/003_meeting";
import { joinMeeting } from "./002_sub-handler/004_attendees";
import { getAttendeeInfo } from "./002_sub-handler/005_attendee";
import { startTranscribe, stopTranscribe } from "./002_sub-handler/006_misc";
import { getEnvironment, postEnvironment } from "./002_sub-handler/010_environment";


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
    Environment: "/environment",
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
export const handler = async (event: any, context: any, callback: any) => {
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

    let userInfo: UserInfoFromCognito | null = null

    try {
        userInfo = await getUserInfoFromCognitoWithAccessToken(accessToken);
    } catch (e) {
        console.warn("get UserInfo from Cognito failed.\n", e);
    }
    if (!userInfo) {
        const response = generateResponse({ success: false, code: Codes.TOKEN_ERROR });
        callback(null, response);
        return
    }


    switch (resource) {
        case Resources.Root:
            await handleRoot(accessToken, method, pathParams, body, callback, userInfo);
            break;
        case Resources.Meetings:
            await handleMeetings(accessToken, method, pathParams, body, callback, userInfo);
            break;
        case Resources.Meeting:
            await handleMeeting(accessToken, method, pathParams, body, callback, userInfo);
            break;
        case Resources.Attendees:
            await handleAttendees(accessToken, method, pathParams, body, callback, userInfo);
            break;
        case Resources.Attendee:
            await handleAttendee(accessToken, method, pathParams, body, callback, userInfo);
            break;
        case Resources.Operation:
            await handleOperation(accessToken, method, pathParams, body, callback, userInfo);
            break;
        case Resources.Environment:
            await handleEnvironment(accessToken, method, pathParams, body, callback, userInfo);
            break;
        default:
            console.warn(`Unknwon resource name: ${resource}`);
            const response = generateResponse({ success: false, code: Codes.UNKNOWN_RESOURCE });
            callback(null, response);
    }
};

// (0) Root
const handleRoot = async (accessToken: string, method: string, pathParams: { [key: string]: string }, body: any, callback: any, userInfo: UserInfoFromCognito) => {
    console.log(`HANDLE ROOT: ${method} ${body}`);
    const response = generateResponse({ success: true, code: Codes.SUCCESS });
    callback(null, response);
};

// (1) meetings
const handleMeetings = async (accessToken: string, method: string, pathParams: { [key: string]: string }, body: any, callback: any, userInfo: UserInfoFromCognito) => {
    console.log(`HANDLE Meetings: ${method} ${body}`);
    switch (method) {
        case Methods.GET:
            await handleGetMeetings(accessToken, pathParams, body, callback, userInfo);
            break;
        case Methods.POST:
            await handlePostMeetings(accessToken, pathParams, body, callback, userInfo);
            break;
        default:
            console.log(`Unknwon method: ${method}`);
            const response = generateResponse({ success: false, code: Codes.UNKNOWN_METHOD });
            callback(null, response);
            break;
    }
};
//// (1-1) list meetings
const handleGetMeetings = async (accessToken: string, pathParams: { [key: string]: string }, body: any, callback: any, userInfo: UserInfoFromCognito) => {
    const params = JSON.parse(body) as HTTPListMeetingsRequest;
    let res: HTTPResponseBody;
    const backendParams: BackendListMeetingsRequest = {
        sub: userInfo.sub,
        ...params
    }
    const result = await listMeetings(backendParams);
    const httpRes: HTTPListMeetingsResponse = result;
    res = {
        success: true,
        code: Codes.SUCCESS,
        data: httpRes,
    };
    const response = generateResponse(res);
    callback(null, response);
};
//// (1-2) post meetings
const handlePostMeetings = async (accessToken: string, pathParams: { [key: string]: string }, body: any, callback: any, userInfo: UserInfoFromCognito) => {
    const params = JSON.parse(body) as HTTPCreateMeetingRequest;
    let res: HTTPResponseBody;
    const backendParams: BackendCreateMeetingRequest = {
        sub: userInfo.sub,
        ...params
    }
    const result = await createMeeting(backendParams);
    const httpRes: HTTPCreateMeetingResponse = result;
    res = {
        success: true,
        code: Codes.SUCCESS,
        data: httpRes,
    };
    const response = generateResponse(res);
    callback(null, response);
};


// (2) meeting
const handleMeeting = async (accessToken: string, method: string, pathParams: { [key: string]: string }, body: any, callback: any, userInfo: UserInfoFromCognito) => {
    console.log(`HANDLE Meeting: ${method} ${body}`);
    switch (method) {
        case Methods.GET:
            await handleGetMeeting(accessToken, pathParams, body, callback, userInfo);
            break;
        case Methods.DELETE:
            await handleDeleteMeeting(accessToken, pathParams, body, callback, userInfo);
            break;
        default:
            console.log(`Unknwon method: ${method}`);
            const response = generateResponse({ success: false, code: Codes.UNKNOWN_METHOD });
            callback(null, response);
            break;
    }
};
//// (2-1) Get Meeting
const handleGetMeeting = async (accessToken: string, pathParams: { [key: string]: string }, body: any, callback: any, userInfo: UserInfoFromCognito) => {
    let res: HTTPResponseBody;
    const meetingName = pathParams["meetingName"];

    if (!meetingName) {
        console.log(`parameter error: ${meetingName}`);
        res = {
            success: false,
            code: Codes.PARAMETER_ERROR,
        };
    } else {
        const result = await getMeetingInfo({ sub: userInfo.sub, meetingName, deleteCode: true });
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
const handleDeleteMeeting = async (accessToken: string, pathParams: { [key: string]: string }, body: any, callback: any, userInfo: UserInfoFromCognito) => {
    let res: HTTPResponseBody;
    const meetingName = pathParams["meetingName"];
    if (!meetingName) {
        console.log(`parameter error: ${meetingName}`);
        res = {
            success: false,
            code: Codes.PARAMETER_ERROR,
        };
    } else {
        const result = await getMeetingInfo({ meetingName, deleteCode: true });
        if (!result) {
            res = {
                success: false,
                code: Codes.NO_SUCH_A_MEETING_ROOM,
            };
        } else {
            await deleteMeeting({
                meetingName,
                messageChannelArn: result.metadata.MessageChannelArn
            });
            res = {
                success: true,
                code: Codes.SUCCESS,
            };

        }
    }
    const response = generateResponse(res);
    callback(null, response);
};

// (3) attendees
const handleAttendees = async (accessToken: string, method: string, pathParams: { [key: string]: string }, body: any, callback: any, userInfo: UserInfoFromCognito) => {
    console.log(`HANDLE attendees: ${method} ${body}`);
    switch (method) {
        case Methods.GET:
            await handleGetAttendees(accessToken, pathParams, body, callback, userInfo);
            break;
        case Methods.POST:
            await handlePostAttendees(accessToken, pathParams, body, callback, userInfo);
            break;
        default:
            console.log(`Unknwon method: ${method}`);
            const response = generateResponse({ success: false, code: Codes.UNKNOWN_METHOD });
            callback(null, response);
            break;
    }
};

//// (3-1) Get Attendees
const handleGetAttendees = async (accessToken: string, pathParams: { [key: string]: string }, body: any, callback: any, userInfo: UserInfoFromCognito) => {
    // let res: ResponseBody;
    // const response = generateResponse(res);
    // callback(null, response);
};
//// (3-2) Post Attendees
const handlePostAttendees = async (accessToken: string, pathParams: { [key: string]: string }, body: any, callback: any, userInfo: UserInfoFromCognito) => {
    let res: HTTPResponseBody;
    const params = JSON.parse(body) as HTTPJoinMeetingRequest;

    const backendParams: BackendJoinMeetingRequest = {
        sub: userInfo.sub,
        ...params
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
const handleAttendee = async (accessToken: string, method: string, pathParams: { [key: string]: string }, body: any, callback: any, userInfo: UserInfoFromCognito) => {
    console.log(`HANDLE attendee: ${method} ${body}`);
    switch (method) {
        case Methods.GET:
            await handleGetAttendee(accessToken, pathParams, body, callback, userInfo);
            break;
        default:
            console.log(`Unknwon method: ${method}`);
            const response = generateResponse({ success: false, code: Codes.UNKNOWN_METHOD });
            callback(null, response);
            break;
    }
};

//// (4-1) Get Attendee
const handleGetAttendee = async (accessToken: string, pathParams: { [key: string]: string }, body: any, callback: any, userInfo: UserInfoFromCognito) => {
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
                externalUserId: attendeeInfo.externalUserId,
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
const handleOperation = async (accessToken: string, method: string, pathParams: { [key: string]: string }, body: any, callback: any, userInfo: UserInfoFromCognito) => {
    console.log(`HANDLE operation: ${method} ${body}`);
    const meetingName = pathParams["meetingName"];
    const attendeeId = pathParams["attendeeId"];
    const operation = pathParams["operation"];
    switch (method) {
        case Methods.POST:
            if (operation === Operations.StartTranscribe) {
                await handlePostStartTranscribe(accessToken, pathParams, body, callback, userInfo);
            } else if (operation === Operations.StopTranscribe) {
                await handlePostStopTranscribe(accessToken, pathParams, body, callback, userInfo);
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
const handlePostStartTranscribe = async (accessToken: string, pathParams: { [key: string]: string }, body: any, callback: any, userInfo: UserInfoFromCognito) => {
    let res: HTTPResponseBody;
    const params = JSON.parse(body) as StartTranscribeRequest;
    const meetingName = pathParams["meetingName"];
    const attendeeId = pathParams["attendeeId"];
    startTranscribe({
        sub: userInfo.sub,
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
const handlePostStopTranscribe = async (accessToken: string, pathParams: { [key: string]: string }, body: any, callback: any, userInfo: UserInfoFromCognito) => {
    let res: HTTPResponseBody;
    const params = JSON.parse(body) as StopTranscribeRequest;
    const meetingName = pathParams["meetingName"];
    const attendeeId = pathParams["attendeeId"];
    stopTranscribe({
        sub: userInfo.sub,
        meetingName,
    });
    res = {
        success: true,
        code: Codes.SUCCESS,
    };
    const response = generateResponse(res);
    callback(null, response);
};

// (6) Environment
const handleEnvironment = async (accessToken: string, method: string, pathParams: { [key: string]: string }, body: any, callback: any, userInfo: UserInfoFromCognito) => {
    switch (method) {
        case Methods.GET:
            await handleGetEnvironemnt(accessToken, pathParams, body, callback, userInfo);
            break;
        case Methods.POST:
            await handlePostEnvironment(accessToken, pathParams, body, callback, userInfo);
            break;
        default:
            console.log(`Unknwon method: ${method}`);
            const response = generateResponse({ success: false, code: Codes.UNKNOWN_METHOD });
            callback(null, response);
            break;
    }
};

const handleGetEnvironemnt = async (accessToken: string, pathParams: { [key: string]: string }, body: any, callback: any, userInfo: UserInfoFromCognito) => {

    let res: HTTPResponseBody;
    // (a) For Messaging
    const backendRes = await getEnvironment({
        sub: userInfo.sub,
    })


    const httpRes: HTTPGetEnvironmentResponse = backendRes

    res = {
        success: true,
        code: Codes.SUCCESS,
        data: httpRes,
    };
    const response = generateResponse(res);
    callback(null, response);
}



const handlePostEnvironment = async (accessToken: string, pathParams: { [key: string]: string }, body: any, callback: any, userInfo: UserInfoFromCognito) => {
    const params = JSON.parse(body) as HTTPPostEnvironmentRequest;
    let res: HTTPResponseBody;
    const backendParams: BackendPostEnvironmentRequest = {
        sub: userInfo.sub,
        ...params
    }
    const result = await postEnvironment(backendParams);
    const httpRes: HTTPPostEnvironmentResponse = result;
    res = {
        success: true,
        code: Codes.SUCCESS,
        data: httpRes,
    };
    const response = generateResponse(res);
    callback(null, response);
};