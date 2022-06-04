import { DynamoDB, Chime, Endpoint } from "aws-sdk";
import { v4 } from "uuid";
import {
    BackendCreateMeetingRequest,
    BackendCreateMeetingResponse,
    BackendDeleteMeetingRequest,
    BackendGetAttendeeInfoException,
    BackendGetAttendeeInfoExceptionType,
    BackendGetAttendeeInfoRequest,
    BackendGetAttendeeInfoResponse,
    BackendGetMeetingInfoRequest,
    BackendGetMeetingInfoResponse,
    BackendJoinMeetingException,
    BackendJoinMeetingExceptionType,
    BackendJoinMeetingRequest,
    BackendJoinMeetingResponse,
    BackendListMeetingsRequest,
    BackendListMeetingsResponse,
    BackendStartTranscribeException,
    BackendStartTranscribeExceptionType,
    BackendStartTranscribeRequest,
    BackendStartTranscribeResponse,
    BackendStopTranscribeExceptionType,
    BackendStopTranscribeRequest,
} from "./backend_request";
import { MeetingListItem, Metadata } from "./http_request";
import { getExpireDate } from "./util";
var meetingTableName = process.env.MEETING_TABLE_NAME!;
var attendeesTableName = process.env.ATTENDEE_TABLE_NAME!;
var ddb = new DynamoDB();
const chime = new Chime({ region: "us-east-1" });
chime.endpoint = new Endpoint("https://service.chime.aws.amazon.com/console");


type MetaddataDB = Metadata & {
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
    }).promise();
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
    })
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
            const mid = await chime.getMeeting({ MeetingId: meeting.meetingId }).promise();
            console.log("chime meeting info:", mid);
            aliveMeetingId.push(meeting.meetingId)
        } catch (err: any) {
            if (err.code == "NotFound") {
                console.log("chime meeting exception, but this maybe happen when the meeting doesn't exist.");
            } else {
                console.log("chime meeting exception:", err);
            }
            await deleteMeeting({ meetingName: meeting.meetingName });
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
    const result = await ddb.getItem({ TableName: meetingTableName, Key: { MeetingName: { S: req.meetingName } } }).promise();
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
        const mid = await chime.getMeeting({ MeetingId: meeting.MeetingId }).promise();
        console.log("chime meeting info:", mid);
    } catch (err: any) {
        if (err.code == "NotFound") {
            console.log("chime meeting exception, but this maybe happen when the meeting doesn't exist.");
        } else {
            console.log("chime meeting exception:", err);
        }
        await deleteMeeting({ meetingName: req.meetingName });
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
export const deleteMeeting = async (req: BackendDeleteMeetingRequest) => {
    console.log(`Delete meeting from DB ${req.meetingName}`)
    await ddb
        .deleteItem({
            TableName: meetingTableName,
            Key: {
                MeetingName: { S: req.meetingName },
            },
        })
        .promise();
};




////////////////////////////////
// (B) 具体的な機能。index.tsから直接コールされる。
////////////////////////////////
// (1) Meetings
// (1-1) List Meetings 
export const listMeetings = async (req: BackendListMeetingsRequest): Promise<BackendListMeetingsResponse> => {
    return listMeetingsFromDB(req)
}

// (1-2) Create Meeting
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

// (2) Meeting

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
        .promise();

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
        .promise();

    console.log("MEETING_INFO", meetingInfo);

    return {
        meetingName: meetingInfo.meetingName,
        meeting: meetingInfo.meeting,
        attendee: attendeeInfo.Attendee!,
    };
};

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

export const startTranscribe = async (req: BackendStartTranscribeRequest): Promise<BackendStartTranscribeResponse | BackendStartTranscribeException> => {
    //// (1) check meeting exists
    let meetingInfo = await getMeetingInfoFromDB({ meetingName: req.meetingName, deleteCode: true });
    if (meetingInfo === null) {
        return {
            code: BackendStartTranscribeExceptionType.NO_MEETING_FOUND,
            exception: true,
        };
    }
    //// (2) check if owner calls or not.
    var meetingMetadata = meetingInfo.metadata;
    var ownerId = meetingMetadata["OwnerId"];
    console.log("OWNERID", ownerId, "email", req.email);
    if (ownerId != req.email) {
        return {
            code: BackendStartTranscribeExceptionType.NOT_OWNER,
            exception: true,
        };
    }

    //// (3) start transcribe
    console.log(`Langage code :${req.lang}`);
    const res = await chime
        .startMeetingTranscription({
            MeetingId: meetingInfo.meetingId,
            TranscriptionConfiguration: {
                EngineTranscribeSettings: {
                    LanguageCode: req.lang,
                    //VocabularyFilterMethod?: TranscribeVocabularyFilterMethod;
                    //VocabularyFilterName?: String;
                    //VocabularyName?: String;
                    //Region?: TranscribeRegion;
                },
            },
        })
        .promise();

    return {};
};

/***
 * stop Transcribe.
 *
 */
export const stopTranscribe = async (req: BackendStopTranscribeRequest) => {
    console.log("stopTranscribe");
    //// (1) If there is no meeting, return fail
    let meetingInfo = await getMeetingInfoFromDB({ meetingName: req.meetingName, deleteCode: true });
    if (meetingInfo === null) {
        return {
            code: BackendStopTranscribeExceptionType.NO_MEETING_FOUND,
            exception: true,
        };
    }

    //// (2) check if owner calls or not.
    var meetingMetadata = meetingInfo.metadata;
    var ownerId = meetingMetadata["OwnerId"];
    console.log("OWNERID", ownerId, "email", req.email);
    if (ownerId != req.email) {
        return {
            code: BackendStopTranscribeExceptionType.NOT_OWNER,
            exception: true,
        };
    }

    //// (3) stop transcribe
    const res = await chime
        .stopMeetingTranscription({
            MeetingId: meetingInfo.meetingId,
        })
        .promise();
    console.log("stop transcribe result", res);
    return {};
};
