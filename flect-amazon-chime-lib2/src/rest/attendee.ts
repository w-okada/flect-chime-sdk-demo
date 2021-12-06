import { RestApiClientContext } from "./RestApiClient";

/**
 * Join Meeting
 */
export type JoinMeetingRequest = {
    meetingName: string;
    attendeeName: string;
};
export type JoinMeetingResponse = {
    MeetingName: string;
    Attendee: {
        AttendeeId: string;
        ExternalUserId: string;
        JoinToken: string;
    };
    Meeting: {
        ExternalMeetingId: string | null;
        MediaPlacement: {
            AudioFallbackUrl: string;
            AudioHostUrl: string;
            ScreenDataUrl: string;
            ScreenSharingUrl: string;
            ScreenViewingUrl: string;
            SignalingUrl: string;
            TurnControlUrl: string;
        };
        MediaRegion: string;
        MeetingId: string;
    };
    code: string | null;
};

export const joinMeeting = async (params: JoinMeetingRequest, context: RestApiClientContext): Promise<JoinMeetingResponse> => {
    const url = `${context.baseUrl}meetings/${encodeURIComponent(params.meetingName)}/attendees`;
    params.meetingName = encodeURIComponent(params.meetingName);
    params.attendeeName = encodeURIComponent(params.attendeeName);
    const requestBody = JSON.stringify(params);

    const response = await fetch(url, {
        method: "POST",
        body: requestBody,
        headers: {
            Authorization: context.idToken!,
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Flect-Access-Token": context.accessToken!,
        },
    });

    const data = await response.json();
    if (data === null) {
        throw new Error(`Server error: Join Meeting Failed`);
    }
    return data;
};

/**
 * get attendee name
 */
export type GetUserNameByAttendeeIdRequest = {
    meetingName: string;
    attendeeId: string;
};

export type GetUserNameByAttendeeIdResponse = {
    name: string;
    result: string;
};
export const getUserNameByAttendeeId = async (params: GetUserNameByAttendeeIdRequest, context: RestApiClientContext): Promise<GetUserNameByAttendeeIdResponse> => {
    const attendeeUrl = `${context.baseUrl}meetings/${encodeURIComponent(params.meetingName)}/attendees/${encodeURIComponent(params.attendeeId)}`;
    const res = await fetch(attendeeUrl, {
        method: "GET",
        headers: {
            Authorization: context.idToken!,
            "X-Flect-Access-Token": context.accessToken!,
        },
    });
    if (!res.ok) {
        throw new Error("Invalid server response");
    }

    const data = await res.json();
    return {
        name: decodeURIComponent(data.AttendeeName),
        result: data.result,
    };
};

/**
 * List attendees *** maybe return attendee history. not current attendee???***
 */
export type GetAttendeeListRequest = {
    meetingName: string;
};
export type GetAttendeeListResponse = {
    attendees: [
        {
            ExternalUserId: string;
            AttendeeId: string;
            JoinToken: string;
        }
    ];
    result: string;
};

export const getAttendeeList = async (params: GetAttendeeListRequest, context: RestApiClientContext): Promise<GetAttendeeListResponse> => {
    const attendeeUrl = `${context.baseUrl}meetings/${encodeURIComponent(params.meetingName)}/attendees`;
    const res = await fetch(attendeeUrl, {
        method: "GET",
        headers: {
            Authorization: context.idToken!,
            "X-Flect-Access-Token": context.accessToken!,
        },
    });
    if (!res.ok) {
        throw new Error("Invalid server response");
    }

    const data = await res.json();
    return {
        attendees: data.Attendees,
        result: data.result,
    };
};
