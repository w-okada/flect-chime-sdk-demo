import { aws_dynamodb as dynamo, RemovalPolicy } from "aws-cdk-lib"
import { Construct } from 'constructs';

///// Table format ///////////////
// AttendeeId :
// AttendeeName:
// TTL:
////////////////////

export const createUserEnvironmentTable = (scope: Construct, id: string) => {
    const userEnvironmentTable = new dynamo.Table(scope, "userEnvironmentTable", {
        tableName: `${id}_UserEnvironmentTable`,
        partitionKey: {
            name: "ExUserId",
            type: dynamo.AttributeType.STRING,
        },
        readCapacity: 2,
        writeCapacity: 2,
        removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
    });

    return { userEnvironmentTable }

}