import { v4 } from "uuid";
import { getUserInfoFromDB } from "../001_common/001_DynamoDB";
import { BackendGetEnvironmentException, BackendGetEnvironmentExceptionType, BackendGetEnvironmentRequest, BackendGetEnvironmentResponse } from "../backend_request";

//// (1) Get Environment Info 
export const getEnvironment = async (req: BackendGetEnvironmentRequest): Promise<BackendGetEnvironmentResponse | BackendGetEnvironmentException> => {

    // (1) DBからユーザ情報を取得する
    const id = req.sub
    const userInfoInServer = await getUserInfoFromDB(id)
    if (!userInfoInServer) {
        return {
            code: BackendGetEnvironmentExceptionType.NO_USER_FOUND,
            exception: true,
        };
    }
    const res: BackendGetEnvironmentResponse = {
        exUserId: id,
        userInfoInServer: userInfoInServer
    }
    return res
};


