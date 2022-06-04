/**
 * Frontendと共用するため、http_request.tsをベースにbackend_requestを作成する。
 */

import { Chime } from "aws-sdk";
import { HTTPCreateMeetingRequest, HTTPCreateMeetingResponse, HTTPGetMeetingInfoRequest, HTTPGetMeetingInfoResponse, HTTPJoinMeetingRequest, HTTPJoinMeetingResponse, HTTPListMeetingsRequest, HTTPListMeetingsResponse, Metadata } from "./http_request";

// (1) Meetings 
// (1-1) List Meetings
export type BackendListMeetingsRequest = HTTPListMeetingsRequest & {
    email: string
}
export type BackendListMeetingsResponse = HTTPListMeetingsResponse

// (1-2) Create Meeting
export type BackendCreateMeetingRequest = HTTPCreateMeetingRequest & {
    email: string
}
export type BackendCreateMeetingResponse = HTTPCreateMeetingResponse;


// Get Meeting Info
export type BackendGetMeetingInfoRequest = HTTPGetMeetingInfoRequest & {
    meetingName: string;
    email?: string;
    deleteCode: boolean;
}

export type BackendGetMeetingInfoResponse = HTTPGetMeetingInfoResponse & {
    code?: string;
};


// Delete Meeting

export type BackendDeleteMeetingRequest = {
    meetingName: string;
};


// Join Meeting
export type BackendJoinMeetingRequest = HTTPJoinMeetingRequest
export type BackendJoinMeetingResponse = HTTPJoinMeetingResponse


export const BackendJoinMeetingExceptionType = {
    NO_MEETING_FOUND: "NO_MEETING_FOUND",
    PARAMETER_ERROR: "PARAMETER_ERROR",
    INVALID_CODE: "INVALID_CODE"
} as const;
export type BackendJoinMeetingExceptionType = typeof BackendJoinMeetingExceptionType[keyof typeof BackendJoinMeetingExceptionType];
export type BackendJoinMeetingException = {
    code: BackendJoinMeetingExceptionType;
    exception: boolean;
};

// Get Attendee
export type BackendGetAttendeeInfoRequest = {
    meetingName: string;
    attendeeId: string;
};

export type BackendGetAttendeeInfoResponse = {
    attendeeId: string;
    attendeeName: string;
};
export const BackendGetAttendeeInfoExceptionType = {
    NO_ATTENDEE_FOUND: "NO_MEETING_FOUND",
    PARAMETER_ERROR: "PARAMETER_ERROR",
} as const;
export type BackendGetAttendeeInfoExceptionType = typeof BackendGetAttendeeInfoExceptionType[keyof typeof BackendGetAttendeeInfoExceptionType];
export type BackendGetAttendeeInfoException = {
    code: BackendGetAttendeeInfoExceptionType;
    exception: boolean;
};

// start transcribe
export type BackendStartTranscribeRequest = {
    email: string;
    meetingName: string;
    lang: string;
};

export type BackendStartTranscribeResponse = {};
export const BackendStartTranscribeExceptionType = {
    NOT_OWNER: "NOT_OWNER",
    NO_MEETING_FOUND: "NO_MEETING_FOUND",
} as const;
export type BackendStartTranscribeExceptionType = typeof BackendStartTranscribeExceptionType[keyof typeof BackendStartTranscribeExceptionType];
export type BackendStartTranscribeException = {
    code: BackendStartTranscribeExceptionType;
    exception: boolean;
};

// stop transcribe
export type BackendStopTranscribeRequest = {
    email: string;
    meetingName: string;
};
export type BackendStopTranscribeResponse = {};
export const BackendStopTranscribeExceptionType = {
    NOT_OWNER: "NOT_OWNER",
    NO_MEETING_FOUND: "NO_MEETING_FOUND",
} as const;
export type BackendStopTranscribeExceptionType = typeof BackendStopTranscribeExceptionType[keyof typeof BackendStopTranscribeExceptionType];
export type BackendStopTranscribeException = {
    code: BackendStopTranscribeExceptionType;
    exception: boolean;
};
