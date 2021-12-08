import { BackendCreateMeetingRequest, BackendCreateMeetingResponse, BackendDeleteMeetingRequest, BackendGetAttendeeInfoException, BackendGetAttendeeInfoRequest, BackendGetAttendeeInfoResponse, BackendGetMeetingInfoRequest, BackendGetMeetingInfoResponse, BackendJoinMeetingException, BackendJoinMeetingRequest, BackendJoinMeetingResponse, BackendStartTranscribeException, BackendStartTranscribeRequest, BackendStartTranscribeResponse, BackendStopTranscribeRequest } from "./backend_request";
/**
 * get meeting info
 * (1) retrieve meeting info from DB
 * (2) If there is no meeting in DB, return null
 * (3) If there is no meeting in Amazon Chime, delete from DB and return null.
 * @param {*} meetingName
 */
export declare const getMeetingInfo: (req: BackendGetMeetingInfoRequest) => Promise<BackendGetMeetingInfoResponse | null>;
/**
 * Delete meeting from DB
 * @param {*} meetingName
 */
export declare const deleteMeeting: (req: BackendDeleteMeetingRequest) => Promise<void>;
export declare const createMeeting: (req: BackendCreateMeetingRequest) => Promise<BackendCreateMeetingResponse>;
export declare const joinMeeting: (req: BackendJoinMeetingRequest) => Promise<BackendJoinMeetingResponse | BackendJoinMeetingException>;
export declare const getAttendeeInfo: (req: BackendGetAttendeeInfoRequest) => Promise<BackendGetAttendeeInfoResponse | BackendGetAttendeeInfoException>;
export declare const startTranscribe: (req: BackendStartTranscribeRequest) => Promise<BackendStartTranscribeResponse | BackendStartTranscribeException>;
/***
 * stop Transcribe.
 *
 */
export declare const stopTranscribe: (req: BackendStopTranscribeRequest) => Promise<{
    code: "NO_MEETING_FOUND";
    exception: boolean;
} | {
    code: "NOT_OWNER";
    exception: boolean;
} | {
    code?: undefined;
    exception?: undefined;
}>;
