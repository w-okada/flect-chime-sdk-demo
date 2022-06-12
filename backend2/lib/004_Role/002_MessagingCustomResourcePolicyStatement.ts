
import { aws_iam as iam } from "aws-cdk-lib"

export const creatMessagingCustomResourcePolicyStatement = () => {
    const messagingPolicyForCreateCustomResource = new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
            "chime:CreateAppInstance",
            // "chime:DescribeAppInstance",
            // "chime:ListAppInstances",
            // "chime:UpdateAppInstance",
            // "chime:DeleteAppInstance",
            "chime:CreateAppInstanceUser",
            // "chime:DeleteAppInstanceUser",
            // "chime:ListAppInstanceUsers",
            // "chime:UpdateAppInstanceUser",
            // "chime:DescribeAppInstanceUser",
            "chime:CreateAppInstanceAdmin",
            // "chime:DescribeAppInstanceAdmin",
            // "chime:ListAppInstanceAdmins",
            // "chime:DeleteAppInstanceAdmin",
            // "chime:PutAppInstanceRetentionSettings",
            // "chime:GetAppInstanceRetentionSettings",
            // "chime:PutAppInstanceStreamingConfigurations",
            // "chime:GetAppInstanceStreamingConfigurations",
            // "chime:DeleteAppInstanceStreamingConfigurations",
            // "chime:TagResource",
            // "chime:UntagResource",
            // "chime:ListTagsForResource",

            // "chime:CreateChannel",
            // "iam:*",

            // "logs:CreateLogGroup",
            // "logs:CreateLogStream",
            // "logs:PutLogEvents",
        ],
        resources: [
            "*"
        ]
    });

    return { messagingPolicyForCreateCustomResource }
}