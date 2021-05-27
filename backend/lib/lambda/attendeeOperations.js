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
 * helper function for shulle the onetime codes.
 */
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


/**
 * Dispatcher of attendeeOperation.
 * @param {*} operation 
 * @param {*} email 
 * @param {*} meetingName 
 * @param {*} userId 
 * @param {*} header 
 * @param {*} body 
 */
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

/**
 * sub-functiuon of generateOnetimeCode
 */
const getOntimeCodeExpireDate = () => {
    return Math.floor(Date.now() / 1000) + 60 * 5 //5 minutes
}

/**
 * generate onetime code.
 * (1) If there is no meeting, return fail
 * (2) generate the code
 * (3) register the code
 * (4) return the code
 * @param {*} meetingName 
 * @param {*} userId 
 * @param {*} headers 
 * @param {*} body 
 */
const generateOnetimeCode = async (meetingName, userId, headers, body) =>{
    const idToken     = headers["Authorization"]
    const accessToken = headers["x-flect-access-token"]

    //// (1) If there is no meeting, return fail
    let meetingInfo = await meeting.getMeetingInfo2(meetingName);
    if (meetingInfo === null) {
        return {
            code: 'MeetingNotFound',
            message: 'No meeting is found. Please check meeting name.'
        }
    }
    console.info('Generate Onetime Code');

    //// (2) generate the code
    const uuid        = v4()
    const code        = v4().substr(0,6)
    const expireDate  = getOntimeCodeExpireDate()


    //// (3) register the code
    await ddb.updateItem({
        TableName: attendeesTableName,
        Key: {
            AttendeeId: {S:`${meetingName}/${userId}`},
        },
        UpdateExpression:"set OnetimeCodeId=:i, Code=:c, OnetimeCodeStatus=:s, OnetimeCodeExpireDate=:d, IdToken=:idToken, AccessToken=:accessToken",
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
    //// (4) return the code
    return{
        uuid: uuid,
        code: code,
        ontimecodeExpireDate: expireDate,
    }
}



/***
 * start Headless Meeting Manager.
 * 
 * @email caller's email. if this email is not the meeting owner's one, invoke hmm failed.
 */
const startMeetingManager = async (email, meetingName, userId, headers, body) =>{
    console.log("startMeetingManager")
    //// (1) If there is no meeting, return fail
    let meetingInfo = await meeting.getMeetingInfo2(meetingName);
    if (meetingInfo === null) {
        return {
            code: 'MeetingNotFound',
            message: 'No meeting is found. Please check meeting name.'
        }
    }
    meetingInfo.Metadata

    //// (2) check if owner calls or not. 
    var meetingMetadata = meetingInfo.Metadata
    var ownerId = meetingMetadata['OwnerId']
    console.log("OWNERID", ownerId, "email", email)
    if(ownerId != email){
        return {
            code: 'permission denyed',
            message: 'Meeting owner id does not match email'
        }
    }

    //// (3) check already hmm is running
    console.log("HmmTaskArn", meetingInfo.HmmTaskArn)
    if(meetingInfo.HmmTaskArn.length <32){
        console.log("invalid task arn. maybe dummy:", meetingInfo.HmmTaskArn) // dummy is OK.
    }else{
        try{
            const p = new Promise((resolve, reject)=>{
                ecs.describeTasks({
                    tasks: [meetingInfo.HmmTaskArn],
                    cluster: clusterArn,
                },(err,res)=>{
                    console.log("TASK STATUS:", res)
                    console.log("TASK STATUS(err):", err)
                    if(err){
                        reject("describe task exception")
                        return
                    }
                    if(res.tasks.length!=0 && res.tasks[0].desiredStatus == "RUNNING"){
                        reject(`describe task exception: already exists, task num:${res.tasks.length} task desiredStatus:${res.tasks[0].desiredStatus}`)
                        return
                    }
                    resolve()
                })
            })
    
            await p
        }catch(e){
            console.log(e)
            return {
                code: 'exist check exception',
                message: e
            }
        }
    }

    
    //// (4) generate onetime code for the HMM
    var oneCodeGenResult = await generateOnetimeCode(meetingName, userId, headers, body)
    if(!oneCodeGenResult['code']){
        console.log("Generating OneTimeCode failed.",oneCodeGenResult)
        return oneCodeGenResult
    }

    var code = oneCodeGenResult['code']
    var uuid = oneCodeGenResult['uuid']

    //// (5) invoke HMM fargate container
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
                    },{
                        "name":"BUCKET_NAME",
                        "value":bucketName
                    }
                ]
            }]
        }
    }

    console.log("Fargate Params:",params)

    const taskArn = await new Promise((resolve, reject)=>{
        ecs.runTask(params, function(err, data) {
            console.log("run task..... ")  
            console.log("...", err, data)  
            console.log("......", data.tasks[0].taskArn)
            resolve(data.tasks[0].taskArn)
        });
    })

    console.log("TASK RESULT:", taskArn)

    //// (5) register the container to DB
    await ddb.updateItem({
        TableName: meetingTableName,
        Key: {
            MeetingName: {S:`${meetingName}`},
        },
        UpdateExpression:"set HmmTaskArn=:t",
        ExpressionAttributeValues:{
            ':t': {S:taskArn},
        },
        ReturnValues:"UPDATED_NEW",
    }).promise();

    return {
        code:    'Start Meeting',
        url: meetingURL,
        taskArn: taskArn,
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






