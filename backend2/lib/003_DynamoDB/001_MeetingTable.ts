import { aws_dynamodb as dynamo, RemovalPolicy } from "aws-cdk-lib"
import { Construct } from 'constructs';

///// Table format ///////////////
// MeetingName :
// MeetingId:
// Meeting : information(AudioHostUrl, ScreenDataUrl, etc)
// Metadata :metadata(OwnerId, Region, StartTime)
// TTL:
////////////////////

export const createMeetingTable = (scope: Construct, id: string) => {
    const meetingTable = new dynamo.Table(scope, "meetingTable", {
        tableName: `${id}_MeetingTable`,
        partitionKey: {
            name: "MeetingName",
            type: dynamo.AttributeType.STRING,
        },
        readCapacity: 2,
        writeCapacity: 2,
        removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
    });

    meetingTable.addGlobalSecondaryIndex({
        indexName: "MeetingId",
        partitionKey: {
            name: "MeetingId",
            type: dynamo.AttributeType.STRING,
        },
        projectionType: dynamo.ProjectionType.ALL,
        readCapacity: 2,
        writeCapacity: 2,
    });

    return { meetingTable }

}