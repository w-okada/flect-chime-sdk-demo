import { aws_apigatewayv2 as v2 } from "aws-cdk-lib"
import { aws_apigateway as api } from "aws-cdk-lib"
import { aws_iam as iam } from "aws-cdk-lib"
import { Construct, DependencyGroup } from 'constructs';

export const createMessages = (scope: Construct, webSocketApiId: string, roleForWebsocketAuthorizerArn: string, region: string, connectFuncArn: string, disconnectFuncArn: string, messageFuncArn: string, authorizerRef: string) => {

    // (1) Integration
    const connectIntegration = new v2.CfnIntegration(scope, "ChimeMessageAPIConnectIntegration", {
        apiId: webSocketApiId,
        integrationType: "AWS_PROXY",
        integrationUri: "arn:aws:apigateway:" + region + ":lambda:path/2015-03-31/functions/" + connectFuncArn + "/invocations",
        credentialsArn: roleForWebsocketAuthorizerArn,
    });

    const disconnectIntegration = new v2.CfnIntegration(scope, "ChimeMessageAPIDisconnectIntegration", {
        apiId: webSocketApiId,
        integrationType: "AWS_PROXY",
        integrationUri: "arn:aws:apigateway:" + region + ":lambda:path/2015-03-31/functions/" + disconnectFuncArn + "/invocations",
        credentialsArn: roleForWebsocketAuthorizerArn,
    });

    const messageIntegration = new v2.CfnIntegration(scope, "ChimeMessageAPIMessageIntegration", {
        apiId: webSocketApiId,
        integrationType: "AWS_PROXY",
        integrationUri: "arn:aws:apigateway:" + region + ":lambda:path/2015-03-31/functions/" + messageFuncArn + "/invocations",
        credentialsArn: roleForWebsocketAuthorizerArn,
    });

    // (2) Route
    const connectRoute = new v2.CfnRoute(scope, "connectRoute", {
        apiId: webSocketApiId,
        routeKey: "$connect",
        authorizationType: api.AuthorizationType.CUSTOM,
        target: "integrations/" + connectIntegration.ref,
        authorizerId: authorizerRef,
    });

    const disconnectRoute = new v2.CfnRoute(scope, "disconnectRoute", {
        apiId: webSocketApiId,
        routeKey: "$disconnect",
        authorizationType: "NONE",
        target: "integrations/" + disconnectIntegration.ref,
    });

    const messageRoute = new v2.CfnRoute(scope, "messageRoute", {
        apiId: webSocketApiId,
        routeKey: "sendmessage",
        authorizationType: "NONE",
        target: "integrations/" + messageIntegration.ref,
    });

    // (3) Deploy
    const deployment = new v2.CfnDeployment(scope, "ChimeMessageAPIDep", {
        apiId: webSocketApiId,
    });

    const stage = new v2.CfnStage(scope, `ChimeMessageAPIStage`, {
        apiId: webSocketApiId,
        autoDeploy: true,
        deploymentId: deployment.ref,
        stageName: "Prod",
    });

    const dependencies = new DependencyGroup();
    dependencies.add(connectRoute);
    dependencies.add(disconnectRoute);
    dependencies.add(messageRoute);
    deployment.node.addDependency(dependencies);

}