import { aws_lambda as lambda, Duration } from "aws-cdk-lib"
import { Construct } from 'constructs';

export const createLambdaForWebsocket = (scope: Construct, id: string) => {
    // (1) Base Parameters
    const baseParameters = {
        code: lambda.Code.fromAsset(`${__dirname}/../dist`),
        runtime: lambda.Runtime.NODEJS_14_X,
        timeout: Duration.seconds(30),
        memorySize: 256,
    }

    // (2) Functions
    // (2-1) connect
    const lambdaFuncMessageConnect = new lambda.Function(scope, "ChimeMessageAPIConnect", {
        ...baseParameters,
        handler: "message.connect",
    });

    // (2-2) disconnect
    const lambdaFuncMessageDisconnect = new lambda.Function(scope, "ChimeMessageAPIDisconnect", {
        ...baseParameters,
        handler: "message.disconnect",
    });

    // (2-3) message
    const lambdaFuncMessageMessage = new lambda.Function(scope, "ChimeMessageAPIMessage", {
        ...baseParameters,
        handler: "message.message",
    });

    // (2-4) auth
    const lambdaFuncMessageAuth = new lambda.Function(scope, "ChimeMessageAPIAuth", {
        ...baseParameters,
        handler: "message.authorize",
    });

    return {
        lambdaFuncMessageConnect,
        lambdaFuncMessageDisconnect,
        lambdaFuncMessageMessage,
        lambdaFuncMessageAuth
    }
}