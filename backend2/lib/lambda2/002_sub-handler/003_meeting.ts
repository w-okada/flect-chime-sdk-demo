
// (2) Meeting
//// (1-1) (POST) -> no support

import { deleteMeetingFromDB, getMeetingInfoFromDB } from "../001_common/001_DynamoDB";
import { notifyMeetingDeletedFromChimeBackend } from "../001_common/002_Chime";
import { BackendDeleteMeetingRequest, BackendDeleteMeetingResponse, BackendGetMeetingInfoRequest, BackendGetMeetingInfoResponse } from "../backend_request";

//// (1-2) Get Meeting Info (Get)
export const getMeetingInfo = async (req: BackendGetMeetingInfoRequest): Promise<BackendGetMeetingInfoResponse | null> => {
    const result = await getMeetingInfoFromDB(req);
    if (result && result.alive === false) {
        deleteMeetingFromDB({
            meetingName: result.meetingName,
            messageChannelArn: result.metadata.MessageChannelArn
        })
    }
    return result
}

//// (1-3) Update Meeting (PUT) -> no support
//// (1-4) Delete Meeting (DELETE)
export const deleteMeeting = async (req: BackendDeleteMeetingRequest): Promise<BackendDeleteMeetingResponse> => {
    deleteMeetingFromDB(req)
    notifyMeetingDeletedFromChimeBackend()
    return {}
}