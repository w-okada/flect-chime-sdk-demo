import * as DynamoDB from "@aws-sdk/client-dynamodb"
import * as Chime from "@aws-sdk/client-chime"
import {
    BackendDeleteMeetingRequest,
    BackendGetMeetingInfoRequest,
    BackendGetMeetingInfoResponse,
    BackendListMeetingsRequest,
    BackendListMeetingsResponse,
    BackendGetAttendeeInfoException,
    BackendGetAttendeeInfoExceptionType,
    BackendGetAttendeeInfoRequest,
    BackendGetAttendeeInfoResponse,
} from "../backend_request";
import { MeetingListItem, Metadata } from "../http_request";
import { checkMeetingExistInChimeBackend, deleteMessageChannelFromChimeBackend } from "./002_Chime";
import { getExpireDate } from "../util";
// @ts-ignore
var meetingTableName = process.env.MEETING_TABLE_NAME!;
var attendeesTableName = process.env.ATTENDEE_TABLE_NAME!;

var ddb = new DynamoDB.DynamoDB({ region: process.env.AWS_REGION });

export type MetaddataDB = Metadata & {
    Code: string
}


// (1) 新規ミーティングの登録
export const registerMeetingIntoDB = async (meetingName: string, ownerEmail: string, region: string, secret: boolean, useCode: boolean, code: string, messageChannelArn: string, meeting: Chime.Meeting) => {
    const date = new Date();
    const now = date.getTime();
    const metadata: MetaddataDB = {
        OwnerId: ownerEmail,
        Region: region,
        Secret: secret,
        UseCode: useCode,
        Code: code,
        StartTime: now,
        MessageChannelArn: messageChannelArn
    };
    const item = {
        MeetingName: { S: meetingName },
        MeetingId: { S: meeting!.MeetingId! },
        Meeting: { S: JSON.stringify(meeting) },
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

}

// (2) ミーティングをDBから列挙。
// Chimeのバックエンドに存在確認も実施（変更検討が必要）。

export const listMeetingsFromDB = async (req: BackendListMeetingsRequest): Promise<BackendListMeetingsResponse> => {
    console.log("dynamo: list all meetings");
    const result = await ddb.scan({
        TableName: meetingTableName,
        Limit: 100,
    })
    console.log("dynamo: list all meetings result:", result);

    const meetingInfos = result.Items;
    const meetings: MeetingListItem[] = meetingInfos!.map(x => {
        const info = JSON.parse(x.Meeting.S!)
        const id = x.MeetingId.S!
        const name = x.MeetingName.S!
        const metadata = JSON.parse(x.Metadata.S!)

        delete metadata["Code"]
        return {
            meetingName: name,
            meetingId: id,
            meeting: info,
            metadata: metadata,
            isOwner: req.email === metadata.OwnerId,
            secret: metadata.Secret
        }
    })
    const meetingIds = meetings.map(x => {
        return x.meetingId
    })
    const aliveMeetingIds = await checkMeetingExistInChimeBackend(meetingIds)
    const retMeetings = meetings.filter(x => { return x.secret == false })
    const res = { meetings: retMeetings, aliveMeetingIds }
    return res
}


// (3) DBからミーティングの情報を取得する。
// DBに存在しない場合はnullを返す。
// Chimeのバックエンドに存在確認も実施（変更検討が必要）。
export const getMeetingInfoFromDB = async (req: BackendGetMeetingInfoRequest): Promise<BackendGetMeetingInfoResponse | null> => {
    //// (1) retrieve info
    const result = await ddb.getItem({ TableName: meetingTableName, Key: { MeetingName: { S: req.meetingName } } })

    //// (2) If no meeting in DB, return null
    if (!result.Item) {
        return null;
    }
    //// (3) If no meeting in Chime, delete meeting from DB and return null
    const meetingInfo = result.Item!;
    const meetingName = meetingInfo.MeetingName.S!
    const meetingId = meetingInfo.MeetingId.S!
    const meeting = JSON.parse(meetingInfo.Meeting.S!);
    const metadata = JSON.parse(meetingInfo.Metadata.S!)
    const hmmTaskArn = meetingInfo.HmmTaskArn ? meetingInfo.HmmTaskArn.S! : "-"
    const isOwner = req.email === JSON.parse(meetingInfo.Metadata.S!).OwnerId
    const code = metadata["Code"]

    // Check Exist?
    const aliveIds = await checkMeetingExistInChimeBackend([meetingId])
    let alive = aliveIds.includes(meeting.MeetingId)
    return {
        meetingName: meetingName,
        meetingId: meetingId,
        meeting: meeting,
        metadata: metadata,
        hmmTaskArn: hmmTaskArn,
        isOwner: isOwner,
        code: code,
        alive: alive
    };
};

// (4) DBからミーティングを削除する
export const deleteMeetingFromDB = async (req: BackendDeleteMeetingRequest) => {
    console.log(`Delete meeting from DB ${req.meetingName}`)
    deleteMessageChannelFromChimeBackend(req.messageChannelArn)

    await ddb
        .deleteItem({
            TableName: meetingTableName,
            Key: {
                MeetingName: { S: req.meetingName },
            },
        })
};


// (5) DBに会議参加者を登録
export const registerAttendeeIntoDB = async (meetingName: string, attendeeId: string, attendeeName: string) => {
    await ddb
        .putItem({
            TableName: attendeesTableName,
            Item: {
                AttendeeId: {
                    S: `${meetingName}/${attendeeId}`,
                },
                AttendeeName: { S: attendeeName },
                TTL: {
                    N: "" + getExpireDate(),
                },
            },
        })
}

// (6) DBから会議参加者の情報を取得
export const getAttendeeInfoFromDB = async (meetingName: string, attendeeId: string): Promise<BackendGetAttendeeInfoResponse | BackendGetAttendeeInfoException> => {
    const result = await ddb
        .getItem({
            TableName: attendeesTableName,
            Key: {
                AttendeeId: {
                    S: `${meetingName}/${attendeeId}`,
                },
            },
        })
    if (!result.Item) {
        return {
            code: BackendGetAttendeeInfoExceptionType.NO_ATTENDEE_FOUND,
            exception: true,
        };
    }
    return {
        attendeeId: result.Item.AttendeeId.S!,
        attendeeName: result.Item.AttendeeName.S!,
    };
}