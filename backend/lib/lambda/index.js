
var meeting = require('./meeting');
var utils   = require('./utils')
var AWS = require('aws-sdk');
var provider = new AWS.CognitoIdentityServiceProvider();

var userPoolId = process.env.USER_POOL_ID



exports.handler = async (event, context, callback) => {
  console.log(event)
  console.log(context)
  console.log(callback)

  console.log(event.body)

  const response = utils.getResponseTemplate()
  response.body = JSON.stringify({ x: 5, y: 6 })
  callback(null, response);
};

exports.getMeetings = async (event, context, callback) => {
  console.log(event)
  console.log(context)
  console.log(callback)
  const response = utils.getResponseTemplate()
  response.body = JSON.stringify({ x: "getMeetings" })
  callback(null, response)
}

exports.postMeeting = async (event, context, callback) => {
  console.log(event)
  console.log(context)
  console.log(callback)
  console.log("headers:::", event.headers)
  const body = JSON.parse(event.body)
  console.log("body:::", body)

  const idToken     = event.headers["Authorization"]
  const accessToken = event.headers["x-flect-access-token"]
  const meetingName = body.meetingName
  const userName    = body.userName
  const region      = body.region
  const userId      = body.userId

  const user = await provider.adminGetUser({
    UserPoolId: userPoolId,
    Username: userId,
  }).promise()
  console.log("user---->",user)

  console.log("accessToken:::", accessToken)

  const p = await provider.getUser(
    {AccessToken: accessToken}, (err,data) => {
      console.log("getUser")
      console.log(err)
      console.log(data)
    })


  console.log(idToken, meetingName, userName, region, userId, accessToken)

  const {created, meetingId} = await meeting.createMeeting(userId, meetingName, region)
  const response = utils.getResponseTemplate()
  console.log(meetingId)
  response.body = JSON.stringify({ success: true, meetingName: meetingName, created:created, meetingId:meetingId})  
  callback(null, response)
}

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

exports.getAttendee = async (event, context, callback) => {
  console.log(event)
  console.log(context)
  console.log(callback)
  console.log("headers:::", event.headers)
  const body = JSON.parse(event.body)
  console.log("body:::", body)

  const accessToken = event.headers["x-flect-access-token"]
  const meetingName = event.pathParameters.meetingName
  const userId      = event.pathParameters.userId
  console.log("accessToken:::", accessToken)

  const p = await provider.getUser(
    {AccessToken: accessToken}, (err,data) => {
      console.log("getUser")
      console.log(err)
      console.log(data)
    })
  console.log(meetingName, userId, accessToken, p)

  const response = utils.getResponseTemplate()
  const attendeeInfo = await meeting.getAttendeeIfno(meetingName, userId)
  response.body=JSON.stringify(attendeeInfo)
  console.log("RESPONSE::::", response)
  callback(null, response)
}

exports.postAttendee = async (event, context, callback) => {
  console.log(event)
  console.log(context)
  console.log(callback)
  console.log("headers:::", event.headers)
  const body = JSON.parse(event.body)
  console.log("body:::", body)

  const accessToken = event.headers["x-flect-access-token"]
  const meetingName = event.pathParameters.meetingName
  const userName    = body.userName
  const userId      = body.userId


  const p = await provider.getUser(
    {AccessToken: accessToken}, (err,data) => {
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

exports.postLog = async (event, context, callback) => {
  console.log(event)
  console.log(context)
  console.log(callback)
  const response = utils.getResponseTemplate()
  callback(null, response)
}