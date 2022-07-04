
import { aws_iam as iam } from "aws-cdk-lib"
import { Construct } from 'constructs';
export const createRestApiPolicyStatement = (scope: Construct, userPoolArn: string) => {
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

            "iam:PassRole",


            // Messaging
            "chime:CreateAppInstanceUser",
            "chime:GetMessagingSessionEndpoint",
            "chime:CreateChannelMembership",
            "chime:CreateChannel",
            "chime:*",
            "iam:*",
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents",

            "sts:TagSession",
            "sts:AssumeRole"
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


    const restApiRole = new iam.Role(scope, `ChimeRestAPIRole`, {
        assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    })
    restApiRole.addToPolicy(restApiPolicyStatement)


    return { restApiPolicyStatement, restApiRole }
}