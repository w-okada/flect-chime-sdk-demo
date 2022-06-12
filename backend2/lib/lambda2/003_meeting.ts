import { deleteMeetingFromDB, getMeetingInfoFromDB } from "./001_meeting_common";
import { BackendDeleteMeetingRequest, BackendDeleteMeetingResponse, BackendGetMeetingInfoRequest, BackendGetMeetingInfoResponse } from "./backend_request";

// (2) Meeting
//// (1-1) (POST) -> no support
//// (1-2) Get Meeting Info (Get)
export const getMeetingInfo = async (req: BackendGetMeetingInfoRequest): Promise<BackendGetMeetingInfoResponse> => {
    const result = await getMeetingInfoFromDB(req);
    return result
}

//// (1-3) Update Meeting (PUT) -> no support
//// (1-4) Delete Meeting (DELETE)
export const deleteMeeting = async (req: BackendDeleteMeetingRequest): Promise<BackendDeleteMeetingResponse> => {
    deleteMeetingFromDB(req)
    return {}
}