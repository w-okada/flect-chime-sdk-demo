const { v4 } = require('uuid');
var AWS = require('aws-sdk');
var ddb = new AWS.DynamoDB();
var meetingTableName = process.env.MEETING_TABLE_NAME
var attendeesTableName = process.env.ATTENDEE_TABLE_NAME
const chime = new AWS.Chime({ region: 'us-east-1' });
chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com/console');

const getExpireDate = () => {
    return Math.floor(Date.now() / 1000) + 60 * 60 * 24
}

const getMeetingInfo = async (meetingName) => {
    const result = await ddb.getItem({
        TableName: meetingTableName,
        Key: {
            'MeetingName': {
                S: meetingName
            },
        },
    }).promise()

    console.log("dynamo", result)

    // Meeting does not exist. return null
    if (!result.Item) {
        return null;
    }

    // Meeting exists. collect info and return them.
    const meetingInfo = result.Item
    const meetingData = JSON.parse(meetingInfo.Data.S);
    try {
        // Check Exist? 
        const mid = await chime.getMeeting(
            {
                MeetingId: meetingData.Meeting.MeetingId
            }).promise();
    } catch (err) {
        await deleteMeeting(meetingName)
        return null;
    }

    return {
        MeetingName: meetingInfo.MeetingName.S,
        MeetingId: meetingInfo.MeetingId.S,
        MeetingInfo: JSON.parse(meetingInfo.Data.S),
        Metadata: JSON.parse(meetingInfo.Metadata.S)
    }
}


const deleteMeeting = async (meetingName) => {
    await ddb.deleteItem({
        TableName: meetingTableName,
        Key: {
            MeetingName: { S: meetingName },
        }
    })
        .promise();
}



exports.createMeeting = async (userId, meetingName, region) => {
    // check meeting name exist
    const meetingInfo = await getMeetingInfo(meetingName)
    if (meetingInfo !== null) {
        return { created: false, meetingId: meetingInfo.MeetingId }
    }

    const request = {
        ClientRequestToken: v4(),
        MediaRegion: region,

        // NotificationsConfiguration: getNotificationsConfig(),
    };
    console.info('Creating new meeting: ' + JSON.stringify(request));
    const newMeetingInfo = await chime.createMeeting(request).promise();
    console.info('Creating new meeting: ', newMeetingInfo);
    const date = new Date();
    const now = date.getTime()
    const metadata = {
        OwnerId: userId,
        //   UsePassCode : usePassCode === "true",
        //   PassCode    : passCode,
        //   Secret      : secret === "true",
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
    return { created: true, meetingId: newMeetingInfo.Meeting.MeetingId }
}


exports.joinMeeting = async (meetingName, userName) => {
    let meetingInfo = await getMeetingInfo(meetingName);
    if (meetingInfo === null) {
        return null
    }
    if (userName === "") {
        return null
    }

    console.info('Adding new attendee');
    const attendeeInfo = (await chime.createAttendee({
        MeetingId: meetingInfo.MeetingId,
        ExternalUserId: v4(),
    }).promise());

    await ddb.putItem({
        TableName: attendeesTableName,
        Item: {
            'AttendeeId': {
                S: `${meetingName}/${attendeeInfo.Attendee.AttendeeId}`
            },
            'UserName': { S: userName },
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


exports.closeMeeting = async(meetingName) =>{
    let meetingInfo = await getMeetingInfo(meetingName);
    await chime.deleteMeeting({
      MeetingId: meetingInfo.MeetingId,
    }).promise();
    await deleteMeeting(meetingName)
}

exports.getAttendeeIfno = async (meetingName, userId) => {
    const result = await ddb.getItem({
        TableName: attendeesTableName,
        Key: {
            'AttendeeId': {
                S: `${meetingName}/${userId}`
            }
        }
    }).promise();
    if (!result.Item) {
        return 'Unknown';
    }
    console.log(result)
    return {AttendeeId:result.Item.AttendeeId.S, UserName:result.Item.UserName.S}
}
