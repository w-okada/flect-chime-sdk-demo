
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