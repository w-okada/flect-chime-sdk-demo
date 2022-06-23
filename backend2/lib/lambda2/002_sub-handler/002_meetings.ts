import {
    BackendCreateMeetingRequest,
    BackendCreateMeetingResponse,
    BackendListMeetingsRequest,
    BackendListMeetingsResponse,
} from "../backend_request";
import { createMeetingInChimeBackend, createMessageChannelInChimeBackend, notifyMeetingDeletedFromChimeBackend } from "../001_common/002_Chime";
import { deleteMeetingFromDB, getMeetingInfoFromDB, listMeetingsFromDB, registerMeetingIntoDB } from "../001_common/001_DynamoDB";

// (1) Meetings
// (1-1) Create Meeting (POST)
export const createMeeting = async (req: BackendCreateMeetingRequest): Promise<BackendCreateMeetingResponse> => {
    //// (1) check meeting name exist
    const meetingInfo = await getMeetingInfoFromDB({ meetingName: req.meetingName, deleteCode: true });
    if (meetingInfo !== null) {
        return {
            created: false,
            meetingId: meetingInfo.meetingId,
            meetingName: meetingInfo.meetingName,
            ownerId: meetingInfo.metadata.OwnerId,
        };
    }

    //// (2) create meeting in Amazon Chime
    const newMeetingInfo = await createMeetingInChimeBackend(req.region);

    //// (3) create App Message Channel
    const response = await createMessageChannelInChimeBackend(req.meetingName)

    //// (4) register meeting info in DB
    await registerMeetingIntoDB(req.meetingName, req.sub, req.region, req.secret, req.useCode, req.code, response.ChannelArn!, newMeetingInfo.Meeting!)

    return {
        created: true,
        meetingId: newMeetingInfo.Meeting!.MeetingId!,
        meetingName: req.meetingName,
        ownerId: req.sub,
    };
};


// (1-2) List Meetings (GET)
export const listMeetings = async (req: BackendListMeetingsRequest): Promise<BackendListMeetingsResponse> => {
    // Meetingのリストを取得(生死問わず)
    const res = await listMeetingsFromDB(req)
    console.log("listMeetingsFromDB Result:", JSON.stringify(res))
    // 死んでいるミーティングのMessaging Channelを削除
    const deadMeetings = res.meetings.filter(x => {
        return !res.aliveMeetingIds.includes(x.meetingId)
    })
    deadMeetings.forEach(x => {
        console.log("delete meeting chat channel", x.meetingName)
        deleteMeetingFromDB({
            meetingName: x.meetingName,
            messageChannelArn: x.metadata.MessageChannelArn
        })
    })
    if (deadMeetings.length > 0) {
        notifyMeetingDeletedFromChimeBackend()
    }

    // 生きているミーティングかつ、secretではないmeetingのみ抽出して返す
    const aliveMeetings = res.meetings.filter(x => {
        return res.aliveMeetingIds.includes(x.meetingId)
    }).filter(x => { return x.secret != true })

    return {
        meetings: aliveMeetings,
        aliveMeetingIds: res.aliveMeetingIds
    }
}
//// (1-3) Update Meetings (PUT) -> no support
//// (1-4) Delete Meetings (DELETE) -> no support