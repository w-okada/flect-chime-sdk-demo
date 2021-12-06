import { RestApiClientContext } from "./RestApiClient";

/**
 * Create Meeting
 */
export type CreateMeetingRequest = {
    meetingName: string;
    region: string;
};

export type CreateMeetingResponse = {
    created: boolean;
    meetingName: string;
    meetingId: string;
};
export const createMeeting = async (params: CreateMeetingRequest, context: RestApiClientContext): Promise<CreateMeetingResponse> => {
    const url = `${context.baseUrl}meetings`;
    const meetingName = params.meetingName;
    params.meetingName = encodeURIComponent(params.meetingName);

    const requestBody = JSON.stringify(params);
    console.log("CREATE MEETING!!");
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
    const { created, meetingId } = data;
    return { created, meetingId, meetingName };
};

/**
 * End Meeting
 */
export type EndMeetingRequest = {
    meetingName: string;
};
export const endMeeting = async (params: EndMeetingRequest, context: RestApiClientContext) => {
    const encodedMeetingName = encodeURIComponent(params.meetingName);

    const url = `${context.baseUrl}meetings/${encodedMeetingName}`;

    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            Authorization: context.idToken!,
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Flect-Access-Token": context.accessToken!,
        },
    });
    if (!response.ok) {
        throw new Error("Server error ending meeting");
    }
};

/**
 * getMeetingInfo
 */
export type GetMeetingInfoRequest = {
    meetingName: string;
};
export type GetMeetingInfoResponse = {
    HmmTaskArn: string;
    IsOwner: boolean;
    MeetingId: string;
    MeetingInfo: {
        Meeting: {
            ExternalMeetingId: string | null;
            MediaPlacement: {
                AudioHostUrl: string;
                AudioFallbackUrl: string;
                ScreenDataUrl: string;
                ScreenSharingUrl: string;
                ScreenViewingUrl: string;
                SignalingUrl: string;
                TurnControlUrl: string;
            };
            MediaRegion: string;
            MeetingId: string;
        };
    };
    MeetingName: string;
    Metadata: {
        OwnerId: string;
        Region: string;
        StartTime: number;
    };
};
export const getMeetingInfo = async (params: GetMeetingInfoRequest, context: RestApiClientContext): Promise<GetMeetingInfoResponse> => {
    const url = `${context.baseUrl}meetings/${encodeURIComponent(params.meetingName)}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: context.idToken!,
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Flect-Access-Token": context.accessToken!,
        },
    });
    const data = await response.json();
    if (!data.success && data.success === false) {
        throw new Error(`Server error: get meeting info failed, ${data.message}, ${data.code}`);
    }
    return data;
};
