import { aws_iam as iam } from "aws-cdk-lib"
import { Construct } from 'constructs';

export const createMessagingUserRole = (scope: Construct, id: string, restApiRole: iam.Role) => {
    const messagingPolicyForClient = new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
            "chime:GetMessagingSessionEndpoint",
            "chime:SendChannelMessage",
            "chime:ListChannelMessages",
            "chime:Connect",

            "sts:TagSession",
            "sts:AssumeRole"
        ],
        resources: [
            "arn:aws:iam::131190205683:*",
            "*"
        ]
    });



    const messagingRoleForClient = new iam.Role(scope, `ChimeMessageRole2_${id}`, {
        assumedBy: new iam.ArnPrincipal(restApiRole.roleArn).withSessionTags()
    })
    messagingRoleForClient.addToPolicy(messagingPolicyForClient)

    return { messagingRoleForClient }

}