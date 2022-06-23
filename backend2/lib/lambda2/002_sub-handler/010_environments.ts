import { v4 } from "uuid";
import { registerUserInfoIntoDB } from "../001_common/001_DynamoDB";
import { addUserToGlobalChannel, createMessagingAPIUser } from "../001_common/002_Chime";
import { assumedMessagingEnduserRole } from "../001_common/003_STS";
import { BackendGetEnvironmentsRequest, BackendGetEnvironmentsResponse, BackendPostEnvironmentsRequest, BackendPostEnvironmentsResponse } from "../backend_request";
import { UserInfoInServer } from "../http_request";

const messagingGlobalChannelArn = process.env.MESSAGING_GLOBAL_CHANNEL_ARN!;

//// (1) Get Environment Info (Get)
export const getEnvironments = async (req: BackendGetEnvironmentsRequest): Promise<BackendGetEnvironmentsResponse> => {

    // (1) Credentialを取得
    const assumedRoleResponse = await assumedMessagingEnduserRole()

    // (2) MessagingAPIにユーザ登録
    const id = req.sub
    const name = req.sub // getEnvironmentを使用することになるときに再考

    const createUserResponse = await createMessagingAPIUser(id, name)

    // (3) グローバルチャンネルにユーザを追加
    const membershipResponse = await addUserToGlobalChannel(createUserResponse.AppInstanceUserArn!)
    console.log("Generate Messaging Environment: addToGlobal", JSON.stringify(membershipResponse.Member))

    const res: BackendGetEnvironmentsResponse = {
        globalChannelArn: messagingGlobalChannelArn,
        credential: assumedRoleResponse.Credentials!,
        appInstanceUserArn: createUserResponse.AppInstanceUserArn!,
    }
    return res
};

//// (2) Post Environment Info (Post)
export const postEnvironments = async (req: BackendPostEnvironmentsRequest): Promise<BackendPostEnvironmentsResponse> => {

    // (1) Credentialを取得
    const assumedRoleResponse = await assumedMessagingEnduserRole()

    // (2) MessagingAPIにユーザ登録
    const id = req.sub
    const name = req.username
    const createUserResponse = await createMessagingAPIUser(id, name)

    // (3) グローバルチャンネルにユーザを追加
    const membershipResponse = await addUserToGlobalChannel(createUserResponse.AppInstanceUserArn!)
    console.log("Generate Messaging Environment: addToGlobal", JSON.stringify(membershipResponse.Member))

    // (4) DBに情報を追加
    const userInfoInServer: UserInfoInServer = {
        lastUpdate: new Date().getTime()
    }
    await registerUserInfoIntoDB(req.sub, userInfoInServer)

    const res: BackendPostEnvironmentsResponse = {
        globalChannelArn: messagingGlobalChannelArn,
        credential: assumedRoleResponse.Credentials!,
        appInstanceUserArn: createUserResponse.AppInstanceUserArn!,
        globalUserId: id,
        userInfoInServer: userInfoInServer
    }
    return res
};


