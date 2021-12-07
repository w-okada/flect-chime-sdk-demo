import { Chime } from "aws-sdk";

export type MeetingInfo = {
    meetingName: string;
    meetingId: string;
    meeting: Chime.Meeting;
    metadata: Metadata;
    hmmTaskArn: string;
};

export type ResponseBody = {
    success: boolean;
    code: string;
    data?: any;
};

export type Metadata = {
    OwnerId: string;
    Region: string;
    StartTime: number;
};

export type CreateMeetingRequest = {
    meetingName: string;
    region: string;
};

export type CreateMeetingResponse = {
    created: boolean;
    meetingId: string;
    meetingName: string;
    ownerId: string;
};

export type JoinMeetingRequest = {
    meetingName: string;
    attendeeName: string;
};
export type JoinMeetingResponse = {
    meetingName: string;
    meeting: Chime.Meeting;
    attendee: Chime.Attendee;
};
export const JoinMeetingExceptionType = {
    NO_MEETING_FOUND: "NO_MEETING_FOUND",
    PARAMETER_ERROR: "PARAMETER_ERROR",
} as const;
export type JoinMeetingExceptionType = typeof JoinMeetingExceptionType[keyof typeof JoinMeetingExceptionType];
export type JoinMeetingException = {
    code: JoinMeetingExceptionType;
    exception: boolean;
};

export type GetAttendeeInfoResponse = {
    attendeeId: string;
    attendeeName: string;
};
export const GetAttendeeInfoExceptionType = {
    NO_ATTENDEE_FOUND: "NO_MEETING_FOUND",
    PARAMETER_ERROR: "PARAMETER_ERROR",
} as const;
export type GetAttendeeInfoExceptionType = typeof GetAttendeeInfoExceptionType[keyof typeof GetAttendeeInfoExceptionType];
export type GetAttendeeInfoException = {
    code: GetAttendeeInfoExceptionType;
    exception: boolean;
};

export type StartTranscribeRequest = {
    lang: string;
};

export type StartTranscribeResponse = {};
export const StartTranscribeExceptionType = {
    NOT_OWNER: "NOT_OWNER",
    NO_MEETING_FOUND: "NO_MEETING_FOUND",
} as const;
export type StartTranscribeExceptionType = typeof StartTranscribeExceptionType[keyof typeof StartTranscribeExceptionType];
export type StartTranscribeException = {
    code: StartTranscribeExceptionType;
    exception: boolean;
};

export type StopTranscribeRequest = {};
export type StopTranscribeResponse = {};
export const StopTranscribeExceptionType = {
    NOT_OWNER: "NOT_OWNER",
    NO_MEETING_FOUND: "NO_MEETING_FOUND",
} as const;
export type StopTranscribeExceptionType = typeof StopTranscribeExceptionType[keyof typeof StopTranscribeExceptionType];
export type StopTranscribeException = {
    code: StartTranscribeExceptionType;
    exception: boolean;
};
