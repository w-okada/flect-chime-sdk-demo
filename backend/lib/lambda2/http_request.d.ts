export declare const HTTPResponseCode: {
    readonly SUCCESS: "SUCCESS";
    readonly INVALID_TOKEN_EXCEPTION: "INVALID_TOKEN_EXCEPTION";
};
export declare type HTTPResponseBody = {
    success: boolean;
    code: string;
    data?: any;
};
import { Chime } from "aws-sdk";
export declare type Metadata = {
    OwnerId: string;
    Region: string;
    StartTime: number;
};
export declare type HTTPCreateMeetingRequest = {
    meetingName: string;
    region: string;
};
export declare type HTTPCreateMeetingResponse = {
    created: boolean;
    meetingId: string;
    meetingName: string;
    ownerId: string;
};
export declare type HTTPGetMeetingInfoResponse = {
    meetingName: string;
    meetingId: string;
    meeting: Chime.Meeting;
    metadata: Metadata;
    hmmTaskArn: string;
    isOwner?: boolean;
};
export declare type HTTPJoinMeetingRequest = {
    meetingName: string;
    attendeeName: string;
};
export declare type HTTPJoinMeetingResponse = {
    meetingName: string;
    meeting: Chime.Meeting;
    attendee: Chime.Attendee;
};
export declare type HTTPGetAttendeeInfoResponse = {
    attendeeId: string;
    attendeeName: string;
};
export declare type SlackHTTPGetUserInformationRequest = {
    token: string;
};
export declare type SlackHTTPGetUserInformationResponse = {
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
