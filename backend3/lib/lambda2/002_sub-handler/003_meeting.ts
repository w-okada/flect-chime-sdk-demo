
// (2) Meeting
//// (1-1) (POST) -> no support

import { deleteMeetingFromDB, getMeetingInfoFromDB } from "../001_common/001_DynamoDB";
import { checkMeetingExistInChimeBackend, notifyMeetingDeletedFromChimeBackend } from "../001_common/002_Chime";
import { BackendDeleteMeetingRequest, BackendDeleteMeetingResponse, BackendGetMeetingInfoRequest, BackendGetMeetingInfoResponse } from "../backend_request";
import { MeetingListItem } from "../http_request";
import { log } from "../util";

//// (1-2) Get Meeting Info (Get)
export const getMeetingInfo = async (req: BackendGetMeetingInfoRequest): Promise<BackendGetMeetingInfoResponse | null> => {
    const meetingFromDB = await getMeetingInfoFromDB(req);
    if (!meetingFromDB) {
        log("getMeetingInfo", "getMeetingInfoFromDB returned null")
        return null
    }
    const meetingItem: MeetingListItem = {
        ...meetingFromDB,
        isOwner: meetingFromDB.ownerId === req.exUserId,
        active: false, // temporary
    }
    // activeの算出
    if (meetingItem.meetingId) {
        const exist = await checkMeetingExistInChimeBackend(meetingItem.meetingId)
        meetingItem.active = exist ? true : false
    } else {
        meetingItem.active = false
    }
    // codeのomit
    delete meetingItem["code"]
    return {
        meeting: meetingItem,
    }
}

//// (1-3) Update Meeting (PUT) -> no support
//// (1-4) Delete Meeting (DELETE)
export const deleteMeeting = async (req: BackendDeleteMeetingRequest): Promise<BackendDeleteMeetingResponse> => {
    deleteMeetingFromDB(req)
    notifyMeetingDeletedFromChimeBackend()
    return {}
}