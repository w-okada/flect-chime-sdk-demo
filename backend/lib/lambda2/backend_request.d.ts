import { Chime } from "aws-sdk";
import { Metadata } from "./http_request";
export declare type BackendGetMeetingInfoRequest = {
    meetingName: string;
    email?: string;
};
export declare type BackendGetMeetingInfoResponse = {
    meetingName: string;
    meetingId: string;
    meeting: Chime.Meeting;
    metadata: Metadata;
    hmmTaskArn: string;
    isOwner?: boolean;
};
export declare type BackendDeleteMeetingRequest = {
    meetingName: string;
};
export declare type BackendCreateMeetingRequest = {
    email: string;
    meetingName: string;
    region: string;
};
export declare type BackendCreateMeetingResponse = {
    created: boolean;
    meetingId: string;
    meetingName: string;
    ownerId: string;
};
export declare type BackendJoinMeetingRequest = {
    meetingName: string;
    attendeeName: string;
};
export declare type BackendJoinMeetingResponse = {
    meetingName: string;
    meeting: Chime.Meeting;
    attendee: Chime.Attendee;
};
export declare const BackendJoinMeetingExceptionType: {
    readonly NO_MEETING_FOUND: "NO_MEETING_FOUND";
    readonly PARAMETER_ERROR: "PARAMETER_ERROR";
};
export declare type BackendJoinMeetingExceptionType = typeof BackendJoinMeetingExceptionType[keyof typeof BackendJoinMeetingExceptionType];
export declare type BackendJoinMeetingException = {
    code: BackendJoinMeetingExceptionType;
    exception: boolean;
};
export declare type BackendGetAttendeeInfoRequest = {
    meetingName: string;
    attendeeId: string;
};
export declare type BackendGetAttendeeInfoResponse = {
    attendeeId: string;
    attendeeName: string;
};
export declare const BackendGetAttendeeInfoExceptionType: {
    readonly NO_ATTENDEE_FOUND: "NO_MEETING_FOUND";
    readonly PARAMETER_ERROR: "PARAMETER_ERROR";
};
export declare type BackendGetAttendeeInfoExceptionType = typeof BackendGetAttendeeInfoExceptionType[keyof typeof BackendGetAttendeeInfoExceptionType];
export declare type BackendGetAttendeeInfoException = {
    code: BackendGetAttendeeInfoExceptionType;
    exception: boolean;
};
export declare type BackendStartTranscribeRequest = {
    email: string;
    meetingName: string;
    lang: string;
};
export declare type BackendStartTranscribeResponse = {};
export declare const BackendStartTranscribeExceptionType: {
    readonly NOT_OWNER: "NOT_OWNER";
    readonly NO_MEETING_FOUND: "NO_MEETING_FOUND";
};
export declare type BackendStartTranscribeExceptionType = typeof BackendStartTranscribeExceptionType[keyof typeof BackendStartTranscribeExceptionType];
export declare type BackendStartTranscribeException = {
    code: BackendStartTranscribeExceptionType;
    exception: boolean;
};
export declare type BackendStopTranscribeRequest = {
    email: string;
    meetingName: string;
};
export declare type BackendStopTranscribeResponse = {};
export declare const BackendStopTranscribeExceptionType: {
    readonly NOT_OWNER: "NOT_OWNER";
    readonly NO_MEETING_FOUND: "NO_MEETING_FOUND";
};
export declare type BackendStopTranscribeExceptionType = typeof BackendStopTranscribeExceptionType[keyof typeof BackendStopTranscribeExceptionType];
export declare type BackendStopTranscribeException = {
    code: BackendStopTranscribeExceptionType;
    exception: boolean;
};
