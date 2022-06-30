import { aws_iam as iam } from "aws-cdk-lib"
import { Construct } from 'constructs';
import { aws_s3 as s3 } from "aws-cdk-lib"

export const createMessagingUserRole = (scope: Construct, id: string, restApiRole: iam.Role) => {
    const messagingPolicyForClient = new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
            "chime:GetMessagingSessionEndpoint",
            "chime:SendChannelMessage",
            "chime:ListChannelMessages",
            "chime:Connect",

            "sts:TagSession",
            "sts:AssumeRole",

            "s3:PutObject",
        ],
        resources: [
            "arn:aws:iam::131190205683:*",
            "*"
        ]
    });


    // restAPIのRole に assumeRoleを許可する
    const messagingRoleForClient = new iam.Role(scope, `ChimeMessageRole2_${id}`, {
        assumedBy: new iam.ArnPrincipal(restApiRole.roleArn).withSessionTags()
    })
    messagingRoleForClient.addToPolicy(messagingPolicyForClient)

    return { messagingRoleForClient }

}