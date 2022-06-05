import { DynamoDB, Chime, Endpoint } from "aws-sdk";
import { getMeetingInfoFromDB } from "./001_meeting_common";
import {
    BackendStartTranscribeException,
    BackendStartTranscribeExceptionType,
    BackendStartTranscribeRequest,
    BackendStartTranscribeResponse,
    BackendStopTranscribeExceptionType,
    BackendStopTranscribeRequest,
} from "./backend_request";
const chime = new Chime({ region: "us-east-1" });
chime.endpoint = new Endpoint("https://service.chime.aws.amazon.com/console");


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
