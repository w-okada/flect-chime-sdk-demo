"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopTranscribe = exports.startTranscribe = exports.getAttendeeInfo = exports.joinMeeting = exports.createMeeting = exports.deleteMeeting = exports.getMeetingInfo = void 0;
const aws_sdk_1 = require("aws-sdk");
const uuid_1 = require("uuid");
const backend_request_1 = require("./backend_request");
const util_1 = require("./util");
var meetingTableName = process.env.MEETING_TABLE_NAME;
var attendeesTableName = process.env.ATTENDEE_TABLE_NAME;
var ddb = new aws_sdk_1.DynamoDB();
const chime = new aws_sdk_1.Chime({ region: "us-east-1" });
chime.endpoint = new aws_sdk_1.Endpoint("https://service.chime.aws.amazon.com/console");
/**
 * get meeting info
 * (1) retrieve meeting info from DB
 * (2) If there is no meeting in DB, return null
 * (3) If there is no meeting in Amazon Chime, delete from DB and return null.
 * @param {*} meetingName
 */
const getMeetingInfo = async (req) => {
    //// (1) retrieve info
    console.log("dynamo1", req.meetingName);
    const result = await ddb.getItem({ TableName: meetingTableName, Key: { MeetingName: { S: req.meetingName } } }).promise();
    console.log("dynamo2", result);
    //// (2) If no meeting in DB, return null
    if (!result.Item) {
        return null;
    }
    //// (3) If no meeting in Chime, delete meeting from DB and return null
    const meetingInfo = result.Item;
    console.log("READ PROPR1");
    const meetingData = JSON.parse(meetingInfo.Meeting.S);
    console.log("READ PROPR2");
    try {
        // Check Exist?
        const mid = await chime.getMeeting({ MeetingId: meetingData.MeetingId }).promise();
        console.log("chime meeting info:", mid);
    }
    catch (err) {
        console.log("chime meeting exception:", err);
        await (0, exports.deleteMeeting)({ meetingName: req.meetingName });
        return null;
    }
    console.log("READ PROPR3");
    //// (4) return meeting info
    return {
        meetingName: meetingInfo.MeetingName.S,
        meetingId: meetingInfo.MeetingId.S,
        meeting: JSON.parse(meetingInfo.Meeting.S),
        metadata: JSON.parse(meetingInfo.Metadata.S),
        hmmTaskArn: meetingInfo.HmmTaskArn ? meetingInfo.HmmTaskArn.S : "-",
        isOwner: req.email === JSON.parse(meetingInfo.Metadata.S).OwnerId,
    };
};
exports.getMeetingInfo = getMeetingInfo;
/**
 * Delete meeting from DB
 * @param {*} meetingName
 */
