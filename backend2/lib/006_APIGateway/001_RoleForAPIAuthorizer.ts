import { aws_iam as iam } from "aws-cdk-lib"
import { aws_lambda as lambda } from "aws-cdk-lib"
import { Construct } from 'constructs';
export const createRoleForAPIAuthorizer = (scope: Construct, authFunc: lambda.Function) => {
    const roleForAPIAuthorizer = new iam.Role(scope, `ChimeRESTAPIRole`, {
        assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
    });
    const restAPIPolicy = new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: [authFunc.functionArn],
        actions: ["lambda:InvokeFunction"],
    });
    roleForAPIAuthorizer.addToPolicy(restAPIPolicy);

    return { roleForAPIAuthorizer }
}