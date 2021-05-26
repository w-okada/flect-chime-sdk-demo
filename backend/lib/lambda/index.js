
var meeting = require('./meeting');
var utils = require('./utils')
var attendeeOperations = require('./attendeeOperations')
var globalOperations = require('./globalOperations')
var AWS = require('aws-sdk');
var provider = new AWS.CognitoIdentityServiceProvider();

var userPoolId = process.env.USER_POOL_ID


// (1) Root Function
exports.handler = async (event, context, callback) => {
    console.log(event)
    console.log(context)
    console.log(callback)

    console.log(event.body)

    const response = utils.getResponseTemplate()
    response.body = JSON.stringify({ x: 5, y: 6 })
    callback(null, response);
};

// (2-1) Get Meetings
exports.getMeetings = async (event, context, callback) => {
    console.log(event)
    console.log(context)
    console.log(callback)
    const response = utils.getResponseTemplate()
    response.body = JSON.stringify({ x: "getMeetings" })
    callback(null, response)
}

// (2-2) Post Meeting
exports.postMeeting = async (event, context, callback) => {
    console.log(event)
    console.log(context)
    console.log(callback)
    console.log("headers:::", event.headers)
    const body = JSON.parse(event.body)
    console.log("body:::", body)

    const idToken = event.headers["Authorization"]
    const accessToken = event.headers["x-flect-access-token"]
    const meetingName = body.meetingName
    const userName = body.userName
    const region = body.region
    const userId = body.userId

    const user = await provider.adminGetUser({
        UserPoolId: userPoolId,
        Username: userId,
    }).promise()
    console.log("user---->", user)

    console.log("accessToken:::", accessToken)

    const p = await provider.getUser(
        { AccessToken: accessToken }, (err, data) => {
            console.log("getUser")
            console.log(err)
            console.log(data)
        })


    console.log(idToken, meetingName, userName, region, userId, accessToken)

    const { created, meetingId, ownerId } = await meeting.createMeeting(userId, meetingName, region)
    const response = utils.getResponseTemplate()
    console.log(meetingId)
    response.body = JSON.stringify({ success: true, meetingName: meetingName, created: created, meetingId: meetingId, ownerId: ownerId })
    callback(null, response)
}

// (2-3) Delete Meeting
exports.deleteMeeting = async (event, context, callback) => {
    console.log(event)
    console.log(context)
    console.log(callback)

    const accessToken = event.headers["x-flect-access-token"]
    const meetingName = event.pathParameters.meetingName

    const response = utils.getResponseTemplate()

    response.body = JSON.stringify({ x: "deleteMeeting" })
    callback(null, response)

}

// (3-1) Get Attendee
exports.getAttendee = async (event, context, callback) => {
    console.log(event)
    console.log(context)
    console.log(callback)
    console.log("headers:::", event.headers)
    const body = JSON.parse(event.body)
    console.log("body:::", body)

    const accessToken = event.headers["x-flect-access-token"]
    const meetingName = event.pathParameters.meetingName
    const userId = event.pathParameters.userId
    console.log("accessToken:::", accessToken)

    const p = await provider.getUser(
        { AccessToken: accessToken }, (err, data) => {
            console.log("getUser")
            console.log(err)
            console.log(data)
        })
    console.log(meetingName, userId, accessToken, p)

    const response = utils.getResponseTemplate()
    const attendeeInfo = await meeting.getAttendeeIfno(meetingName, userId)
    response.body = JSON.stringify(attendeeInfo)
    console.log("RESPONSE::::", response)
    callback(null, response)
}

// (3-2) Post Attendee
exports.postAttendee = async (event, context, callback) => {
    console.log(event)
    console.log(context)
    console.log(callback)
    console.log("headers:::", event.headers)
    const body = JSON.parse(event.body)
    console.log("body:::", body)

    const accessToken = event.headers["x-flect-access-token"]
    const meetingName = event.pathParameters.meetingName
    const userName = body.userName
    const userId = body.userId


    const p = await provider.getUser(
        { AccessToken: accessToken }, (err, data) => {
            console.log("getUser")
            console.log(err)
            console.log(data)
        })
    console.log(meetingName, userName, userId, accessToken, p)

    const response = utils.getResponseTemplate()

    console.log("JOIN INFO.....")
    const joinInfo = await meeting.joinMeeting(meetingName, userName)
    console.log("JOIN INFO:", joinInfo)

    response.body = JSON.stringify(joinInfo)
    callback(null, response)
}

// (3-3) List Attendees
exports.getAttendees = async (event, context, callback) => {
    console.log(event)
    console.log(context)
    console.log(callback)
    console.log("headers:::", event.headers)

    const accessToken = event.headers["x-flect-access-token"]
    const meetingName = event.pathParameters.meetingName

    const p = await provider.getUser(
        { AccessToken: accessToken }, (err, data) => {
            console.log("getUser")
            console.log(err)
            console.log(data)
        })
    console.log(meetingName, accessToken, p)

    const response = utils.getResponseTemplate()

    console.log("list attendees.....")
    const attendees = await meeting.getAttendees(meetingName)
    console.log("list attendees.....done",attendees)

    response.body = JSON.stringify(attendees)
    callback(null, response)
}



// (4-1) Post Attendee Operation
exports.postAttendeeOperation = async (event, context, callback) => {
    console.log(event)
    console.log(context)
    console.log(callback)
    console.log("headers:::", event.headers)
    const body = JSON.parse(event.body)
    console.log("body:::", body)

    const accessToken = event.headers["x-flect-access-token"]
    const meetingName = event.pathParameters.meetingName
    const userId = event.pathParameters.userId      // attendeeId
    const operation = event.pathParameters.operation


    const p = new Promise((resolve, reject) => {
        provider.getUser(
            { AccessToken: accessToken }, (err, data) => {
                console.log("getUser")
                console.log(err)
                console.log(data)
                resolve(data)
            })
    })
    const userData = await p
    console.log(meetingName, userId, accessToken, operation)

    let email    
    for(let i = 0; i < userData['UserAttributes'].length; i++){
        const att = userData['UserAttributes'][i]
        if(att['Name'] == 'email'){
            email = att['Value']
        }
    }

    const response = utils.getResponseTemplate()

    console.log("ATTENDEE OPERATION.....", event.headers)
    const operationResult = await attendeeOperations.dispatchAttendeeOperation(operation, email, meetingName, userId, event.headers, body)
    console.log("ATTENDEE OPERATION RESULT:", operationResult)

    response.body = JSON.stringify(operationResult)
    callback(null, response)
}

// (5-1) Post Log
exports.postLog = async (event, context, callback) => {
    console.log(event)
    console.log(context)
    console.log(callback)
    const response = utils.getResponseTemplate()
    callback(null, response)
}

// (a-1) Post Onetime Code Signin Request
exports.postOperation = async (event, context, callback) => {
    console.log(event)
    console.log(context)
    console.log(callback)
    console.log("headers:::", event.headers)
    const body = JSON.parse(event.body)
    console.log("body:::", body)
    const operation = event.pathParameters.operation

    const response = utils.getResponseTemplate()

    console.log("OPERATION.....", event.headers)
    const operationResult = await globalOperations.dispatchOperation(operation, event.headers, body)
    console.log("OPERATION RESULT:", operationResult)

    response.body = JSON.stringify(operationResult)
    callback(null, response)
}
