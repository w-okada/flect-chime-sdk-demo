import { aws_lambda as lambda, Duration } from "aws-cdk-lib"
import { Construct } from 'constructs';

export const createLambdas = (scope: Construct, id: string) => {
    // (1) Base Parameters
    const baseParameters = {
        code: lambda.Code.fromAsset(`${__dirname}/dist`),
        runtime: lambda.Runtime.NODEJS_14_X,
        timeout: Duration.seconds(5),
        memorySize: 256,

    }

    // (2) Function
    //// (2-1) Auth
    const lambdaFuncRestAPIAuth = new lambda.Function(scope, "ChimeRESTAPIAuth", {
        ...baseParameters,
        handler: "rest_auth.authorize",
    });

    //// (2-2) Rest
    const lambdaFunctionForRestAPI: lambda.Function = new lambda.Function(scope, "funcHelloWorld", {
        ...baseParameters,
        handler: "index.handler",
    });

    //// (2-3) Slack Rest
    const lambdaFunctionForSlackFederationRestAPI: lambda.Function = new lambda.Function(scope, "funcSlackFederation", {
        ...baseParameters,
        handler: "slack.handler",
    });

    return { lambdaFuncRestAPIAuth, lambdaFunctionForRestAPI, lambdaFunctionForSlackFederationRestAPI }
}