import { Chime } from "aws-sdk";

export type HTTPResponseBody = {
    success: boolean;
    code: string;
    data?: any;
};

export type Metadata = {
    OwnerId: string;
    Region: string;
    StartTime: number;
};

// Create Meeting
export type HTTPCreateMeetingRequest = {
    meetingName: string;
    region: string;
};

export type HTTPCreateMeetingResponse = {
    created: boolean;
    meetingId: string;
    meetingName: string;
    ownerId: string;
};

// Get Meeting Info
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
