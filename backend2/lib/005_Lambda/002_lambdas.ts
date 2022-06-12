import { aws_lambda as lambda, Duration, aws_lambda_nodejs } from "aws-cdk-lib"
import { Construct } from 'constructs';
import { aws_iam as iam } from "aws-cdk-lib"

export const createLambdas = (scope: Construct, restApiRole: iam.Role) => {

    // (1) Base Parameters
    const baseParameters = {
        runtime: lambda.Runtime.NODEJS_14_X,
        timeout: Duration.seconds(5),
        memorySize: 128,
        role: restApiRole,
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

    // (2) Function
    //// (2-1) Auth
    const lambdaFuncRestAPIAuth: lambda.Function = new aws_lambda_nodejs.NodejsFunction(scope, "ChimeRESTAPIAuth", {
        entry: `${__dirname}/../lambda2/rest_auth.ts`,
        handler: "authorize",
        ...baseParameters
    });

    //// (2-2) Rest
    const lambdaFunctionForRestAPI: lambda.Function = new aws_lambda_nodejs.NodejsFunction(scope, "funcHelloWorld", {
        entry: `${__dirname}/../lambda2/index.ts`,
        handler: "handler",
        ...baseParameters
    });

    //// (2-3) Slack Rest
    const lambdaFunctionForSlackFederationRestAPI: lambda.Function = new aws_lambda_nodejs.NodejsFunction(scope, "funcSlackFederation", {
        entry: `${__dirname}/../lambda2/federation/slack/slack.ts`,
        handler: "handler",
        ...baseParameters
    });

    return { lambdaFuncRestAPIAuth, lambdaFunctionForRestAPI, lambdaFunctionForSlackFederationRestAPI }
}