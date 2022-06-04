/**
 * Frontendと共用するため、http_request.tsをベースにbackend_requestを作成する。
 */

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
} as const;
type Code = typeof Codes[keyof typeof Codes];


type HTTPResponseCode = typeof HTTPResponseCode[keyof typeof HTTPResponseCode];

export type HTTPResponseBody = {
    success: boolean;
    code: string;
    data?: any;
};

import { Chime } from "aws-sdk";

export type Metadata = {
    OwnerId: string;
    Region: string;
    Secret: boolean,
    UseCode: boolean,
    StartTime: number;
};

// (1) Meetings 
// (1-1) List Meetings
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
// (1-2) Create Meeting
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

// Get Meeting Info
export type HTTPGetMeetingInfoRequest = {}
export type HTTPGetMeetingInfoResponse = {
    meetingName: string;
    meetingId: string;
    meeting: Chime.Meeting;
    metadata: Metadata;
    hmmTaskArn: string;
    isOwner?: boolean;
};
// Delete Meeting

// Join Meeting
export type HTTPJoinMeetingRequest = {
    meetingName: string;
    attendeeName: string;
    code: string;
};

export type HTTPJoinMeetingResponse = {
    meetingName: string;
    meeting: Chime.Meeting;
    attendee: Chime.Attendee;
};

// Get Attendee Info
export type HTTPGetAttendeeInfoResponse = {
    attendeeId: string;
    attendeeName: string;
};

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
