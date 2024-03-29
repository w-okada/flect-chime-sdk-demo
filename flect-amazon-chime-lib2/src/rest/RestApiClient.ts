import { getAttendeeList, GetAttendeeListRequest, getUserNameByAttendeeId, GetUserNameByAttendeeIdRequest, joinMeeting, JoinMeetingRequest } from "./attendee";
import { createMeeting, endMeeting, EndMeetingRequest, GetMeetingInfoRequest, getMeetingInfo, CreateMeetingRequest } from "./meeting";
import { startTranscribe, StartTranscribeRequest, stopTranscribe, StopTranscribeRequest } from "./operations";

// (6)
type GenerateOnetimeCodeResponse = {
    code: string;
    ontimecodeExpireDate: number;
    uuid: string;
};

// (7)
type SinginWithOnetimeCodeRequestResponse = {
    uuid: string;
    codes: string[];
    status: string;
    meetingName: string;
    attendeeId: string;
};

// (8)
type SinginWithOnetimeCodeResponse = {
    result: boolean;
    idToken?: string;
    accessToken?: string;
    attendeeName?: string;
};

// (9)
type StartManagerResponse = {
    // userPoolId: string,
    // userPoolClientId: string,
    code: string;
    uuid: string;
    meetingName: string;
    attendeeId: string;
    restAPIEndpoint: string;
    url: string;
    bucketArn: string;
    bucketName: string;
};

//(11)
type GetManagerInfoRequest = {
    code: string;
    publicIp: string;
    lastStatus: string;
    desiredStatus: string;
};

export type RestApiClientContext = {
    baseUrl: string;
    idToken: string;
    accessToken: string;
    refreshToken: string;
    codeToAccess?: string;
};

export class RestApiClient {
    private context: RestApiClientContext;
    constructor(baseUrl: string) {
        this.context = { baseUrl, idToken: "", accessToken: "", refreshToken: "" };
    }

