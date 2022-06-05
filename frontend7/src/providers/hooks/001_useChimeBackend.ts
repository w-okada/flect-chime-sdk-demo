import { useEffect, useMemo, useState } from "react";
import { RestCreateMeetingRequest, RestCreateMeetingResponse, RestListMeetingsRequest, RestListMeetingsResponse } from "../../002_rest/001_meetings";
import { RestEndMeetingRequest, RestEndMeetingResponse, RestGetMeetingInfoRequest, RestGetMeetingInfoResponse } from "../../002_rest/002_meeting";
import { RestJoinMeetingRequest, RestJoinMeetingResponse } from "../../002_rest/003_attendees";
import { RestGetAttendeeInfoRequest, RestGetAttendeeInfoResponse } from "../../002_rest/004_attendee";
import { RestApiClient, RestApiClientContext } from "../../002_rest/RestApiClient";
import { MeetingListItem } from "../../http_request";

export type UseRestClientProps = {
    RestAPIEndpoint: string;
    idToken: string | null;
    accessToken: string | null;
    refreshToken: string | null;
};
export type CreateMeetingParams = RestCreateMeetingRequest
export type CreateMeetingResponse = RestCreateMeetingResponse
export type ListMeetingsRequest = RestListMeetingsRequest
export type ListMeetingsResponse = RestListMeetingsResponse

export type GetMeetingInfoRequest = RestGetMeetingInfoRequest
export type GetMeetingInfoResponse = RestGetMeetingInfoResponse
export type EndMeetingRequest = RestEndMeetingRequest
export type EndMeetingResponse = RestEndMeetingResponse
export type JoinMeetingRequest = RestJoinMeetingRequest
export type JoinMeetingResponse = RestJoinMeetingResponse
export type GetAttendeeInfoRequest = RestGetAttendeeInfoRequest
export type GetAttendeeInfoResponse = RestGetAttendeeInfoResponse

export type ChimeBackendState = {
    meetings: MeetingListItem[]
}
export type ChimeBackendStateAndMethod = ChimeBackendState & {
    createMeeting: (params: CreateMeetingParams) => Promise<CreateMeetingResponse | null>
    reloadMeetingList: (params: ListMeetingsRequest) => Promise<ListMeetingsResponse | null>
    getMeetingInfo: (params: GetMeetingInfoResponse) => Promise<GetMeetingInfoResponse | null>
    endMeeting: (params: EndMeetingRequest) => Promise<EndMeetingResponse | null>
    joinMeeting: (params: JoinMeetingRequest) => Promise<JoinMeetingResponse | null>
    getAttendeeInfo: (params: GetAttendeeInfoRequest) => Promise<GetAttendeeInfoResponse | null>
}
export const useChimeBackend = (props: UseRestClientProps): ChimeBackendStateAndMethod => {
    const [state, setState] = useState<ChimeBackendState>({
        meetings: []
    })

    const restClient = useMemo(() => {
        if (props.idToken && props.accessToken && props.refreshToken) {
            const context: RestApiClientContext = {
                baseUrl: props.RestAPIEndpoint,
                idToken: props.idToken,
                accessToken: props.accessToken,
                refreshToken: props.refreshToken
            }


            return new RestApiClient(context)
        } else {
            return null
        }
    }, [props.RestAPIEndpoint, props.idToken, props.accessToken, props.refreshToken])
    useEffect(() => {
        if (restClient) {
            reloadMeetingList({})
        }
    }, [restClient]);


    // (1) Meetings
    //// (1-1) Create Meeting (POST)
    const createMeeting = async (params: CreateMeetingParams): Promise<CreateMeetingResponse | null> => {
        if (!restClient) return null
        const res = await restClient.createMeeting(params as RestCreateMeetingRequest)
        return res as CreateMeetingResponse

    }

    //// (1-2) List Meetings (GET)
    const reloadMeetingList = async (params: ListMeetingsRequest): Promise<ListMeetingsResponse | null> => {
        if (!restClient) return null
        const res = await restClient.listMeetings(params as RestListMeetingsRequest)
        setState({ ...state, meetings: res.meetings })
        return res as ListMeetingsResponse
    }
    //// (1-3) (PUT)
    //// (1-4) (DELETE)

    // (2) Meeting
    //// (2-1) (POST)
    //// (2-2) Get Meeting Info (GET)
    const getMeetingInfo = async (params: GetMeetingInfoResponse): Promise<GetMeetingInfoResponse | null> => {
        if (!restClient) return null
        const res = await restClient.getMeetingInfo(params as RestGetMeetingInfoResponse)
        return res as GetMeetingInfoResponse
    }
    //// (2-3) (PUT) 
    //// (2-4) End Meeting (DELETE)
    const endMeeting = async (params: EndMeetingRequest): Promise<EndMeetingResponse | null> => {
        if (!restClient) return null
        const res = await restClient.endMeeting(params as RestEndMeetingRequest)
        return res as EndMeetingResponse
    }

    // (3) Attendees
    //// (3-1) join meeting (POST)
    const joinMeeting = async (params: JoinMeetingRequest): Promise<JoinMeetingResponse | null> => {
        if (!restClient) return null
        const res = await restClient.joinMeeting(params as RestJoinMeetingRequest)
        return res as JoinMeetingResponse
    }

    //// (3-2) get Attendee List (GET)
    ///// *** maybe return attendee history. not current attendee???***
    // getAttendeeList = async (params: GetAttendeeListRequest) => {
    //     getAttendeeList(params, this.context!);
    // };
    //// (3-3)  (PUT) -> no support
    //// (3-4)  (DELETE) -> no support


    // (4) Attendee
    //// (4-1) (POST)
    //// (4-2) get Attendee Name (GET)
    const getAttendeeInfo = async (params: GetAttendeeInfoRequest): Promise<RestGetAttendeeInfoResponse | null> => {
        if (!restClient) return null
        const res = await restClient.geAttendeeInfo(params as RestGetAttendeeInfoRequest)
        return res as RestGetAttendeeInfoResponse
    }

    // (4-3)  (PUT) -> no support
    // (4-4)  (DELETE) 

    const returnVal: ChimeBackendStateAndMethod = {
        ...state,
        createMeeting,
        reloadMeetingList,
        getMeetingInfo,
        endMeeting,
        joinMeeting,
        getAttendeeInfo
    }

    return returnVal
}