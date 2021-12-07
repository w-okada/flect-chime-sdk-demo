import { DynamoDB } from "aws-sdk";
import { CreateMeetingRequest, JoinMeetingRequest, ResponseBody, JoinMeetingException, JoinMeetingExceptionType, GetAttendeeInfoException, GetAttendeeInfoExceptionType, StartTranscribeRequest, StopTranscribeRequest } from "./const";
import { createMeeting, deleteMeeting, getAttendeeInfo, getMeetingInfo, joinMeeting, startTranscribe, stopTranscribe } from "./meeting";
import { generateResponse, getEmailFromAccessToken } from "./util";

var meetingTableName = process.env.MEETING_TABLE_NAME!;
var attendeesTableName = process.env.ATTENDEE_TABLE_NAME!;
var ddb = new DynamoDB();

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

const Codes = {
    SUCCESS: "SUCCESS",
    UNKNOWN_RESOURCE: "UNKNOWN_RESOURCE",
    UNKNOWN_METHOD: "UNKNOWN_METHOD",
    TOKEN_ERROR: "TOKEN_ERROR",
    PARAMETER_ERROR: "PARAMETER_ERROR",
    NO_SUCH_A_MEETING_ROOM: "NO_SUCH_A_MEETING_ROOM",
    NO_SUCH_AN_ATTENDEE: "NO_SUCH_AN_ATTENDEE",
} as const;
type Code = typeof Codes[keyof typeof Codes];

export const handler = (event: any, context: any, callback: any) => {
    console.log(event);
    console.log("resource:", event.resource);
    console.log("pathPArameters:", event.pathParameters);
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
//// (1-1) get meetings
const handleGetMeetings = (accessToken: string, pathParams: { [key: string]: string }, body: any, callback: any) => {
    ////// Not implemented
    const response = generateResponse({ success: true, code: Codes.SUCCESS });
    callback(null, response);
};
//// (1-2) post meetings
const handlePostMeetings = async (accessToken: string, pathParams: { [key: string]: string }, body: any, callback: any) => {
    const params = JSON.parse(body) as CreateMeetingRequest;
    let email;
    try {
        email = await getEmailFromAccessToken(accessToken);
    } catch (e) {
        console.log(e);
    }
    let res: ResponseBody;
    if (email) {
        const result = await createMeeting(email, params.meetingName, params.region);
        res = {
            success: true,
            code: Codes.SUCCESS,
            data: result,
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
// (2) meetings
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
    let res: ResponseBody;
    const meetingName = pathParams["meetingName"];
    if (!meetingName) {
        console.log(`parameter error: ${meetingName}`);
        res = {
            success: false,
            code: Codes.PARAMETER_ERROR,
        };
    } else {
        const result = await getMeetingInfo(meetingName);
        if (!result) {
            res = {
                success: false,
                code: Codes.NO_SUCH_A_MEETING_ROOM,
            };
        } else {
            res = {
                success: true,
                code: Codes.SUCCESS,
                data: result,
            };
        }
    }
    const response = generateResponse(res);
    callback(null, response);
};

//// (2-2) Delete Meeting
const handleDeleteMeeting = async (accessToken: string, pathParams: { [key: string]: string }, body: any, callback: any) => {
    let res: ResponseBody;
    const meetingName = pathParams["meetingName"];
    if (!meetingName) {
        console.log(`parameter error: ${meetingName}`);
        res = {
            success: false,
            code: Codes.PARAMETER_ERROR,
        };
    } else {
        await deleteMeeting(meetingName);
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
    let res: ResponseBody;
    const params = JSON.parse(body) as JoinMeetingRequest;

    const joinInfo = await joinMeeting(params.meetingName, params.attendeeName);
    if ("exception" in joinInfo) {
        const exception = joinInfo as JoinMeetingException;
        if (exception.code === JoinMeetingExceptionType.NO_MEETING_FOUND) {
            res = {
                success: false,
                code: Codes.NO_SUCH_A_MEETING_ROOM,
            };
        } else {
            res = {
                success: false,
                code: Codes.PARAMETER_ERROR,
            };
        }
    } else {
        res = {
            success: true,
            code: Codes.SUCCESS,
            data: joinInfo,
        };
    }
    const response = generateResponse(res);
    callback(null, response);
};

// (4) attendees
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
    let res: ResponseBody;
    const meetingName = pathParams["meetingName"];
    const attendeeId = pathParams["attendeeId"];
    if (!meetingName || !attendeeId) {
        console.log(`parameter error: ${meetingName}, ${attendeeId}`);
        res = {
            success: false,
            code: Codes.PARAMETER_ERROR,
        };
    } else {
        const attendeeInfo = await getAttendeeInfo(meetingName, attendeeId);

        if ("exception" in attendeeInfo) {
            const exception = attendeeInfo as GetAttendeeInfoException;
            if (exception.code === GetAttendeeInfoExceptionType.NO_ATTENDEE_FOUND) {
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
            res = {
                success: true,
                code: Codes.SUCCESS,
                data: attendeeInfo,
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
    let res: ResponseBody;
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
    startTranscribe(email, meetingName, params.lang);
    res = {
        success: true,
        code: Codes.SUCCESS,
    };
    const response = generateResponse(res);
    callback(null, response);
};
//// (5-2) stop transcribe
const handlePostStopTranscribe = async (accessToken: string, pathParams: { [key: string]: string }, body: any, callback: any) => {
    let res: ResponseBody;
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
    stopTranscribe(email, meetingName);
    res = {
        success: true,
        code: Codes.SUCCESS,
    };
    const response = generateResponse(res);
    callback(null, response);
};
