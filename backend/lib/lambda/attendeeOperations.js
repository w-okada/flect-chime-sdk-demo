const { v4 } = require('uuid');
var AWS = require('aws-sdk');
var ddb = new AWS.DynamoDB();
var meeting = require('./meeting');
var attendeesTableName = process.env.ATTENDEE_TABLE_NAME

Array.prototype.shuffle = function() {
    var i, j, temp;
    i = this.length;
    while(i) {
      j = Math.floor(Math.random() * i);
      i--;
      temp = this[i];
      this[i] = this[j];
      this[j] = temp;
    }
    return this;
}

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
        UpdateExpression:"set onetimeCodeId=:i, code=:c, onetimeCodeStatus=:s, onetimeCodeExpireDate=:d, idToken=:idToken, accessToken=:accessToken",
        ExpressionAttributeValues:{
            ':i': {S:uuid},
            ':c': {S:code},
            ':s': {S:'active'},
            ':d': {N:`${expireDate}`},
            ':idToken': {S:idToken},
            ':accessToken': {S:accessToken},
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






exports.dispatchOperation = async (operation, header, body) => {
    switch(operation){
        case "onetime-code-signin-request":
            return onetimeCodeSigninRequest(header, body)
        case "onetime-code-signin":
            return onetimeCodeSignin(header, body)
        default:
            return defaultResponse(operation)
    }

}

const onetimeCodeSigninRequest = async  (headers, body) =>{
    console.log("[onetimeCodeSigninRequest]:", body)
    const uuid        = v4()
    const expireDate  = getOntimeCodeExpireDate()
    const meetingName = body.meetingName // already encoded.
    const attendeeId  = body.attendeeId
    const onetimeCode = body.uuid

    const tablekey = `${meetingName}/${attendeeId}`
    console.log("[onetimeCodeSigninRequest]: tablekey", tablekey)

    const result = await ddb.getItem({
        TableName: attendeesTableName,
        Key: {
            'AttendeeId': {
                S: tablekey 
            },
        },
    }).promise()


    console.log("dynamo", result)
    // console.log("dynamo", result.Item.onetimeCodeId.S, result.Item.oneCodeExpireDate.N, result.Item.code.S, result.Item.onetimeCodeStatus.S)
    console.log("dynamo", result.Item.onetimeCodeId.S, result.Item.code.S, result.Item.onetimeCodeExpireDate.N, result.Item.onetimeCodeStatus.S)
    const codes = []
    for(let i=0; i< 5; i++){
        codes.push(v4().substr(0,6))
    }
    codes.push(result.Item.code.S)
    codes.shuffle()
    
    return{
        uuid: uuid,
        codes: codes,
        status:result.Item.onetimeCodeStatus.S,
        meetingName: meetingName,
        attendeeId: attendeeId,
    }
}


const onetimeCodeSignin = async  (headers, body) =>{
    console.log("[onetimeCodeSigninRequest]:", body)
    const uuid        = v4()
    const expireDate  = getOntimeCodeExpireDate()
    const meetingName = body.meetingName // already encoded.
    const attendeeId  = body.attendeeId
    const onetimeCode = body.uuid

    const tablekey = `${meetingName}/${attendeeId}`
    console.log("[onetimeCodeSigninRequest]: tablekey", tablekey)

    const result = await ddb.getItem({
        TableName: attendeesTableName,
        Key: {
            'AttendeeId': {
                S: tablekey 
            },
        },
    }).promise()


    console.log("dynamo", result)
    console.log("dynamo", result.Item.onetimeCodeId.S, result.Item.code.S, result.Item.onetimeCodeExpireDate.N, result.Item.onetimeCodeStatus.S)

    await ddb.updateItem({
        TableName: attendeesTableName,
        Key: {
            AttendeeId: {S: tablekey },
        },
        UpdateExpression:"set onetimeCodeStatus=:s, idToken=:idToken, accessToken=:accessToken",
        ExpressionAttributeValues:{
            ':s': {S:'n/a'},
            ':idToken': {S:'-'},
            ':accessToken': {S:'-'},
        },
        ReturnValues:"UPDATED_NEW",
    }).promise();

    let signin = result.Item.code.S === body.code
    console.log("sign in result:", signin)
    if(result.Item.onetimeCodeStatus.S !== "active"){
        console.log("code is deactivated!")
        signin = false
    }
    if(signin){
        return{
            result: signin,
            idToken: result.Item.idToken.S,
            accessToken: result.Item.accessToken.S,
            userName: result.Item.UserName.S,
        }
    }else{
        return{
            result: signin,
        }
    }
    
}





