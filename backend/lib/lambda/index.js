var meeting = require("./meeting");
var utils = require("./utils");
var attendeeOperations = require("./attendeeOperations");
var globalOperations = require("./globalOperations");
var AWS = require("aws-sdk");

/**
 * generate policy. subfunction of authorizer.
 * @param {*} principalId
 * @param {*} effect
 * @param {*} resource
 * @param {*} context
 */
const generatePolicy = (principalId, effect, resource, context) => {
  const authResponse = {
    principalId: principalId,
  };
  if (effect && resource) {
    const policyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    };
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
  console.log("token", event.authorizationToken);
  const email = await utils.getEmailFromAccessToken(event.authorizationToken);
  console.log("email1", email);

  return generatePolicy("me", "Allow", event.methodArn, {
    // meetingId: event.queryStringParameters.meetingId,
    // attendeeId: event.queryStringParameters.attendeeId,
  });
};

// (1) Root Function (dummy)
exports.handler = async (event, context, callback) => {
  // console.log(event)
  // console.log(context)
  // console.log(callback)
  // console.log(event.body)
  // const response = utils.getResponseTemplate()
  // response.body = JSON.stringify({ x: 5, y: 6 })
  // callback(null, response);
};

// (2-1) Get Meetings (dummy)
exports.getMeetings = async (event, context, callback) => {
  // console.log(event)
  // console.log(context)
  // console.log(callback)
  // const response = utils.getResponseTemplate()
  // response.body = JSON.stringify({ x: "getMeetings" })
  // callback(null, response)
};

// (2-2) Post Meeting
exports.postMeeting = async (event, context, callback) => {
  console.log(event);
  console.log(context);
  console.log(callback);
  console.log("headers:::", event.headers);
  const body = JSON.parse(event.body);
  console.log("body:::", body);

  const idToken = event.headers["Authorization"];
  const accessToken = event.headers["x-flect-access-token"];
  const meetingName = body.meetingName;
  const region = body.region;

  const email = await utils.getEmailFromAccessToken(accessToken);
  console.log(`idToken:${idToken}, accessToken:${accessToken}`);
  console.log(`meetingName:${meetingName}, region:${region}, email:${email}`);

  const { created, meetingId, ownerId } = await meeting.createMeeting(
    email,
    meetingName,
    region
  );
  const response = utils.getResponseTemplate();
  console.log(`meetingId:${meetingId}`);
  response.body = JSON.stringify({
    success: true,
    meetingName: meetingName,
    created: created,
    meetingId: meetingId,
    ownerId: ownerId,
  });
  callback(null, response);
};

// (2-3) Delete Meeting (not implemented)
exports.deleteMeeting = async (event, context, callback) => {
  console.log(event);
  console.log(context);
  console.log(callback);

  const accessToken = event.headers["x-flect-access-token"];
  const meetingName = event.pathParameters.meetingName;

  const response = utils.getResponseTemplate();

  response.body = JSON.stringify({ x: "deleteMeeting" });
  callback(null, response);
};

// (2-4) Get Meeting
exports.getMeeting = async (event, context, callback) => {
  console.log(event);
  console.log(context);
  console.log(callback);

  const idToken = event.headers["Authorization"];
  const accessToken = event.headers["x-flect-access-token"];
  const meetingName = event.pathParameters.meetingName;

  const email = await utils.getEmailFromAccessToken(accessToken);
  console.log(`idToken:${idToken}, accessToken:${accessToken}`);
  console.log(`meetingName:${meetingName}, email:${email}`);

  const response = utils.getResponseTemplate();
  const meetingInfo = await meeting.getMeetingInfo2(meetingName);
  if (meetingInfo.Metadata.OwnerId === email) {
    meetingInfo.IsOwner = true;
  } else {
    meetingInfo.IsOwner = false;
  }

  response.body = JSON.stringify(meetingInfo);
  callback(null, response);
};

