import { Meeting } from "aws-sdk/clients/chime";

export type RoomInfo = {
    roomName: string;
    teamId: string;
    channelId: string;
    channelName: string;
    ts: string;
    meetingInfo?: MeetingInfo;
    attendees: AttendeeInfo[];
    ttl: number;
};
export type MeetingInfo = {
    meetingName: string; // must sync to roomName
    meetingId: string;
    meeting: Meeting;
    metadata: Metadata;
};
export type Metadata = {
    ownerId: string;
    region: string;
    startTime: number;
};
export type AttendeeInfo = {
    attendeeId: string;
    attendeeName: string;
    playerName?: string;
};
