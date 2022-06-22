import * as Chime from "@aws-sdk/client-chime"
import { ChannelMessagePersistenceType, ChannelMessageType } from "@aws-sdk/client-chime";
import { v4 } from "uuid";
import { ControlTypes } from "../messaging_format";


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
    await chime.sendChannelMessage({
        ChannelArn: messagingGlobalChannelArn,
        ClientRequestToken: v4(),
        Content: ControlTypes.RoomCreated,
        Type: ChannelMessageType.CONTROL,
        Persistence: ChannelMessagePersistenceType.NON_PERSISTENT,
        ChimeBearer: messagingAppInstanceAdminArn,
    })
    return newMeetingInfo
}

export const notifyMeetingDeletedFromChimeBackend = async () => {
    await chime.sendChannelMessage({
        ChannelArn: messagingGlobalChannelArn,
        ClientRequestToken: v4(),
        Content: ControlTypes.RoomDeleted,
        Type: ChannelMessageType.CONTROL,
        Persistence: ChannelMessagePersistenceType.NON_PERSISTENT,
        ChimeBearer: messagingAppInstanceAdminArn,
    })
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
            if (err.code == "NotFoundException") {
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
        ClientRequestToken: v4(),
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
export const createMessagingAPIUser = async (id: string, name: string) => {
    console.log("Generate Messaging Environment: ID, name:", id, name)

    // 既存のIDを検索。存在する場合はupdate ⇒ Userが多いとタイムアウトするためNG。直接アップデートしてエラーハンドリングする方式に変更
    // let listRes: Chime.ListAppInstanceUsersCommandOutput | null = null
    // let existId: string | null = null
    // let existMetadata: string | undefined = undefined
    // while (true) {
    //     const nextToken = (listRes && listRes.NextToken) ? listRes.NextToken : undefined
    //     listRes = await chime.listAppInstanceUsers({
    //         AppInstanceArn: messagingAppInstanceArn,
    //         // MaxResults: 50,
    //         NextToken: nextToken
    //     })
    //     console.log("APP USERS:", listRes.AppInstanceUsers)
    //     const exist = listRes.AppInstanceUsers?.find(x => {
    //         return x.AppInstanceUserArn?.endsWith(`/${id}`)
    //     })
    //     if (exist) {
    //         existId = exist.AppInstanceUserArn || null
    //         existMetadata = exist.Metadata
    //         break
    //     }
    //     if (!listRes.NextToken) {
    //         break
    //     }
    // }

    // // 既存IDが見つかった。⇒update
    // if (existId) {
    const userArn = `${messagingAppInstanceArn}/user/${id}`
    try {

        console.log("Generate Messaging Environment: Updating...:", userArn)
        const response = await chime
            .updateAppInstanceUser({
                AppInstanceUserArn: userArn,
                Name: name,
                Metadata: ""
            })
        console.log("Generate Messaging Environment: UserArn(Update)", response.AppInstanceUserArn)
        return response
    } catch (exception) {
        console.log(`No existing app user ${userArn}`, exception)
        // 新規IDの登録⇒新規登録
        const response = await chime.createAppInstanceUser({
            AppInstanceArn: messagingAppInstanceArn,
            AppInstanceUserId: id,
            ClientRequestToken: v4(),
            Name: name,
        })
        console.log("Generate Messaging Environment: UserArn(New)", response.AppInstanceUserArn)
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
    console.log("Generate Messaging Environment: addUserToGlobalChannel", JSON.stringify(membershipResponse.Member))
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
    console.log("Generate Messaging Environment: addUserToRoomChannel", JSON.stringify(membershipResponse.Member))
    return membershipResponse
}