const deleteMeeting = async (req) => {
    await ddb
        .deleteItem({
        TableName: meetingTableName,
        Key: {
            MeetingName: { S: req.meetingName },
        },
    })
        .promise();
};
exports.deleteMeeting = deleteMeeting;
const createMeeting = async (req) => {
    //// (1) check meeting name exist
    const meetingInfo = await (0, exports.getMeetingInfo)({ meetingName: req.meetingName });
    if (meetingInfo !== null) {
        return {
            created: false,
            meetingId: meetingInfo.meetingId,
            meetingName: meetingInfo.meetingName,
            ownerId: meetingInfo.metadata.OwnerId,
        };
    }
    //// (2) create meeting in Amazon Chime
    const request = {
        ClientRequestToken: (0, uuid_1.v4)(),
        MediaRegion: req.region,
    };
    const newMeetingInfo = await chime.createMeeting(request).promise();
    //// (3) register meeting info in DB
    const date = new Date();
    const now = date.getTime();
    const metadata = {
        OwnerId: req.email,
        Region: req.region,
        StartTime: now,
    };
    const item = {
        MeetingName: { S: req.meetingName },
        MeetingId: { S: newMeetingInfo.Meeting.MeetingId },
        Meeting: { S: JSON.stringify(newMeetingInfo.Meeting) },
        Metadata: { S: JSON.stringify(metadata) },
        TTL: {
            N: "" + (0, util_1.getExpireDate)(),
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
        meetingId: newMeetingInfo.Meeting.MeetingId,
        meetingName: req.meetingName,
        ownerId: req.email,
    };
};
exports.createMeeting = createMeeting;
const joinMeeting = async (req) => {
    //// (1) check meeting exists
    let meetingInfo = await (0, exports.getMeetingInfo)({ meetingName: req.meetingName });
    if (meetingInfo === null) {
        return {
            code: backend_request_1.BackendJoinMeetingExceptionType.NO_MEETING_FOUND,
            exception: true,
        };
    }
    //// (2) check attendeeName
    if (req.attendeeName === "") {
        return {
            code: backend_request_1.BackendJoinMeetingExceptionType.PARAMETER_ERROR,
            exception: true,
        };
    }
    //// (3) create attendee in Amazon Chime
    console.info("Adding new attendee");
    const attendeeInfo = await chime
        .createAttendee({
        MeetingId: meetingInfo.meetingId,
        ExternalUserId: (0, uuid_1.v4)(),
    })
        .promise();
    //// (4) register attendee in DB
    await ddb
        .putItem({
        TableName: attendeesTableName,
        Item: {
            AttendeeId: {
                S: `${req.meetingName}/${attendeeInfo.Attendee.AttendeeId}`,
            },
            AttendeeName: { S: req.attendeeName },
            TTL: {
                N: "" + (0, util_1.getExpireDate)(),
            },
        },
    })
        .promise();
    console.log("MEETING_INFO", meetingInfo);
    return {
        meetingName: meetingInfo.meetingName,
        meeting: meetingInfo.meeting,
        attendee: attendeeInfo.Attendee,
    };
};
exports.joinMeeting = joinMeeting;
const getAttendeeInfo = async (req) => {
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
            code: backend_request_1.BackendGetAttendeeInfoExceptionType.NO_ATTENDEE_FOUND,
            exception: true,
        };
    }
    console.log(result);
    //// (3) return attendee info.
    return {
        attendeeId: result.Item.AttendeeId.S,
        attendeeName: result.Item.AttendeeName.S,
    };
};
exports.getAttendeeInfo = getAttendeeInfo;
const startTranscribe = async (req) => {
    //// (1) check meeting exists
    let meetingInfo = await (0, exports.getMeetingInfo)({ meetingName: req.meetingName });
    if (meetingInfo === null) {
        return {
            code: backend_request_1.BackendStartTranscribeExceptionType.NO_MEETING_FOUND,
            exception: true,
        };
    }
    //// (2) check if owner calls or not.
    var meetingMetadata = meetingInfo.metadata;
    var ownerId = meetingMetadata["OwnerId"];
    console.log("OWNERID", ownerId, "email", req.email);
    if (ownerId != req.email) {
        return {
            code: backend_request_1.BackendStartTranscribeExceptionType.NOT_OWNER,
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
exports.startTranscribe = startTranscribe;
/***
 * stop Transcribe.
 *
 */
const stopTranscribe = async (req) => {
    console.log("stopTranscribe");
    //// (1) If there is no meeting, return fail
    let meetingInfo = await (0, exports.getMeetingInfo)({ meetingName: req.meetingName });
    if (meetingInfo === null) {
        return {
            code: backend_request_1.BackendStopTranscribeExceptionType.NO_MEETING_FOUND,
            exception: true,
        };
    }
    //// (2) check if owner calls or not.
    var meetingMetadata = meetingInfo.metadata;
    var ownerId = meetingMetadata["OwnerId"];
    console.log("OWNERID", ownerId, "email", req.email);
    if (ownerId != req.email) {
        return {
            code: backend_request_1.BackendStopTranscribeExceptionType.NOT_OWNER,
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
exports.stopTranscribe = stopTranscribe;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVldGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1lZXRpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUNBQW9EO0FBQ3BELCtCQUEwQjtBQUMxQix1REFvQjJCO0FBRTNCLGlDQUF1QztBQUN2QyxJQUFJLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQW1CLENBQUM7QUFDdkQsSUFBSSxrQkFBa0IsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFvQixDQUFDO0FBQzFELElBQUksR0FBRyxHQUFHLElBQUksa0JBQVEsRUFBRSxDQUFDO0FBQ3pCLE1BQU0sS0FBSyxHQUFHLElBQUksZUFBSyxDQUFDLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7QUFDakQsS0FBSyxDQUFDLFFBQVEsR0FBRyxJQUFJLGtCQUFRLENBQUMsOENBQThDLENBQUMsQ0FBQztBQUM5RTs7Ozs7O0dBTUc7QUFDSSxNQUFNLGNBQWMsR0FBRyxLQUFLLEVBQUUsR0FBaUMsRUFBaUQsRUFBRTtJQUNySCxzQkFBc0I7SUFDdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3hDLE1BQU0sTUFBTSxHQUFHLE1BQU0sR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxHQUFHLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzFILE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBRS9CLHlDQUF5QztJQUN6QyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtRQUNkLE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFFRCx1RUFBdUU7SUFDdkUsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLElBQUssQ0FBQztJQUNqQyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzNCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFFLENBQUMsQ0FBQztJQUN2RCxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzNCLElBQUk7UUFDQSxlQUFlO1FBQ2YsTUFBTSxHQUFHLEdBQUcsTUFBTSxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ25GLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDM0M7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDN0MsTUFBTSxJQUFBLHFCQUFhLEVBQUMsRUFBRSxXQUFXLEVBQUUsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDdEQsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7SUFFM0IsNEJBQTRCO0lBQzVCLE9BQU87UUFDSCxXQUFXLEVBQUUsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFFO1FBQ3ZDLFNBQVMsRUFBRSxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUU7UUFDbkMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFFLENBQUM7UUFDM0MsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFFLENBQUM7UUFDN0MsVUFBVSxFQUFFLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBRSxDQUFDLENBQUMsQ0FBQyxHQUFHO1FBQ3BFLE9BQU8sRUFBRSxHQUFHLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFFLENBQUMsQ0FBQyxPQUFPO0tBQ3JFLENBQUM7QUFDTixDQUFDLENBQUM7QUFwQ1csUUFBQSxjQUFjLGtCQW9DekI7QUFFRjs7O0dBR0c7QUFDSSxNQUFNLGFBQWEsR0FBRyxLQUFLLEVBQUUsR0FBZ0MsRUFBRSxFQUFFO0lBQ3BFLE1BQU0sR0FBRztTQUNKLFVBQVUsQ0FBQztRQUNSLFNBQVMsRUFBRSxnQkFBZ0I7UUFDM0IsR0FBRyxFQUFFO1lBQ0QsV0FBVyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxXQUFXLEVBQUU7U0FDdEM7S0FDSixDQUFDO1NBQ0QsT0FBTyxFQUFFLENBQUM7QUFDbkIsQ0FBQyxDQUFDO0FBVFcsUUFBQSxhQUFhLGlCQVN4QjtBQUVLLE1BQU0sYUFBYSxHQUFHLEtBQUssRUFBRSxHQUFnQyxFQUF5QyxFQUFFO0lBQzNHLGlDQUFpQztJQUNqQyxNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUEsc0JBQWMsRUFBQyxFQUFFLFdBQVcsRUFBRSxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUMzRSxJQUFJLFdBQVcsS0FBSyxJQUFJLEVBQUU7UUFDdEIsT0FBTztZQUNILE9BQU8sRUFBRSxLQUFLO1lBQ2QsU0FBUyxFQUFFLFdBQVcsQ0FBQyxTQUFTO1lBQ2hDLFdBQVcsRUFBRSxXQUFXLENBQUMsV0FBVztZQUNwQyxPQUFPLEVBQUUsV0FBVyxDQUFDLFFBQVEsQ0FBQyxPQUFPO1NBQ3hDLENBQUM7S0FDTDtJQUVELHVDQUF1QztJQUN2QyxNQUFNLE9BQU8sR0FBK0I7UUFDeEMsa0JBQWtCLEVBQUUsSUFBQSxTQUFFLEdBQUU7UUFDeEIsV0FBVyxFQUFFLEdBQUcsQ0FBQyxNQUFNO0tBQzFCLENBQUM7SUFDRixNQUFNLGNBQWMsR0FBRyxNQUFNLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7SUFFcEUsb0NBQW9DO0lBQ3BDLE1BQU0sSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDeEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzNCLE1BQU0sUUFBUSxHQUFhO1FBQ3ZCLE9BQU8sRUFBRSxHQUFHLENBQUMsS0FBSztRQUNsQixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU07UUFDbEIsU0FBUyxFQUFFLEdBQUc7S0FDakIsQ0FBQztJQUNGLE1BQU0sSUFBSSxHQUFHO1FBQ1QsV0FBVyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxXQUFXLEVBQUU7UUFDbkMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxPQUFRLENBQUMsU0FBUyxFQUFFO1FBQ25ELE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUN0RCxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRTtRQUN6QyxHQUFHLEVBQUU7WUFDRCxDQUFDLEVBQUUsRUFBRSxHQUFHLElBQUEsb0JBQWEsR0FBRTtTQUMxQjtLQUNKLENBQUM7SUFDRixNQUFNLEdBQUc7U0FDSixPQUFPLENBQUM7UUFDTCxTQUFTLEVBQUUsZ0JBQWdCO1FBQzNCLElBQUksRUFBRSxJQUFJO0tBQ2IsQ0FBQztTQUNELE9BQU8sRUFBRSxDQUFDO0lBRWYsT0FBTztRQUNILE9BQU8sRUFBRSxJQUFJO1FBQ2IsU0FBUyxFQUFFLGNBQWMsQ0FBQyxPQUFRLENBQUMsU0FBVTtRQUM3QyxXQUFXLEVBQUUsR0FBRyxDQUFDLFdBQVc7UUFDNUIsT0FBTyxFQUFFLEdBQUcsQ0FBQyxLQUFLO0tBQ3JCLENBQUM7QUFDTixDQUFDLENBQUM7QUFqRFcsUUFBQSxhQUFhLGlCQWlEeEI7QUFFSyxNQUFNLFdBQVcsR0FBRyxLQUFLLEVBQUUsR0FBOEIsRUFBcUUsRUFBRTtJQUNuSSw2QkFBNkI7SUFDN0IsSUFBSSxXQUFXLEdBQUcsTUFBTSxJQUFBLHNCQUFjLEVBQUMsRUFBRSxXQUFXLEVBQUUsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDekUsSUFBSSxXQUFXLEtBQUssSUFBSSxFQUFFO1FBQ3RCLE9BQU87WUFDSCxJQUFJLEVBQUUsaURBQStCLENBQUMsZ0JBQWdCO1lBQ3RELFNBQVMsRUFBRSxJQUFJO1NBQ2xCLENBQUM7S0FDTDtJQUVELDJCQUEyQjtJQUMzQixJQUFJLEdBQUcsQ0FBQyxZQUFZLEtBQUssRUFBRSxFQUFFO1FBQ3pCLE9BQU87WUFDSCxJQUFJLEVBQUUsaURBQStCLENBQUMsZUFBZTtZQUNyRCxTQUFTLEVBQUUsSUFBSTtTQUNsQixDQUFDO0tBQ0w7SUFFRCx3Q0FBd0M7SUFDeEMsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBQ3BDLE1BQU0sWUFBWSxHQUFHLE1BQU0sS0FBSztTQUMzQixjQUFjLENBQUM7UUFDWixTQUFTLEVBQUUsV0FBVyxDQUFDLFNBQVM7UUFDaEMsY0FBYyxFQUFFLElBQUEsU0FBRSxHQUFFO0tBQ3ZCLENBQUM7U0FDRCxPQUFPLEVBQUUsQ0FBQztJQUVmLGdDQUFnQztJQUNoQyxNQUFNLEdBQUc7U0FDSixPQUFPLENBQUM7UUFDTCxTQUFTLEVBQUUsa0JBQWtCO1FBQzdCLElBQUksRUFBRTtZQUNGLFVBQVUsRUFBRTtnQkFDUixDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsV0FBVyxJQUFJLFlBQVksQ0FBQyxRQUFTLENBQUMsVUFBVSxFQUFFO2FBQy9EO1lBQ0QsWUFBWSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxZQUFZLEVBQUU7WUFDckMsR0FBRyxFQUFFO2dCQUNELENBQUMsRUFBRSxFQUFFLEdBQUcsSUFBQSxvQkFBYSxHQUFFO2FBQzFCO1NBQ0o7S0FDSixDQUFDO1NBQ0QsT0FBTyxFQUFFLENBQUM7SUFFZixPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUV6QyxPQUFPO1FBQ0gsV0FBVyxFQUFFLFdBQVcsQ0FBQyxXQUFXO1FBQ3BDLE9BQU8sRUFBRSxXQUFXLENBQUMsT0FBTztRQUM1QixRQUFRLEVBQUUsWUFBWSxDQUFDLFFBQVM7S0FDbkMsQ0FBQztBQUNOLENBQUMsQ0FBQztBQWxEVyxRQUFBLFdBQVcsZUFrRHRCO0FBRUssTUFBTSxlQUFlLEdBQUcsS0FBSyxFQUFFLEdBQWtDLEVBQTZFLEVBQUU7SUFDbkosa0dBQWtHO0lBQ2xHLE1BQU0sTUFBTSxHQUFHLE1BQU0sR0FBRztTQUNuQixPQUFPLENBQUM7UUFDTCxTQUFTLEVBQUUsa0JBQWtCO1FBQzdCLEdBQUcsRUFBRTtZQUNELFVBQVUsRUFBRTtnQkFDUixDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsV0FBVyxJQUFJLEdBQUcsQ0FBQyxVQUFVLEVBQUU7YUFDNUM7U0FDSjtLQUNKLENBQUM7U0FDRCxPQUFPLEVBQUUsQ0FBQztJQUVmLDREQUE0RDtJQUM1RCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtRQUNkLE9BQU87WUFDSCxJQUFJLEVBQUUscURBQW1DLENBQUMsaUJBQWlCO1lBQzNELFNBQVMsRUFBRSxJQUFJO1NBQ2xCLENBQUM7S0FDTDtJQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFcEIsOEJBQThCO0lBQzlCLE9BQU87UUFDSCxVQUFVLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBRTtRQUNyQyxZQUFZLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBRTtLQUM1QyxDQUFDO0FBQ04sQ0FBQyxDQUFDO0FBM0JXLFFBQUEsZUFBZSxtQkEyQjFCO0FBRUssTUFBTSxlQUFlLEdBQUcsS0FBSyxFQUFFLEdBQWtDLEVBQTZFLEVBQUU7SUFDbkosNkJBQTZCO0lBQzdCLElBQUksV0FBVyxHQUFHLE1BQU0sSUFBQSxzQkFBYyxFQUFDLEVBQUUsV0FBVyxFQUFFLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQ3pFLElBQUksV0FBVyxLQUFLLElBQUksRUFBRTtRQUN0QixPQUFPO1lBQ0gsSUFBSSxFQUFFLHFEQUFtQyxDQUFDLGdCQUFnQjtZQUMxRCxTQUFTLEVBQUUsSUFBSTtTQUNsQixDQUFDO0tBQ0w7SUFDRCxxQ0FBcUM7SUFDckMsSUFBSSxlQUFlLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQztJQUMzQyxJQUFJLE9BQU8sR0FBRyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDekMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEQsSUFBSSxPQUFPLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRTtRQUN0QixPQUFPO1lBQ0gsSUFBSSxFQUFFLHFEQUFtQyxDQUFDLFNBQVM7WUFDbkQsU0FBUyxFQUFFLElBQUk7U0FDbEIsQ0FBQztLQUNMO0lBRUQseUJBQXlCO0lBQ3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3pDLE1BQU0sR0FBRyxHQUFHLE1BQU0sS0FBSztTQUNsQix5QkFBeUIsQ0FBQztRQUN2QixTQUFTLEVBQUUsV0FBVyxDQUFDLFNBQVM7UUFDaEMsMEJBQTBCLEVBQUU7WUFDeEIsd0JBQXdCLEVBQUU7Z0JBQ3RCLFlBQVksRUFBRSxHQUFHLENBQUMsSUFBSTtnQkFDdEIsNERBQTREO2dCQUM1RCxnQ0FBZ0M7Z0JBQ2hDLDBCQUEwQjtnQkFDMUIsNEJBQTRCO2FBQy9CO1NBQ0o7S0FDSixDQUFDO1NBQ0QsT0FBTyxFQUFFLENBQUM7SUFFZixPQUFPLEVBQUUsQ0FBQztBQUNkLENBQUMsQ0FBQztBQXRDVyxRQUFBLGVBQWUsbUJBc0MxQjtBQUVGOzs7R0FHRztBQUNJLE1BQU0sY0FBYyxHQUFHLEtBQUssRUFBRSxHQUFpQyxFQUFFLEVBQUU7SUFDdEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzlCLDRDQUE0QztJQUM1QyxJQUFJLFdBQVcsR0FBRyxNQUFNLElBQUEsc0JBQWMsRUFBQyxFQUFFLFdBQVcsRUFBRSxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUN6RSxJQUFJLFdBQVcsS0FBSyxJQUFJLEVBQUU7UUFDdEIsT0FBTztZQUNILElBQUksRUFBRSxvREFBa0MsQ0FBQyxnQkFBZ0I7WUFDekQsU0FBUyxFQUFFLElBQUk7U0FDbEIsQ0FBQztLQUNMO0lBRUQscUNBQXFDO0lBQ3JDLElBQUksZUFBZSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUM7SUFDM0MsSUFBSSxPQUFPLEdBQUcsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3BELElBQUksT0FBTyxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUU7UUFDdEIsT0FBTztZQUNILElBQUksRUFBRSxvREFBa0MsQ0FBQyxTQUFTO1lBQ2xELFNBQVMsRUFBRSxJQUFJO1NBQ2xCLENBQUM7S0FDTDtJQUVELHdCQUF3QjtJQUN4QixNQUFNLEdBQUcsR0FBRyxNQUFNLEtBQUs7U0FDbEIsd0JBQXdCLENBQUM7UUFDdEIsU0FBUyxFQUFFLFdBQVcsQ0FBQyxTQUFTO0tBQ25DLENBQUM7U0FDRCxPQUFPLEVBQUUsQ0FBQztJQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDM0MsT0FBTyxFQUFFLENBQUM7QUFDZCxDQUFDLENBQUM7QUE5QlcsUUFBQSxjQUFjLGtCQThCekIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEeW5hbW9EQiwgQ2hpbWUsIEVuZHBvaW50IH0gZnJvbSBcImF3cy1zZGtcIjtcbmltcG9ydCB7IHY0IH0gZnJvbSBcInV1aWRcIjtcbmltcG9ydCB7XG4gICAgQmFja2VuZENyZWF0ZU1lZXRpbmdSZXF1ZXN0LFxuICAgIEJhY2tlbmRDcmVhdGVNZWV0aW5nUmVzcG9uc2UsXG4gICAgQmFja2VuZERlbGV0ZU1lZXRpbmdSZXF1ZXN0LFxuICAgIEJhY2tlbmRHZXRBdHRlbmRlZUluZm9FeGNlcHRpb24sXG4gICAgQmFja2VuZEdldEF0dGVuZGVlSW5mb0V4Y2VwdGlvblR5cGUsXG4gICAgQmFja2VuZEdldEF0dGVuZGVlSW5mb1JlcXVlc3QsXG4gICAgQmFja2VuZEdldEF0dGVuZGVlSW5mb1Jlc3BvbnNlLFxuICAgIEJhY2tlbmRHZXRNZWV0aW5nSW5mb1JlcXVlc3QsXG4gICAgQmFja2VuZEdldE1lZXRpbmdJbmZvUmVzcG9uc2UsXG4gICAgQmFja2VuZEpvaW5NZWV0aW5nRXhjZXB0aW9uLFxuICAgIEJhY2tlbmRKb2luTWVldGluZ0V4Y2VwdGlvblR5cGUsXG4gICAgQmFja2VuZEpvaW5NZWV0aW5nUmVxdWVzdCxcbiAgICBCYWNrZW5kSm9pbk1lZXRpbmdSZXNwb25zZSxcbiAgICBCYWNrZW5kU3RhcnRUcmFuc2NyaWJlRXhjZXB0aW9uLFxuICAgIEJhY2tlbmRTdGFydFRyYW5zY3JpYmVFeGNlcHRpb25UeXBlLFxuICAgIEJhY2tlbmRTdGFydFRyYW5zY3JpYmVSZXF1ZXN0LFxuICAgIEJhY2tlbmRTdGFydFRyYW5zY3JpYmVSZXNwb25zZSxcbiAgICBCYWNrZW5kU3RvcFRyYW5zY3JpYmVFeGNlcHRpb25UeXBlLFxuICAgIEJhY2tlbmRTdG9wVHJhbnNjcmliZVJlcXVlc3QsXG59IGZyb20gXCIuL2JhY2tlbmRfcmVxdWVzdFwiO1xuaW1wb3J0IHsgTWV0YWRhdGEgfSBmcm9tIFwiLi9odHRwX3JlcXVlc3RcIjtcbmltcG9ydCB7IGdldEV4cGlyZURhdGUgfSBmcm9tIFwiLi91dGlsXCI7XG52YXIgbWVldGluZ1RhYmxlTmFtZSA9IHByb2Nlc3MuZW52Lk1FRVRJTkdfVEFCTEVfTkFNRSE7XG52YXIgYXR0ZW5kZWVzVGFibGVOYW1lID0gcHJvY2Vzcy5lbnYuQVRURU5ERUVfVEFCTEVfTkFNRSE7XG52YXIgZGRiID0gbmV3IER5bmFtb0RCKCk7XG5jb25zdCBjaGltZSA9IG5ldyBDaGltZSh7IHJlZ2lvbjogXCJ1cy1lYXN0LTFcIiB9KTtcbmNoaW1lLmVuZHBvaW50ID0gbmV3IEVuZHBvaW50KFwiaHR0cHM6Ly9zZXJ2aWNlLmNoaW1lLmF3cy5hbWF6b24uY29tL2NvbnNvbGVcIik7XG4vKipcbiAqIGdldCBtZWV0aW5nIGluZm9cbiAqICgxKSByZXRyaWV2ZSBtZWV0aW5nIGluZm8gZnJvbSBEQlxuICogKDIpIElmIHRoZXJlIGlzIG5vIG1lZXRpbmcgaW4gREIsIHJldHVybiBudWxsXG4gKiAoMykgSWYgdGhlcmUgaXMgbm8gbWVldGluZyBpbiBBbWF6b24gQ2hpbWUsIGRlbGV0ZSBmcm9tIERCIGFuZCByZXR1cm4gbnVsbC5cbiAqIEBwYXJhbSB7Kn0gbWVldGluZ05hbWVcbiAqL1xuZXhwb3J0IGNvbnN0IGdldE1lZXRpbmdJbmZvID0gYXN5bmMgKHJlcTogQmFja2VuZEdldE1lZXRpbmdJbmZvUmVxdWVzdCk6IFByb21pc2U8QmFja2VuZEdldE1lZXRpbmdJbmZvUmVzcG9uc2UgfCBudWxsPiA9PiB7XG4gICAgLy8vLyAoMSkgcmV0cmlldmUgaW5mb1xuICAgIGNvbnNvbGUubG9nKFwiZHluYW1vMVwiLCByZXEubWVldGluZ05hbWUpO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRkYi5nZXRJdGVtKHsgVGFibGVOYW1lOiBtZWV0aW5nVGFibGVOYW1lLCBLZXk6IHsgTWVldGluZ05hbWU6IHsgUzogcmVxLm1lZXRpbmdOYW1lIH0gfSB9KS5wcm9taXNlKCk7XG4gICAgY29uc29sZS5sb2coXCJkeW5hbW8yXCIsIHJlc3VsdCk7XG5cbiAgICAvLy8vICgyKSBJZiBubyBtZWV0aW5nIGluIERCLCByZXR1cm4gbnVsbFxuICAgIGlmICghcmVzdWx0Lkl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8vLyAoMykgSWYgbm8gbWVldGluZyBpbiBDaGltZSwgZGVsZXRlIG1lZXRpbmcgZnJvbSBEQiBhbmQgcmV0dXJuIG51bGxcbiAgICBjb25zdCBtZWV0aW5nSW5mbyA9IHJlc3VsdC5JdGVtITtcbiAgICBjb25zb2xlLmxvZyhcIlJFQUQgUFJPUFIxXCIpO1xuICAgIGNvbnN0IG1lZXRpbmdEYXRhID0gSlNPTi5wYXJzZShtZWV0aW5nSW5mby5NZWV0aW5nLlMhKTtcbiAgICBjb25zb2xlLmxvZyhcIlJFQUQgUFJPUFIyXCIpO1xuICAgIHRyeSB7XG4gICAgICAgIC8vIENoZWNrIEV4aXN0P1xuICAgICAgICBjb25zdCBtaWQgPSBhd2FpdCBjaGltZS5nZXRNZWV0aW5nKHsgTWVldGluZ0lkOiBtZWV0aW5nRGF0YS5NZWV0aW5nSWQgfSkucHJvbWlzZSgpO1xuICAgICAgICBjb25zb2xlLmxvZyhcImNoaW1lIG1lZXRpbmcgaW5mbzpcIiwgbWlkKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJjaGltZSBtZWV0aW5nIGV4Y2VwdGlvbjpcIiwgZXJyKTtcbiAgICAgICAgYXdhaXQgZGVsZXRlTWVldGluZyh7IG1lZXRpbmdOYW1lOiByZXEubWVldGluZ05hbWUgfSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyhcIlJFQUQgUFJPUFIzXCIpO1xuXG4gICAgLy8vLyAoNCkgcmV0dXJuIG1lZXRpbmcgaW5mb1xuICAgIHJldHVybiB7XG4gICAgICAgIG1lZXRpbmdOYW1lOiBtZWV0aW5nSW5mby5NZWV0aW5nTmFtZS5TISxcbiAgICAgICAgbWVldGluZ0lkOiBtZWV0aW5nSW5mby5NZWV0aW5nSWQuUyEsXG4gICAgICAgIG1lZXRpbmc6IEpTT04ucGFyc2UobWVldGluZ0luZm8uTWVldGluZy5TISksXG4gICAgICAgIG1ldGFkYXRhOiBKU09OLnBhcnNlKG1lZXRpbmdJbmZvLk1ldGFkYXRhLlMhKSxcbiAgICAgICAgaG1tVGFza0FybjogbWVldGluZ0luZm8uSG1tVGFza0FybiA/IG1lZXRpbmdJbmZvLkhtbVRhc2tBcm4uUyEgOiBcIi1cIixcbiAgICAgICAgaXNPd25lcjogcmVxLmVtYWlsID09PSBKU09OLnBhcnNlKG1lZXRpbmdJbmZvLk1ldGFkYXRhLlMhKS5Pd25lcklkLFxuICAgIH07XG59O1xuXG4vKipcbiAqIERlbGV0ZSBtZWV0aW5nIGZyb20gREJcbiAqIEBwYXJhbSB7Kn0gbWVldGluZ05hbWVcbiAqL1xuZXhwb3J0IGNvbnN0IGRlbGV0ZU1lZXRpbmcgPSBhc3luYyAocmVxOiBCYWNrZW5kRGVsZXRlTWVldGluZ1JlcXVlc3QpID0+IHtcbiAgICBhd2FpdCBkZGJcbiAgICAgICAgLmRlbGV0ZUl0ZW0oe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBtZWV0aW5nVGFibGVOYW1lLFxuICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgTWVldGluZ05hbWU6IHsgUzogcmVxLm1lZXRpbmdOYW1lIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KVxuICAgICAgICAucHJvbWlzZSgpO1xufTtcblxuZXhwb3J0IGNvbnN0IGNyZWF0ZU1lZXRpbmcgPSBhc3luYyAocmVxOiBCYWNrZW5kQ3JlYXRlTWVldGluZ1JlcXVlc3QpOiBQcm9taXNlPEJhY2tlbmRDcmVhdGVNZWV0aW5nUmVzcG9uc2U+ID0+IHtcbiAgICAvLy8vICgxKSBjaGVjayBtZWV0aW5nIG5hbWUgZXhpc3RcbiAgICBjb25zdCBtZWV0aW5nSW5mbyA9IGF3YWl0IGdldE1lZXRpbmdJbmZvKHsgbWVldGluZ05hbWU6IHJlcS5tZWV0aW5nTmFtZSB9KTtcbiAgICBpZiAobWVldGluZ0luZm8gIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNyZWF0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgbWVldGluZ0lkOiBtZWV0aW5nSW5mby5tZWV0aW5nSWQsXG4gICAgICAgICAgICBtZWV0aW5nTmFtZTogbWVldGluZ0luZm8ubWVldGluZ05hbWUsXG4gICAgICAgICAgICBvd25lcklkOiBtZWV0aW5nSW5mby5tZXRhZGF0YS5Pd25lcklkLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vLy8gKDIpIGNyZWF0ZSBtZWV0aW5nIGluIEFtYXpvbiBDaGltZVxuICAgIGNvbnN0IHJlcXVlc3Q6IENoaW1lLkNyZWF0ZU1lZXRpbmdSZXF1ZXN0ID0ge1xuICAgICAgICBDbGllbnRSZXF1ZXN0VG9rZW46IHY0KCksXG4gICAgICAgIE1lZGlhUmVnaW9uOiByZXEucmVnaW9uLFxuICAgIH07XG4gICAgY29uc3QgbmV3TWVldGluZ0luZm8gPSBhd2FpdCBjaGltZS5jcmVhdGVNZWV0aW5nKHJlcXVlc3QpLnByb21pc2UoKTtcblxuICAgIC8vLy8gKDMpIHJlZ2lzdGVyIG1lZXRpbmcgaW5mbyBpbiBEQlxuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgpO1xuICAgIGNvbnN0IG5vdyA9IGRhdGUuZ2V0VGltZSgpO1xuICAgIGNvbnN0IG1ldGFkYXRhOiBNZXRhZGF0YSA9IHtcbiAgICAgICAgT3duZXJJZDogcmVxLmVtYWlsLFxuICAgICAgICBSZWdpb246IHJlcS5yZWdpb24sXG4gICAgICAgIFN0YXJ0VGltZTogbm93LFxuICAgIH07XG4gICAgY29uc3QgaXRlbSA9IHtcbiAgICAgICAgTWVldGluZ05hbWU6IHsgUzogcmVxLm1lZXRpbmdOYW1lIH0sXG4gICAgICAgIE1lZXRpbmdJZDogeyBTOiBuZXdNZWV0aW5nSW5mby5NZWV0aW5nIS5NZWV0aW5nSWQgfSxcbiAgICAgICAgTWVldGluZzogeyBTOiBKU09OLnN0cmluZ2lmeShuZXdNZWV0aW5nSW5mby5NZWV0aW5nKSB9LFxuICAgICAgICBNZXRhZGF0YTogeyBTOiBKU09OLnN0cmluZ2lmeShtZXRhZGF0YSkgfSxcbiAgICAgICAgVFRMOiB7XG4gICAgICAgICAgICBOOiBcIlwiICsgZ2V0RXhwaXJlRGF0ZSgpLFxuICAgICAgICB9LFxuICAgIH07XG4gICAgYXdhaXQgZGRiXG4gICAgICAgIC5wdXRJdGVtKHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogbWVldGluZ1RhYmxlTmFtZSxcbiAgICAgICAgICAgIEl0ZW06IGl0ZW0sXG4gICAgICAgIH0pXG4gICAgICAgIC5wcm9taXNlKCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjcmVhdGVkOiB0cnVlLFxuICAgICAgICBtZWV0aW5nSWQ6IG5ld01lZXRpbmdJbmZvLk1lZXRpbmchLk1lZXRpbmdJZCEsXG4gICAgICAgIG1lZXRpbmdOYW1lOiByZXEubWVldGluZ05hbWUsXG4gICAgICAgIG93bmVySWQ6IHJlcS5lbWFpbCxcbiAgICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IGpvaW5NZWV0aW5nID0gYXN5bmMgKHJlcTogQmFja2VuZEpvaW5NZWV0aW5nUmVxdWVzdCk6IFByb21pc2U8QmFja2VuZEpvaW5NZWV0aW5nUmVzcG9uc2UgfCBCYWNrZW5kSm9pbk1lZXRpbmdFeGNlcHRpb24+ID0+IHtcbiAgICAvLy8vICgxKSBjaGVjayBtZWV0aW5nIGV4aXN0c1xuICAgIGxldCBtZWV0aW5nSW5mbyA9IGF3YWl0IGdldE1lZXRpbmdJbmZvKHsgbWVldGluZ05hbWU6IHJlcS5tZWV0aW5nTmFtZSB9KTtcbiAgICBpZiAobWVldGluZ0luZm8gPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvZGU6IEJhY2tlbmRKb2luTWVldGluZ0V4Y2VwdGlvblR5cGUuTk9fTUVFVElOR19GT1VORCxcbiAgICAgICAgICAgIGV4Y2VwdGlvbjogdHJ1ZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLy8vICgyKSBjaGVjayBhdHRlbmRlZU5hbWVcbiAgICBpZiAocmVxLmF0dGVuZGVlTmFtZSA9PT0gXCJcIikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29kZTogQmFja2VuZEpvaW5NZWV0aW5nRXhjZXB0aW9uVHlwZS5QQVJBTUVURVJfRVJST1IsXG4gICAgICAgICAgICBleGNlcHRpb246IHRydWUsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8vLyAoMykgY3JlYXRlIGF0dGVuZGVlIGluIEFtYXpvbiBDaGltZVxuICAgIGNvbnNvbGUuaW5mbyhcIkFkZGluZyBuZXcgYXR0ZW5kZWVcIik7XG4gICAgY29uc3QgYXR0ZW5kZWVJbmZvID0gYXdhaXQgY2hpbWVcbiAgICAgICAgLmNyZWF0ZUF0dGVuZGVlKHtcbiAgICAgICAgICAgIE1lZXRpbmdJZDogbWVldGluZ0luZm8ubWVldGluZ0lkLFxuICAgICAgICAgICAgRXh0ZXJuYWxVc2VySWQ6IHY0KCksXG4gICAgICAgIH0pXG4gICAgICAgIC5wcm9taXNlKCk7XG5cbiAgICAvLy8vICg0KSByZWdpc3RlciBhdHRlbmRlZSBpbiBEQlxuICAgIGF3YWl0IGRkYlxuICAgICAgICAucHV0SXRlbSh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IGF0dGVuZGVlc1RhYmxlTmFtZSxcbiAgICAgICAgICAgIEl0ZW06IHtcbiAgICAgICAgICAgICAgICBBdHRlbmRlZUlkOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGAke3JlcS5tZWV0aW5nTmFtZX0vJHthdHRlbmRlZUluZm8uQXR0ZW5kZWUhLkF0dGVuZGVlSWR9YCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEF0dGVuZGVlTmFtZTogeyBTOiByZXEuYXR0ZW5kZWVOYW1lIH0sXG4gICAgICAgICAgICAgICAgVFRMOiB7XG4gICAgICAgICAgICAgICAgICAgIE46IFwiXCIgKyBnZXRFeHBpcmVEYXRlKCksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pXG4gICAgICAgIC5wcm9taXNlKCk7XG5cbiAgICBjb25zb2xlLmxvZyhcIk1FRVRJTkdfSU5GT1wiLCBtZWV0aW5nSW5mbyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBtZWV0aW5nTmFtZTogbWVldGluZ0luZm8ubWVldGluZ05hbWUsXG4gICAgICAgIG1lZXRpbmc6IG1lZXRpbmdJbmZvLm1lZXRpbmcsXG4gICAgICAgIGF0dGVuZGVlOiBhdHRlbmRlZUluZm8uQXR0ZW5kZWUhLFxuICAgIH07XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0QXR0ZW5kZWVJbmZvID0gYXN5bmMgKHJlcTogQmFja2VuZEdldEF0dGVuZGVlSW5mb1JlcXVlc3QpOiBQcm9taXNlPEJhY2tlbmRHZXRBdHRlbmRlZUluZm9SZXNwb25zZSB8IEJhY2tlbmRHZXRBdHRlbmRlZUluZm9FeGNlcHRpb24+ID0+IHtcbiAgICAvLy8vICgxKSByZXRyaWV2ZSBhdHRlbmRlZSBpbmZvIGZyb20gREIuIGtleSBpcyBjb25jYXRpbmF0ZSBvZiBtZWV0aW5nTmFtZShlbmNvZGVkKSBhbmQgYXR0ZW5kZWVJZFxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRkYlxuICAgICAgICAuZ2V0SXRlbSh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IGF0dGVuZGVlc1RhYmxlTmFtZSxcbiAgICAgICAgICAgIEtleToge1xuICAgICAgICAgICAgICAgIEF0dGVuZGVlSWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogYCR7cmVxLm1lZXRpbmdOYW1lfS8ke3JlcS5hdHRlbmRlZUlkfWAsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pXG4gICAgICAgIC5wcm9taXNlKCk7XG5cbiAgICAvLy8vICgyKSBJZiB0aGVyZSBpcyBubyBhdHRlbmRlZSBpbiB0aGUgbWVldGluZywgcmV0dXJuIGZhaWxcbiAgICBpZiAoIXJlc3VsdC5JdGVtKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb2RlOiBCYWNrZW5kR2V0QXR0ZW5kZWVJbmZvRXhjZXB0aW9uVHlwZS5OT19BVFRFTkRFRV9GT1VORCxcbiAgICAgICAgICAgIGV4Y2VwdGlvbjogdHJ1ZSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgY29uc29sZS5sb2cocmVzdWx0KTtcblxuICAgIC8vLy8gKDMpIHJldHVybiBhdHRlbmRlZSBpbmZvLlxuICAgIHJldHVybiB7XG4gICAgICAgIGF0dGVuZGVlSWQ6IHJlc3VsdC5JdGVtLkF0dGVuZGVlSWQuUyEsXG4gICAgICAgIGF0dGVuZGVlTmFtZTogcmVzdWx0Lkl0ZW0uQXR0ZW5kZWVOYW1lLlMhLFxuICAgIH07XG59O1xuXG5leHBvcnQgY29uc3Qgc3RhcnRUcmFuc2NyaWJlID0gYXN5bmMgKHJlcTogQmFja2VuZFN0YXJ0VHJhbnNjcmliZVJlcXVlc3QpOiBQcm9taXNlPEJhY2tlbmRTdGFydFRyYW5zY3JpYmVSZXNwb25zZSB8IEJhY2tlbmRTdGFydFRyYW5zY3JpYmVFeGNlcHRpb24+ID0+IHtcbiAgICAvLy8vICgxKSBjaGVjayBtZWV0aW5nIGV4aXN0c1xuICAgIGxldCBtZWV0aW5nSW5mbyA9IGF3YWl0IGdldE1lZXRpbmdJbmZvKHsgbWVldGluZ05hbWU6IHJlcS5tZWV0aW5nTmFtZSB9KTtcbiAgICBpZiAobWVldGluZ0luZm8gPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvZGU6IEJhY2tlbmRTdGFydFRyYW5zY3JpYmVFeGNlcHRpb25UeXBlLk5PX01FRVRJTkdfRk9VTkQsXG4gICAgICAgICAgICBleGNlcHRpb246IHRydWUsXG4gICAgICAgIH07XG4gICAgfVxuICAgIC8vLy8gKDIpIGNoZWNrIGlmIG93bmVyIGNhbGxzIG9yIG5vdC5cbiAgICB2YXIgbWVldGluZ01ldGFkYXRhID0gbWVldGluZ0luZm8ubWV0YWRhdGE7XG4gICAgdmFyIG93bmVySWQgPSBtZWV0aW5nTWV0YWRhdGFbXCJPd25lcklkXCJdO1xuICAgIGNvbnNvbGUubG9nKFwiT1dORVJJRFwiLCBvd25lcklkLCBcImVtYWlsXCIsIHJlcS5lbWFpbCk7XG4gICAgaWYgKG93bmVySWQgIT0gcmVxLmVtYWlsKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb2RlOiBCYWNrZW5kU3RhcnRUcmFuc2NyaWJlRXhjZXB0aW9uVHlwZS5OT1RfT1dORVIsXG4gICAgICAgICAgICBleGNlcHRpb246IHRydWUsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8vLyAoMykgc3RhcnQgdHJhbnNjcmliZVxuICAgIGNvbnNvbGUubG9nKGBMYW5nYWdlIGNvZGUgOiR7cmVxLmxhbmd9YCk7XG4gICAgY29uc3QgcmVzID0gYXdhaXQgY2hpbWVcbiAgICAgICAgLnN0YXJ0TWVldGluZ1RyYW5zY3JpcHRpb24oe1xuICAgICAgICAgICAgTWVldGluZ0lkOiBtZWV0aW5nSW5mby5tZWV0aW5nSWQsXG4gICAgICAgICAgICBUcmFuc2NyaXB0aW9uQ29uZmlndXJhdGlvbjoge1xuICAgICAgICAgICAgICAgIEVuZ2luZVRyYW5zY3JpYmVTZXR0aW5nczoge1xuICAgICAgICAgICAgICAgICAgICBMYW5ndWFnZUNvZGU6IHJlcS5sYW5nLFxuICAgICAgICAgICAgICAgICAgICAvL1ZvY2FidWxhcnlGaWx0ZXJNZXRob2Q/OiBUcmFuc2NyaWJlVm9jYWJ1bGFyeUZpbHRlck1ldGhvZDtcbiAgICAgICAgICAgICAgICAgICAgLy9Wb2NhYnVsYXJ5RmlsdGVyTmFtZT86IFN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgLy9Wb2NhYnVsYXJ5TmFtZT86IFN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgLy9SZWdpb24/OiBUcmFuc2NyaWJlUmVnaW9uO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KVxuICAgICAgICAucHJvbWlzZSgpO1xuXG4gICAgcmV0dXJuIHt9O1xufTtcblxuLyoqKlxuICogc3RvcCBUcmFuc2NyaWJlLlxuICpcbiAqL1xuZXhwb3J0IGNvbnN0IHN0b3BUcmFuc2NyaWJlID0gYXN5bmMgKHJlcTogQmFja2VuZFN0b3BUcmFuc2NyaWJlUmVxdWVzdCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwic3RvcFRyYW5zY3JpYmVcIik7XG4gICAgLy8vLyAoMSkgSWYgdGhlcmUgaXMgbm8gbWVldGluZywgcmV0dXJuIGZhaWxcbiAgICBsZXQgbWVldGluZ0luZm8gPSBhd2FpdCBnZXRNZWV0aW5nSW5mbyh7IG1lZXRpbmdOYW1lOiByZXEubWVldGluZ05hbWUgfSk7XG4gICAgaWYgKG1lZXRpbmdJbmZvID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb2RlOiBCYWNrZW5kU3RvcFRyYW5zY3JpYmVFeGNlcHRpb25UeXBlLk5PX01FRVRJTkdfRk9VTkQsXG4gICAgICAgICAgICBleGNlcHRpb246IHRydWUsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8vLyAoMikgY2hlY2sgaWYgb3duZXIgY2FsbHMgb3Igbm90LlxuICAgIHZhciBtZWV0aW5nTWV0YWRhdGEgPSBtZWV0aW5nSW5mby5tZXRhZGF0YTtcbiAgICB2YXIgb3duZXJJZCA9IG1lZXRpbmdNZXRhZGF0YVtcIk93bmVySWRcIl07XG4gICAgY29uc29sZS5sb2coXCJPV05FUklEXCIsIG93bmVySWQsIFwiZW1haWxcIiwgcmVxLmVtYWlsKTtcbiAgICBpZiAob3duZXJJZCAhPSByZXEuZW1haWwpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvZGU6IEJhY2tlbmRTdG9wVHJhbnNjcmliZUV4Y2VwdGlvblR5cGUuTk9UX09XTkVSLFxuICAgICAgICAgICAgZXhjZXB0aW9uOiB0cnVlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vLy8gKDMpIHN0b3AgdHJhbnNjcmliZVxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGNoaW1lXG4gICAgICAgIC5zdG9wTWVldGluZ1RyYW5zY3JpcHRpb24oe1xuICAgICAgICAgICAgTWVldGluZ0lkOiBtZWV0aW5nSW5mby5tZWV0aW5nSWQsXG4gICAgICAgIH0pXG4gICAgICAgIC5wcm9taXNlKCk7XG4gICAgY29uc29sZS5sb2coXCJzdG9wIHRyYW5zY3JpYmUgcmVzdWx0XCIsIHJlcyk7XG4gICAgcmV0dXJuIHt9O1xufTtcbiJdfQ==