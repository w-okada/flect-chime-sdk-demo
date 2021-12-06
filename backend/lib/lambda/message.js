//// Import
var utils = require("./utils");
var AWS = require("aws-sdk");

//// AWS Clients setup
const chime = new AWS.Chime({ region: "us-east-1" });
var ddb = new AWS.DynamoDB();

/**
 * generate policy. subfunction of authorizer.
 * @param {*} principalId
 * @param {*} effect
 * @param {*} resource
 * @param {*} context
 */
const generatePolicy = (principalId, effect, resource, context) => {
    const authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        const policyDocument = {};
        policyDocument.Version = "2012-10-17";
        policyDocument.Statement = [];
        const statementOne = {};
        statementOne.Action = "execute-api:Invoke";
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    authResponse.context = context;
    return authResponse;
};

/**
 * Authorizer
 * (1) check query parameter. meetingId, attendeeId, joinToken
 * (2) check attendee in the meeting
 * (3) check joinToken
 * (4) return policy
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
exports.authorize = async (event, context, callback) => {
    console.log("authorize event:", JSON.stringify(event, null, 2));
    console.log("authorize event:", JSON.stringify(context, null, 2));
    let passedAuthCheck = false;

    //// (1) check query parameter. meetingId, attendeeId, joinToken
    if (!event.queryStringParameters.meetingId || !event.queryStringParameters.attendeeId || !event.queryStringParameters.joinToken) {
        console.error("missing MeetingId, AttendeeId, JoinToken parameters", event.queryStringParameters);
        return generatePolicy("me", "Deny", event.methodArn, {});
    }

    console.log("meetingId:", event.queryStringParameters.meetingId);
    console.log("attendeeId:", event.queryStringParameters.attendeeId);
    console.log("joinToken:", event.queryStringParameters.joinToken);

    //// (2) check attendee in the meeting
    let attendeeInfo;
    try {
        console.log("auth attendeeId1: ", event.queryStringParameters.attendeeId);
        const attendeeId = event.queryStringParameters.attendeeId.split("_")[0]; //// for extension, (currently no meeing)
        console.log("auth attendeeId2: ", attendeeId);
        attendeeInfo = await chime
            .getAttendee({
                MeetingId: event.queryStringParameters.meetingId,
                AttendeeId: attendeeId,
            })
            .promise();
    } catch (e) {
        console.error(`failed to authenticate with join token: ${e.message}`);
        return generatePolicy("me", "Deny", event.methodArn, {});
    }

    //// (3) check joinToken
    if (attendeeInfo.Attendee.JoinToken !== event.queryStringParameters.joinToken) {
        console.error(`failed to authenticate with join token ${attendeeInfo.Attendee.JoinToken} - ${event.queryStringParameters.joinToken}`);
        return generatePolicy("me", "Deny", event.methodArn, {});
    }

    //// (4) return policy
    return generatePolicy("me", "Allow", event.methodArn, {
        meetingId: event.queryStringParameters.meetingId,
        attendeeId: event.queryStringParameters.attendeeId,
    });
};

/**
 * Authorizer(To Be Deleted)
 * (1) check query parameter. meetingId, attendeeId, joinToken
 * (2)
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
exports.authorize_old = async (event, context, callback) => {
    console.log("authorize event:", JSON.stringify(event, null, 2));
    console.log("authorize event:", JSON.stringify(context, null, 2));
    let passedAuthCheck = false;
    if (!!event.queryStringParameters.meetingId && !!event.queryStringParameters.attendeeId && !!event.queryStringParameters.joinToken) {
        console.log("meetingId:", event.queryStringParameters.meetingId);
        console.log("attendeeId:", event.queryStringParameters.attendeeId);
        console.log("joinToken:", event.queryStringParameters.joinToken);
        try {
            console.log("auth attendeeId1: ", event.queryStringParameters.attendeeId);
            const attendeeId = event.queryStringParameters.attendeeId.split("_")[0]; //// for extension, (currently no meeing)
            console.log("auth attendeeId2: ", attendeeId);
            attendeeInfo = await chime
                .getAttendee({
                    MeetingId: event.queryStringParameters.meetingId,
                    AttendeeId: attendeeId,
                })
                .promise();
            if (attendeeInfo.Attendee.JoinToken === event.queryStringParameters.joinToken) {
                passedAuthCheck = true;
            } else {
                console.error(`failed to authenticate with join token ${attendeeInfo.Attendee.JoinToken} - ${event.queryStringParameters.joinToken}`);
            }
        } catch (e) {
            console.error(`failed to authenticate with join token: ${e.message}`);
        }
    } else {
        console.error("missing MeetingId, AttendeeId, JoinToken parameters");
    }
    return generatePolicy("me", passedAuthCheck ? "Allow" : "Deny", event.methodArn, {
        meetingId: event.queryStringParameters.meetingId,
        attendeeId: event.queryStringParameters.attendeeId,
    });
};

/**
 * register connection. The connectionId is generatedBy API GW automatically?
 * (1) register connection info to DB
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
exports.connect = async (event, context, callback) => {
    console.log(event);
    console.log(context);
    console.log(callback);
    //// (1) register connection info to DB
    const oneDayFromNow = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
    try {
        const meetingId = event.queryStringParameters.meetingId;
        const attendeeId = event.queryStringParameters.attendeeId;
        console.log("meetingId:", meetingId);
        console.log("attendeeId", attendeeId);
        const res = await ddb
            .putItem({
                TableName: process.env.CONNECTION_TABLE_NAME,
                Item: {
                    MeetingId: { S: meetingId },
                    AttendeeId: { S: attendeeId },
                    ConnectionId: { S: event.requestContext.connectionId }, // auto generated by API GW
                    TTL: { N: `${oneDayFromNow}` },
                },
            })
            .promise();
        console.log("update res", res);
    } catch (e) {
        console.error(`error connecting: ${e.message}`);
        return {
            statusCode: 500,
            body: `Failed to connect: ${JSON.stringify(e)}`,
        };
    }
    return { statusCode: 200, body: "Connected." };
};

/**
 * disconnect.
 * (1) remove connection from DB
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
exports.disconnect = async (event, context, callback) => {
    console.log(event);
    console.log(context);
    console.log(callback);
    try {
        const meetingId = event.requestContext.authorizer.meetingId;
        const attendeeId = event.requestContext.authorizer.attendeeId;
        console.log(meetingId, attendeeId);
        //// (1) remove connection from DB
        await ddb
            .deleteItem({
                TableName: process.env.CONNECTION_TABLE_NAME,
                Key: {
                    MeetingId: { S: meetingId },
                    AttendeeId: { S: attendeeId },
                },
            })
            .promise();
    } catch (err) {
        console.error(`error : ${err.message}`);
        return {
            statusCode: 500,
            body: `Failed to disconnect: ${JSON.stringify(err)}`,
        };
    }
    return { statusCode: 200, body: "Disconnected." };
};

/**
 * message
 * (1) Gather the information of attendees in the same meeting
 * (2) get endpoint of API GW
 * (3) decide the destination
 * (4) send message
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
exports.message = async (event, context, callback) => {
    console.log(event);
    console.log(context);
    console.log(callback);
    console.log("sendmessage event:", JSON.stringify(event, null, 2));
    console.log("meetingId", event.requestContext.authorizer.meetingId);
    //// (1) Gather the information of attendees in the same meeting
    let attendees = {};
    try {
        attendees = await ddb
            .query({
                ExpressionAttributeValues: {
                    ":meetingId": { S: event.requestContext.authorizer.meetingId },
                },
                KeyConditionExpression: "MeetingId = :meetingId",
                ProjectionExpression: "ConnectionId, AttendeeId",
                TableName: process.env.CONNECTION_TABLE_NAME,
            })
            .promise();
    } catch (e) {
        console.log("Query error:", e);
        return { statusCode: 500, body: e.stack };
    }

    //// (2) get endpoint of API GW
    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
        apiVersion: "2018-11-29",
        endpoint: `${event.requestContext.domainName}/${event.requestContext.stage}`,
    });

    //// (3) decide the destination
    console.log("DATA:", event.body);
    console.log("Attendee!!!:", attendees);
    const body = JSON.parse(event.body);
    const targetId = body.targetId;
    const private = body.private;

    console.log("targetId:", targetId);
    console.log("private:", private);

    /// (4) send message
    const postCalls = attendees.Items.map(async (connection) => {
        const connectionId = connection.ConnectionId.S;
        const attendeeId = connection.AttendeeId.S;
        if (private !== true || attendeeId === targetId) {
            try {
                const res = await apigwManagementApi
                    .postToConnection({
                        ConnectionId: connectionId,
                        Data: JSON.stringify(body),
                    })
                    .promise();
                console.log("done sending!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1", res);
                console.log("done sending!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!2", connectionId);
                console.log("done sending!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!3", JSON.stringify(body));
            } catch (e) {
                if (e.statusCode === 410) {
                    console.log(`found stale connection, skipping ${connectionId}`);
                } else {
                    console.error(`error posting to connection ${connectionId}: ${e.message}`);
                }
            }
        }
    });

    try {
        const res = await Promise.all(postCalls);
        console.log("RESPONSE!", res);
    } catch (e) {
        console.error(`failed to post: ${e.message}`);
        return { statusCode: 500, body: e.stack };
    }

    body.done = true;
    // body.content.fileParts = "" // reduce trafic

    return { statusCode: 200, body: JSON.stringify(body) };
};
