import * as Chime from "@aws-sdk/client-chime"

const messagingAppInstanceAdminArn = process.env.MESSAGING_APP_INSTANCE_ADMIN_ARN!;
const messagingAppInstanceArn = process.env.MESSAGING_APP_INSTANCE_ARN!
const messagingGlobalChannelArn = process.env.MESSAGING_GLOBAL_CHANNEL_ARN!;
import { v4 } from "uuid";
import { ControlTypes } from "../messaging_format";
import { ChannelMessagePersistenceType, ChannelMessageType } from "@aws-sdk/client-chime";

const chime = new Chime.Chime({ region: process.env.AWS_REGION });


export const notifyRoomRegistered = async () => {
    await chime.sendChannelMessage({
        ChannelArn: messagingGlobalChannelArn,
        ClientRequestToken: v4(),
        Content: ControlTypes.RoomRegistered,
        Type: ChannelMessageType.CONTROL,
        Persistence: ChannelMessagePersistenceType.NON_PERSISTENT,
        ChimeBearer: messagingAppInstanceAdminArn,
    })
}


export const notifyRoomStarted = async () => {
    await chime.sendChannelMessage({
        ChannelArn: messagingGlobalChannelArn,
        ClientRequestToken: v4(),
        Content: ControlTypes.RoomStarted,
        Type: ChannelMessageType.CONTROL,
        Persistence: ChannelMessagePersistenceType.NON_PERSISTENT,
        ChimeBearer: messagingAppInstanceAdminArn,
    })
}


export const notifyRoomEnded = async () => {
    await chime.sendChannelMessage({
        ChannelArn: messagingGlobalChannelArn,
        ClientRequestToken: v4(),
        Content: ControlTypes.RoomEnded,
        Type: ChannelMessageType.CONTROL,
        Persistence: ChannelMessagePersistenceType.NON_PERSISTENT,
        ChimeBearer: messagingAppInstanceAdminArn,
    })
}

export const notifyRoomDeleted = async () => {
    await chime.sendChannelMessage({
        ChannelArn: messagingGlobalChannelArn,
        ClientRequestToken: v4(),
        Content: ControlTypes.RoomDeleted,
        Type: ChannelMessageType.CONTROL,
        Persistence: ChannelMessagePersistenceType.NON_PERSISTENT,
        ChimeBearer: messagingAppInstanceAdminArn,
    })
}

