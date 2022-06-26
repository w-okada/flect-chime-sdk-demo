

// (3) attendees

import { getMeetingInfoFromDB, getUserInfoFromDB, registerAttendeeIntoDB, updateMeetingInDB } from "../001_common/001_DynamoDB";
import { addUserToGlobalChannel, addUserToRoomChannel, checkMeetingExistInChimeBackend, createMeetingInChimeBackend, createMessageChannelInChimeBackend, joinMeetingInChimeBackend } from "../001_common/002_Chime";
import { BackendJoinMeetingException, BackendJoinMeetingExceptionType, BackendJoinMeetingRequest, BackendJoinMeetingResponse } from "../backend_request";
import { log } from "../util";

//// Join
export const joinMeeting = async (req: BackendJoinMeetingRequest): Promise<BackendJoinMeetingResponse | BackendJoinMeetingException> => {
    log("joinMeeting", JSON.stringify(req))
    //// (1) check meeting exists
    let meetingInfo = await getMeetingInfoFromDB({
        exMeetingId: req.exMeetingId,
        exUserId: req.exUserId
    });
    if (meetingInfo === null) {
        return {
            code: BackendJoinMeetingExceptionType.NO_MEETING_FOUND,
            exception: true,
        };
    }

    //// (2) check attendeeName
    if (req.exUserId === "") {
        return {
            code: BackendJoinMeetingExceptionType.PARAMETER_ERROR,
            exception: true,
        };
    }

    if (meetingInfo.useCode && meetingInfo.code != req.code) {
        return {
            code: BackendJoinMeetingExceptionType.INVALID_CODE,
            exception: true,
        };
    }

    //// (3) create meeting roome
    ///// (3-1) check meetingId
    let needCreateMeetingRoom = true
    ///// meetingIdが存在して、chime backendにも存在する場合はroomを作成しない。
    if (meetingInfo.meetingId) {
        const exist = await checkMeetingExistInChimeBackend(meetingInfo.meetingId)
        needCreateMeetingRoom = exist ? false : true
    }
    log("joinMeeting", `create new room ${needCreateMeetingRoom}`)
    ///// (3-2) 必要に応じてroom作成
    if (needCreateMeetingRoom) {
        const newMeetingInfo = await createMeetingInChimeBackend(meetingInfo.region);
        const newChannelInfo = await createMessageChannelInChimeBackend(req.exMeetingId)
        newMeetingInfo.Meeting
        updateMeetingInDB({
            ...meetingInfo,
            meetingId: newMeetingInfo.Meeting?.MeetingId,
            meeting: newMeetingInfo.Meeting,
            messageChannelArn: newChannelInfo.ChannelArn,
        })
        meetingInfo.meetingId = newMeetingInfo.Meeting?.MeetingId || ""
        meetingInfo.meeting = newMeetingInfo.Meeting
        meetingInfo.messageChannelArn = newChannelInfo.ChannelArn
        // await notifyRoomStarted()
        log("joinMeeting", `create new room and registerd infos to db`)
    }

    //// (4) join attendee in Amazon Chime
    const attendeeInfo = await joinMeetingInChimeBackend(meetingInfo.meetingId!)

    //// (5) register attendee in DB
    await registerAttendeeIntoDB({
        exMeetingId: req.exMeetingId,
        exUserId: req.exUserId,
        attendeeId: attendeeInfo.Attendee!.AttendeeId!
    })
    log("joinMeeting", "join to room and register to db")

    //// (6) Roomのチャンネルにユーザを追加
    ///// (6-1) ユーザのAppinstance ARNを取得
    const userInfo = await getUserInfoFromDB(req.exUserId)

    log("joinMeeting", "User ID", req.exUserId)
    log("joinMeeting", "User Info", JSON.stringify(userInfo))

    const membershipResponse = await addUserToRoomChannel(meetingInfo.messageChannelArn || "", userInfo!.appInstanceUserArn)
    log("joinMeeting", "add user to room channel", JSON.stringify(membershipResponse.Member))

    const res: BackendJoinMeetingResponse = {
        meetingName: meetingInfo.meetingName,
        meeting: meetingInfo.meeting!,
        attendee: attendeeInfo.Attendee!,
    }
    return res;
};

