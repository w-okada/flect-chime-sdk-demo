import * as DynamoDB from "@aws-sdk/client-dynamodb"
import * as Chime from "@aws-sdk/client-chime"
import {
    BackendDeleteMeetingRequest,
    BackendGetMeetingInfoRequest,
    BackendGetMeetingInfoResponse,
    BackendListMeetingsRequest,
    BackendListMeetingsResponse,
} from "./backend_request";
import { MeetingListItem, Metadata } from "./http_request";
// @ts-ignore
var meetingTableName = process.env.MEETING_TABLE_NAME!;
var ddb = new DynamoDB.DynamoDB({ region: process.env.AWS_REGION });
const chime = new Chime.Chime({ region: process.env.AWS_REGION });

export type MetaddataDB = Metadata & {
    Code: string
}

////////////////////////////////
// (A) Common Functions。index.tsから直接コールされない。
////////////////////////////////

// (A-1) ミーティングをDBから列挙。
// Chimeのバックエンドと同期して返す(syncMeetingWithChimeBackendをコール)。
// ※ codeはmetadataから削除する。とる場合はgetMeetingInfoFromDBを使用する。
export const listMeetingsFromDB = async (req: BackendListMeetingsRequest): Promise<BackendListMeetingsResponse> => {
    console.log("dynamo: list all meetings");
    const result = await ddb.scan({
        TableName: meetingTableName,
        Limit: 100,
    })
    console.log("dynamo: list all meetings result:", result);

    const meetingInfos = result.Items;
    const meetings: MeetingListItem[] = meetingInfos.map(x => {
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
    const aliveMeetingIds = await syncMeetingWithChimeBackend(meetings)
    const aliveMeetings = meetings.filter(x => {
        return aliveMeetingIds.includes(x.meetingId);
    }).filter(x => { return x.secret == false })
    const res = { meetings: aliveMeetings }
    return res
}

// (A-2) Chimeのバックエンドと同期。
// バックエンドに存在しないミーティングはDBから削除する。
// 存在していたミーティングのIDだけを返す。
const syncMeetingWithChimeBackend = async (meetings: MeetingListItem[]): Promise<string[]> => {
    const aliveMeetingId: string[] = []
    for (let meeting of meetings) {
        try {
            const mid = await chime.getMeeting({ MeetingId: meeting.meetingId })
            console.log("chime meeting info:", mid);
            aliveMeetingId.push(meeting.meetingId)
        } catch (err: any) {
            if (err.code == "NotFound") {
                console.log("chime meeting exception, but this maybe happen when the meeting doesn't exist.");
            } else {
                console.log("chime meeting exception:", err);
            }
            await deleteMeetingFromDB({ meetingName: meeting.meetingName });
        }
    }
    return aliveMeetingId;
}

// (A-3) DBからミーティングの情報を取得する。
// DBに存在しない場合はnullを返す。
// DBに存在して、Chimeのバックエンドに存在しない場合はDBから削除したうえで、nullを返す。
// 
export const getMeetingInfoFromDB = async (req: BackendGetMeetingInfoRequest): Promise<BackendGetMeetingInfoResponse | null> => {
    //// (1) retrieve info
    console.log("dynamo1", req.meetingName);
    const result = await ddb.getItem({ TableName: meetingTableName, Key: { MeetingName: { S: req.meetingName } } })
    console.log("dynamo2", result);

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

    try {
        // Check Exist?
        const mid = await chime.getMeeting({ MeetingId: meeting.MeetingId })
        console.log("chime meeting info:", mid);
    } catch (err: any) {
        if (err.code == "NotFound") {
            console.log("chime meeting exception, but this maybe happen when the meeting doesn't exist.");
        } else {
            console.log("chime meeting exception:", err);
        }
        await deleteMeetingFromDB({ meetingName: req.meetingName });
        return null;
    }

    //// (4) return meeting info


    return {
        meetingName: meetingName,
        meetingId: meetingId,
        meeting: meeting,
        metadata: metadata,
        hmmTaskArn: hmmTaskArn,
        isOwner: isOwner,
        code: code
    };
};

// (A-4) DBからミーティングを削除する
export const deleteMeetingFromDB = async (req: BackendDeleteMeetingRequest) => {
    console.log(`Delete meeting from DB ${req.meetingName}`)
    await ddb
        .deleteItem({
            TableName: meetingTableName,
            Key: {
                MeetingName: { S: req.meetingName },
            },
        })
};



