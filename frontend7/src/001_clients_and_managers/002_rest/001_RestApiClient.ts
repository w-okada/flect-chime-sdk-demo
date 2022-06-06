import { RestAPIEndpoint } from "../../BackendConfig";
import { HTTPCreateMeetingRequest, HTTPListMeetingsRequest } from "../../http_request";
import { createMeeting, listMeetings, RestCreateMeetingRequest, RestCreateMeetingResponse, RestListMeetingsRequest, RestListMeetingsResponse } from "./011_meetings";
import { endMeeting, getMeetingInfo, RestEndMeetingRequest, RestEndMeetingResponse, RestGetMeetingInfoRequest, RestGetMeetingInfoResponse } from "./012_meeting";
import { joinMeeting, RestJoinMeetingRequest, RestJoinMeetingResponse } from "./013_attendees";
import { geAttendeeInfo, RestGetAttendeeInfoRequest, RestGetAttendeeInfoResponse } from "./014_attendee";

export { createMeeting, endMeeting, getMeetingInfo };
export type { HTTPCreateMeetingRequest, HTTPListMeetingsRequest };

export type RestApiClientContext = {
    idToken: string;
    accessToken: string;
    refreshToken: string;
    codeToAccess?: string;
};
export type InternalRestApiClientContext = RestApiClientContext & {
    baseUrl: string
}

export class RestApiClient {
    internalContext = {
        baseUrl: RestAPIEndpoint
    }
    constructor() { }

    // (1) Meetings
    //// (1-1) Create Meeting (POST)
    createMeeting = async (params: RestCreateMeetingRequest, context: RestApiClientContext): Promise<RestCreateMeetingResponse> => {
        const res = await createMeeting(params, { ...context, ...this.internalContext })
        return res as RestCreateMeetingResponse;
    };
    //// (1-2) List Meetings (GET)
    listMeetings = async (params: RestListMeetingsRequest, context: RestApiClientContext): Promise<RestListMeetingsResponse> => {
        const res = await listMeetings(params, { ...context, ...this.internalContext })
        return res as RestListMeetingsResponse
    }
    //// (1-3) (PUT)
    //// (1-4) (DELETE)

    // (2) Meeting
    //// (2-1) (POST)
    //// (2-2) Get Meeting Info (GET)
    getMeetingInfo = async (params: RestGetMeetingInfoRequest, context: RestApiClientContext): Promise<RestGetMeetingInfoResponse> => {
        const res = await getMeetingInfo(params, { ...context, ...this.internalContext });
        return res as RestGetMeetingInfoResponse
    };
    //// (2-3) (PUT) 
    //// (2-4) End Meeting (DELETE)
    endMeeting = async (params: RestEndMeetingRequest, context: RestApiClientContext): Promise<RestEndMeetingResponse> => {
        const res = await endMeeting(params, { ...context, ...this.internalContext });
        return res as RestEndMeetingResponse
    };


    // (3) Attendees
    //// (3-1) join meeting (POST)
    joinMeeting = async (params: RestJoinMeetingRequest, context: RestApiClientContext): Promise<RestJoinMeetingResponse> => {
        const res = await joinMeeting(params, { ...context, ...this.internalContext });
        return res as RestJoinMeetingResponse
    };

    //// (3-2) get Attendee List (GET)
    ///// *** maybe return attendee history. not current attendee???***
    // getAttendeeList = async (params: GetAttendeeListRequest) => {
    //     getAttendeeList(params, this.context!);
    // };


    //// (3)  (PUT) -> no support
    //// (4)  (DELETE) -> no support



    // (4) Attendee
    //// (4-1) (POST)
    //// (4-2) get Attendee Name (GET)
    geAttendeeInfo = async (params: RestGetAttendeeInfoRequest, context: RestApiClientContext): Promise<RestGetAttendeeInfoResponse> => {
        const res = await geAttendeeInfo(params, { ...context, ...this.internalContext });
        return res as RestGetAttendeeInfoResponse
    };

    // (4-3)  (PUT) -> no support
    // (4-4)  (DELETE) 

    //// (2-2) Leave meeting
    //// not needed for Chime Server.


    // // (3) Operations
    // //// (3-1) Start Transcribe
    // startTranscribe = async (params: StartTranscribeRequest) => {
    //     startTranscribe(params, this.context);
    // };

    // //// (3-2) Stop Transcribe
    // stopTranscribe = async (params: StopTranscribeRequest) => {
    //     stopTranscribe(params, this.context);
    // };
}