// (3-1) Get Attendee
exports.getAttendee = async (event, context, callback) => {
  console.log(event);
  console.log(context);
  console.log(callback);
  console.log("headers:::", event.headers);
  const body = JSON.parse(event.body);
  console.log("body:::", body);

  const accessToken = event.headers["x-flect-access-token"];
  const meetingName = event.pathParameters.meetingName;
  const attendeeId = event.pathParameters.attendeeId;

  const email = await utils.getEmailFromAccessToken(accessToken);
  console.log(`accessToken:${accessToken}`);
  console.log(
    `meetingName:${meetingName}, attendeeId:${attendeeId}, email:${email}`
  );

  const response = utils.getResponseTemplate();
  const attendeeInfo = await meeting.getAttendeeIfno(meetingName, attendeeId);
  response.body = JSON.stringify(attendeeInfo);
  callback(null, response);
};

// (3-2) Post Attendee
exports.postAttendee = async (event, context, callback) => {
  console.log(event);
  console.log(context);
  console.log(callback);
  console.log("headers:::", event.headers);
  const body = JSON.parse(event.body);
  console.log("body:::", body);

  const accessToken = event.headers["x-flect-access-token"];
  const meetingName = event.pathParameters.meetingName;
  const attendeeName = body.attendeeName;

  const email = await utils.getEmailFromAccessToken(accessToken);
  console.log(
    `meetingName:${meetingName}, attendeeName:${attendeeName}, email:${email}`
  );

  const response = utils.getResponseTemplate();
  const joinInfo = await meeting.joinMeeting(meetingName, attendeeName);
  console.log("JOIN INFO:", joinInfo);

  response.body = JSON.stringify(joinInfo);
  callback(null, response);
};

// (3-3) List Attendees
exports.getAttendees = async (event, context, callback) => {
  console.log(event);
  console.log(context);
  console.log(callback);
  console.log("headers:::", event.headers);

  const accessToken = event.headers["x-flect-access-token"];
  const meetingName = event.pathParameters.meetingName;

  const email = await utils.getEmailFromAccessToken(accessToken);
  console.log(`accessToken:${accessToken}`);
  console.log(`meetingName:${meetingName}, email:${email}`);

  const response = utils.getResponseTemplate();

  const attendees = await meeting.getAttendees(meetingName);
  console.log("list attendees.....done", attendees);

  response.body = JSON.stringify(attendees);
  callback(null, response);
};

// (4-1) Post Attendee Operation
exports.postAttendeeOperation = async (event, context, callback) => {
  console.log(event);
  console.log(context);
  console.log(callback);
  console.log("headers:::", event.headers);
  const body = JSON.parse(event.body);
  console.log("body:::", body);
  console.log("REQUEST CONTEXT NAME;;;;;;", event["requestContext"]);

  const apiDomainName = event["requestContext"]["domainName"];
  const apiStage = event["requestContext"]["stage"];
  const apiEndpoint = `https://` + apiDomainName + `/` + apiStage + "/";
  console.log("API ENDPOINT", apiEndpoint);

  const accessToken = event.headers["x-flect-access-token"];
  const meetingName = event.pathParameters.meetingName;
  const attendeeId = event.pathParameters.attendeeId; // attendeeId
  const operation = event.pathParameters.operation;

  const email = await utils.getEmailFromAccessToken(accessToken);

  const response = utils.getResponseTemplate();

  console.log("ATTENDEE OPERATION.....", event.headers);
  const operationResult = await attendeeOperations.dispatchAttendeeOperation(
    operation,
    email,
    meetingName,
    attendeeId,
    apiEndpoint,
    event.headers,
    body
  );
  console.log("ATTENDEE OPERATION RESULT:", operationResult);

  response.body = JSON.stringify(operationResult);
  callback(null, response);
};

// (5-1) Post Log
exports.postLog = async (event, context, callback) => {
  console.log(event);
  console.log(context);
  console.log(callback);
  const response = utils.getResponseTemplate();
  callback(null, response);
};

// (a-1) Post Onetime Code Signin Request
exports.postOperation = async (event, context, callback) => {
  console.log(event);
  console.log(context);
  console.log(callback);
  console.log("headers:::", event.headers);
  const body = JSON.parse(event.body);
  console.log("body:::", body);
  const operation = event.pathParameters.operation;

  const response = utils.getResponseTemplate();

  console.log("OPERATION.....", event.headers);
  const operationResult = await globalOperations.dispatchOperation(
    operation,
    event.headers,
    body
  );
  console.log("OPERATION RESULT:", operationResult);

  response.body = JSON.stringify(operationResult);
  callback(null, response);
};
