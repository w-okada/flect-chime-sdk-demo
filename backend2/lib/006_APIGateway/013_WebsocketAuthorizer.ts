import { aws_apigatewayv2 as v2 } from "aws-cdk-lib"
import { aws_iam as iam } from "aws-cdk-lib"
import { Construct } from 'constructs';

export const createWebsocketAuthorizer = (scope: Construct, id: string, roleForWebsocketAuthorizer: iam.Role, webSocketApi: v2.CfnApi, authorizerFunctionUri: string) => {

    const websocketAuthorizer = new v2.CfnAuthorizer(scope, "messageAuthorizer", {
        name: `${id}_authorizer`,
        authorizerType: "REQUEST",
        identitySource: [],
        apiId: webSocketApi.ref,
        authorizerUri: authorizerFunctionUri,
        authorizerCredentialsArn: roleForWebsocketAuthorizer.roleArn,
    });

    return { websocketAuthorizer }

}