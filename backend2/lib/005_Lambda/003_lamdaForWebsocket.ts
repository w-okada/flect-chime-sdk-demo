import { aws_lambda as lambda, Duration, aws_lambda_nodejs } from "aws-cdk-lib"
import { Construct } from 'constructs';


export const createLambdaForWebsocket = (scope: Construct) => {
    // (1) Base Parameters
    const baseParameters = {
        code: lambda.Code.fromAsset(`${__dirname}/../dist`),
        runtime: lambda.Runtime.NODEJS_14_X,
        timeout: Duration.seconds(30),
        memorySize: 256,
    }

    // (2) Functions
    // (2-1) connect
    // const lambdaFuncMessageConnect = new lambda.Function(scope, "ChimeMessageAPIConnect", {
    //     ...baseParameters,
    //     handler: "message.connect",
    // });

    const lambdaFuncMessageConnect: lambda.Function = new aws_lambda_nodejs.NodejsFunction(scope, "ChimeMessageAPIConnect", {
        runtime: lambda.Runtime.NODEJS_14_X,
        timeout: Duration.seconds(900),
        memorySize: 256,
        entry: `${__dirname}/../lambda2/message.ts`,
        handler: "connect",
        bundling: {
            externalModules: [
                '@aws-sdk/client-api-gateway',
                '@aws-sdk/client-apigatewaymanagementapi',
                '@aws-sdk/client-chime',
                '@aws-sdk/client-cognito-identity-provider',
                '@aws-sdk/client-dynamodb',
            ],
        },
    });


    // (2-2) disconnect
    // const lambdaFuncMessageDisconnect = new lambda.Function(scope, "ChimeMessageAPIDisconnect", {
    //     ...baseParameters,
    //     handler: "message.disconnect",
    // });
    const lambdaFuncMessageDisconnect: lambda.Function = new aws_lambda_nodejs.NodejsFunction(scope, "ChimeMessageAPIDisconnect", {
        runtime: lambda.Runtime.NODEJS_14_X,
        timeout: Duration.seconds(900),
        memorySize: 256,
        entry: `${__dirname}/../lambda2/message.ts`,
        handler: "disconnect",
        bundling: {
            externalModules: [
                '@aws-sdk/client-api-gateway',
                '@aws-sdk/client-apigatewaymanagementapi',
                '@aws-sdk/client-chime',
                '@aws-sdk/client-cognito-identity-provider',
                '@aws-sdk/client-dynamodb',
            ],
        },
    });



    // (2-3) message
    // const lambdaFuncMessageMessage = new lambda.Function(scope, "ChimeMessageAPIMessage", {
    //     ...baseParameters,
    //     handler: "message.message",
    // });

    const lambdaFuncMessageMessage: lambda.Function = new aws_lambda_nodejs.NodejsFunction(scope, "ChimeMessageAPIMessage", {
        runtime: lambda.Runtime.NODEJS_14_X,
        timeout: Duration.seconds(900),
        memorySize: 256,
        entry: `${__dirname}/../lambda2/message.ts`,
        handler: "message",
        bundling: {
            externalModules: [
                '@aws-sdk/client-api-gateway',
                '@aws-sdk/client-apigatewaymanagementapi',
                '@aws-sdk/client-chime',
                '@aws-sdk/client-cognito-identity-provider',
                '@aws-sdk/client-dynamodb',
            ],
        },
    });

    // (2-4) auth
    // const lambdaFuncMessageAuth = new lambda.Function(scope, "ChimeMessageAPIAuth", {
    //     ...baseParameters,
    //     handler: "message.authorize",
    // });
    const lambdaFuncMessageAuth: lambda.Function = new aws_lambda_nodejs.NodejsFunction(scope, "ChimeMessageAPIAuth", {
        runtime: lambda.Runtime.NODEJS_14_X,
        timeout: Duration.seconds(900),
        memorySize: 256,
        entry: `${__dirname}/../lambda2/message.ts`,
        handler: "authorize",
        bundling: {
            externalModules: [
                '@aws-sdk/client-api-gateway',
                '@aws-sdk/client-apigatewaymanagementapi',
                '@aws-sdk/client-chime',
                '@aws-sdk/client-cognito-identity-provider',
                '@aws-sdk/client-dynamodb',
            ],
        },
    });



    return {
        lambdaFuncMessageConnect,
        lambdaFuncMessageDisconnect,
        lambdaFuncMessageMessage,
        lambdaFuncMessageAuth
    }
}