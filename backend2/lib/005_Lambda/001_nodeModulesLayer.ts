import { aws_lambda as lambda } from "aws-cdk-lib"
import { Code } from "aws-cdk-lib/aws-lambda";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from 'constructs';

export const createNodeModulesLayer = (scope: Construct, id: string) => {
    const nodeModulesLayer = new lambda.LayerVersion(scope, "NodeModulesLayer", {
        layerVersionName: `${id}_LambdaLayer`,
        code: lambda.AssetCode.fromAsset(`${__dirname}/layer`),
        compatibleRuntimes: [lambda.Runtime.NODEJS_14_X],
    });


    return { nodeModulesLayer }
}