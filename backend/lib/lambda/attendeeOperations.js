const { v4 } = require('uuid');
var AWS = require('aws-sdk');
var ddb = new AWS.DynamoDB();
var meeting = require('./meeting');
const { url } = require('inspector');
var attendeesTableName = process.env.ATTENDEE_TABLE_NAME
var clusterArn = process.env.CLUSTER_ARN
var taskDefinitionArnManager = process.env.TASK_DIFINITION_ARN_MANAGER
var vpcId = process.env.VPC_ID // not used
var subnetId = process.env.SUBNET_ID
var bucketDomainName = process.env.BUCKET_DOMAIN_NAME
var managerContainerName = process.env.MANAGER_CONTAINER_NAME
var bucketArn = process.env.BUCKET_ARN
var ecs = new AWS.ECS();


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

exports.dispatchAttendeeOperation = async (operation, email, meetingName, userId, header, body) => {
    switch(operation){
        case "generate-onetime-code":
            return generateOnetimeCode(meetingName, userId, header, body)
        case "start-manager":
            return startMeetingManager(email, meetingName, userId, header, body)
        default:
            return defaultResponse(operation)
    }

}

const getOntimeCodeExpireDate = () => {
    return Math.floor(Date.now() / 1000) + 60 * 5 //5 minutes
}

const generateOnetimeCode = async (meetingName, userId, headers, body) =>{
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


const startMeetingManager = async (email, meetingName, userId, headers, body) =>{
    console.log("startMeetingManager")
    let meetingInfo = await meeting.getMeetingInfo2(meetingName);
    if (meetingInfo === null) {
        return {
            code: 'MeetingNotFound',
            message: 'No meeting is found. Please check meeting name.'
        }
    }
    meetingInfo.Metadata

    var meetingMetadata = meetingInfo.Metadata
    var ownerId = meetingMetadata['OwnerId']
    console.log("OWNERID", ownerId, "email", email)
    if(ownerId != email){
        return {
            code: 'permission denyed',
            message: 'Meeting owner id does not match email'
        }
    }

    var oneCodeGenResult = await generateOnetimeCode(meetingName, userId, headers, body)
    if(!oneCodeGenResult['code']){
        console.log("Generating OneTimeCode failed.",oneCodeGenResult)
        return oneCodeGenResult
    }

    var code = oneCodeGenResult['code']
    var uuid = oneCodeGenResult['uuid']


    var meetingURL = `https://${bucketDomainName}/index.html?code=${code}&uuid=${uuid}&meetingName=${meetingName}&attendeeId=${userId}&mode=HEADLESS_MEETING_MANAGER`
    var params = {
        cluster: clusterArn ,
        count: 1,
        launchType: "FARGATE",
        taskDefinition: taskDefinitionArnManager,
        networkConfiguration: { 
          awsvpcConfiguration: { 
              assignPublicIp: "ENABLED",
              subnets: [ subnetId ]
          }
        },
        overrides:{
            containerOverrides:[{
                name: managerContainerName,
                environment:[
                    {
                        "name": "MEETING_URL",
                        "value": meetingURL
                    },{
                        "name":"BUCKET_ARN",
                        "value":bucketArn
                    }
                ]
            }]
        }
    }

    console.log("Fargate PArams:",params)

    // const res = ecs.runTask(params, function(err, data) {
    //     console.log("run task..... ")  
    //     console.log(err, data)  
    // });

    // console.log(res)

    return {
        code:    'Start Meeting',
        url: meetingURL
    }
}



const defaultResponse = (operation) => {
    console.log("no valid response" + operation)
    return{
        mess: "no valid response" + operation
    }
}








//////////////////////////
/// Global Operation   ///
//////////////////////////
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
///// Request onetime code challenge
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




///// Signin request with onetime code
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





