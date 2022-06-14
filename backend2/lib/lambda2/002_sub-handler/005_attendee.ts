import * as Chime from "@aws-sdk/client-chime"
import { BackendGetAttendeeInfoException, BackendGetAttendeeInfoRequest, BackendGetAttendeeInfoResponse } from "../backend_request";
import { getAttendeeInfoFromDB } from "../001_common/001_DynamoDB";

// @ts-ignore
const chime = new Chime.Chime({ region: process.env.AWS_REGION });


export const getAttendeeInfo = async (req: BackendGetAttendeeInfoRequest): Promise<BackendGetAttendeeInfoResponse | BackendGetAttendeeInfoException> => {
    //// (1) retrieve attendee info from DB. key is concatinate of meetingName(encoded) and attendeeId
    return await getAttendeeInfoFromDB(req.meetingName, req.attendeeId)
};
