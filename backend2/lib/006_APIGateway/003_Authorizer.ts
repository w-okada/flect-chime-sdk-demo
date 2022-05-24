import { aws_apigateway as api } from "aws-cdk-lib"
import { Construct } from 'constructs';

export const createAuthorizer = (scope: Construct, id: string, restAPIAuthRoleArn: string, restApiId: string, authorizerFunctionUri: string) => {

    // (1) Custom Authorizer
    const authorizer = new api.CfnAuthorizer(scope, "apiAuthorizerLambda", {
        name: `${id}_authorizerLamda`,
        type: "TOKEN",
        identitySource: "method.request.header.X-Flect-Access-Token",
        restApiId: restApiId,
        authorizerCredentials: restAPIAuthRoleArn,
        authorizerUri: authorizerFunctionUri,
        authorizerResultTtlInSeconds: 0,
    });

    return { authorizer }

}