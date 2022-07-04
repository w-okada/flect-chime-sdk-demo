import { aws_lambda as lambda, Duration, aws_lambda_nodejs } from "aws-cdk-lib"
import { Construct } from 'constructs';

import { aws_cloudformation as cf } from "aws-cdk-lib"
import { aws_iam as iam } from "aws-cdk-lib"

export const createCustomResource = (scope: Construct, id: string, policy: iam.PolicyStatement, nodeModulesLayer: lambda.LayerVersion) => {

    const baseParameters = {
        runtime: lambda.Runtime.NODEJS_14_X,
        timeout: Duration.seconds(5),
        memorySize: 128,
        bundling: {
            externalModules: [
                '@slack/bolt',
                'aws-serverless-express',
                'crypto',
                'node-fetch',
                'uuid',
                '@aws-sdk/client-api-gateway',
                '@aws-sdk/client-apigatewaymanagementapi',
                '@aws-sdk/client-chime',
                '@aws-sdk/client-cognito-identity-provider',
                '@aws-sdk/client-dynamodb',
                '@aws-sdk/client-sts'

            ],
        },
    }
    //// (a) custom resource
    const lambdaFunctionForMessagingCustomResource: lambda.Function = new aws_lambda_nodejs.NodejsFunction(scope, "funcMessagingCustomResource", {
        entry: `${__dirname}/../lambda-messaging/index.ts`,
        handler: "handler",
        ...baseParameters
    });
    lambdaFunctionForMessagingCustomResource.addToRolePolicy(policy)
    lambdaFunctionForMessagingCustomResource.addEnvironment("STACK_ID", id)
    lambdaFunctionForMessagingCustomResource.addLayers(nodeModulesLayer)

    const messagingCustomResource = new cf.CfnCustomResource(scope, 'function', {
        serviceToken: lambdaFunctionForMessagingCustomResource.functionArn
    });

    return { messagingCustomResource }
}