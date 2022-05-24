import { aws_apigateway as api } from "aws-cdk-lib"
import { aws_iam as iam } from "aws-cdk-lib"
import { Construct } from 'constructs';

export const createAuthorizer = (scope: Construct, id: string, restAPIAuthRole: iam.Role, restApi: api.RestApi, authorizerFunctionUri: string) => {

    // (1) Custom Authorizer
    const authorizer = new api.CfnAuthorizer(scope, "apiAuthorizerLambda", {
        name: `${id}_authorizerLamda`,
        type: "TOKEN",
        identitySource: "method.request.header.X-Flect-Access-Token",
        restApiId: restApi.restApiId,
        authorizerCredentials: restAPIAuthRole.roleArn,
        authorizerUri: authorizerFunctionUri,
        authorizerResultTtlInSeconds: 0,
    });

    return { authorizer }

}