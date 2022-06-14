import * as DynamoDB from "@aws-sdk/client-dynamodb"
import * as Chime from "@aws-sdk/client-chime"
import { v4 } from "uuid";


var messagingAppInstanceAdminArn = process.env.MESSAGING_APP_INSTANCE_ADMIN_ARN!;
var messagingAppInstanceArn = process.env.MESSAGING_APP_INSTANCE_ARN!

const chime = new Chime.Chime({ region: process.env.AWS_REGION });

// (1) Chimeのバックエンドに会議室の存在確認。
// 存在していたミーティングのIDだけを返す。
export const checkMeetingExistInChimeBackend = async (meetingIds: string[]): Promise<string[]> => {
    const aliveMeetingIds: string[] = []
    for (let meetingId of meetingIds) {
        try {
            const mid = await chime.getMeeting({ MeetingId: meetingId })
            console.log("chime meeting info:", mid);
            aliveMeetingIds.push(meetingId)
        } catch (err: any) {
            if (err.code == "NotFound") {
                console.log("chime meeting exception, but this maybe happen when the meeting doesn't exist.");
            } else {
                console.log("chime meeting exception:", err);
            }
        }
    }
    return aliveMeetingIds;
}


// (2) ミーティング作成
export const createMeetingInChimeBackend = async (region: string) => {
    const request: Chime.CreateMeetingRequest = {
        ClientRequestToken: v4(),
        MediaRegion: region,
    };
    const newMeetingInfo = await chime.createMeeting(request);
    return newMeetingInfo
}

// (3) メッセージングチャネル作成
export const createMessageChannelInChimeBackend = async (meetingName: string,) => {
    const dateNow = new Date();
    const params = {
        Name: `Ch.${meetingName}`,
        AppInstanceArn: messagingAppInstanceArn,
        ClientRequestToken: `${dateNow.getHours().toString()}_${dateNow.getMinutes().toString()}`,
        ChimeBearer: messagingAppInstanceAdminArn,
        Mode: 'RESTRICTED',
        Privacy: 'PRIVATE'
    };

    const response = await chime.createChannel(params);
    console.log("Message Channel Created:", response.ChannelArn)
    return response

}

// (4) Join meeting
export const joinMeetingInChimeBackend = async (meetingId: string) => {
    console.info("Adding new attendee");
    const attendeeInfo = await chime
        .createAttendee({
            MeetingId: meetingId,
            ExternalUserId: v4(),
        })
    return attendeeInfo
}

// (5) メッセージングチャネル削除
export const deleteMessageChannelFromChimeBackend = async (messageChannelArn: string) => {
    const params = {
        ChannelArn: messageChannelArn,
        ChimeBearer: messagingAppInstanceAdminArn
    };
    const response = await chime.deleteChannel(params);
    console.log(`Delete Channel ${messageChannelArn}`, response)
}