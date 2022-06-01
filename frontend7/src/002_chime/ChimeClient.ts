import { createMeeting, CreateMeetingRequest, GetMeetingInfoRequest, RestApiClient, RestApiClientContext } from "./rest/RestApiClient";

export class FlectChimeClient {
    private _restApiClient: RestApiClient;
    constructor(restEndPoint: string, idToken: string, accessToken: string, refreshToken: string) {
        const restApiContext: RestApiClientContext = {
            baseUrl: restEndPoint,
            idToken: idToken,
            accessToken: accessToken,
            refreshToken: refreshToken
        }
        this._restApiClient = new RestApiClient(restApiContext);
    }
    ///////////////////////////////////////////
    // Meeting Management
    ///////////////////////////////////////////
    /**
     * (A-) create meeting
     */
    getMeetingInfo = async (meetingName: string, userName: string | null = null) => {
        // this._meetingName = meetingName;
        // this._userName = userName;
        const props: GetMeetingInfoRequest = {
            meetingName
        }
        const res = await this._restApiClient.getMeetingInfo(props);
        console.log(res);
        return res;
    };

    /**
     * (A) create meeting
     */
    createMeeting = async (meetingName: string, region: string) => {
        // this._meetingName = meetingName;
        const props: CreateMeetingRequest = {
            meetingName, region
        }
        const res = await this._restApiClient.createMeeting(props);
        if (!res.created) {
            console.log("[FlectChimeClient][createMeeting] meeting create failed", res);
            throw new Error(`Meeting Create Failed`);
        }
        return res;
    };

}