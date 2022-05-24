import { aws_iam as iam } from "aws-cdk-lib"
import { aws_lambda as lambda } from "aws-cdk-lib"
import { Construct } from 'constructs';

export const createRoleForWebsocketAuthorizer = (scope: Construct, authFuncArn: string) => {
    const roleForWebsocketAuthorizer = new iam.Role(scope, `ChimeMessageAPIRole`, {
        assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
    });
    const websocketPolicy = new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: [authFuncArn],
        actions: ["lambda:InvokeFunction"],
    });
    roleForWebsocketAuthorizer.addToPolicy(websocketPolicy);

    return { roleForWebsocketAuthorizer }
}