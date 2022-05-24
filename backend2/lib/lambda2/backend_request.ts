import { Chime } from "aws-sdk";
import { Metadata } from "./http_request";

// Get Meeting Info
export type BackendGetMeetingInfoRequest = {
    meetingName: string;
    email?: string;
};
export type BackendGetMeetingInfoResponse = {
    meetingName: string;
    meetingId: string;
    meeting: Chime.Meeting;
    metadata: Metadata;
    hmmTaskArn: string;
    isOwner?: boolean;
};

// Delete Meeting

export type BackendDeleteMeetingRequest = {
    meetingName: string;
};

// Create Meeting
export type BackendCreateMeetingRequest = {
    email: string;
    meetingName: string;
    region: string;
};

export type BackendCreateMeetingResponse = {
    created: boolean;
    meetingId: string;
    meetingName: string;
    ownerId: string;
};

// Join Meeting
export type BackendJoinMeetingRequest = {
    meetingName: string;
    attendeeName: string;
};

export type BackendJoinMeetingResponse = {
    meetingName: string;
    meeting: Chime.Meeting;
    attendee: Chime.Attendee;
};
export const BackendJoinMeetingExceptionType = {
    NO_MEETING_FOUND: "NO_MEETING_FOUND",
    PARAMETER_ERROR: "PARAMETER_ERROR",
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
