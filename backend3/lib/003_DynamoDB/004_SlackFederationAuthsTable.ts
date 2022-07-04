import { aws_dynamodb as dynamo, RemovalPolicy } from "aws-cdk-lib"
import { Construct } from 'constructs';

///// Table format ///////////////
// TeamId : Slack Team ID
// Data : emcrypted auth data
////////////////////

export const createSlackFederationAuthsTable = (scope: Construct, id: string) => {
    const slackFederationAuthsTable = new dynamo.Table(scope, "slackFederationAuthsTable", {
        tableName: `${id}_SlackFederationAuthsTable`,
        partitionKey: {
            name: "TeamId",
            type: dynamo.AttributeType.STRING,
        },
        readCapacity: 2,
        writeCapacity: 2,
        removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
    });
    return { slackFederationAuthsTable }
}