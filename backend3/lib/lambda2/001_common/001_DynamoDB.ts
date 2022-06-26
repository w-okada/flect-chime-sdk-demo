import * as DynamoDB from "@aws-sdk/client-dynamodb"
import * as Chime from "@aws-sdk/client-chime"
import {
    BackendDeleteMeetingRequest,
    BackendGetMeetingInfoRequest,
    BackendListMeetingsRequest,
    BackendGetAttendeeInfoException,
    BackendGetAttendeeInfoExceptionType,
    BackendCreateMeetingRequest,
} from "../backend_request";
import { UserInfoInServer } from "../http_request";
import { getExpireDate, log } from "../util";

// @ts-ignore
var meetingTableName = process.env.MEETING_TABLE_NAME!;
var attendeesTableName = process.env.ATTENDEE_TABLE_NAME!;
var userEnvrionmentTableName = process.env.USER_ENVIRONMENT_TABLE!

var ddb = new DynamoDB.DynamoDB({ region: process.env.AWS_REGION });


// (1) ミーティングテーブル
//// (1-1) 新規ミーティングの登録
export type MeetingInfoDB = BackendCreateMeetingRequest & {
    // ミーティング登録時に内部生成される情報(DBに格納)
    exMeetingId: string,
    ended: boolean,
    deleted: boolean,
    // ミーティング開始時に内部生成追加される情報(DBに格納)
    meetingId?: string,
    meeting?: Chime.Meeting,
    messageChannelArn?: string,

}
export const registerMeetingIntoDB = async (meetingInfoDB: MeetingInfoDB) => {
    const meetingInfoDBString = JSON.stringify(meetingInfoDB)
    log("registerMeetingIntoDB", "meetingInfo1:", meetingInfoDBString)

    const item = {
        Meeting: { S: "Meeting" },
        ExMeetingId: { S: meetingInfoDB.exMeetingId },
        EndTime: { N: "" + meetingInfoDB.endTime },
        MeetingInfoDB: { S: meetingInfoDBString },
        TTL: {
            N: "" + getExpireDate(24 * 14), // 2weeks
        },
    };
    await ddb
        .putItem({
            TableName: meetingTableName,
            Item: item,
        })
}

//// (1-2) ミーティングをDBから列挙。
export const listMeetingsFromDB = async (req: BackendListMeetingsRequest): Promise<MeetingInfoDB[]> => {
    log("listMeetingsFromDB", "dynamo: list meetings")
    const now = new Date().getTime()
    const trimTime = 1000 * 60 * 60 * 7 // 1 weeks前の会議までリストで返す
    const filterTime = now - trimTime // (EndTime + trimTime > currentTime) => (EndTime > currentTime - trimTime)で式変形)
    log("listMeetingsFromDB", now.toString())
    const result = await ddb.query({
        ExpressionAttributeValues: {
            ':p': { S: "Meeting" },
            ':filterTime': { N: "" + filterTime }
        },
        KeyConditionExpression: 'Meeting = :p and EndTime > :filterTime',
        ProjectionExpression: 'MeetingInfoDB',
        TableName: meetingTableName,
        IndexName: "EndTime",
        Limit: 100,
    })
    // log("listMeetingsFromDB", "dynamo: list all meetings result:", JSON.stringify(result));

    const meetingInfos = result.Items;
    const meetings: MeetingInfoDB[] = meetingInfos!.map(x => {
        const info = JSON.parse(x.MeetingInfoDB.S!) as MeetingInfoDB
        return info
    })
    return meetings
}

//// (1-3) 単一ミーティングをDBから取得。
export const getMeetingInfoFromDB = async (req: BackendGetMeetingInfoRequest): Promise<MeetingInfoDB | null> => {
    log("getMeetingInfoFromDB", "get meeting info from db", req.exMeetingId)
    //// (1) retrieve info
    const result = await ddb.getItem({
        TableName: meetingTableName,
        Key: {
            Meeting: { S: "Meeting" },
            ExMeetingId: { S: req.exMeetingId }
        }
    })
    //// (2) If no meeting in DB, return null
    if (!result.Item) {
        return null;
    }
    const info = JSON.parse(result.Item.MeetingInfoDB.S!) as MeetingInfoDB
    return info

};

