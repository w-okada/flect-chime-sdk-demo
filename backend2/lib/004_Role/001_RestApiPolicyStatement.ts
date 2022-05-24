
import { aws_cognito as cognito } from "aws-cdk-lib"
import { aws_iam as iam } from "aws-cdk-lib"

export const createRestApiPolicyStatement = (userPoolArn: string) => {
    const restApiPolicyStatement = new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
            "cognito-idp:GetUser",
            "cognito-idp:AdminGetUser",

            "chime:CreateMeeting",
            "chime:DeleteMeeting",
            "chime:GetMeeting",
            "chime:ListMeetings",
            "chime:BatchCreateAttendee",
            "chime:CreateAttendee",
            "chime:DeleteAttendee",
            "chime:GetAttendee",
            "chime:ListAttendees",
            "chime:StartMeetingTranscription",
            "chime:StopMeetingTranscription",

            "execute-api:ManageConnections",

            "ecs:RunTask",
            "ecs:DescribeTasks",
            "ecs:UpdateService",
            "ecs:DescribeServices",

            `ec2:DescribeNetworkInterfaces`,

            "iam:PassRole"
        ],
        resources: [
            userPoolArn,
            "arn:*:chime::*:meeting/*",
            "arn:aws:execute-api:*:*:**/@connections/*",
            "arn:aws:ecs:*",
            "arn:aws:iam::*:*",
            "*"
        ]
    });

    return { restApiPolicyStatement }
}