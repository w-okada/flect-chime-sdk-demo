import { Chime } from "aws-sdk";
export declare type MeetingInfo = {
    meetingName: string;
    meetingId: string;
    meeting: Chime.Meeting;
    metadata: Metadata;
    hmmTaskArn: string;
};
export declare type ResponseBody = {
    success: boolean;
    code: string;
    data?: any;
};
export declare type Metadata = {
    OwnerId: string;
    Region: string;
    StartTime: number;
};
export declare type CreateMeetingRequest = {
    meetingName: string;
    region: string;
};
export declare type CreateMeetingResponse = {
    created: boolean;
    meetingId: string;
    meetingName: string;
    ownerId: string;
};
export declare type JoinMeetingRequest = {
    meetingName: string;
    attendeeName: string;
};
export declare type JoinMeetingResponse = {
    meetingName: string;
    meeting: Chime.Meeting;
    attendee: Chime.Attendee;
};
export declare const JoinMeetingExceptionType: {
    readonly NO_MEETING_FOUND: "NO_MEETING_FOUND";
    readonly PARAMETER_ERROR: "PARAMETER_ERROR";
};
export declare type JoinMeetingExceptionType = typeof JoinMeetingExceptionType[keyof typeof JoinMeetingExceptionType];
export declare type JoinMeetingException = {
    code: JoinMeetingExceptionType;
    exception: boolean;
};
export declare type GetAttendeeInfoResponse = {
    attendeeId: string;
    attendeeName: string;
};
export declare const GetAttendeeInfoExceptionType: {
    readonly NO_ATTENDEE_FOUND: "NO_MEETING_FOUND";
    readonly PARAMETER_ERROR: "PARAMETER_ERROR";
};
export declare type GetAttendeeInfoExceptionType = typeof GetAttendeeInfoExceptionType[keyof typeof GetAttendeeInfoExceptionType];
export declare type GetAttendeeInfoException = {
    code: GetAttendeeInfoExceptionType;
    exception: boolean;
};
