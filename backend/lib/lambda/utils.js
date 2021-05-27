var AWS = require('aws-sdk');
var provider = new AWS.CognitoIdentityServiceProvider();

exports.getResponseTemplate = () => {
    var response = {
      "statusCode": 200,
      "headers": {
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Origin': '*'
      },
      "body": "{}",
      "isBase64Encoded": false
    };
    return response
}

exports.getEmailFromAccessToken = async (accessToken) =>{
    const p = new Promise((resolve, reject) => {
        provider.getUser({ AccessToken: accessToken }, (err, data) => {
            console.log("getUser")
            console.log(err)
            if(err){
                console.log("invalid accessToken")
                reject("invalid accessToken")
            }
            console.log(data)
            resolve(data)
        })
    })
    const userData = await p

    let email    
    let foundEmail = false
    for(let i = 0; i < userData['UserAttributes'].length; i++){
        const att = userData['UserAttributes'][i]
        if(att['Name'] == 'email'){
            email = att['Value']
            foundEmail = true
        }
    }

    if(foundEmail){
        return email
    }else{
        console.log("email not found")
        throw 'email not found';
    }
}
