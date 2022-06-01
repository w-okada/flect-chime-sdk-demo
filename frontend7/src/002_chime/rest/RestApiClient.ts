import { createMeeting, CreateMeetingRequest, endMeeting, EndMeetingRequest, getMeetingInfo, GetMeetingInfoRequest } from "./meeting";
export { createMeeting, endMeeting, getMeetingInfo };
export type { CreateMeetingRequest, EndMeetingRequest, GetMeetingInfoRequest };


export type RestApiClientContext = {
    baseUrl: string;
    idToken: string;
    accessToken: string;
    refreshToken: string;
    codeToAccess?: string;
};



export class RestApiClient {
    private context: RestApiClientContext;
    constructor(_context: RestApiClientContext) {
        this.context = _context;
    }

    // (1) Meeting Management
    //// (1-1) Create Meeting
    createMeeting = async (params: CreateMeetingRequest) => {
        return createMeeting(params, this.context!);
    };

    //// (1-2) End Meeting
    endMeeting = async (params: EndMeetingRequest) => {
        return endMeeting(params, this.context!);
    };

    //// (1-3) Get Meeting Info
    getMeetingInfo = async (params: GetMeetingInfoRequest) => {
        return getMeetingInfo(params, this.context!);
    };

    // // (2) Attendee Management

    // //// (2-1) Join meeting
    // joinMeeting = async (params: JoinMeetingRequest) => {
    //     return joinMeeting(params, this.context!);
    // };

    // //// (2-2) Leave meeting
    // //// not needed for Chime Server.

    // //// (2-3) get Attendee Name
    // getUserNameByAttendeeId = async (params: GetUserNameByAttendeeIdRequest) => {
    //     return getUserNameByAttendeeId(params, this.context!);
    // };

    // //// (2-4) get Attendee List
    // ///// *** maybe return attendee history. not current attendee???***
    // getAttendeeList = async (params: GetAttendeeListRequest) => {
    //     getAttendeeList(params, this.context!);
    // };

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