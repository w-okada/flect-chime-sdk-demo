import * as DynamoDB from "@aws-sdk/client-dynamodb"
import * as Chime from "@aws-sdk/client-chime"

import { v4 } from "uuid";
import { deleteMeetingFromDB, getMeetingInfoFromDB, listMeetingsFromDB, MetaddataDB } from "./001_meeting_common";
import {
    BackendCreateMeetingRequest,
    BackendCreateMeetingResponse,
    BackendListMeetingsRequest,
    BackendListMeetingsResponse,
} from "./backend_request";
import { getExpireDate } from "./util";
// @ts-ignore
var meetingTableName = process.env.MEETING_TABLE_NAME!;
// @ts-ignore
var messagingAppInstanceArn = process.env.MESSAGING_APP_INSTANCE_ARN!;
// @ts-ignore
var messagingAppInstanceAdminArn = process.env.MESSAGING_APP_INSTANCE_ADMIN_ARN!;

var ddb = new DynamoDB.DynamoDB({ region: process.env.AWS_REGION });

// const chime = new Chime({ region: "us-east-1" });
const chime = new Chime.Chime({ region: process.env.AWS_REGION });

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
    const newMeetingInfo = await chime.createMeeting(request);

    //// (3) create App Message Channel
    const dateNow = new Date();
    const params = {
        Name: `Ch.${req.meetingName}`,
        AppInstanceArn: messagingAppInstanceArn,
        ClientRequestToken: `${dateNow.getHours().toString()}_${dateNow.getMinutes().toString()}`,
        ChimeBearer: messagingAppInstanceAdminArn,
        Mode: 'RESTRICTED',
        Privacy: 'PRIVATE'
    };

    const response = await chime.createChannel(params);
    console.log("Message Channel Created:", response.ChannelArn)


    //// (4) register meeting info in DB
    const date = new Date();
    const now = date.getTime();
    const metadata: MetaddataDB = {
        OwnerId: req.email,
        Region: req.region,
        Secret: req.secret,
        UseCode: req.useCode,
        Code: req.code,
        StartTime: now,
        MessageChannelArn: response.ChannelArn
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

    return {
        created: true,
        meetingId: newMeetingInfo.Meeting!.MeetingId!,
        meetingName: req.meetingName,
        ownerId: req.email,
    };
};


// (1-2) List Meetings (GET)
export const listMeetings = async (req: BackendListMeetingsRequest): Promise<BackendListMeetingsResponse> => {
    // Meetingのリストを取得(生死問わず)
    const res = await listMeetingsFromDB(req)
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

    // 生きているミーティングのみ抽出して返す
    const aliveMeetings = res.meetings.filter(x => {
        return res.aliveMeetingIds.includes(x.meetingId)
    })
    return {
        meetings: aliveMeetings,
        aliveMeetingIds: res.aliveMeetingIds
    }
}
//// (1-3) Update Meetings (PUT) -> no support
//// (1-4) Delete Meetings (DELETE) -> no support