import { aws_apigateway as api } from "aws-cdk-lib"
import { aws_lambda as lambda } from "aws-cdk-lib";
import { addCorsOptions } from "./100_addCorsOptions";

// (注) APIを追加したら、(3)でaddCorsOptionsを実施するのを忘れずに。


export const createApis = (id: string, restApi: api.RestApi, authorizerId: string, lambdaFunctionForRestAPI: lambda.Function, corsOrigin: string) => {

    // (1) basic parameters
    const basicParams = {
        authorizationType: api.AuthorizationType.CUSTOM,
        authorizer: {
            authorizerId: authorizerId,
        },
    }

    // (2) APIs
    //// (2-1) Get Root
    const root = restApi.root

    //// (2-2) Meeting
    const apiMeetings = root.addResource("meetings");
    const apiMeeting = apiMeetings.addResource("{meetingName}");
    ////// (2-2-1) Get Meetings
    apiMeetings.addMethod("GET", new api.LambdaIntegration(lambdaFunctionForRestAPI), {
        ...basicParams,
        operationName: `${id}_getMeetings`,
    });
    ////// (2-2-2) Post Meeting
    apiMeetings.addMethod("POST", new api.LambdaIntegration(lambdaFunctionForRestAPI), {
        ...basicParams,
        operationName: `${id}_postMeeting`,
    });
    ////// (2-2-3) Delete Meeting
    apiMeeting.addMethod("DELETE", new api.LambdaIntegration(lambdaFunctionForRestAPI), {
        ...basicParams,
        operationName: `${id}_deleteMeeting`,
    });
    ////// (2-2-4) Get Meeting
    apiMeeting.addMethod("GET", new api.LambdaIntegration(lambdaFunctionForRestAPI), {
        ...basicParams,
        operationName: `${id}_getMeeting`,
    });

    //// (2-3) Attendee
    const apiAttendees = apiMeeting.addResource("attendees");
    const apiAttendee = apiAttendees.addResource("{attendeeId}");
    ////// (2-3-1) Get Attendee
    apiAttendee.addMethod("GET", new api.LambdaIntegration(lambdaFunctionForRestAPI), {
        ...basicParams,
        operationName: `${id}_getAttendee`,
    });
    ////// (2-3-2) Get Attendee
    apiAttendees.addMethod("POST", new api.LambdaIntegration(lambdaFunctionForRestAPI), {
        ...basicParams,
        operationName: `${id}_postAttendee`,
    });
    ////// (2-3-3) List Attendees
    apiAttendees.addMethod("GET", new api.LambdaIntegration(lambdaFunctionForRestAPI), {
        ...basicParams,
        operationName: `${id}_getAttendees`,
    });

    //// (2-4) Attendee Operations // Operation under meeting
    const apiAttendeeOperations = apiAttendee.addResource("operations");
    const apiAttendeeOperation = apiAttendeeOperations.addResource("{operation}");
    ////// (2-4-1) Post Attendee Operation
    apiAttendeeOperation.addMethod("POST", new api.LambdaIntegration(lambdaFunctionForRestAPI), {
        ...basicParams,
        operationName: `${id}_postAttendeeOperation`,
    });

    //// (2-5) Log
    const apiLogs = root.addResource("logs");
    //// (2-5-1) Post Log
    apiLogs.addMethod("POST", new api.LambdaIntegration(lambdaFunctionForRestAPI), {
        operationName: `${id}_postLog`,
    });

    //// (2-6) Operation // Global Operation(without signin)
    const apiOperations = root.addResource("operations");
    const apiOperation = apiOperations.addResource("{operation}");
    apiOperation.addMethod("POST", new api.LambdaIntegration(lambdaFunctionForRestAPI), {
        operationName: `${id}_postOperation`,
    });

    //// (2-7) Environment
    ///// (2-7-1) Get envrionment // not use?
    const apiEnvironemnt = root.addResource("environment");
    apiEnvironemnt.addMethod("GET", new api.LambdaIntegration(lambdaFunctionForRestAPI), {
        ...basicParams,
        operationName: `${id}_getEnvironment`,
    });

    ///// (2-7-2) Post envrionment
    apiEnvironemnt.addMethod("POST", new api.LambdaIntegration(lambdaFunctionForRestAPI), {
        ...basicParams,
        operationName: `${id}_postEnvironment`,
    });

    // (3) CORS Configuration
    [root,
        apiMeetings,
        apiMeeting,
        apiAttendees,
        apiAttendee,
        apiAttendeeOperations,
        apiAttendeeOperation,
        apiLogs,
        apiOperations,
        apiOperation,
        apiEnvironemnt,].forEach(func => {
            addCorsOptions(func, corsOrigin)
        })

}