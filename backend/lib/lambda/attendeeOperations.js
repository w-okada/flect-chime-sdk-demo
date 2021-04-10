const { v4 } = require('uuid');
var AWS = require('aws-sdk');
var ddb = new AWS.DynamoDB();
var meeting = require('./meeting');
var attendeesTableName = process.env.ATTENDEE_TABLE_NAME

exports.dispatchAttendeeOperation = async (operation, meetingName, userId, header, body) => {
    switch(operation){
        case "generate-onetime-code":
            return generateOnetimeCode(meetingName, userId, header, body)
        default:
            return defaultResponse(operation)
    }

}

const getOntimeCodeExpireDate = () => {
    return Math.floor(Date.now() / 1000) + 60 * 5 //5 minutes
}

const generateOnetimeCode =  async  (meetingName, userId, headers, body) =>{
    const idToken     = headers["Authorization"]
    const accessToken = headers["x-flect-access-token"]
    const uuid        = v4()
    const code        = v4().substr(0,6)
    const expireDate  = getOntimeCodeExpireDate()

    let meetingInfo = await meeting.getMeetingInfo2(meetingName);
    if (meetingInfo === null) {
        return {
            code: 'MeetingNotFound',
            message: 'No meeting is found. Please check meeting name.'
        }
    }
    console.info('Generate Onetime Code');

    await ddb.updateItem({
        TableName: attendeesTableName,
        Key: {
            AttendeeId: {S:`${meetingName}/${userId}`},
        },
        UpdateExpression:"set onetimeCodeId=:i, code=:c, onetimeCodeStatus=:s, oneCodeExpireDate=:d",
        ExpressionAttributeValues:{
            ':i': {S:uuid},
            ':c': {S:code},
            ':s': {S:'active'},
            ':d': {N:`${expireDate}`}
        },
        ReturnValues:"UPDATED_NEW",
    }).promise();
    
    console.log("GenerateOntetimeCode:", idToken, accessToken, uuid, code, meetingName, userId)
    return{
        uuid: uuid,
        code: code,
        ontimecodeExpireDate: expireDate,
    }
}

const defaultResponse = (operation) => {
    console.log("no valid response" + operation)
    return{
        mess: "no valid response" + operation
    }
}