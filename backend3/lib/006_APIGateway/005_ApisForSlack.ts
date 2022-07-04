import { aws_apigateway as api } from "aws-cdk-lib"
import { aws_lambda as lambda } from "aws-cdk-lib";
import { addCorsOptions } from "./100_addCorsOptions";

export const createApisForSlack = (id: string, restApi: api.RestApi, lambdaFunctionForSlackFederationRestAPI: lambda.Function, corsOrigin: string) => {

    // (2) APIs
    //// (2-1) Get Root
    const root = restApi.root
    //// (2-2) APIs for Slack
    const apiSlack = root.addResource("slack");
    const apiSlackOAuthRedirect = apiSlack.addResource("oauth_redirect");
    const apiSlackInstall = apiSlack.addResource("install");
    const apiSlackEvents = apiSlack.addResource("events");
    const apiSlackApi = apiSlack.addResource("api");
    const apiSlackOperation = apiSlackApi.addResource("{operation}");
    apiSlackOAuthRedirect.addMethod("GET", new api.LambdaIntegration(lambdaFunctionForSlackFederationRestAPI), {
        operationName: `${id}_slackOAuthRedirect`,
    });
    apiSlackInstall.addMethod("GET", new api.LambdaIntegration(lambdaFunctionForSlackFederationRestAPI), {
        operationName: `${id}_slackInstall`,
    });
    apiSlackEvents.addMethod("POST", new api.LambdaIntegration(lambdaFunctionForSlackFederationRestAPI), {
        operationName: `${id}_slackEvents`,
    });
    apiSlackOperation.addMethod("POST", new api.LambdaIntegration(lambdaFunctionForSlackFederationRestAPI), {
        operationName: `${id}_slackApi`,
    });

    // (3) CORS Configuration
    [apiSlackOAuthRedirect, apiSlackInstall, apiSlackEvents, apiSlackOperation].forEach(func => {
        addCorsOptions(func, corsOrigin)
    })
}