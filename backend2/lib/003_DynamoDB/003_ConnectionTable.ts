import { aws_dynamodb as dynamo, RemovalPolicy } from "aws-cdk-lib"
import { Construct } from 'constructs';

///// Table format ///////////////
// MeetingId :
// AttendeeId :
// ConnectionId :
// TTL:
////////////////////

export const createConnectionTable = (scope: Construct, id: string) => {
    const connectionTable = new dynamo.Table(scope, "connectionTable", {
        tableName: `${id}_ConnectionTable`,
        partitionKey: {
            name: "MeetingId",
            type: dynamo.AttributeType.STRING,
        },
        sortKey: {
            name: "AttendeeId",
            type: dynamo.AttributeType.STRING,
        },
        readCapacity: 2,
        writeCapacity: 2,
        removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
    });
    return { connectionTable }
}