    init(idToken: string, accessToken: string, refreshToken: string) {
        this.context = { ...this.context, idToken, accessToken, refreshToken };
    }
    initWithCode(codeToAccess: string) {
        this.context = { ...this.context, codeToAccess };
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

    // (2) Attendee Management

    //// (2-1) Join meeting
    joinMeeting = async (params: JoinMeetingRequest) => {
        return joinMeeting(params, this.context!);
    };

    //// (2-2) Leave meeting
    //// not needed for Chime Server.

    //// (2-3) get Attendee Name
    getUserNameByAttendeeId = async (params: GetUserNameByAttendeeIdRequest) => {
        return getUserNameByAttendeeId(params, this.context!);
    };

    //// (2-4) get Attendee List
    ///// *** maybe return attendee history. not current attendee???***
    getAttendeeList = async (params: GetAttendeeListRequest) => {
        getAttendeeList(params, this.context!);
    };

    // (3) Operations
    //// (3-1) Start Transcribe
    startTranscribe = async (params: StartTranscribeRequest) => {
        startTranscribe(params, this.context);
    };

    //// (3-2) Stop Transcribe
    stopTranscribe = async (params: StopTranscribeRequest) => {
        stopTranscribe(params, this.context);
    };

    // /**
    //  * (6) generateOnetimeCode
    //  */
    // generateOnetimeCode = async (meetingName: string, attendeeId: string): Promise<GenerateOnetimeCodeResponse> => {
    //     const url = `${this._baseUrl}meetings/${encodeURIComponent(meetingName)}/attendees/${encodeURIComponent(attendeeId)}/operations/generate-onetime-code`;

    //     const request = {
    //         meetingName: encodeURIComponent(meetingName),
    //     };

    //     const requestBody = JSON.stringify(request);

    //     const response = await fetch(url, {
    //         method: "POST",
    //         body: requestBody,
    //         headers: {
    //             Authorization: this._idToken!,
    //             Accept: "application/json",
    //             "Content-Type": "application/json",
    //             "X-Flect-Access-Token": this._accessToken!,
    //         },
    //     });

    //     const data = await response.json();
    //     if (data === null) {
    //         throw new Error(`Server error: Join Meeting Failed`);
    //     }
    //     return data;
    // };

    // /**
    //  * (7) requestOnetimeSigninChallengeRequest
    //  */
    // requestOnetimeSigninChallengeRequest = async (meetingName: string, attendeeId: string, uuid: string): Promise<SinginWithOnetimeCodeRequestResponse> => {
    //     const url = `${this._baseUrl}operations/onetime-code-signin-request`;

    //     const request = {
    //         uuid: uuid,
    //         meetingName: meetingName,
    //         attendeeId: attendeeId,
    //     };
    //     const requestBody = JSON.stringify(request);

    //     const response = await fetch(url, {
    //         method: "POST",
    //         body: requestBody,
    //         headers: {
    //             Accept: "application/json",
    //             "Content-Type": "application/json",
    //         },
    //     });

    //     const data = await response.json();
    //     if (data === null) {
    //         throw new Error(`Server error: Join Meeting Failed`);
    //     }
    //     return data;
    // };

    // /**
    //  * (8) singinWithOnetimeCode
    //  */
    // singinWithOnetimeCode = async (meetingName: string, attendeeId: string, uuid: string, code: string): Promise<SinginWithOnetimeCodeResponse> => {
    //     const url = `${this._baseUrl}operations/onetime-code-signin`;

    //     const request = {
    //         uuid: uuid,
    //         meetingName: meetingName,
    //         attendeeId: attendeeId,
    //         code: code,
    //     };
    //     const requestBody = JSON.stringify(request);

    //     try {
    //         const response = await fetch(url, {
    //             method: "POST",
    //             body: requestBody,
    //             headers: {
    //                 Accept: "application/json",
    //                 "Content-Type": "application/json",
    //             },
    //         });

    //         const data = await response.json();
    //         if (data === null) {
    //             throw new Error(`Server error: Join Meeting Failed`);
    //         }
    //         return data;
    //     } catch (exception: any) {
    //         console.log("[onetimecode] exception:", exception.message);
    //         console.log("[onetimecode] exception: ", JSON.stringify(exception.message));
    //     }
    //     return {
    //         result: false,
    //         idToken: "",
    //         accessToken: "",
    //         attendeeName: "",
    //     };
    // };

    // /**
    //  * (9) startManager
    //  */
    // startManager = async (meetingName: string, attendeeId: string): Promise<StartManagerResponse> => {
    //     const url = `${this._baseUrl}meetings/${encodeURIComponent(meetingName)}/attendees/${encodeURIComponent(attendeeId)}/operations/start-manager`;

    //     const request = {
    //         meetingName: encodeURIComponent(meetingName),
    //     };

    //     const requestBody = JSON.stringify(request);

    //     const response = await fetch(url, {
    //         method: "POST",
    //         body: requestBody,
    //         headers: {
    //             Authorization: this._idToken!,
    //             Accept: "application/json",
    //             "Content-Type": "application/json",
    //             "X-Flect-Access-Token": this._accessToken!,
    //         },
    //     });

    //     const data = await response.json();
    //     if (data === null) {
    //         throw new Error(`Server error: startManager failed`);
    //     }
    //     return data;
    // };

    // /**
    //  * (11) getManagerInfo
    //  */
    // getManagerInfo = async (meetingName: string, attendeeId: string): Promise<GetManagerInfoRequest> => {
    //     const url = `${this._baseUrl}meetings/${encodeURIComponent(meetingName)}/attendees/${encodeURIComponent(attendeeId)}/operations/get-manager-info`;

    //     const request = {};
    //     const requestBody = JSON.stringify(request);

    //     const response = await fetch(url, {
    //         method: "POST",
    //         body: requestBody,
    //         headers: {
    //             Authorization: this._idToken!,
    //             Accept: "application/json",
    //             "Content-Type": "application/json",
    //             "X-Flect-Access-Token": this._accessToken!,
    //         },
    //     });

    //     const data = await response.json();
    //     console.log("[getManagerInfo]", data);
    //     return data;
    // };
}
