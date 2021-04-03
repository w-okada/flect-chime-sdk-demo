import * as cdk from '@aws-cdk/core';
import * as lambda from "@aws-cdk/aws-lambda";
import { RestApi, LambdaIntegration, MockIntegration, PassthroughBehavior, AuthorizationType, IResource, CfnAuthorizer } from "@aws-cdk/aws-apigateway"
import * as v2 from "@aws-cdk/aws-apigatewayv2";
// { CfnApi, CfnDeployment, CfnIntegration, CfnRoute, CfnStage, CfnAuthorizer }
import { UserPool, UserPoolClient } from "@aws-cdk/aws-cognito"
import { Table, AttributeType, ProjectionType, } from "@aws-cdk/aws-dynamodb";
import { CfnOutput, Duration, ConcreteDependable } from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3'
import { ManagedPolicy, Effect, PolicyStatement } from '@aws-cdk/aws-iam'
import { Role, ServicePrincipal } from "@aws-cdk/aws-iam";
import { FRONTEND_LOCAL_DEV } from '../bin/config';

export class BackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    ///////////////////////////////
    //// Authentication
    ///////////////////////////////
    ////  (1) Cognito User Pool
    const userPool = new UserPool(this, `${id}_UserPool`, {
      userPoolName: `${id}_UserPool`,
      selfSignUpEnabled: true,
      autoVerify: {
        email: true
      },
      passwordPolicy: {
        minLength: 6,
        requireSymbols: false
      },
      signInAliases: {
        email: true
      }
    })

    const userPoolClient = new UserPoolClient(this, id + "_UserPool_Client", {
      userPoolClientName: `${id}_UserPoolClient`,
      userPool: userPool
    })

    //// (2) Policy Statement
    const statement = new PolicyStatement({
      effect: Effect.ALLOW,
    })
    statement.addActions(
      "cognito-idp:GetUser",
      "cognito-idp:AdminGetUser",

      'chime:CreateMeeting',
      'chime:DeleteMeeting',
      'chime:GetMeeting',
      'chime:ListMeetings',
      'chime:BatchCreateAttendee',
      'chime:CreateAttendee',
      'chime:DeleteAttendee',
      'chime:GetAttendee',
      'chime:ListAttendees',

      'execute-api:ManageConnections'
    )
    statement.addResources(userPool.userPoolArn)
    statement.addResources("arn:*:chime::*:meeting/*")
    statement.addResources("arn:aws:execute-api:*:*:**/@connections/*")

    //////////////////////////////////////
    //// Storage Resources (S3)
    //////////////////////////////////////
    const bucket = new s3.Bucket(this, 'StaticSiteBucket', {
      bucketName: (`${id}-Bucket`).toLowerCase(),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      publicReadAccess: true,
    })



    //////////////////////////////////////
    //// Storage Resources (DynamoDB)
    //////////////////////////////////////
    //// (1) Meeting Table
    const meetingTable = new Table(this, "meetingTable", {
      tableName: `${id}_MeetingTable`,
      partitionKey: {
        name: "MeetingName",
        type: AttributeType.STRING,
      },
      readCapacity: 2,
      writeCapacity: 2,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production code
    });

    meetingTable.addGlobalSecondaryIndex({
      indexName: "MeetingId",
      partitionKey: {
        name: "MeetingId", type: AttributeType.STRING
      },
      projectionType: ProjectionType.ALL,
      readCapacity: 2,
      writeCapacity: 2
    })

    //// (2) Attendee Table
    const attendeeTable = new Table(this, "attendeeTable", {
      tableName: `${id}_attendeeTable`,
      partitionKey: {
        name: "AttendeeId",
        type: AttributeType.STRING,
      },
      readCapacity: 2,
      writeCapacity: 2,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production code
    });

    //// (3) Connection Table
    const connectionTable = new Table(this, "connectionTable", {
      tableName: `${id}_connectionTable`,
      partitionKey: {
        name: "MeetingId",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "AttendeeId",
        type: AttributeType.STRING,
      },
      readCapacity: 2,
      writeCapacity: 2,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production code
    });


    ///////////////////////////////
    //// Lambda Layers
    ///////////////////////////////
    // ( - ) Lambda Layer
    const nodeModulesLayer = new lambda.LayerVersion(this, 'NodeModulesLayer', {
      layerVersionName: `${id}_LambdaLayer`,
      code: lambda.AssetCode.fromAsset(`${__dirname}/layer`),
      compatibleRuntimes: [lambda.Runtime.NODEJS_12_X]
    });

    // ( - ) Utility
    const addCommonSetting = (f: lambda.Function) => {
      meetingTable.grantFullAccess(f)
      attendeeTable.grantFullAccess(f)
      connectionTable.grantFullAccess(f)
      f.addToRolePolicy(statement)

      f.addEnvironment("MEETING_TABLE_NAME", meetingTable.tableName)
      f.addEnvironment("ATTENDEE_TABLE_NAME", attendeeTable.tableName)
      f.addEnvironment("CONNECTION_TABLE_NAME", connectionTable.tableName)
      f.addEnvironment("USER_POOL_ID", userPool.userPoolId)
      f.addLayers(nodeModulesLayer)
    }

    //// (1) Root Function
    const lambdaFunctionGetRoot: lambda.Function = new lambda.Function(this, "funcHelloWorld", {
      functionName: `${id}_getRoot`,
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset(`${__dirname}/lambda`),
      handler: "index.handler",
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
    })
    addCommonSetting(lambdaFunctionGetRoot)


    //// (2-1) Get Meetings
    const lambdaFunctionGetMeetings: lambda.Function = new lambda.Function(this, "funcGetMeetings", {
      functionName: `${id}_getMeetings`,
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset(`${__dirname}/lambda`),
      handler: "index.getMeetings",
      memorySize: 256,
      timeout: Duration.seconds(10),
    })
    addCommonSetting(lambdaFunctionGetMeetings)

    //// (2-2) Post Meeting
    const lambdaFunctionPostMeeting: lambda.Function = new lambda.Function(this, "funcPostMeeting", {
      functionName: `${id}_postMeeting`,
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset(`${__dirname}/lambda`),
      handler: "index.postMeeting",
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
    })
    addCommonSetting(lambdaFunctionPostMeeting)


    //// (2-3) Delete Meeting
    const lambdaFunctionDeleteMeeting: lambda.Function = new lambda.Function(this, "funcDeleteMeeting", {
      functionName: `${id}_deleteMeeting`,
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset(`${__dirname}/lambda`),
      handler: "index.deleteMeeting",
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
    })
    addCommonSetting(lambdaFunctionDeleteMeeting)

    //// (3-1) Get Attendee
    const lambdaFunctionGetAttendee: lambda.Function = new lambda.Function(this, "funcGetAttendee", {
      functionName: `${id}_getAttendee`,
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset(`${__dirname}/lambda`),
      handler: "index.getAttendee",
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
    })
    addCommonSetting(lambdaFunctionGetAttendee)

    //// (3-2) Post Attendee
    const lambdaFunctionPostAttendee: lambda.Function = new lambda.Function(this, "funcPostAttendee", {
      functionName: `${id}_postAttendee`,
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset(`${__dirname}/lambda`),
      handler: "index.postAttendee",
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
    })
    addCommonSetting(lambdaFunctionPostAttendee)

    //// (4-1) Post Log
    const lambdaFunctionPostLog: lambda.Function = new lambda.Function(this, "funcPostLog", {
      functionName: `${id}_postLog`,
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset(`${__dirname}/lambda`),
      handler: "index.postLog",
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
    })
    addCommonSetting(lambdaFunctionPostLog)

    ///////////////////////////////
    //// API Gateway
    ///////////////////////////////

    //// ( - ) Utility
    // https://github.com/aws/aws-cdk/issues/906
    const addCorsOptions = (apiResource: IResource) => {
      let origin
      if (FRONTEND_LOCAL_DEV) {
        origin = "'https://localhost:3000'"
        // origin = "'https://192.168.1.4:3000'"
      } else {
        origin = `'https://${bucket.bucketDomainName}'`
      }
      apiResource.addMethod('OPTIONS', new MockIntegration({
        integrationResponses: [{
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent,X-Flect-Access-Token'",
            'method.response.header.Access-Control-Allow-Origin': origin,
            'method.response.header.Access-Control-Allow-Credentials': "'true'",
            'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE,PATCH,HEAD'",
          }
        }],
        passthroughBehavior: PassthroughBehavior.WHEN_NO_MATCH,
        requestTemplates: {
          "application/json": "{\"statusCode\": 200}"
        }
      }), {
        methodResponses: [{
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Headers': true,
            'method.response.header.Access-Control-Allow-Methods': true,
            'method.response.header.Access-Control-Allow-Credentials': true,
            'method.response.header.Access-Control-Allow-Origin': true,
          }

        }]
      })
    }



    //// ( - ) Rest API 
    const restApi: RestApi = new RestApi(this, "ChimeAPI", {
      restApiName: `${id}_restApi`,
    })

    //// ( - ) Authorizer
    //////// for V1 ...
    const authorizer = new CfnAuthorizer(this, 'cfnAuth', {
      name: `${id}_authorizer`,
      type: AuthorizationType.COGNITO,
      identitySource: 'method.request.header.Authorization',
      restApiId: restApi.restApiId,
      providerArns: [userPool.userPoolArn],
    })

    //// (1) Get Root
    const root = restApi.root
    addCorsOptions(root)
    const addRoot = root.addMethod("GET", new LambdaIntegration(lambdaFunctionGetRoot), {
      operationName: `${id}_getRoot`,
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: authorizer.ref
      }
    })

    //// (2) Meeting
    const apiMeetings = restApi.root.addResource("meetings")
    const apiMeeting = apiMeetings.addResource("{meetingName}")
    addCorsOptions(apiMeetings)
    addCorsOptions(apiMeeting)
    //// (2-1) Get Meetings
    apiMeetings.addMethod("GET", new LambdaIntegration(lambdaFunctionGetMeetings), {
      operationName: `${id}_getMeetings`,
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: authorizer.ref
      }
    })

    //// (2-2) Post Meeting
    apiMeetings.addMethod("POST", new LambdaIntegration(lambdaFunctionPostMeeting), {
      operationName: `${id}_postMeeting`,
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: authorizer.ref
      },
    })

    //// (2-3) Delete Meeting
    apiMeeting.addMethod("DELETE", new LambdaIntegration(lambdaFunctionDeleteMeeting), {
      operationName: `${id}_deleteMeeting`,
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: authorizer.ref
      },
    })


    ///// (3) Attendee
    const apiAttendees = apiMeeting.addResource("attendees")
    const apiAttendee = apiAttendees.addResource("{userId}")
    addCorsOptions(apiAttendees)
    addCorsOptions(apiAttendee)

    //// (3-1) Get Attendee
    apiAttendee.addMethod("GET", new LambdaIntegration(lambdaFunctionGetAttendee), {
      operationName: `${id}_postAttendee`,
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: authorizer.ref
      },
    })

    //// (3-2) Post Attendee
    apiAttendees.addMethod("POST", new LambdaIntegration(lambdaFunctionPostAttendee), {
      operationName: `${id}_postAttendee`,
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: authorizer.ref
      },
    })

    //// (4) Log
    const apiLogs = restApi.root.addResource("logs")
    addCorsOptions(apiLogs)
    //// (4-1) Post Log
    apiLogs.addMethod("POST", new LambdaIntegration(lambdaFunctionPostLog), {
      operationName: `${id}_postLog`,
      // authorizationType: AuthorizationType.COGNITO,
      // authorizer: {
      //   authorizerId: authorizer.ref
      // },
    })


    /////////
    // WebSocket
    // https://github.com/aws-samples/aws-cdk-examples/pull/325/files
    ////////

    // API Gateway
    const webSocketApi = new v2.CfnApi(this, "ChimeMessageAPI", {
      name: "ChimeMessageAPI",
      protocolType: "WEBSOCKET",
      routeSelectionExpression: "$request.body.action",
    });

    //// Lambda Function
    // (1) connect
    const lambdaFuncMessageConnect = new lambda.Function(this, 'ChimeMessageAPIConnect', {
      code: lambda.Code.asset(`${__dirname}/lambda`),
      handler: 'message.connect',
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: Duration.seconds(300),
      memorySize: 256,
    });
    addCommonSetting(lambdaFuncMessageConnect)

    // (2) disconnect
    const lambdaFuncMessageDisconnect = new lambda.Function(this, 'ChimeMessageAPIDisconnect', {
      code: lambda.Code.asset(`${__dirname}/lambda`),
      handler: 'message.disconnect',
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: Duration.seconds(300),
      memorySize: 256,
    });
    addCommonSetting(lambdaFuncMessageDisconnect)


    // (3) message
    const lambdaFuncMessageMessage = new lambda.Function(this, 'ChimeMessageAPIMessage', {
      code: lambda.Code.asset(`${__dirname}/lambda`),
      handler: 'message.message',
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: Duration.seconds(300),
      memorySize: 256,
    });
    addCommonSetting(lambdaFuncMessageMessage)


    // (4) auth
    const lambdaFuncMessageAuth = new lambda.Function(this, 'ChimeMessageAPIAuth', {
      code: lambda.Code.asset(`${__dirname}/lambda`),
      handler: 'message.authorize',
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: Duration.seconds(300),
      memorySize: 256,
    });
    addCommonSetting(lambdaFuncMessageAuth)

    const policy = new PolicyStatement({
      effect: Effect.ALLOW,
      resources: [
        lambdaFuncMessageConnect.functionArn,
        lambdaFuncMessageDisconnect.functionArn,
        lambdaFuncMessageMessage.functionArn,
        lambdaFuncMessageAuth.functionArn,

      ],
      actions: ["lambda:InvokeFunction"]
    });

    const role = new Role(this, `ChimeMessageAPIRole`, {
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com")
    });
    role.addToPolicy(policy);

    const messageAuthorizer = new v2.CfnAuthorizer(this, 'messageAuthorizer', {
      name: `${id}_authorizer`,
      authorizerType: 'REQUEST',
      identitySource: [],
      apiId: webSocketApi.ref,
      authorizerUri: `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${lambdaFuncMessageAuth.functionArn}/invocations`,
      authorizerCredentialsArn:role.roleArn
    })


    //// Integration
    const connectIntegration = new v2.CfnIntegration(this, "ChimeMessageAPIConnectIntegration", {
      apiId: webSocketApi.ref,
      integrationType: "AWS_PROXY",
      integrationUri: "arn:aws:apigateway:" + this.region + ":lambda:path/2015-03-31/functions/" + lambdaFuncMessageConnect.functionArn + "/invocations",
      credentialsArn: role.roleArn,
    })

    const disconnectIntegration = new v2.CfnIntegration(this, "ChimeMessageAPIDisconnectIntegration", {
      apiId: webSocketApi.ref,
      integrationType: "AWS_PROXY",
      integrationUri: "arn:aws:apigateway:" + this.region + ":lambda:path/2015-03-31/functions/" + lambdaFuncMessageDisconnect.functionArn + "/invocations",
      credentialsArn: role.roleArn,
    })

    const messageIntegration = new v2.CfnIntegration(this, "ChimeMessageAPIMessageIntegration", {
      apiId: webSocketApi.ref,
      integrationType: "AWS_PROXY",
      integrationUri: "arn:aws:apigateway:" + this.region + ":lambda:path/2015-03-31/functions/" + lambdaFuncMessageMessage.functionArn + "/invocations",
      credentialsArn: role.roleArn,
    })


    // const messageAuthorizer = new CfnAuthorizer(this, 'cfnMessageAuth', {
    //   name: `${id}_messageAuthorizer`,
    //   type: "TOKEN",
    //   restApiId: restApi.restApiId,
    //   identitySource: 'method.request.header.Authorization',
    //   authorizerCredentials: role.roleArn,
    //   authorizerUri: `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${lambdaFuncMessageAuth.functionArn}/invocations`,
    // })    

    //// Route
    const connectRoute = new v2.CfnRoute(this, "connectRoute", {
      apiId: webSocketApi.ref,
      routeKey: "$connect",
      authorizationType: AuthorizationType.CUSTOM,
      //authorizationType: "NONE",
      target: "integrations/" + connectIntegration.ref,
      authorizerId: messageAuthorizer.ref
    });

    const disconnectRoute = new v2.CfnRoute(this, "disconnectRoute", {
      apiId: webSocketApi.ref,
      routeKey: "$disconnect",
      authorizationType: "NONE",
      target: "integrations/" + disconnectIntegration.ref,
    });

    const messageRoute = new v2.CfnRoute(this, "messageRoute", {
      apiId: webSocketApi.ref,
      routeKey: "sendmessage",
      authorizationType: "NONE",
      target: "integrations/" + messageIntegration.ref,
    });

    //// Deploy
    const deployment = new v2.CfnDeployment(this, 'ChimeMessageAPIDep', {
      apiId: webSocketApi.ref
    });

    const stage = new v2.CfnStage(this, `ChimeMessageAPIStage`, {
      apiId: webSocketApi.ref,
      autoDeploy: true,
      deploymentId: deployment.ref,
      stageName: "Prod"
    });

    const dependencies = new ConcreteDependable();
    dependencies.add(connectRoute)
    dependencies.add(disconnectRoute)
    dependencies.add(messageRoute)
    deployment.node.addDependency(dependencies);




    ///////////////////////////////
    //// Output 
    ///////////////////////////////
    new CfnOutput(this, "UserPoolId", {
      description: "UserPoolId",
      value: userPool.userPoolId,
    })

    new CfnOutput(this, "UserPoolClientId", {
      description: "UserPoolClientId",
      value: userPoolClient.userPoolClientId,
    })

    new CfnOutput(this, "Bucket", {
      description: "Bucket",
      value: bucket.bucketName
    })

    new CfnOutput(this, "BucketWebsiteDomainName", {
      description: "BucketWebsiteDomainName",
      value: bucket.bucketWebsiteDomainName
    })

    new CfnOutput(this, "BucketDomainName", {
      description: "BucketDomainName",
      value: bucket.bucketDomainName
    })

    new CfnOutput(this, "RestAPIEndpoint", {
      description: "RestAPIEndpoint",
      value: restApi.url
    })

    new CfnOutput(this, "WebSocketEndpoint", {
      description: "WebSocketEndpoint",
      value: webSocketApi.attrApiEndpoint,
    })
  }
}
