import { v4 } from "uuid";
import { addUserToGlobalChannel, createMessagingAPIUser } from "../001_common/002_Chime";
import { assumedMessagingEnduserRole } from "../001_common/003_STS";
import { BackendGetEnvironmentRequest, BackendGetEnvironmentResponse, BackendPostEnvironmentRequest, BackendPostEnvironmentResponse } from "../backend_request";

const messagingGlobalChannelArn = process.env.MESSAGING_GLOBAL_CHANNEL_ARN!;

//// (1) Get Environment Info (Get)
export const getEnvironment = async (req: BackendGetEnvironmentRequest): Promise<BackendGetEnvironmentResponse> => {

    // (1) Credentialを取得
    const assumedRoleResponse = await assumedMessagingEnduserRole()

    // (2) MessagingAPIにユーザ登録
    const createUserResponse = await createMessagingAPIUser(req.email)

    // (3) グローバルチャンネルにユーザを追加
    const membershipResponse = await addUserToGlobalChannel(createUserResponse.AppInstanceUserArn!)
    console.log("Generate Messaging Environment: addToGlobal", JSON.stringify(membershipResponse.Member))

    const res: BackendGetEnvironmentResponse = {
        globalChannelArn: messagingGlobalChannelArn,
        credential: assumedRoleResponse.Credentials!,
        appInstanceUserArn: createUserResponse.AppInstanceUserArn!,
    }
    return res
};

//// (2) Post Environment Info (Post)
export const postEnvironment = async (req: BackendPostEnvironmentRequest): Promise<BackendPostEnvironmentResponse> => {

    // (1) Credentialを取得
    const assumedRoleResponse = await assumedMessagingEnduserRole()

    // (2) MessagingAPIにユーザ登録
    const globalUserId = `${v4()}_${req.username}`
    const createUserResponse = await createMessagingAPIUser(globalUserId)

    // (3) グローバルチャンネルにユーザを追加
    const membershipResponse = await addUserToGlobalChannel(createUserResponse.AppInstanceUserArn!)
    console.log("Generate Messaging Environment: addToGlobal", JSON.stringify(membershipResponse.Member))

    const res: BackendPostEnvironmentResponse = {
        globalChannelArn: messagingGlobalChannelArn,
        credential: assumedRoleResponse.Credentials!,
        appInstanceUserArn: createUserResponse.AppInstanceUserArn!,
        globalUserId: globalUserId,
    }
    return res
};
