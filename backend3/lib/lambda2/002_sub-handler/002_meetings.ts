import {
    BackendCreateMeetingRequest,
    BackendCreateMeetingResponse,
    BackendListMeetingsRequest,
    BackendListMeetingsResponse,
} from "../backend_request";
import { checkMeetingExistInChimeBackend } from "../001_common/002_Chime";
import { listMeetingsFromDB, MeetingInfoDB, registerMeetingIntoDB } from "../001_common/001_DynamoDB";
import { log } from "../util";
import { v4 } from "uuid";
import { notifyRoomRegistered } from "../001_common/100_ChimeMessaging";
import { MeetingListItem } from "../http_request";
// (1) Meetings
// (1-1) Create Meeting (POST)
export const createMeeting = async (req: BackendCreateMeetingRequest): Promise<BackendCreateMeetingResponse> => {
    log("createMeeting", JSON.stringify(req))

    // (1) generate exMeetingId
    const exMeetingId = v4()
    // (2) register meeting info in DB
    const params: MeetingInfoDB = {
        ...req,
        exMeetingId: exMeetingId,
        ended: false,
        deleted: false,
    }
    await registerMeetingIntoDB(params)
    // (3) notify
    await notifyRoomRegistered()

    return {
        created: true,
        exMeetingId: exMeetingId,
    };
};


// (1-2) List Meetings (GET)
export const listMeetings = async (req: BackendListMeetingsRequest): Promise<BackendListMeetingsResponse> => {
    const meetingsFromDB = await listMeetingsFromDB(req)
    const meetingItems: MeetingListItem[] = []
    for (let x of meetingsFromDB) {
        const meetingItem: MeetingListItem = {
            ...x,
            isOwner: x.ownerId === req.exUserId,
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

        meetingItems.push(meetingItem)
    }
    log("listMeetings", "listMeetingsFromDB Result:", JSON.stringify(meetingItems))

    const filterdMeeting = meetingItems.filter(x => {
        return x.secret === false
    })
    return {
        meetings: filterdMeeting,
    }
}
//// (1-3) Update Meetings (PUT) -> no support
//// (1-4) Delete Meetings (DELETE) -> no support