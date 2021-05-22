import { BASE_URL } from '../Config'

type CreateMeetingRequest = {
    meetingName: string
    userName: string
    region: string
    userId: string
}
type JoinMeetingRequest = {
    meetingName: string
    userName: string
    userId: string
}
type EndMeetingRequest = {
    meetingName: string
    userName: string
    userId: string
}

export const createMeeting = async (meetingName: string, userName: string, region: string, userId: string, idToken: string, accessToken: string, refreshToken: string):
    Promise<{ created: boolean, meetingName: string, meetingId: string }> =>{

    const url = `${BASE_URL}meetings`

    const request: CreateMeetingRequest = { 
        meetingName: encodeURIComponent(meetingName), 
        userName: encodeURIComponent(userName), 
        region: region, 
        userId: userId
    }

    const requestBody = JSON.stringify(request)

    const response = await fetch(url, {
        method: 'POST',
        body: requestBody,
        headers: {
            "Authorization": idToken,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "X-Flect-Access-Token": accessToken
        }
    });
    const data = await response.json();
    const { created, meetingId } = data;
    console.log(data)
    return { created, meetingId, meetingName };
}

export const joinMeeting = async (meetingName: string, userName: string, userId: string, idToken: string, accessToken: string, refreshToken: string):
    Promise<{ MeetingName: string, Meeting: any, Attendee: any, code?: string }> => { // 公式でもMeetingとAttendeeはanyで定義されている。 

    const url = `${BASE_URL}meetings/${encodeURIComponent(meetingName)}/attendees`

    const request:JoinMeetingRequest = { 
        meetingName: encodeURIComponent(meetingName), 
        userName: encodeURIComponent(userName), 
        userId: userId 
    }

    const requestBody = JSON.stringify(request)

    // console.log("[joinMeeting]", idToken, accessToken)


    const response = await fetch(url, {
            method: 'POST',
            body: requestBody,
            headers: {
                "Authorization": idToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "X-Flect-Access-Token": accessToken
            }
        }
    );

    const data = await response.json();
    if (data === null) {
        throw new Error(`Server error: Join Meeting Failed`);
    }
    return data;
}

export const endMeeting = async (meetingName: string, userName: string, userId: string, idToken: string, accessToken: string, refreshToken: string) => {
    const encodedMeetingName = encodeURIComponent(meetingName)

    const url = `${BASE_URL}meetings/${encodedMeetingName}`
    const request: EndMeetingRequest = { 
        meetingName: encodeURIComponent(meetingName), 
        userName: encodeURIComponent(userName), 
        userId: userId 
    }

    const requestBody = JSON.stringify(request)

    const response = await fetch(url,
        {
            method: 'DELETE',
            body: requestBody,
            headers: {
                "Authorization": idToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "X-Flect-Access-Token": accessToken
            }
        }
    );

    if (!response.ok) {
        throw new Error('Server error ending meeting');
    }
}

export const getUserNameByAttendeeId = async (meetingName: string, attendeeId: string, idToken: string, accessToken: string, refreshToken: string) => {
    const attendeeUrl = `${BASE_URL}meetings/${encodeURIComponent(meetingName)}/attendees/${encodeURIComponent(attendeeId)}`
    const res = await fetch(attendeeUrl, {
        method: 'GET',
        headers: {
            "Authorization": idToken,
            "X-Flect-Access-Token": accessToken
        }
    });
    if (!res.ok) {
        throw new Error('Invalid server response');
    }

    const data = await res.json();
    return {
        name: decodeURIComponent(data.UserName),
        result: data.result
    };
}


export const generateOnetimeCode = async (meetingName: string, attendeeId: string, idToken: string, accessToken: string, refreshToken: string):
    Promise<{ uuid: string, code: string, ontimecodeExpireDate:number }> => { 

    const url = `${BASE_URL}meetings/${encodeURIComponent(meetingName)}/attendees/${encodeURIComponent(attendeeId)}/operations/generate-onetime-code`

    const request = { 
        meetingName: encodeURIComponent(meetingName), 
    }

    const requestBody = JSON.stringify(request)

    const response = await fetch(url, {
            method: 'POST',
            body: requestBody,
            headers: {
                "Authorization": idToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "X-Flect-Access-Token": accessToken
            }
        }
    );

    const data = await response.json();
    if (data === null) {
        throw new Error(`Server error: Join Meeting Failed`);
    }
    return data;
}

export type OnetimeCodeInfo = {
    uuid: string,
    codes: string[],
    status:string,
    meetingName:string,
    attendeeId:string,
}

export const singinWithOnetimeCodeRequest = async (meetingName:string, attendeeId:string, uuid:string):
    Promise<OnetimeCodeInfo> => { 

    const url = `${BASE_URL}operations/onetime-code-signin-request`

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
    console.log("[singinWithOnetimeCodeRequest]",data)
    if (data === null) {
        throw new Error(`Server error: Join Meeting Failed`);
    }
    return data;
}


export type OnetimeCodeSigninResult = {
    result:boolean,
    idToken?:string,
    accessToken?:string,
    userName?: string,
}

export const singinWithOnetimeCode = async (meetingName:string, attendeeId:string, uuid:string, code:string):
    Promise<OnetimeCodeSigninResult> => {

    const url = `${BASE_URL}operations/onetime-code-signin`

    const request = { 
        uuid:uuid,
        meetingName: meetingName,
        attendeeId: attendeeId,
        code: code,
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
    console.log("[singinWithOnetimeCode]",data)
    if (data === null) {
        throw new Error(`Server error: Join Meeting Failed`);
    }
    return data;
}





export const startManager = async (meetingName: string, attendeeId: string, idToken: string, accessToken: string, refreshToken: string):
    Promise<{ code: string, url:string }> => {

    const url = `${BASE_URL}meetings/${encodeURIComponent(meetingName)}/attendees/${encodeURIComponent(attendeeId)}/operations/start-manager`

    const request = { 
        meetingName: encodeURIComponent(meetingName), 
    }

    const requestBody = JSON.stringify(request)

    const response = await fetch(url, {
            method: 'POST',
            body: requestBody,
            headers: {
                "Authorization": idToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "X-Flect-Access-Token": accessToken
            }
        }
    );

    const data = await response.json();
    if (data === null) {
        throw new Error(`Server error: Join Meeting Failed`);
    }
    return data;
}