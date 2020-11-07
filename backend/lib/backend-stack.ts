import * as cdk from '@aws-cdk/core';
import * as lambda from "@aws-cdk/aws-lambda";
import {
  RestApi, Integration, LambdaIntegration, Resource,
  MockIntegration, PassthroughBehavior, EmptyModel, Cors, AuthorizationType, CfnAuthorizer, LambdaRestApi
} from "@aws-cdk/aws-apigateway"
import { UserPool, UserPoolClient } from "@aws-cdk/aws-cognito"
import {Table, AttributeType, ProjectionType, } from "@aws-cdk/aws-dynamodb";
import { CfnOutput, Duration } from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3'
import { ManagedPolicy, Effect, PolicyStatement} from '@aws-cdk/aws-iam'
import { Role, ServicePrincipal } from "@aws-cdk/aws-iam";

export class BackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 for Frontend
    const bucket = new s3.Bucket(this, 'StaticSiteBucket', {
      bucketName: (`${id}-Bucket`).toLowerCase(),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      publicReadAccess: true
    })

    // Cognito User Pool
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


    // DynamoDB
    const meetingTable = new Table(this, "meetingTable", {
      tableName: `${id}_MeetingTable`,
      partitionKey: {
        name: "MeetingName",
        type: AttributeType.STRING,
      },
      readCapacity:2,
      writeCapacity:2,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production code
    });

    meetingTable.addGlobalSecondaryIndex({
      indexName:"MeetingId",
      partitionKey:{
        name:"MeetingId", type:AttributeType.STRING
      },
      projectionType: ProjectionType.ALL,
      readCapacity:2,
      writeCapacity:2
    })    

    const attendeeTable = new Table(this, "attendeeTable", {
      tableName: `${id}_attendeeTable`,
      partitionKey: {
        name: "AttendeeId",
        type: AttributeType.STRING,
      },
      readCapacity:2,
      writeCapacity:2,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production code
    });


    // Policy Statement
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
      'chime:ListAttendees'
    )
    statement.addResources(userPool.userPoolArn)
    statement.addResources("arn:*:chime::*:meeting/*")


    // Lambda Layer
    const nodeModulesLayer = new lambda.LayerVersion(this, 'NodeModulesLayer',{
      layerVersionName:`${id}_LambdaLayer`,
      code: lambda.AssetCode.fromAsset(`${__dirname}/layer`),
      compatibleRuntimes: [lambda.Runtime.NODEJS_12_X]
    });

    // Lambda Function 作成
    //// utility
    const addPermission = (f:lambda.Function)=>{
      meetingTable.grantFullAccess(f)
      attendeeTable.grantFullAccess(f)
      f.addToRolePolicy(statement)
    }
    const environment = {
      MEETING_TABLE_NAME: meetingTable.tableName,
      ATTENDEE_TABLE_NAME: attendeeTable.tableName,
      USER_POOL_ID: userPool.userPoolId
    }

    const lambdaFunctionGetRoot: lambda.Function = new lambda.Function(this, "funcHelloWorld", {
      functionName: `${id}_getRoot`,
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset(`${__dirname}/lambda`),
      handler: "index.handler",
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
      environment: environment,
      layers: [nodeModulesLayer],
    })
    addPermission(lambdaFunctionGetRoot)
    

    const lambdaFunctionGetMeetings: lambda.Function = new lambda.Function(this, "funcGetMeetings", {
      functionName: `${id}_getMeetings`,
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset(`${__dirname}/lambda`),
      handler: "index.getMeetings",
      memorySize: 256,
      timeout: Duration.seconds(10),
      environment: environment,
      layers: [nodeModulesLayer],
    })
    addPermission(lambdaFunctionGetMeetings)

    const lambdaFunctionPostMeeting: lambda.Function = new lambda.Function(this, "funcPostMeeting", {
      functionName: `${id}_postMeeting`,
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset(`${__dirname}/lambda`),
      handler: "index.postMeeting",
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
      environment: environment,
      layers: [nodeModulesLayer],
    })
    addPermission(lambdaFunctionPostMeeting)


    const lambdaFunctionDeleteMeeting: lambda.Function = new lambda.Function(this, "funcDeleteMeeting", {
      functionName: `${id}_deleteMeeting`,
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset(`${__dirname}/lambda`),
      handler: "index.deleteMeeting",
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
      environment: environment,
      layers: [nodeModulesLayer],
    })
    addPermission(lambdaFunctionDeleteMeeting)

    const lambdaFunctionPostAttendee: lambda.Function = new lambda.Function(this, "funcPostAttendee", {
      functionName: `${id}_postAttendee`,
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset(`${__dirname}/lambda`),
      handler: "index.postAttendee",
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
      environment: environment,
      layers: [nodeModulesLayer],
    })
    addPermission(lambdaFunctionPostAttendee)

    // API Gateway
    const restApi: RestApi = new RestApi(this, "ChimeAPI", {
      restApiName: `${id}_restApi`,
      defaultCorsPreflightOptions: {
        //        allowOrigins: Cors.ALL_ORIGINS,
        allowOrigins: ["https://localhost:3000", bucket.bucketWebsiteDomainName],
        allowMethods: Cors.ALL_METHODS,
        allowCredentials: true
      },
    })



    // Authorizer
    const authorizer = new CfnAuthorizer(this, 'cfnAuth', {
      name: `${id}_authorizer`,
      type: AuthorizationType.COGNITO,
      identitySource: 'method.request.header.Authorization',
      restApiId: restApi.restApiId,
      providerArns: [userPool.userPoolArn],
    })

    // API Integration
    const root = restApi.root
    root.addMethod("GET", new LambdaIntegration(lambdaFunctionGetRoot), {
      operationName:`${id}_getRoot`,
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: authorizer.ref
      }
    })

    const apiMeetings = restApi.root.addResource("meetings")
    apiMeetings.addMethod("GET", new LambdaIntegration(lambdaFunctionGetMeetings), {
      operationName:`${id}_getMeetings`,
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: authorizer.ref
      }
    })
    apiMeetings.addMethod("POST", new LambdaIntegration(lambdaFunctionPostMeeting), {
      operationName:`${id}_postMeeting`,
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: authorizer.ref
      },
    })

    const apiMeeting = apiMeetings.addResource("{meetingName}")
    apiMeeting.addMethod("DELETE", new LambdaIntegration(lambdaFunctionDeleteMeeting),{
      operationName:`${id}_deleteMeeting`,
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: authorizer.ref
      },
    })

    const apiAttendees = apiMeeting.addResource("attendees")
    apiAttendees.addMethod("POST", new LambdaIntegration(lambdaFunctionPostAttendee), {
      operationName:`${id}_postAttendee`,
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: authorizer.ref
      },
    })





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

    new CfnOutput(this, "RestAPIEndpoint", {
      description: "RestAPIEndpoint",
      value: restApi.url
    })

  }
}
