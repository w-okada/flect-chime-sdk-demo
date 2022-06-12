// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

export const SUCCESS = 'SUCCESS';
export const FAILED = 'FAILED';


export const send = (event: any, context: any, responseStatus: any, responseData: any, physicalResourceId?: any, noEcho?: any) => {

    return new Promise((resolve, reject) => {
        const responseBody = JSON.stringify({
            Status: responseStatus,
            Reason: 'See the details in CloudWatch Log Stream: ' + context.logStreamName,
            PhysicalResourceId: physicalResourceId || context.logStreamName,
            StackId: event.StackId,
            RequestId: event.RequestId,
            LogicalResourceId: event.LogicalResourceId,
            NoEcho: noEcho || false,
            Data: responseData,
        });

        console.log('Response body:\n', responseBody);

        const https = require('https');
        const url = require('url');

        const parsedUrl = url.parse(event.ResponseURL);
        const options = {
            hostname: parsedUrl.hostname,
            port: 443,
            path: parsedUrl.path,
            method: 'PUT',
            headers: {
                'content-type': '',
                'content-length': responseBody.length,
            }
        };

        const request = https.request(options, (response: any) => {
            console.log('Status code: ' + response.statusCode);
            console.log('Status message: ' + response.statusMessage);
            resolve(context.done());
        });

        request.on('error', (error: any) => {
            console.log('send(..) failed executing https.request(..): ' + error);
            reject(context.done(error));
        });

        request.write(responseBody);
        request.end();
    })
}
