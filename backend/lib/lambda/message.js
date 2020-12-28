
var utils = require('./utils')
var AWS = require('aws-sdk');
const chime = new AWS.Chime({ region: 'us-east-1' });
var ddb = new AWS.DynamoDB();

const generatePolicy = (principalId, effect, resource, context) => {
    const authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        const policyDocument = {};
        policyDocument.Version = '2012-10-17';
        policyDocument.Statement = [];
        const statementOne = {};
        statementOne.Action = 'execute-api:Invoke';
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    authResponse.context = context;
    return authResponse;
};

exports.authorize = async (event, context, callback) => {
    console.log('authorize event:', JSON.stringify(event, null, 2));
    console.log('authorize event:', JSON.stringify(context, null, 2));
    let passedAuthCheck = false;
    if (
        !!event.queryStringParameters.meetingId &&
        !!event.queryStringParameters.attendeeId &&
        !!event.queryStringParameters.joinToken
    ) {
        console.log("meetingId:", event.queryStringParameters.meetingId)
        console.log("attendeeId:", event.queryStringParameters.attendeeId)
        console.log("joinToken:", event.queryStringParameters.joinToken)
        try {
            console.log("auth attendeeId1: ", event.queryStringParameters.attendeeId)
            const attendeeId = event.queryStringParameters.attendeeId.split("_")[0]
            console.log("auth attendeeId2: ", attendeeId)
            attendeeInfo = await chime.getAttendee({
                    MeetingId: event.queryStringParameters.meetingId,
                    AttendeeId: attendeeId
                }).promise();
            if (attendeeInfo.Attendee.JoinToken === event.queryStringParameters.joinToken) {
                passedAuthCheck = true;
            } else {
                console.error('failed to authenticate with join token');
            }
        } catch (e) {
            console.error(`failed to authenticate with join token: ${e.message}`);
        }
    } else {
        console.error('missing MeetingId, AttendeeId, JoinToken parameters');
    }
    return generatePolicy(
        'me',
        passedAuthCheck ? 'Allow' : 'Deny',
        event.methodArn,
        {
            meetingId: event.queryStringParameters.meetingId,
            attendeeId: event.queryStringParameters.attendeeId
        }
    );
};

exports.connect = async (event, context, callback) => {
    console.log(event)
    console.log(context)
    console.log(callback)
    const oneDayFromNow  = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
    try {
        const meetingId  = event.queryStringParameters.meetingId
        const attendeeId = event.queryStringParameters.attendeeId
        console.log("meetingId:", meetingId)
        console.log("attendeeId", attendeeId)
        const res = await ddb.putItem({
                TableName : process.env.CONNECTION_TABLE_NAME,
                Item      : {
                    MeetingId    : { S: meetingId },
                    AttendeeId   : { S: attendeeId },
                    ConnectionId : { S: event.requestContext.connectionId },
                    TTL          : { N: `${oneDayFromNow}` }
                }
            })
            .promise();
        console.log("update res", res)
    } catch (e) {
        console.error(`error connecting: ${e.message}`);
        return {
            statusCode: 500,
            body: `Failed to connect: ${JSON.stringify(e)}`
        };
    }
    return { statusCode: 200, body: 'Connected.' };
}


exports.disconnect = async (event, context, callback) => {
    console.log(event)
    console.log(context)
    console.log(callback)
    try {
        const meetingId  = event.requestContext.authorizer.meetingId
        const attendeeId = event.requestContext.authorizer.attendeeId
        console.log(meetingId, attendeeId)
        await ddb.deleteItem({
                TableName : process.env.CONNECTION_TABLE_NAME,
                Key       : {
                    MeetingId  : { S: meetingId  },
                    AttendeeId : { S: attendeeId }
                }
            })
            .promise();
    } catch (err) {
        console.error(`error : ${err.message}`);
        return {
            statusCode: 500,
            body: `Failed to disconnect: ${JSON.stringify(err)}`
        };
    }
    return { statusCode: 200, body: 'Disconnected.' };
}


exports.message = async (event, context, callback) => {
    console.log(event)
    console.log(context)
    console.log(callback)
    console.log('sendmessage event:', JSON.stringify(event, null, 2));
    console.log("meetingId",event.requestContext.authorizer.meetingId)
    // Gather the information of attendees
    let attendees = {};
    try {
        attendees = await ddb.query({
                ExpressionAttributeValues: {
                    ':meetingId': { S: event.requestContext.authorizer.meetingId }
                },
                KeyConditionExpression : 'MeetingId = :meetingId',
                ProjectionExpression   : 'ConnectionId, AttendeeId',
                TableName              : process.env.CONNECTION_TABLE_NAME,
            })
            .promise();
    } catch (e) {
        console.log('Query error:', e);
        return { statusCode: 500, body: e.stack };
    }
    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
        apiVersion : '2018-11-29',
        endpoint   : `${event.requestContext.domainName}/${event.requestContext.stage}`
    });
    
    console.log("DATA:",event.body)
    console.log("Attendee!!!:", attendees)
    const body = JSON.parse(event.body)
    const targetId = body.targetId
    const private  = body.private

    console.log("targetId:", targetId)
    console.log("private:", private)
    
    const postCalls = attendees.Items.map(async connection => {
        const connectionId = connection.ConnectionId.S
        const attendeeId   = connection.AttendeeId.S
        if(private !==true || attendeeId === targetId){
            try {
                const res = await apigwManagementApi
                    .postToConnection({ ConnectionId: connectionId, Data: JSON.stringify(body)})
                    .promise();
                    console.log("done sending!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1", res)
                    console.log("done sending!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!2", connectionId)
                    console.log("done sending!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!3", JSON.stringify(body))
            } catch (e) {
                if (e.statusCode === 410) {
                    console.log(`found stale connection, skipping ${connectionId}`);
                } else {
                    console.error(
                        `error posting to connection ${connectionId}: ${e.message}`
                    );
                }
            }
        }
    });

    try {
        const res = await Promise.all(postCalls);
        console.log("RESPONSE!", res)

    } catch (e) {
        console.error(`failed to post: ${e.message}`);
        return { statusCode: 500, body: e.stack };
    }
    
    body.done              = true
    // body.content.fileParts = "" // reduce trafic

    return { statusCode: 200, body: JSON.stringify(body) };}

