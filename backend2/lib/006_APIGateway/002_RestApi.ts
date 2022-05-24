import { aws_apigateway as api } from "aws-cdk-lib"
import { Construct } from 'constructs';

export const createRestApi = (scope: Construct, id: string) => {

    // (1) RestAPI Container
    const restApi: api.RestApi = new api.RestApi(scope, "ChimeAPI", {
        restApiName: `${id}_restApi`,
    });

    return { restApi }
}