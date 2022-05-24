import { aws_apigateway as api } from "aws-cdk-lib"
export const addCorsOptions = (apiResource: api.IResource, corsOrigin: string) => {

    apiResource.addMethod(
        "OPTIONS",
        new api.MockIntegration({
            integrationResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent,X-Flect-Access-Token'",
                        "method.response.header.Access-Control-Allow-Origin": corsOrigin,
                        "method.response.header.Access-Control-Allow-Credentials": "'true'",
                        "method.response.header.Access-Control-Allow-Methods": "'OPTIONS,GET,PUT,POST,DELETE,PATCH,HEAD'",
                    },
                },
            ],
            passthroughBehavior: api.PassthroughBehavior.WHEN_NO_MATCH,
            requestTemplates: {
                "application/json": '{"statusCode": 200}',
            },
        }),
        {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": true,
                        "method.response.header.Access-Control-Allow-Methods": true,
                        "method.response.header.Access-Control-Allow-Credentials": true,
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        }
    );
};