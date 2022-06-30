import { aws_iam as iam } from "aws-cdk-lib"
import { Construct } from 'constructs';
import { aws_s3 as s3 } from "aws-cdk-lib"

export const createMessagingUserRole = (scope: Construct, id: string, restApiRole: iam.Role, frontendBucket: s3.Bucket) => {
    const messagingPolicyForClient = new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
            "chime:GetMessagingSessionEndpoint",
            "chime:SendChannelMessage",
            "chime:ListChannelMessages",
            "chime:Connect",

            "sts:TagSession",
            "sts:AssumeRole",

            "s3:DeleteObject",
            "s3:GetObject",
            "s3:ListBucket",
            "s3:PutObject",
            "s3:PutObjectAcl"
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





    const myBucketPolicy = new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["s3:GetObject", "s3:PutObject"],
        principals: [messagingRoleForClient],
        resources: [frontendBucket.bucketArn + "/*"],
    });
    frontendBucket.addToResourcePolicy(myBucketPolicy);








    return { messagingRoleForClient }

}