

// (3) attendees

import { getMeetingInfoFromDB, registerAttendeeIntoDB } from "../001_common/001_DynamoDB";
import { addUserToGlobalChannel, addUserToRoomChannel, joinMeetingInChimeBackend } from "../001_common/002_Chime";
import { BackendJoinMeetingException, BackendJoinMeetingExceptionType, BackendJoinMeetingRequest, BackendJoinMeetingResponse } from "../backend_request";

//// Join
export const joinMeeting = async (req: BackendJoinMeetingRequest): Promise<BackendJoinMeetingResponse | BackendJoinMeetingException> => {
    //// (1) check meeting exists
    let meetingInfo = await getMeetingInfoFromDB({ meetingName: req.meetingName, deleteCode: false });
    if (meetingInfo === null) {
        return {
            code: BackendJoinMeetingExceptionType.NO_MEETING_FOUND,
            exception: true,
        };
    }

    //// (2) check attendeeName
    if (req.attendeeName === "") {
        return {
            code: BackendJoinMeetingExceptionType.PARAMETER_ERROR,
            exception: true,
        };
    }

    if (meetingInfo.metadata["UseCode"]) {
        return {
            code: BackendJoinMeetingExceptionType.INVALID_CODE,
            exception: true,
        };
    }

    //// (3) create attendee in Amazon Chime
    const attendeeInfo = await joinMeetingInChimeBackend(meetingInfo.meetingId)

    //// (4) register attendee in DB
    await registerAttendeeIntoDB(req.meetingName, attendeeInfo.Attendee!.AttendeeId!, req.attendeeName)

    //// (5) Roomのチャンネルにユーザを追加
    console.log("USER REQ", JSON.stringify(req))
    console.log("USER ARN", req.messagingUserArn)
    const membershipResponse = await addUserToRoomChannel(meetingInfo.metadata.MessageChannelArn, req.messagingUserArn)
    console.log("Generate Messaging Environment: addToGlobal", JSON.stringify(membershipResponse.Member))

    console.log("MEETING_INFO", meetingInfo);

    return {
        meetingName: meetingInfo.meetingName,
        meeting: meetingInfo.meeting,
        attendee: attendeeInfo.Attendee!,
    };
};

