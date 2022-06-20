/**
 * Frontendと共用するため、http_request.tsをベースにbackend_requestを作成する。
 */
import * as STS from "@aws-sdk/client-sts"

// (0) Common
export const HTTPResponseCode = {
    SUCCESS: "SUCCESS",
    INVALID_TOKEN_EXCEPTION: "INVALID_TOKEN_EXCEPTION",
} as const;

export const Codes = {
    SUCCESS: "SUCCESS",
    UNKNOWN_RESOURCE: "UNKNOWN_RESOURCE",
    UNKNOWN_METHOD: "UNKNOWN_METHOD",
    TOKEN_ERROR: "TOKEN_ERROR",
    PARAMETER_ERROR: "PARAMETER_ERROR",
    NO_SUCH_A_MEETING_ROOM: "NO_SUCH_A_MEETING_ROOM",
    NO_SUCH_AN_ATTENDEE: "NO_SUCH_AN_ATTENDEE",
    INVALID_CODE: "INVALID_CODE"
} as const;
type Code = typeof Codes[keyof typeof Codes];


type HTTPResponseCode = typeof HTTPResponseCode[keyof typeof HTTPResponseCode];

export type HTTPResponseBody = {
    success: boolean;
    code: string;
    data?: any;
};

import * as Chime from "@aws-sdk/client-chime"

export type Metadata = {
    OwnerId: string;
    Region: string;
    Secret: boolean,
    UseCode: boolean,
    StartTime: number;
    MessageChannelArn: string;
};

// (1) Meetings 
//// (1-1) Create Meeting (POST)
export type HTTPCreateMeetingRequest = {
    meetingName: string;
    region: string;
    secret: boolean;
    useCode: boolean;
    code: string;
}
export type HTTPCreateMeetingResponse = {
    created: boolean;
    meetingId: string;
    meetingName: string;
    ownerId: string;
}
//// (1-2) List Meetings (GET)
export type MeetingListItem = {
    meetingName: string;
    meetingId: string;
    meeting: Chime.Meeting;
    metadata: Metadata;
    isOwner?: boolean;
    secret: boolean;
}
export type HTTPListMeetingsRequest = {}
export type HTTPListMeetingsResponse = {
    meetings: MeetingListItem[]
}
//// (1-3) Update Meetings (PUT) -> no support
//// (1-4) Delete Meetings (DELETE) -> no support

// (2) Meeting
//// (2-1) Create (POST) -> no support
//// (2-2) Get Meeting Info (GET)
export type HTTPGetMeetingInfoRequest = {}
export type HTTPGetMeetingInfoResponse = {
    meetingName: string;
    meetingId: string;
    meeting: Chime.Meeting;
    metadata: Metadata;
    hmmTaskArn: string;
    isOwner?: boolean;
};

//// (2-3) Update Meeting  -> no support
//// (2-4) Delete Meeting
export type HTTPDeleteMeetingRequest = {}
export type HTTPDeleteMeetingResponse = {}
// (3) Attendees
//// (3-1) Join Meeting (POST)
export type HTTPJoinMeetingRequest = {
    meetingName: string;
    attendeeName: string;
    messagingUserArn: string;
    code: string;
};
export type HTTPJoinMeetingResponse = {
    meetingName: string;
    meeting: Chime.Meeting;
    attendee: Chime.Attendee;
};
//// (3-2) Get Attendees List (GET) not inplemented
export type HTTPGetAttendeesListRequest = {}
export type HTTPGetAttendeesListResponse = {
    attendees: [
        {
            ExternalUserId: string;
            AttendeeId: string;
            // JoinToken: string;
        }
    ];
    result: string;
}

//// (3-3) Update Attendees (PUT) -> no support
//// (3-4) Delete Attendees (DELETE) -> no support

// (4) Attendee
//// (4-1) Create (POST) -> no support
//// (4-2) Get Attendee Info
export type HTTPGetAttendeeInfoRequest = {};
export type HTTPGetAttendeeInfoResponse = {
    attendeeId: string;
    attendeeName: string;
};

//// (4-3) Update Attendee Info -> no support
//// (4-4) Delete Attendee 
// TODO: Implement Delete Attendee

///// Operation...
export type StartTranscribeRequest = {
    lang: string;
};

export type StopTranscribeRequest = {};

// (6) Environment
export type HTTPGetEnvironmentRequest = {}
export type HTTPGetEnvironmentResponse = {
    globalChannelArn: string,
    credential: STS.Credentials,
    appInstanceUserArn: string,
}

///////////////////////////
// Federation
//////////////////////////

export type SlackHTTPGetUserInformationRequest = {
    token: string;
};
export type SlackHTTPGetUserInformationResponse = {
    roomKey: string;
    roomName: string;
    channelId: string;
    channelName: string;
    userId: string;
    userName: string;
    imageUrl: string;
    chimeInfo: {
        attendeeName: string;
        useDefault: boolean;
    };
};
