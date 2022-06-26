
import * as STS from "@aws-sdk/client-sts"
const sts = new STS.STS({ region: process.env.AWS_REGION });
import { v4 } from "uuid";

const messagingAppInstanceArn = process.env.MESSAGING_APP_INSTANCE_ARN!;
const messagingAppInstanceAdminArn = process.env.MESSAGING_APP_INSTANCE_ADMIN_ARN!;
const messagingRoleForClient = process.env.MESSAGING_ROLE_FOR_CLIENT

// (1) Messaging APIエンドユーザ向けクレデンシャルを発行
export const assumedMessagingEnduserRole = async () => {
    const assumedRoleResponse = await sts.assumeRole({
        RoleArn: messagingRoleForClient,
        RoleSessionName: `chime_${v4()}`,
        DurationSeconds: 3600,
        Tags: [
            {
                Key: 'UserUUID',
                Value: `chime_${v4()}`
            }
        ]
    })
    console.log("Generate Messaging Environment: Cred")
    return assumedRoleResponse
}