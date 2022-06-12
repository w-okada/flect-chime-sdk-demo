import * as DynamoDB from "@aws-sdk/client-dynamodb"
import * as Chime from "@aws-sdk/client-chime"
import { v4 } from "uuid";
import { getMeetingInfoFromDB } from "./001_meeting_common";
import {
    BackendJoinMeetingException,
    BackendJoinMeetingExceptionType,
    BackendJoinMeetingRequest,
    BackendJoinMeetingResponse,
} from "./backend_request";
import { getExpireDate } from "./util";
// @ts-ignore
var attendeesTableName = process.env.ATTENDEE_TABLE_NAME!;
var ddb = new DynamoDB.DynamoDB({ region: process.env.AWS_REGION });
const chime = new Chime.Chime({ region: process.env.AWS_REGION });

// (3) attendees
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
    console.info("Adding new attendee");
    const attendeeInfo = await chime
        .createAttendee({
            MeetingId: meetingInfo.meetingId,
            ExternalUserId: v4(),
        })

    //// (4) register attendee in DB
    await ddb
        .putItem({
            TableName: attendeesTableName,
            Item: {
                AttendeeId: {
                    S: `${req.meetingName}/${attendeeInfo.Attendee!.AttendeeId}`,
                },
                AttendeeName: { S: req.attendeeName },
                TTL: {
                    N: "" + getExpireDate(),
                },
            },
        })

    console.log("MEETING_INFO", meetingInfo);

    return {
        meetingName: meetingInfo.meetingName,
        meeting: meetingInfo.meeting,
        attendee: attendeeInfo.Attendee!,
    };
};

