
import { BASE_URL } from '../Config'
import { LocalLogger } from '../utils/localLogger'

const logger = new LocalLogger("API")

type CreateMeetingRequest = {
    meetingName: string
    region: string
}
type JoinMeetingRequest = {
    meetingName: string
    attendeeName: string
}
type EndMeetingRequest = {
}

/**
 * 1. Create meeting
 * @param meetingName 
 * @param region 
 * @param idToken 
 * @param accessToken 
 * @param refreshToken 
 */
export const createMeeting = async (meetingName: string, region: string, idToken: string, accessToken: string, refreshToken: string):
    Promise<{ created: boolean, meetingName: string, meetingId: string }> =>{

    const url = `${BASE_URL}meetings`

    const request: CreateMeetingRequest = { 
        meetingName: encodeURIComponent(meetingName), 
        region: region, 
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
    logger.log("createMeeting", data)
    return { created, meetingId, meetingName };
}

/**
 * 2. Join Meeting
 * @param meetingName 
 * @param userName 
 * @param idToken 
 * @param accessToken 
 * @param refreshToken 
 */
export const joinMeeting = async (meetingName: string, userName: string, idToken: string, accessToken: string, refreshToken: string):
    Promise<{ MeetingName: string, Meeting: any, Attendee: any, code?: string }> => { // 公式でもMeetingとAttendeeはanyで定義されている。 

    const url = `${BASE_URL}meetings/${encodeURIComponent(meetingName)}/attendees`
    const attendeeName = userName // TODO:

    const request:JoinMeetingRequest = { 
        meetingName: encodeURIComponent(meetingName), 
        attendeeName: encodeURIComponent(attendeeName), 
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

/**
 * 3. end meeting
 * @param meetingName 
 * @param userName 
 * @param userId 
 * @param idToken 
 * @param accessToken 
 * @param refreshToken 
 */
export const endMeeting = async (meetingName: string, idToken: string, accessToken: string, refreshToken: string) => {
    const encodedMeetingName = encodeURIComponent(meetingName)

    const url = `${BASE_URL}meetings/${encodedMeetingName}`
    const request:EndMeetingRequest ={}
    const requestBody = JSON.stringify(request)

    const response = await fetch(url,{
        method: 'DELETE',
        body: requestBody,
        headers: {
            "Authorization": idToken,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "X-Flect-Access-Token": accessToken
        }
    });
    if (!response.ok) {
        throw new Error('Server error ending meeting');
    }
}

/**
 * 4. get user info
 * @param meetingName 
 * @param attendeeId 
 * @param idToken 
 * @param accessToken 
 * @param refreshToken 
 */
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
    console.log("getUserNameByAttendeeId", data)
    return {
        name: decodeURIComponent(data.AttendeeName),
        result: data.result
    };
}


/**
 * 5. List attendees *** maybe return attendee history. not current attendee???***
 * @param meetingName 
 * @param attendeeId 
 * @param idToken 
 * @param accessToken 
 * @param refreshToken 
 */
export const getAttendeeList = async (meetingName: string, idToken: string, accessToken: string, refreshToken: string) => {
    const attendeeUrl = `${BASE_URL}meetings/${encodeURIComponent(meetingName)}/attendees`
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
    console.log(data)
    return {
        name: decodeURIComponent(data.UserName),
        result: data.result
    };
}



/**
 * 6. generateOnetimeCode
 * @param meetingName 
 * @param attendeeId 
 * @param idToken 
 * @param accessToken 
 * @param refreshToken 
 */
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


/**
 * 7. singinWithOnetimeCodeRequest
 * @param meetingName 
 * @param attendeeId 
 * @param uuid 
 */
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
    attendeeName?: string,
}

/**
 * 8, singinWithOnetimeCode
 * @param meetingName 
 * @param attendeeId 
 * @param uuid 
 * @param code 
 */
export const singinWithOnetimeCode = async (meetingName:string, attendeeId:string, uuid:string, code:string):
    Promise<OnetimeCodeSigninResult> => {

    const url = `${BASE_URL}operations/onetime-code-signin`

    console.log("[onetimecode] 1")

    const request = { 
        uuid:uuid,
        meetingName: meetingName,
        attendeeId: attendeeId,
        code: code,
    }
    const requestBody = JSON.stringify(request)

    console.log("[onetimecode] 2")
    try{
        const response = await fetch(url, {
            method: 'POST',
            body: requestBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });

        console.log("[onetimecode] 3")
        const data = await response.json();
        console.log("[singinWithOnetimeCode]",data)    
        if (data === null) {
            throw new Error(`Server error: Join Meeting Failed`);
        }
        return data;
    }catch(exception){
        console.log("[onetimecode]2-2, ", exception.message)
        console.log("[onetimecode]2-2, ", JSON.stringify(exception.message))
        

        console.log("[onetimecode]2-3, ", url)
    }
    return {
        result:false,
        idToken:"b",
        accessToken:"c",
        attendeeName: "d",
    }

}


/**
 * 9. startManager
 * @param meetingName 
 * @param attendeeId 
 * @param idToken 
 * @param accessToken 
 * @param refreshToken 
 */
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
    console.log("START MANAGER:", data)
    if (data === null) {
        throw new Error(`Server error: startManager failed`);
    }
    return data;
}


