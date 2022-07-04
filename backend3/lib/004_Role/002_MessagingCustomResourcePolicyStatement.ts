
import { aws_iam as iam } from "aws-cdk-lib"

export const creatMessagingCustomResourcePolicyStatement = () => {
    const messagingPolicyForCreateCustomResource = new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
            "chime:CreateAppInstance",
            "chime:CreateAppInstanceUser",
            "chime:CreateAppInstanceAdmin",

            "chime:CreateChannel",
        ],
        resources: [
            "*"
        ]
    });

    return { messagingPolicyForCreateCustomResource }
}