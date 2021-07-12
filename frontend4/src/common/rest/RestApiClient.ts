
// (1)
type CreateMeetingRequest = {
    meetingName: string
    region: string
}

type CreateMeetingResponse = {
    created: boolean, 
    meetingName: string, 
    meetingId: string 
}

// (2)
type JoinMeetingRequest = {
    meetingName: string
    attendeeName: string
}
type JoinMeetingResponse = {
    MeetingName: string,
    Attendee:{
        AttendeeId: string,
        ExternalUserId: string,
        JoinToken: string
    },
    Meeting:{
        ExternalMeetingId: string|null,
        MediaPlacement:{
            AudioFallbackUrl: string,
            AudioHostUrl: string,
            ScreenDataUrl: string,
            ScreenSharingUrl: string,
            ScreenViewingUrl: string,
            SignalingUrl: string,
            TurnControlUrl: string,
        },
        MediaRegion: string,
        MeetingId: string
    },
    code:string|null
}

// (3)
type EndMeetingRequest = {
}

// (4)
type GetUserNameByAttendeeIdResponse = {
    name: string,
    result: string
}

// (5)
type GetAttendeeListResponse = {
    attendees: [{
        ExternalUserId: string, 
        AttendeeId: string, 
        JoinToken:string
    }],
    result: string
}

// (6)
type GenerateOnetimeCodeResponse = {
    code: string,
    ontimecodeExpireDate: number,
    uuid: string
}

// (7)
type SinginWithOnetimeCodeRequestResponse = {
    uuid: string,
    codes: string[],
    status:string,
    meetingName:string,
    attendeeId:string,
}

// (8)
type SinginWithOnetimeCodeResponse = {
    result:boolean,
    idToken?:string,
    accessToken?:string,
    attendeeName?: string,
}

// (9)
type StartManagerResponse = {
    code: string, 
    url:string
}

// (10)
type GetMeetingInfoResponse = {
    HmmTaskArn: string,
    IsOwner: boolean,
    MeetingId: string,
    MeetingInfo: {
        Meeting: {
            ExternalMeetingId: string | null
            MediaPlacement: {
                AudioHostUrl: string, 
                AudioFallbackUrl: string, 
                ScreenDataUrl: string, 
                ScreenSharingUrl: string, 
                ScreenViewingUrl: string,
                SignalingUrl: string,
                TurnControlUrl: string,
            },
            MediaRegion: string,
            MeetingId: string,
        }
    }
    MeetingName: string,
    Metadata: {
        OwnerId: string, 
        Region: string, 
        StartTime: number
    }
}

//(11)
type GetManagerInfoRequest = {
    code: string,
    publicIp:string,
    lastStatus:string,
    desiredStatus:string
}

export class RestApiClient{
    private _baseUrl:string|null = null
    private _idToken:string|null = null
    private _accessToken:string|null = null
    private _refreshToken:string|null = null

    constructor(baseUrl:string, idToken:string, accessToken:string, refreshToken:string){
        this._baseUrl = baseUrl
        this._idToken = idToken
        this._accessToken = accessToken
        this._refreshToken = refreshToken
    }

    // (1) Create meeting
    createMeeting = async (meetingName: string, region: string): Promise<CreateMeetingResponse> =>{
        const url = `${this._baseUrl}meetings`

        const request: CreateMeetingRequest = { 
            meetingName: encodeURIComponent(meetingName), 
            region: region, 
        }

        const requestBody = JSON.stringify(request)

        const response = await fetch(url, {
            method: 'POST',
            body: requestBody,
            headers: {
                "Authorization": this._idToken!,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "X-Flect-Access-Token": this._accessToken!
            }
        });
        const data = await response.json();
        const { created, meetingId } = data;
        return { created, meetingId, meetingName };
    }

    // (2) Create meeting
    joinMeeting = async (meetingName: string, userName: string):Promise<JoinMeetingResponse> =>{
        const url = `${this._baseUrl}meetings/${encodeURIComponent(meetingName)}/attendees`
        const attendeeName = userName 
    
        const request:JoinMeetingRequest = { 
            meetingName: encodeURIComponent(meetingName), 
            attendeeName: encodeURIComponent(attendeeName), 
        }
    
        const requestBody = JSON.stringify(request)
    
        const response = await fetch(url, {
                method: 'POST',
                body: requestBody,
                headers: {
                    "Authorization": this._idToken!,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    "X-Flect-Access-Token": this._accessToken!
                }
            }
        );
    
        const data = await response.json();
        if (data === null) {
            throw new Error(`Server error: Join Meeting Failed`);
        }
        return data;
    }

    /**
     * (3) end meeting
     */
    endMeeting = async (meetingName: string) => {
        const encodedMeetingName = encodeURIComponent(meetingName)

        const url = `${this._baseUrl}meetings/${encodedMeetingName}`
        const request:EndMeetingRequest ={}
        const requestBody = JSON.stringify(request)

        const response = await fetch(url,{
            method: 'DELETE',
            body: requestBody,
            headers: {
                "Authorization": this._idToken!,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "X-Flect-Access-Token": this._accessToken!
            }
        });
        if (!response.ok) {
            throw new Error('Server error ending meeting');
        }
    }

