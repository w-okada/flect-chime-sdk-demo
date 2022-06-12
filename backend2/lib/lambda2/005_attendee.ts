import * as DynamoDB from "@aws-sdk/client-dynamodb"
import * as Chime from "@aws-sdk/client-chime"
import {
    BackendGetAttendeeInfoException,
    BackendGetAttendeeInfoExceptionType,
    BackendGetAttendeeInfoRequest,
    BackendGetAttendeeInfoResponse,
} from "./backend_request";
// @ts-ignore
var attendeesTableName = process.env.ATTENDEE_TABLE_NAME!;
var ddb = new DynamoDB.DynamoDB({ region: process.env.AWS_REGION });
const chime = new Chime.Chime({ region: process.env.AWS_REGION });


export const getAttendeeInfo = async (req: BackendGetAttendeeInfoRequest): Promise<BackendGetAttendeeInfoResponse | BackendGetAttendeeInfoException> => {
    //// (1) retrieve attendee info from DB. key is concatinate of meetingName(encoded) and attendeeId
    const result = await ddb
        .getItem({
            TableName: attendeesTableName,
            Key: {
                AttendeeId: {
                    S: `${req.meetingName}/${req.attendeeId}`,
                },
            },
        })

    //// (2) If there is no attendee in the meeting, return fail
    if (!result.Item) {
        return {
            code: BackendGetAttendeeInfoExceptionType.NO_ATTENDEE_FOUND,
            exception: true,
        };
    }
    console.log(result);

    //// (3) return attendee info.
    return {
        attendeeId: result.Item.AttendeeId.S!,
        attendeeName: result.Item.AttendeeName.S!,
    };
};