/**
 * 10. getMeetingInfo
 * @param meetingName 
 * @param idToken 
 * @param accessToken 
 * @param refreshToken 
 */
export const getMeetingInfo = async(meetingName: string, idToken: string, accessToken: string, refreshToken: string) => {

    const url = `${BASE_URL}meetings/${encodeURIComponent(meetingName)}`

    const response = await fetch(url, {
            method: 'GET',
            headers: {
                "Authorization": idToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "X-Flect-Access-Token": accessToken
            }
        }
    );

    const data = await response.json();
    console.log("getMeetingInfo res:", data)
    if (data === null) {
        throw new Error(`Server error: get meeting info failed`);
    }
    return data;
}




/**
 * x1. getManagerInfo
 * @param meetingName 
 * @param attendeeId 
 * @param uuid 
 * @param code 
 */
export const getManagerInfo = async (meetingName: string, attendeeId: string, idToken: string, accessToken: string, refreshToken: string):
Promise<{ code: string, publicIp:string, lastStatus:string,  desiredStatus:string}> => {

    const url = `${BASE_URL}meetings/${encodeURIComponent(meetingName)}/attendees/${encodeURIComponent(attendeeId)}/operations/get-manager-info`

    const request = { 
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
    console.log("[getManagerInfo]",data)
    return data;
}



/**
 * x1. get presigned url
 * @param meetingName 
 * @param attendeeId 
 * @param uuid 
 * @param code 
 */
export const getPresignedURL = async (key:string, idToken: string, accessToken: string, refreshToken: string):
Promise<{ result:string, url: string, fields:{[key:string]:string} }> => {

    const url = `${BASE_URL}operations/generate-s3-presigned-url`

    const request = { 
        key: key
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
    console.log("[getPresignedURL]",data)
    return data;
}


// /**
//  * x1. update among us service
//  * @param meetingName 
//  * @param attendeeId 
//  * @param uuid 
//  * @param code 
//  */
// export const updateAmongUsService = async (desiredCount:number):
//     Promise<OnetimeCodeSigninResult> => {

//     const url = `${BASE_URL}operations/update-amongus-service`

//     const request = { 
//         desiredCount:desiredCount
//     }    
//     const requestBody = JSON.stringify(request)

//     const response = await fetch(url, {
//             method: 'POST',
//             body: requestBody,
//             headers: {
//                 'Accept': 'application/json',
//                 'Content-Type': 'application/json',
//             }
//         }
//     );

//     const data = await response.json();
//     console.log("[updateAmongUsService]",data)
//     return data;
// }


// /**
//  * x1. update among us service
//  * @param meetingName 
//  * @param attendeeId 
//  * @param uuid 
//  * @param code 
//  */
// export const listAmongUsService = async ():
//     Promise<OnetimeCodeSigninResult> => {

//     const url = `${BASE_URL}operations/list-amongus-service`

//     const request = { 
//     }    
//     const requestBody = JSON.stringify(request)

//     const response = await fetch(url, {
//             method: 'POST',
//             body: requestBody,
//             headers: {
//                 'Accept': 'application/json',
//                 'Content-Type': 'application/json',
//             }
//         }
//     );

//     const data = await response.json();
//     console.log("[updateAmongUsService]",data)
//     return data;
// }
