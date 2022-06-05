import { DynamoDB, Chime, Endpoint } from "aws-sdk";
import { v4 } from "uuid";
import { getMeetingInfoFromDB, listMeetingsFromDB, MetaddataDB } from "./001_meeting_common";
import {
    BackendCreateMeetingRequest,
    BackendCreateMeetingResponse,
    BackendListMeetingsRequest,
    BackendListMeetingsResponse,
} from "./backend_request";
import { getExpireDate } from "./util";
// @ts-ignore
var meetingTableName = process.env.MEETING_TABLE_NAME!;
var ddb = new DynamoDB();
const chime = new Chime({ region: "us-east-1" });
chime.endpoint = new Endpoint("https://service.chime.aws.amazon.com/console");

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
    const request: Chime.CreateMeetingRequest = {
        ClientRequestToken: v4(),
        MediaRegion: req.region,
    };
    const newMeetingInfo = await chime.createMeeting(request).promise();

    //// (3) register meeting info in DB
    const date = new Date();
    const now = date.getTime();
    const metadata: MetaddataDB = {
        OwnerId: req.email,
        Region: req.region,
        Secret: req.secret,
        UseCode: req.useCode,
        Code: req.code,
        StartTime: now,
    };
    const item = {
        MeetingName: { S: req.meetingName },
        MeetingId: { S: newMeetingInfo.Meeting!.MeetingId },
        Meeting: { S: JSON.stringify(newMeetingInfo.Meeting) },
        Metadata: { S: JSON.stringify(metadata) },
        TTL: {
            N: "" + getExpireDate(),
        },
    };
    await ddb
        .putItem({
            TableName: meetingTableName,
            Item: item,
        })
        .promise();

    return {
        created: true,
        meetingId: newMeetingInfo.Meeting!.MeetingId!,
        meetingName: req.meetingName,
        ownerId: req.email,
    };
};


// (1-2) List Meetings (GET)
export const listMeetings = async (req: BackendListMeetingsRequest): Promise<BackendListMeetingsResponse> => {
    return listMeetingsFromDB(req)
}
//// (1-3) Update Meetings (PUT) -> no support
//// (1-4) Delete Meetings (DELETE) -> no support