
var utils = require('./utils')
var AWS = require('aws-sdk');
const chime = new AWS.Chime({ region: 'us-east-1' });

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
            attendeeInfo = await chime.getAttendee({
                    MeetingId: event.queryStringParameters.meetingId,
                    AttendeeId: event.queryStringParameters.attendeeId
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
    const response = utils.getResponseTemplate()
    callback(null, response)
}
exports.disconnect = async (event, context, callback) => {
    console.log(event)
    console.log(context)
    console.log(callback)
    const response = utils.getResponseTemplate()
    callback(null, response)
}
exports.message = async (event, context, callback) => {
    console.log(event)
    console.log(context)
    console.log(callback)
    const response = utils.getResponseTemplate()
    callback(null, response)
}