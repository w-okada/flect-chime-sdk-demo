const { v4 } = require('uuid');
var AWS = require('aws-sdk');
// const { url } = require('inspector');
// const { exception } = require('console');

//// Inject Environment
var attendeesTableName       = process.env.ATTENDEE_TABLE_NAME
var meetingTableName         = process.env.MEETING_TABLE_NAME
var clusterArn               = process.env.CLUSTER_ARN
var taskDefinitionArnManager = process.env.TASK_DIFINITION_ARN_MANAGER
var vpcId                    = process.env.VPC_ID // not used
var subnetId                 = process.env.SUBNET_ID
var bucketDomainName         = process.env.BUCKET_DOMAIN_NAME
var managerContainerName     = process.env.MANAGER_CONTAINER_NAME
var bucketArn                = process.env.BUCKET_ARN
var bucketName               = process.env.BUCKET_NAME

//// AWS Clients setup
var ddb = new AWS.DynamoDB();
var meeting = require('./meeting');
var ecs = new AWS.ECS();

/**
 * Dispatcher
 * @param {*} operation 
 * @param {*} header 
 * @param {*} body 
 */
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


/**
 * generate onetime code challenge
 * (1) retrieve onetime code information
 * (2) generate dummy code
 * (3) return challenge
 * @param {*} headers 
 * @param {*} body 
 */
const onetimeCodeSigninRequest = async  (headers, body) =>{
    console.log("[onetimeCodeSigninRequest]:", body)
    const uuid        = v4()
    const meetingName = body.meetingName // already encoded.
    const attendeeId  = body.attendeeId

    //// (1) retrieve onetime code information
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
    console.log("dynamo", result.Item.OnetimeCodeId.S, result.Item.Code.S, result.Item.OnetimeCodeExpireDate.N, result.Item.OnetimeCodeStatus.S)

    //// (2) generate dummy code
    const codes = []
    for(let i=0; i< 5; i++){
        codes.push(v4().substr(0,6))
    }
    codes.push(result.Item.Code.S)
    codes.shuffle()
    
    //// (3) return challenge
    return{
        uuid: uuid,
        codes: codes,
        status:result.Item.OnetimeCodeStatus.S,
        meetingName: meetingName,
        attendeeId: attendeeId,
    }
}


/**
 * signin with onetimecode
 * (1) retrieve onetime code information
 * (2) invalidate onetimecode
 * (3) check onetime code is same as between param and db.
 * @param {*} headers 
 * @param {*} body 
 */
const onetimeCodeSignin = async  (headers, body) =>{
    console.log("[onetimeCodeSigninRequest]:", body)
    const meetingName = body.meetingName // already encoded.
    const attendeeId  = body.attendeeId

    //// (1) retrieve onetime code information
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
    console.log("dynamo", result.Item.OnetimeCodeId.S, result.Item.Code.S, result.Item.OnetimeCodeExpireDate.N, result.Item.OnetimeCodeStatus.S)


    //// (2) invalidate onetimecode
    await ddb.updateItem({
        TableName: attendeesTableName,
        Key: {
            AttendeeId: {S: tablekey },
        },
        UpdateExpression:"set OnetimeCodeStatus=:s, IdToken=:idToken, AccessToken=:accessToken",
        ExpressionAttributeValues:{
            ':s': {S:'n/a'},
            ':idToken': {S:'-'},
            ':accessToken': {S:'-'},
        },
        ReturnValues:"UPDATED_NEW",
    }).promise();

    //// (3) check onetime code is same as between param and db.
    let signin = result.Item.Code.S === body.code
    console.log("sign in result:", signin)
    if(result.Item.OnetimeCodeStatus.S !== "active"){
        console.log("code is deactivated!")
        signin = false
    }
    if(signin){
        return{
            result: signin,
            idToken: result.Item.IdToken.S,
            accessToken: result.Item.AccessToken.S,
            userName: result.Item.UserName.S,
        }
    }else{
        return{
            result: signin,
        }
    }
    
}

/**
 * return default response
 * @param {*} operation 
 */
const defaultResponse = (operation) => {
    console.log("no valid response" + operation)
    return{
        mess: "no valid response" + operation
    }
}


