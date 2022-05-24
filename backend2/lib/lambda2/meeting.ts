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
    BackendStartTranscribeException,
    BackendStartTranscribeExceptionType,
    BackendStartTranscribeRequest,
    BackendStartTranscribeResponse,
    BackendStopTranscribeExceptionType,
    BackendStopTranscribeRequest,
} from "./backend_request";
import { Metadata } from "./http_request";
import { getExpireDate } from "./util";
var meetingTableName = process.env.MEETING_TABLE_NAME!;
var attendeesTableName = process.env.ATTENDEE_TABLE_NAME!;
var ddb = new DynamoDB();
const chime = new Chime({ region: "us-east-1" });
chime.endpoint = new Endpoint("https://service.chime.aws.amazon.com/console");
/**
 * get meeting info
 * (1) retrieve meeting info from DB
 * (2) If there is no meeting in DB, return null
 * (3) If there is no meeting in Amazon Chime, delete from DB and return null.
 * @param {*} meetingName
 */
export const getMeetingInfo = async (req: BackendGetMeetingInfoRequest): Promise<BackendGetMeetingInfoResponse | null> => {
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
    console.log("READ PROPR1");
    const meetingData = JSON.parse(meetingInfo.Meeting.S!);
    console.log("READ PROPR2");
    try {
        // Check Exist?
        const mid = await chime.getMeeting({ MeetingId: meetingData.MeetingId }).promise();
        console.log("chime meeting info:", mid);
    } catch (err) {
        console.log("chime meeting exception:", err);
        await deleteMeeting({ meetingName: req.meetingName });
        return null;
    }
    console.log("READ PROPR3");

    //// (4) return meeting info
    return {
        meetingName: meetingInfo.MeetingName.S!,
        meetingId: meetingInfo.MeetingId.S!,
        meeting: JSON.parse(meetingInfo.Meeting.S!),
        metadata: JSON.parse(meetingInfo.Metadata.S!),
        hmmTaskArn: meetingInfo.HmmTaskArn ? meetingInfo.HmmTaskArn.S! : "-",
        isOwner: req.email === JSON.parse(meetingInfo.Metadata.S!).OwnerId,
    };
};

/**
 * Delete meeting from DB
 * @param {*} meetingName
 */
export const deleteMeeting = async (req: BackendDeleteMeetingRequest) => {
    await ddb
        .deleteItem({
            TableName: meetingTableName,
            Key: {
                MeetingName: { S: req.meetingName },
            },
        })
        .promise();
};

export const createMeeting = async (req: BackendCreateMeetingRequest): Promise<BackendCreateMeetingResponse> => {
    //// (1) check meeting name exist
    const meetingInfo = await getMeetingInfo({ meetingName: req.meetingName });
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
    const metadata: Metadata = {
        OwnerId: req.email,
        Region: req.region,
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

export const joinMeeting = async (req: BackendJoinMeetingRequest): Promise<BackendJoinMeetingResponse | BackendJoinMeetingException> => {
    //// (1) check meeting exists
    let meetingInfo = await getMeetingInfo({ meetingName: req.meetingName });
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
    let meetingInfo = await getMeetingInfo({ meetingName: req.meetingName });
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
    let meetingInfo = await getMeetingInfo({ meetingName: req.meetingName });
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
