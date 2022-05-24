import { aws_apigatewayv2 as v2 } from "aws-cdk-lib"
import { Construct } from 'constructs';

export const createWebsocket = (scope: Construct) => {

    // (1) Websocket Container
    const webSocketApi = new v2.CfnApi(scope, "ChimeMessageAPI", {
        name: "ChimeMessageAPI",
        protocolType: "WEBSOCKET",
        routeSelectionExpression: "$request.body.action",
    });

    return { webSocketApi }
}