//// (1-4) 単一ミーティングを更新
///// 処理簡単化の為項目全体を上書きする(registerMeetingIntoDBと同じ挙動)
export const updateMeetingInDB = async (meetingInfoDB: MeetingInfoDB) => {
    const meetingInfoDBString = JSON.stringify(meetingInfoDB)
    log("updateMeetingInDB", "meetingInfo:", meetingInfoDBString)
    const item = {
        Meeting: { S: "Meeting" },
        ExMeetingId: { S: meetingInfoDB.exMeetingId },
        EndTime: { N: "" + meetingInfoDB.endTime },
        MeetingInfoDB: { S: meetingInfoDBString },
        TTL: {
            N: "" + getExpireDate(24 * 14), // 2weeks
        },
    };
    await ddb
        .putItem({
            TableName: meetingTableName,
            Item: item,
        })

}
//// (1-5) 単一ミーティングをDBから削除。
///// 処理簡単化の為項目全体を上書きする(registerMeetingIntoDBと同じ挙動)
export const deleteMeetingFromDB = async (req: BackendDeleteMeetingRequest) => {
    log("deleteMeetingFromDB", `Delete meeting from DB ${req.exMeetingId}`)
    const info = await getMeetingInfoFromDB({
        exMeetingId: req.exMeetingId,
        exUserId: req.exUserId
    })
    if (!info) {
        log("deleteMeetingFromDB", "db is not found")
        return
    }
    if (info.ownerId != req.exUserId || req.exUserId != "") {
        log("deleteMeetingFromDB", "no-owner can not delete.")
        return
    }

    info.deleted = true
    const meetingInfoDBString = JSON.stringify(info)
    const item = {
        Meeting: { S: "Meeting" },
        ExMeetingId: { S: info.exMeetingId },
        EndTime: { N: "" + info.endTime },
        MeetingInfoDB: { S: meetingInfoDBString },
        TTL: {
            N: "" + getExpireDate(24 * 14), // 2weeks
        },
    };
    await ddb
        .putItem({
            TableName: meetingTableName,
            Item: item,
        })
};


// (2) 参加者テーブル
export type AttendeeInfoDB = {
    exMeetingId: string,
    attendeeId: string,
    exUserId: string
}
//// (2-1) 会議参加者を登録
export const registerAttendeeIntoDB = async (req: AttendeeInfoDB) => {
    const attendeeInfoString = JSON.stringify(req)
    await ddb
        .putItem({
            TableName: attendeesTableName,
            Item: {
                AttendeeId: {
                    S: `${req.exMeetingId}/${req.attendeeId}`,
                },
                AttendeeInfoDB: { S: attendeeInfoString },
                TTL: {
                    N: "" + getExpireDate(24 * 3), // 3days
                },
            },
        })
}

//// (2-2) 会議参加者の情報を取得
export const getAttendeeInfoFromDB = async (exMeetingId: string, attendeeId: string): Promise<AttendeeInfoDB | null> => {
    const result = await ddb
        .getItem({
            TableName: attendeesTableName,
            Key: {
                AttendeeId: {
                    S: `${exMeetingId}/${attendeeId}`,
                },
            },
        })
    if (!result.Item) {
        return null
    }
    const res = JSON.parse(result.Item.AttendeeInfoDB.S!) as AttendeeInfoDB
    return res;
}


// (3) ユーザ情報
// (3-1) ユーザ情報をDBに登録
export const registerUserInfoIntoDB = async (userInfo: UserInfoInServer) => {
    await ddb
        .putItem({
            TableName: userEnvrionmentTableName,
            Item: {
                ExUserId: {
                    S: userInfo.exUserId,
                },
                UserInfoInServer: { S: JSON.stringify(userInfo) },
                TTL: {
                    N: "" + getExpireDate(24 * 3), // 3days
                },
            },
        })
}



// (3-2) DBから会議参加者の情報を取得
export const getUserInfoFromDB = async (exUserId: string): Promise<UserInfoInServer | null> => {
    log("getUserInfoFromDB", exUserId)
    const result = await ddb
        .getItem({
            TableName: userEnvrionmentTableName,
            Key: {
                ExUserId: {
                    S: exUserId,
                },
            },
        })
    if (!result.Item) {
        return null;
    }

    log("getUserInfoFromDB res:", JSON.stringify(result))

    const userInfoJson = result.Item.UserInfoInServer.S!
    const userInfo = JSON.parse(userInfoJson) as UserInfoInServer
    return userInfo;
}
