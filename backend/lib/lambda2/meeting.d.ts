import { CreateMeetingResponse, GetAttendeeInfoException, GetAttendeeInfoResponse, JoinMeetingException, JoinMeetingResponse, MeetingInfo, StartTranscribeException, StartTranscribeResponse } from "./const";
/**
 * get meeting info
 * (1) retrieve meeting info from DB
 * (2) If there is no meeting in DB, return null
 * (3) If there is no meeting in Amazon Chime, delete from DB and return null.
 * @param {*} meetingName
 */
export declare const getMeetingInfo: (meetingName: string) => Promise<MeetingInfo | null>;
/**
 * Delete meeting from DB
 * @param {*} meetingName
 */
export declare const deleteMeeting: (meetingName: string) => Promise<void>;
export declare const createMeeting: (email: string, meetingName: string, region: string) => Promise<CreateMeetingResponse>;
export declare const joinMeeting: (meetingName: string, attendeeName: string) => Promise<JoinMeetingResponse | JoinMeetingException>;
export declare const getAttendeeInfo: (meetingName: string, attendeeId: string) => Promise<GetAttendeeInfoResponse | GetAttendeeInfoException>;
export declare const startTranscribe: (email: string, meetingName: string, lang: string) => Promise<StartTranscribeResponse | StartTranscribeException>;
/***
 * stop Transcribe.
 *
 */
export declare const stopTranscribe: (email: string, meetingName: string) => Promise<{
    code: "NO_MEETING_FOUND";
    exception: boolean;
} | {
    code: "NOT_OWNER";
    exception: boolean;
} | {
    code?: undefined;
    exception?: undefined;
}>;
