/**
 * Frontendと共用するため、http_request.tsをベースにbackend_requestを作成する。
 */

import { Chime } from "aws-sdk";
import { HTTPCreateMeetingRequest, HTTPCreateMeetingResponse, HTTPDeleteMeetingRequest, HTTPDeleteMeetingResponse, HTTPGetAttendeeInfoRequest, HTTPGetAttendeeInfoResponse, HTTPGetAttendeesListRequest, HTTPGetAttendeesListResponse, HTTPGetMeetingInfoRequest, HTTPGetMeetingInfoResponse, HTTPJoinMeetingRequest, HTTPJoinMeetingResponse, HTTPListMeetingsRequest, HTTPListMeetingsResponse, Metadata } from "./http_request";


// (1) Meetings 
//// (1-1) Create Meeting (POST)
export type BackendCreateMeetingRequest = HTTPCreateMeetingRequest & {
    email: string
}
export type BackendCreateMeetingResponse = HTTPCreateMeetingResponse;
//// (1-2) List Meetings (GET)
export type BackendListMeetingsRequest = HTTPListMeetingsRequest & {
    email: string
}
export type BackendListMeetingsResponse = HTTPListMeetingsResponse
//// (1-3) Update Meetings (PUT) -> no support
//// (1-4) Delete Meetings (DELETE) -> no support

// (2) Meeting
//// (2-1) Create (POST) -> no support
//// (2-2) Get Meeting Info (GET)
export type BackendGetMeetingInfoRequest = HTTPGetMeetingInfoRequest & {
    meetingName: string;
    email?: string;
    deleteCode: boolean;
}
export type BackendGetMeetingInfoResponse = HTTPGetMeetingInfoResponse & {
    code?: string;
};

//// (2-3) Update Meeting  -> no support
//// (2-4) Delete Meeting
export type BackendDeleteMeetingRequest = HTTPDeleteMeetingRequest & {
    meetingName: string;
};
export type BackendDeleteMeetingResponse = HTTPDeleteMeetingResponse

// (3) Attendees
//// (3-1) Join Meeting (POST)
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

//// (3-2) Get Attendees List (GET)
export type BackendGetAttendeesListRequest = HTTPGetAttendeesListRequest
export type BackendGetAttendeesListResponse = HTTPGetAttendeesListResponse
//// (3-3) Update Attendees (PUT) -> no support
//// (3-4) Delete Attendees (DELETE) -> no support

// (4) Attendee
//// (4-1) Create (POST) -> no support
//// (4-2) Get Attendee Info
export type BackendGetAttendeeInfoRequest = HTTPGetAttendeeInfoRequest & {
    meetingName: string;
    attendeeId: string;
};

export type BackendGetAttendeeInfoResponse = HTTPGetAttendeeInfoResponse
export const BackendGetAttendeeInfoExceptionType = {
    NO_ATTENDEE_FOUND: "NO_MEETING_FOUND",
    PARAMETER_ERROR: "PARAMETER_ERROR",
} as const;
export type BackendGetAttendeeInfoExceptionType = typeof BackendGetAttendeeInfoExceptionType[keyof typeof BackendGetAttendeeInfoExceptionType];
export type BackendGetAttendeeInfoException = {
    code: BackendGetAttendeeInfoExceptionType;
    exception: boolean;
};

//// (4-3) Update Attendee Info -> no support
//// (4-4) Delete Attendee 
// TODO: Implement Delete Attendee




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