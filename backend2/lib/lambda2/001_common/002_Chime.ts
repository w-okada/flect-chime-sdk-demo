import * as Chime from "@aws-sdk/client-chime"
import { v4 } from "uuid";


const messagingAppInstanceAdminArn = process.env.MESSAGING_APP_INSTANCE_ADMIN_ARN!;
const messagingAppInstanceArn = process.env.MESSAGING_APP_INSTANCE_ARN!
const messagingGlobalChannelArn = process.env.MESSAGING_GLOBAL_CHANNEL_ARN!;

const chime = new Chime.Chime({ region: process.env.AWS_REGION });



// (1) ミーティング作成
export const createMeetingInChimeBackend = async (region: string) => {
    const request: Chime.CreateMeetingRequest = {
        ClientRequestToken: v4(),
        MediaRegion: region,
    };
    const newMeetingInfo = await chime.createMeeting(request);
    return newMeetingInfo
}

// (2) Chimeのバックエンドに会議室の存在確認。
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

// (3) meeting参加
export const joinMeetingInChimeBackend = async (meetingId: string) => {
    console.info("Adding new attendee");
    const attendeeInfo = await chime
        .createAttendee({
            MeetingId: meetingId,
            ExternalUserId: v4(),
        })
    return attendeeInfo
}

// (4) メッセージングチャネル作成
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


// (5) メッセージングチャネル削除
export const deleteMessageChannelFromChimeBackend = async (messageChannelArn: string) => {
    const params = {
        ChannelArn: messageChannelArn,
        ChimeBearer: messagingAppInstanceAdminArn
    };
    const response = await chime.deleteChannel(params);
    console.log(`Delete Channel ${messageChannelArn}`, response)
}

// (6) Messaging APIにユーザ登録
export const createMessagingAPIUser = async (email: string) => {
    const createUserResponse = await chime
        .createAppInstanceUser({
            AppInstanceArn: messagingAppInstanceArn,
            AppInstanceUserId: email,
            ClientRequestToken: v4(),
            Name: email
        })
    console.log("Generate Messaging Environment: UserArn", createUserResponse.AppInstanceUserArn)
    return createUserResponse
}

// (7) Global チャンネルにユーザを追加
export const addUserToGlobalChannel = async (appInstanceUserArn: string) => {
    const params = {
        ChannelArn: messagingGlobalChannelArn,
        MemberArn: appInstanceUserArn,
        Type: 'DEFAULT',
        ChimeBearer: messagingAppInstanceAdminArn
    };

    const membershipResponse = await chime.createChannelMembership(params);
    console.log("Generate Messaging Environment: addToGlobal", JSON.stringify(membershipResponse.Member))
    return membershipResponse
}