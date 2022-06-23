import { v4 } from "uuid";
import { getUserInfoFromDB, registerUserInfoIntoDB } from "../001_common/001_DynamoDB";
import { addUserToGlobalChannel, createMessagingAPIUser } from "../001_common/002_Chime";
import { assumedMessagingEnduserRole } from "../001_common/003_STS";
import { BackendGetEnvironmentRequest, BackendGetEnvironmentResponse, BackendGetEnvironmentsRequest, BackendGetEnvironmentsResponse, BackendPostEnvironmentsRequest, BackendPostEnvironmentsResponse } from "../backend_request";
import { UserInfoInServer } from "../http_request";

const messagingGlobalChannelArn = process.env.MESSAGING_GLOBAL_CHANNEL_ARN!;

//// (1) Get Environment Info 
export const getEnvironment = async (req: BackendGetEnvironmentRequest): Promise<BackendGetEnvironmentResponse> => {

    // (1) DBからユーザ情報を取得する
    const id = req.sub
    const userInfoInServer = await getUserInfoFromDB(id)

    const res: BackendGetEnvironmentResponse = {
        globalUserId: id,
        userInfoInServer: userInfoInServer || {
            lastUpdate: 0
        }
    }
    return res
};