    /**
     * (4) get user info
     */
    getUserNameByAttendeeId = async (meetingName: string, attendeeId: string):Promise<GetUserNameByAttendeeIdResponse>=> {
        const attendeeUrl = `${this._baseUrl}meetings/${encodeURIComponent(meetingName)}/attendees/${encodeURIComponent(attendeeId)}`
        const res = await fetch(attendeeUrl, {
            method: 'GET',
            headers: {
                "Authorization": this._idToken!,
                "X-Flect-Access-Token": this._accessToken!
            }
        });
        if (!res.ok) {
            throw new Error('Invalid server response');
        }

        const data = await res.json();
        return {
            name: decodeURIComponent(data.AttendeeName),
            result: data.result
        };
    }



    /**
     * (5) List attendees *** maybe return attendee history. not current attendee???***
     */
    getAttendeeList = async (meetingName: string):Promise<GetAttendeeListResponse> => {
        const attendeeUrl = `${this._baseUrl}meetings/${encodeURIComponent(meetingName)}/attendees`
        const res = await fetch(attendeeUrl, {
            method: 'GET',
            headers: {
                "Authorization": this._idToken!,
                "X-Flect-Access-Token": this._accessToken!
            }
        });
        if (!res.ok) {
            throw new Error('Invalid server response');
        }

        const data = await res.json();
        return {
            attendees: data.Attendees,
            result: data.result
        };
    }


    /**
     * (6) generateOnetimeCode
     */
    generateOnetimeCode = async (meetingName: string, attendeeId: string):Promise<GenerateOnetimeCodeResponse > => { 

        const url = `${this._baseUrl}meetings/${encodeURIComponent(meetingName)}/attendees/${encodeURIComponent(attendeeId)}/operations/generate-onetime-code`

        const request = { 
            meetingName: encodeURIComponent(meetingName), 
        }

        const requestBody = JSON.stringify(request)

        const response = await fetch(url, {
                method: 'POST',
                body: requestBody,
                headers: {
                    "Authorization": this._idToken!,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    "X-Flect-Access-Token": this._accessToken!
                }
            }
        );

        const data = await response.json();
        if (data === null) {
            throw new Error(`Server error: Join Meeting Failed`);
        }
        return data;
    }


    /**
     * (7) requestOnetimeSigninChallengeRequest
     */
    requestOnetimeSigninChallengeRequest = async (meetingName:string, attendeeId:string, uuid:string):Promise<SinginWithOnetimeCodeRequestResponse> => { 

        const url = `${this._baseUrl}operations/onetime-code-signin-request`

        const request = { 
            uuid:uuid,
            meetingName: meetingName,
            attendeeId: attendeeId,
        }
        const requestBody = JSON.stringify(request)

        const response = await fetch(url, {
                method: 'POST',
                body: requestBody,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            }
        );

        const data = await response.json();
        if (data === null) {
            throw new Error(`Server error: Join Meeting Failed`);
        }
        return data;
    }


    /**
     * (8) singinWithOnetimeCode
     */
    singinWithOnetimeCode = async (meetingName:string, attendeeId:string, uuid:string, code:string):Promise<SinginWithOnetimeCodeResponse> => {

        const url = `${this._baseUrl}operations/onetime-code-signin`

        const request = { 
            uuid:uuid,
            meetingName: meetingName,
            attendeeId: attendeeId,
            code: code,
        }
        const requestBody = JSON.stringify(request)

        try{
            const response = await fetch(url, {
                method: 'POST',
                body: requestBody,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();
            if (data === null) {
                throw new Error(`Server error: Join Meeting Failed`);
            }
            return data;
        }catch(exception){
            console.log("[onetimecode] exception:", exception.message)
            console.log("[onetimecode] exception: ", JSON.stringify(exception.message))
        }
        return {
            result:false,
            idToken:"",
            accessToken:"",
            attendeeName: "",
        }
    }



    /**
     * (9) startManager
     */
    startManager = async (meetingName: string, attendeeId: string):Promise<StartManagerResponse> => {

        const url = `${this._baseUrl}meetings/${encodeURIComponent(meetingName)}/attendees/${encodeURIComponent(attendeeId)}/operations/start-manager`

        const request = { 
            meetingName: encodeURIComponent(meetingName), 
        }

        const requestBody = JSON.stringify(request)

        const response = await fetch(url, {
                method: 'POST',
                body: requestBody,
                headers: {
                    "Authorization": this._idToken!,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    "X-Flect-Access-Token": this._accessToken!
                }
            }
        );

        const data = await response.json();
        if (data === null) {
            throw new Error(`Server error: startManager failed`);
        }
        return data;
    }

    /**
     * (10) getMeetingInfo
     */
    getMeetingInfo = async(meetingName: string):Promise<GetMeetingInfoResponse> => {

        const url = `${this._baseUrl}meetings/${encodeURIComponent(meetingName)}`

        const response = await fetch(url, {
                method: 'GET',
                headers: {
                    "Authorization": this._idToken!,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    "X-Flect-Access-Token": this._accessToken!
                }
            }
        );
        const data = await response.json();
        if (data === null) {
            throw new Error(`Server error: get meeting info failed`);
        }
        return data;
    }


    /**
     * (11) getManagerInfo
     */
    getManagerInfo = async (meetingName: string, attendeeId: string):Promise<GetManagerInfoRequest> => {
        const url = `${this._baseUrl}meetings/${encodeURIComponent(meetingName)}/attendees/${encodeURIComponent(attendeeId)}/operations/get-manager-info`

        const request = { 
        }    
        const requestBody = JSON.stringify(request)

        const response = await fetch(url, {
                method: 'POST',
                body: requestBody,
                headers: {
                    "Authorization": this._idToken!,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    "X-Flect-Access-Token": this._accessToken!
                }
            }
        );

        const data = await response.json();
        console.log("[getManagerInfo]",data)
        return data;
    }
}


