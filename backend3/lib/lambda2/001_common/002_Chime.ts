import * as Chime from "@aws-sdk/client-chime"
import { ChannelMessagePersistenceType, ChannelMessageType } from "@aws-sdk/client-chime";
import { v4 } from "uuid";
import { ControlTypes } from "../messaging_format";
import { log } from "../util";


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
export const checkMeetingExistInChimeBackend = async (meetingId: string): Promise<boolean> => {
    try {
        const mid = await chime.getMeeting({ MeetingId: meetingId })
        log("checkMeetingExistInChimeBackend", "chime meeting info:", JSON.stringify(mid));
        return true
    } catch (err: any) {
        if (err.code == "NotFoundException") {
            log("checkMeetingExistInChimeBackend", "chime meeting exception, but this maybe happen when the meeting doesn't exist.");
        } else {
            log("checkMeetingExistInChimeBackend", "chime meeting exception:", err);
        }
        return false
    }
}

// (3) meeting参加
export const joinMeetingInChimeBackend = async (meetingId: string) => {
    log("joinMeetingInChimeBacken", "Adding new attendee");
    const attendeeInfo = await chime
        .createAttendee({
            MeetingId: meetingId,
            // ExternalUserId: sub, // 同一IDだと複数のmeetingに同時に入れない。
            ExternalUserId: v4(), // よって、ダミーを使う。
        })
    return attendeeInfo
}

// (4) メッセージングチャネル作成
export const createMessageChannelInChimeBackend = async (meetingName: string,) => {
    const params = {
        Name: `Ch.${meetingName}`,
        AppInstanceArn: messagingAppInstanceArn,
        ClientRequestToken: v4(),
        ChimeBearer: messagingAppInstanceAdminArn,
        Mode: 'RESTRICTED',
        Privacy: 'PRIVATE'
    };

    const response = await chime.createChannel(params);
    log("createMessageChannelInChimeBackend", "Message Channel Created:", JSON.stringify(response.ChannelArn));
    return response

}


// (5) メッセージングチャネル削除
export const deleteMessageChannelFromChimeBackend = async (messageChannelArn: string) => {
    const params = {
        ChannelArn: messageChannelArn,
        ChimeBearer: messagingAppInstanceAdminArn
    };
    const response = await chime.deleteChannel(params);
    log("deleteMessageChannelFromChimeBackend", `Delete Channel ${messageChannelArn}`, JSON.stringify(response))
}

// (6) Messaging APIにユーザ登録
export const createMessagingAPIUser = async (id: string, name: string) => {
    log("createMessagingAPIUser", "Generate Messaging Environment: ID, name:", id, name)

    // 既存のIDを検索。存在する場合はupdate ⇒ Userが多いとタイムアウトするためNG。直接アップデートしてエラーハンドリングする方式に変更
    // if (existId) {
    const userArn = `${messagingAppInstanceArn}/user/${id}`
    try {

        log("createMessagingAPIUser", "Generate Messaging Environment: Updating...:", userArn)
        const response = await chime
            .updateAppInstanceUser({
                AppInstanceUserArn: userArn,
                Name: name,
                Metadata: ""
            })
        log("createMessagingAPIUser", "Generate Messaging Environment: UserArn(Update)", JSON.stringify(response.AppInstanceUserArn))
        return response
    } catch (exception) {
        log("createMessagingAPIUser", `No existing app user ${userArn}`, exception)
        // 新規IDの登録⇒新規登録
        const response = await chime.createAppInstanceUser({
            AppInstanceArn: messagingAppInstanceArn,
            AppInstanceUserId: id,
            ClientRequestToken: v4(),
            Name: name,
        })
        log("createMessagingAPIUser", "Generate Messaging Environment: UserArn(New)", JSON.stringify(response.AppInstanceUserArn))
        return response
    }

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
    log("addUserToGlobalChannel", "Generate Messaging Environment: addUserToGlobalChannel", JSON.stringify(membershipResponse.Member))
    return membershipResponse
}


// (7) room チャンネルにユーザを追加
export const addUserToRoomChannel = async (roomChannelArn: string, appInstanceUserArn: string) => {
    const params = {
        ChannelArn: roomChannelArn,
        MemberArn: appInstanceUserArn,
        Type: 'DEFAULT',
        ChimeBearer: messagingAppInstanceAdminArn
    };

    const membershipResponse = await chime.createChannelMembership(params);
    log("addUserToRoomChannel", "Generate Messaging Environment: addUserToRoomChannel", JSON.stringify(membershipResponse.Member))
    return membershipResponse
}