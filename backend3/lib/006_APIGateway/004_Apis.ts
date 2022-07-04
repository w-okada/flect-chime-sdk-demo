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

    // (2) Meeting APIs
    //// (2-1) Root
    const root = restApi.root

    //// (2-2) Meetings
    const apiMeetings = root.addResource("meetings");
    ////// (2-2-1) Post Meeting
    apiMeetings.addMethod("POST", new api.LambdaIntegration(lambdaFunctionForRestAPI), {
        ...basicParams,
        operationName: `${id}_postMeeting`,
    });
    ////// (2-2-2) Get Meetings
    apiMeetings.addMethod("GET", new api.LambdaIntegration(lambdaFunctionForRestAPI), {
        ...basicParams,
        operationName: `${id}_getMeetings`,
    });

    //// (2-3) Meeting
    const apiMeeting = apiMeetings.addResource("{exMeetingId}");
    ////// (2-3-1) Get Meeting
    apiMeeting.addMethod("GET", new api.LambdaIntegration(lambdaFunctionForRestAPI), {
        ...basicParams,
        operationName: `${id}_getMeeting`,
    });
    ////// (2-3-2) PUT Meeting
    apiMeeting.addMethod("PUT", new api.LambdaIntegration(lambdaFunctionForRestAPI), {
        ...basicParams,
        operationName: `${id}_putMeeting`,
    });
    ////// (2-3-3) Delete Meeting
    apiMeeting.addMethod("DELETE", new api.LambdaIntegration(lambdaFunctionForRestAPI), {
        ...basicParams,
        operationName: `${id}_deleteMeeting`,
    });

    //// (2-4) Attendees
    const apiAttendees = apiMeeting.addResource("attendees");
    ////// (2-4-1) POST Attendee
    apiAttendees.addMethod("POST", new api.LambdaIntegration(lambdaFunctionForRestAPI), {
        ...basicParams,
        operationName: `${id}_postAttendee`,
    });
    ////// (2-4-2) List Attendees
    apiAttendees.addMethod("GET", new api.LambdaIntegration(lambdaFunctionForRestAPI), {
        ...basicParams,
        operationName: `${id}_getAttendees`,
    });
    //// (2-5) Attendee
    const apiAttendee = apiAttendees.addResource("{attendeeId}");
    ////// (2-5-1) Get Attendee
    apiAttendee.addMethod("GET", new api.LambdaIntegration(lambdaFunctionForRestAPI), {
        ...basicParams,
        operationName: `${id}_getAttendee`,
    });

    //// (2-6) Attendee Operations // Operation under meeting
    const apiAttendeeOperations = apiAttendee.addResource("operations");
    //// (2-7) Attendee Operation // Operation under meeting
    const apiAttendeeOperation = apiAttendeeOperations.addResource("{operation}");
    ////// (2-7-1) Post Attendee Operation
    apiAttendeeOperation.addMethod("POST", new api.LambdaIntegration(lambdaFunctionForRestAPI), {
        ...basicParams,
        operationName: `${id}_postAttendeeOperation`,
    });

    // (3) Log APIs
    //// (3-1) logs
    const apiLogs = root.addResource("logs");
    ////// (3-1-1) Post Log
    apiLogs.addMethod("POST", new api.LambdaIntegration(lambdaFunctionForRestAPI), {
        operationName: `${id}_postLog`,
    });

    // (4) Operation API// Global Operation(without signin)
    //// (4-1) Operations // Global Operation(without signin)
    const apiOperations = root.addResource("operations");
    //// (4-2) Operation // Global Operation(without signin)
    const apiOperation = apiOperations.addResource("{operation}");
    ////// (4-2-1) POST Operation // Global Operation(without signin)
    apiOperation.addMethod("POST", new api.LambdaIntegration(lambdaFunctionForRestAPI), {
        operationName: `${id}_postOperation`,
    });

    // (5) Environment API
    ///// (5-1) envrionments
    const apiEnvironemnts = root.addResource("environments");
    ////// (5-1-1) GET Environments
    apiEnvironemnts.addMethod("GET", new api.LambdaIntegration(lambdaFunctionForRestAPI), {
        ...basicParams,
        operationName: `${id}_getEnvironments`,
    });
    ////// (5-1-2) POST Environments
    apiEnvironemnts.addMethod("POST", new api.LambdaIntegration(lambdaFunctionForRestAPI), {
        ...basicParams,
        operationName: `${id}_postEnvironments`,
    });

    ///// (5-2) envrionment
    const apiEnvironemnt = apiEnvironemnts.addResource("{globalUserId}");
    /////// (5-2-1) get envrionment
    apiEnvironemnt.addMethod("GET", new api.LambdaIntegration(lambdaFunctionForRestAPI), {
        ...basicParams,
        operationName: `${id}_getEnvironment`,
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
        apiEnvironemnts,
        apiEnvironemnt,].forEach(func => {
            addCorsOptions(func, corsOrigin)
        })

}