import { DynamoDB, Chime, Endpoint } from "aws-sdk";
import {
    BackendGetAttendeeInfoException,
    BackendGetAttendeeInfoExceptionType,
    BackendGetAttendeeInfoRequest,
    BackendGetAttendeeInfoResponse,
} from "./backend_request";
// @ts-ignore
var attendeesTableName = process.env.ATTENDEE_TABLE_NAME!;
var ddb = new DynamoDB();
const chime = new Chime({ region: "us-east-1" });
chime.endpoint = new Endpoint("https://service.chime.aws.amazon.com/console");


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
        .promise();

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
