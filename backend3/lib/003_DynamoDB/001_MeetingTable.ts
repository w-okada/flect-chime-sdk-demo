import { aws_dynamodb as dynamo, RemovalPolicy } from "aws-cdk-lib"
import { Construct } from 'constructs';

///// Table format ///////////////
// MeetingName :
// MeetingId:
// Meeting : information(AudioHostUrl, ScreenDataUrl, etc)
// Metadata :metadata(OwnerId, Region, StartTime)
// TTL:
////////////////////

export const createMeetingTable2 = (scope: Construct, id: string) => {
    const meetingTable = new dynamo.Table(scope, "meetingTable2", {
        tableName: `${id}_MeetingTable2`,
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

///// Table format ///////////////
// ExMeetingId: Partition key
// StartTime:   Sort key
// MeetingId:
// MeetingName:
// OwnerId:
// Deleted:
// Ended:
// Metadata :metadata(OwnerId, Region, StartTime)
// Meeting : information(AudioHostUrl, ScreenDataUrl, etc)
// TTL:
////////////////////
export const createMeetingTable = (scope: Construct, id: string) => {
    const meetingTable = new dynamo.Table(scope, "meetingTable", {
        tableName: `${id}_MeetingTable`,
        partitionKey: {
            name: "Meeting",
            type: dynamo.AttributeType.STRING,
        },
        sortKey: {
            name: "ExMeetingId",
            type: dynamo.AttributeType.STRING
        },
        readCapacity: 2,
        writeCapacity: 2,
        removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
    });
    meetingTable.addLocalSecondaryIndex({
        indexName: "EndTime",
        sortKey: {
            name: "EndTime",
            type: dynamo.AttributeType.NUMBER
        }
    })
    return { meetingTable }
}