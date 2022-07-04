import { aws_iam as iam } from "aws-cdk-lib"
import { aws_lambda as lambda } from "aws-cdk-lib"
import { Construct } from 'constructs';
export const createRoleForAPIAuthorizer = (scope: Construct, authFuncArn: string) => {
    const roleForAPIAuthorizer = new iam.Role(scope, `ChimeRESTAPIRole`, {
        assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
    });
    const restAPIPolicy = new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: [authFuncArn],
        actions: ["lambda:InvokeFunction"],
    });
    roleForAPIAuthorizer.addToPolicy(restAPIPolicy);

    return { roleForAPIAuthorizer }
}