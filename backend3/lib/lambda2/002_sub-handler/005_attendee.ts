import * as Chime from "@aws-sdk/client-chime"
import { BackendGetAttendeeInfoException, BackendGetAttendeeInfoExceptionType, BackendGetAttendeeInfoRequest, BackendGetAttendeeInfoResponse } from "../backend_request";
import { getAttendeeInfoFromDB, getUserInfoFromDB } from "../001_common/001_DynamoDB";

// @ts-ignore
const chime = new Chime.Chime({ region: process.env.AWS_REGION });


export const getAttendeeInfo = async (req: BackendGetAttendeeInfoRequest): Promise<BackendGetAttendeeInfoResponse | BackendGetAttendeeInfoException> => {
    const attendeeInfo = await getAttendeeInfoFromDB(req.exMeetingId, req.attendeeId)
    if (!attendeeInfo) {
        return {
            code: BackendGetAttendeeInfoExceptionType.NO_ATTENDEE_FOUND,
            exception: true,
        };
    }

    const userInfo = await getUserInfoFromDB(attendeeInfo.exUserId)
    if (!userInfo) {
        return {
            code: BackendGetAttendeeInfoExceptionType.NO_ATTENDEE_FOUND,
            exception: true,
        };
    }
    const res: BackendGetAttendeeInfoResponse = {
        exUserId: attendeeInfo.exUserId,
        username: userInfo.username
    }
    return res
};
