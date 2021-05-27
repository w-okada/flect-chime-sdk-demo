//// Import
const { v4 } = require('uuid');
var AWS = require('aws-sdk');

//// Inject Environment
var meetingTableName   = process.env.MEETING_TABLE_NAME
var attendeesTableName = process.env.ATTENDEE_TABLE_NAME

//// AWS Clients setup
var ddb = new AWS.DynamoDB();
const chime = new AWS.Chime({ region: 'us-east-1' });
chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com/console');


/**
 * Meeting Expire Date
 */
const getExpireDate = () => {
    return Math.floor(Date.now() / 1000) + 60 * 60 * 24
}

/**
 * Wrapper for getMeetingInfo
 * @param {*} meetingName 
 */
exports.getMeetingInfo2 = async (meetingName) =>{
    return getMeetingInfo(meetingName)
}

/**
 * get meeting info
 * (1) retrieve meeting info from DB
 * (2) If there is no meeting in DB, return null
 * (3) If there is no meeting in Amazon Chime, delete from DB and return null.
 * @param {*} meetingName 
 */
const getMeetingInfo = async (meetingName) => {
    //// (1) retrieve info 
    const result = await ddb.getItem({
        TableName: meetingTableName,
        Key: {
            'MeetingName': {
                S: meetingName
            },
        },
    }).promise()

    console.log("dynamo", result)

    //// (2) If no meeting in DB, return null
    if (!result.Item) {
        return null;
    }

    //// (3) If no meeting in Chime, delete meeting from DB and return null
    const meetingInfo = result.Item
    const meetingData = JSON.parse(meetingInfo.Data.S);
    try {
        // Check Exist? 
        const mid = await chime.getMeeting({
                MeetingId: meetingData.Meeting.MeetingId
            }).promise();
    } catch (err) {
        await deleteMeeting(meetingName)
        return null;
    }

    //// (4) return meeting info
    return {
        MeetingName: meetingInfo.MeetingName.S,
        MeetingId: meetingInfo.MeetingId.S,
        MeetingInfo: JSON.parse(meetingInfo.Data.S),
        Metadata: JSON.parse(meetingInfo.Metadata.S),
        HmmTaskArn: meetingInfo.HmmTaskArn ? meetingInfo.HmmTaskArn.S: "-",
    }
}

/**
 * Delete meeting from DB
 * @param {*} meetingName 
 */
const deleteMeeting = async (meetingName) => {
    await ddb.deleteItem({
        TableName: meetingTableName,
        Key: {
            MeetingName: { S: meetingName },
        }
    })
        .promise();
}


/**
 * Create meeting
 * (1) If the meeting already exists, return fail.
 * (2) create meeting in Amazon Chime
 * (3) register meeting info in DB
 * @param {*} email (email address!)
 * @param {*} meetingName 
 * @param {*} region 
 */
exports.createMeeting = async (email, meetingName, region) => {
    //// (1) check meeting name exist
    const meetingInfo = await getMeetingInfo(meetingName)
    if (meetingInfo !== null) {
        return { created: false, meetingId: meetingInfo.MeetingId }
    }

    //// (2) create meeting in Amazon Chime
    const request = {
        ClientRequestToken: v4(),
        MediaRegion: region,
    };
    console.info('Creating new meeting: ' + JSON.stringify(request));
    const newMeetingInfo = await chime.createMeeting(request).promise();
    console.info('Creating new meeting: ', newMeetingInfo);

    //// (3) register meeting info in DB
    const date = new Date();
    const now = date.getTime()
    const metadata = {
        OwnerId: email,
        Region: region,
        StartTime: now
    }
    const item = {
        'MeetingName': { S: meetingName },
        'MeetingId': { S: newMeetingInfo.Meeting.MeetingId },
        'Data': { S: JSON.stringify(newMeetingInfo) },
        'Metadata': { S: JSON.stringify(metadata) },
        'TTL': {
            N: '' + getExpireDate()
        }
    }
    await ddb.putItem({
        TableName: meetingTableName,
        Item: item,
    }).promise();


    return { created: true, meetingId: newMeetingInfo.Meeting.MeetingId, meetingName: meetingName, ownerId: email }
}



/**
 * attendee join the meeting
 * (1) If there is no meeting, return fail
 * (2) If attendeeName is invalid, return fail
 * (3) create attendee in Amazon Chime
 * (4) register attendee in DB
 * @param {*} meetingName 
 * @param {*} attendeeName 
 */
exports.joinMeeting = async (meetingName, attendeeName) => {
    //// (1) check meeting exists
    let meetingInfo = await getMeetingInfo(meetingName);
    if (meetingInfo === null) {
        return {
            code: 'MeetingNotFound',
            message: 'No meeting is found. Please check meeting name.'
        }
    }

    //// (2) check attendeeName
    if (attendeeName === "") {
        return {
            code: 'InvalidInput',
            message: 'AttendeeName you input is invalid.'
        }
    }

    //// (3) create attendee in Amazon Chime
    console.info('Adding new attendee');
    const attendeeInfo = (await chime.createAttendee({
        MeetingId: meetingInfo.MeetingId,
        ExternalUserId: v4(),
    }).promise());


    //// (4) register attendee in DB
    await ddb.putItem({
        TableName: attendeesTableName,
        Item: {
            'AttendeeId': {
                S: `${meetingName}/${attendeeInfo.Attendee.AttendeeId}`
            },
            'AttendeeName': { S: attendeeName },
            'TTL': {
                N: '' + getExpireDate()
            }
        }
    }).promise();

    console.log("MEETING_INFO", meetingInfo)

    return {
        MeetingName: meetingInfo.MeetingName,
        Meeting: meetingInfo.MeetingInfo.Meeting,
        Attendee: attendeeInfo.Attendee
    }
}

/**
 * close meeting
 * (1) retrieve meetingId from DB by meetingName
 * (2) delete meeting from Amazon Chime
 * (3) delete meeting from DB
 * @param {*} meetingName 
 */
exports.closeMeeting = async(meetingName) =>{
    //// (1) retrieve meetingId from DB by meetingName
    let meetingInfo = await getMeetingInfo(meetingName);
    //// (2) delete meeting from Amazon Chime
    await chime.deleteMeeting({
      MeetingId: meetingInfo.MeetingId,
    }).promise();
    //// (3) delete meeting from DB
    await deleteMeeting(meetingName)
}


/**
 * get attendee info
 * (1) retrieve attendee info from DB. key is concatinate of meetingName(encoded) and attendeeId
 * (2) If there is no attendee in the meeting, return fail
 * (3) return attendee info.
 * @param {*} meetingName 
 * @param {*} attendeeId
 */
exports.getAttendeeIfno = async (meetingName, attendeeId) => {
    //// (1) retrieve attendee info from DB. key is concatinate of meetingName(encoded) and attendeeId
    const result = await ddb.getItem({
        TableName: attendeesTableName,
        Key: {
            'AttendeeId': {
                S: `${meetingName}/${attendeeId}`
            }
        }
    }).promise();

    //// (2) If there is no attendee in the meeting, return fail
    if (!result.Item) {
        return {AttendeeId:attendeeId, AttendeeName:"no entry", Query:`${meetingName}/${attendeeId}`, result:'fail'};
    }
    console.log(result)

    //// (3) return attendee info.
    return {AttendeeId:result.Item.AttendeeId.S, AttendeeName:result.Item.AttendeeName.S, result:'success'}
}



/**
 * get list of attendee from Amazon Chime
 * This api return history of attendee???
 * Currently not used.
 * @param {*} meetingName 
 */
exports.getAttendees = async (meetingName) => {
    const meetingInfo = await getMeetingInfo(meetingName);
    const meetingId = meetingInfo.MeetingId
    console.log("meetinginfo:::::",meetingInfo)
    console.log("meetingid:::::",meetingId)

    const params = {
        MeetingId: meetingId
    }

    const attendees = await chime.listAttendees(params).promise()
    console.log(attendees)
    console.log(attendees.Attendees)

    return {Attendees:attendees.Attendees, result:'success'}
}



