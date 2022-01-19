import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import { RestApi, LambdaIntegration, MockIntegration, PassthroughBehavior, AuthorizationType, IResource, CfnAuthorizer } from "@aws-cdk/aws-apigateway";
import * as v2 from "@aws-cdk/aws-apigatewayv2";
// { CfnApi, CfnDeployment, CfnIntegration, CfnRoute, CfnStage, CfnAuthorizer }
import { UserPool, UserPoolClient } from "@aws-cdk/aws-cognito";
import { Table, AttributeType, ProjectionType } from "@aws-cdk/aws-dynamodb";
import { CfnOutput, Duration, ConcreteDependable } from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import { ManagedPolicy, Effect, PolicyStatement } from "@aws-cdk/aws-iam";
import { Role, ServicePrincipal } from "@aws-cdk/aws-iam";
import { FRONTEND_LOCAL_DEV, USE_DOCKER, USE_CDN, SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, SLACK_SIGNING_SECRET, SLACK_STATE_SECRET, SLACK_APP_DB_PASSWORD, SLACK_APP_DB_SALT, SLACK_APP_DB_SECRET } from "../bin/config";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as logs from "@aws-cdk/aws-logs";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as iam from "@aws-cdk/aws-iam";

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
                email: true,
            },
            passwordPolicy: {
                minLength: 6,
                requireSymbols: false,
            },
            signInAliases: {
                email: true,
            },
        });

        const userPoolClient = new UserPoolClient(this, id + "_UserPool_Client", {
            userPoolClientName: `${id}_UserPoolClient`,
            userPool: userPool,
            accessTokenValidity: Duration.minutes(1440),
            idTokenValidity: Duration.minutes(1440),
            refreshTokenValidity: Duration.days(30),
        });

        //// (2) Policy Statement
        const statement = new PolicyStatement({
            effect: Effect.ALLOW,
        });
        statement.addActions(
            "cognito-idp:GetUser",
            "cognito-idp:AdminGetUser",

            "chime:CreateMeeting",
            "chime:DeleteMeeting",
            "chime:GetMeeting",
            "chime:ListMeetings",
            "chime:BatchCreateAttendee",
            "chime:CreateAttendee",
            "chime:DeleteAttendee",
            "chime:GetAttendee",
            "chime:ListAttendees",
            "chime:StartMeetingTranscription",
            "chime:StopMeetingTranscription",

            "execute-api:ManageConnections",

            "ecs:RunTask",
            "ecs:DescribeTasks",
            "ecs:UpdateService",
            "ecs:DescribeServices",

            `ec2:DescribeNetworkInterfaces`,

            "iam:PassRole"
        );
        statement.addResources(userPool.userPoolArn);
        statement.addResources("arn:*:chime::*:meeting/*");
        statement.addResources("arn:aws:execute-api:*:*:**/@connections/*");
        statement.addResources("arn:aws:ecs:*");
        statement.addResources("*");
        statement.addResources("arn:aws:iam::*:*");

        //////////////////////////////////////
        //// Storage Resources (S3)
        //////////////////////////////////////
        const bucket = new s3.Bucket(this, "StaticSiteBucket", {
            bucketName: `${id}-Bucket`.toLowerCase(),
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            publicReadAccess: true,
        });

        let cdn: cloudfront.CloudFrontWebDistribution;
        if (USE_CDN) {
            const oai = new cloudfront.OriginAccessIdentity(this, "my-oai");

            const myBucketPolicy = new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ["s3:GetObject"],
                principals: [new iam.CanonicalUserPrincipal(oai.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
                resources: [bucket.bucketArn + "/*"],
            });
            bucket.addToResourcePolicy(myBucketPolicy);

            // Create CloudFront WebDistribution
            cdn = new cloudfront.CloudFrontWebDistribution(this, "WebsiteDistribution", {
                viewerCertificate: {
                    aliases: [],
                    props: {
                        cloudFrontDefaultCertificate: true,
                    },
                },
                priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
                originConfigs: [
                    {
                        s3OriginSource: {
                            s3BucketSource: bucket,
                            originAccessIdentity: oai,
                        },
                        behaviors: [
                            {
                                isDefaultBehavior: true,
                                minTtl: cdk.Duration.seconds(0),
                                maxTtl: cdk.Duration.days(365),
                                defaultTtl: cdk.Duration.days(1),
                                pathPattern: "my-contents/*",
                            },
                        ],
                    },
                ],
                errorConfigurations: [
                    {
                        errorCode: 403,
                        responsePagePath: "/index.html",
                        responseCode: 200,
                        errorCachingMinTtl: 0,
                    },
                    {
                        errorCode: 404,
                        responsePagePath: "/index.html",
                        responseCode: 200,
                        errorCachingMinTtl: 0,
                    },
                ],
            });
        }

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
                name: "MeetingId",
                type: AttributeType.STRING,
            },
            projectionType: ProjectionType.ALL,
            readCapacity: 2,
            writeCapacity: 2,
        });

        //// (2) Attendee Table
        const attendeeTable = new Table(this, "attendeeTable", {
            tableName: `${id}_AttendeeTable`,
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
            tableName: `${id}_ConnectionTable`,
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

        //// (x) SlackFederationAccounts Table
        const slackFederationAuthsTable = new Table(this, "slackFederationAuthsTable", {
            tableName: `${id}_SlackFederationAuthsTable`,
            partitionKey: {
                name: "TeamId",
                type: AttributeType.STRING,
            },
            readCapacity: 2,
            writeCapacity: 2,
            removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production code
        });

        /////////////////////
        /// Fargate
        /////////////////////
        const vpc = new ec2.Vpc(this, `${id}_vpc`, {
            maxAzs: 2,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: `${id}_pub`,
                    subnetType: ec2.SubnetType.PUBLIC,
                },
            ],
        });
        const cluster = new ecs.Cluster(this, `${id}_cluster`, { vpc });
        const logGroup = new logs.LogGroup(this, `${id}_logGroup`, {
            logGroupName: `/${id}-fargate`,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // create a task definition with CloudWatch Logs
        const logging = new ecs.AwsLogDriver({
            logGroup: logGroup,
            streamPrefix: "fargate",
        });

        const taskDefinition = new ecs.FargateTaskDefinition(this, `${id}_fargate_task`, {
            family: this.node.tryGetContext("serviceName"),
            cpu: 2048,
            // memoryLimitMiB: 5120,
            memoryLimitMiB: 8192,
        });

        if (USE_DOCKER) {
            const container = taskDefinition.addContainer("DefaultContainer", {
                containerName: `${id}_manager_container`,
                image: ecs.ContainerImage.fromAsset("lib/manager"),
                cpu: 2048,
                // memoryLimitMiB: 4096,
                memoryLimitMiB: 8192,
                logging: logging,
            });
        } else {
            const image = ecs.ContainerImage.fromRegistry(`dannadori/hmm:latest`);
            const container = taskDefinition.addContainer("DefaultContainer", {
                containerName: `${id}_manager_container`,
                image: image,
                cpu: 2048,
                memoryLimitMiB: 8192,
                // memoryLimitMiB: 5120,
                logging: logging,
            });
        }

        bucket.grantReadWrite(taskDefinition.taskRole);

        const securityGroup = new ec2.SecurityGroup(this, "SecurityGroup", {
            vpc: vpc,
        });
        securityGroup.addIngressRule(ec2.Peer.ipv4("0.0.0.0/0"), ec2.Port.tcp(3000));

        ///////////////////////////////
        //// Lambda Layers
        ///////////////////////////////
        // ( - ) Lambda Layer
        const nodeModulesLayer = new lambda.LayerVersion(this, "NodeModulesLayer", {
            layerVersionName: `${id}_LambdaLayer`,
            code: lambda.AssetCode.fromAsset(`${__dirname}/layer`),
            compatibleRuntimes: [lambda.Runtime.NODEJS_14_X],
        });

        // ( - ) Utility
        const addCommonSetting = (f: lambda.Function) => {
            meetingTable.grantFullAccess(f);
            attendeeTable.grantFullAccess(f);
            connectionTable.grantFullAccess(f);
            slackFederationAuthsTable.grantFullAccess(f);
            f.addToRolePolicy(statement);

            f.addEnvironment("MEETING_TABLE_NAME", meetingTable.tableName);
            f.addEnvironment("ATTENDEE_TABLE_NAME", attendeeTable.tableName);
            f.addEnvironment("CONNECTION_TABLE_NAME", connectionTable.tableName);
            f.addEnvironment("SLACK_FEDERATION_AUTHS_TABLE_NAME", slackFederationAuthsTable.tableName);

            f.addEnvironment("USER_POOL_ID", userPool.userPoolId);
            f.addEnvironment("VPC_ID", vpc.vpcId);
            f.addEnvironment("SUBNET_ID", vpc.publicSubnets[0].subnetId);
            f.addEnvironment("CLUSTER_ARN", cluster.clusterArn);
            f.addEnvironment("TASK_DIFINITION_ARN_MANAGER", taskDefinition.taskDefinitionArn);
            f.addEnvironment("BUCKET_DOMAIN_NAME", bucket.bucketDomainName);
            f.addEnvironment("MANAGER_CONTAINER_NAME", `${id}_manager_container`);
            f.addEnvironment("BUCKET_ARN", bucket.bucketArn);
            f.addEnvironment("BUCKET_NAME", bucket.bucketName);
            f.addEnvironment("SECURITY_GROUP_NAME", securityGroup.securityGroupName);
            f.addEnvironment("SECURITY_GROUP_ID", securityGroup.securityGroupId);

            f.addEnvironment("USERPOOL_ID", userPool.userPoolId);
            f.addEnvironment("USERPOOL_CLIENT_ID", userPoolClient.userPoolClientId);

            // Slack-Chime Connector (slack access)
            f.addEnvironment("SLACK_CLIENT_ID", SLACK_CLIENT_ID);
            f.addEnvironment("SLACK_CLIENT_SECRET", SLACK_CLIENT_SECRET);
            f.addEnvironment("SLACK_SIGNING_SECRET", SLACK_SIGNING_SECRET);
            f.addEnvironment("SLACK_STATE_SECRET", SLACK_STATE_SECRET);
            // Slack-Chime Connector (db access)
            f.addEnvironment("SLACK_APP_DB_PASSWORD", SLACK_APP_DB_PASSWORD);
            f.addEnvironment("SLACK_APP_DB_SALT", SLACK_APP_DB_SALT);
            f.addEnvironment("SLACK_APP_DB_SECRET", SLACK_APP_DB_SECRET);

            //// DEMO URL
            if (USE_CDN) {
                f.addEnvironment("DEMO_ENDPOINT", `https://${cdn!.distributionDomainName}`);
            } else {
                f.addEnvironment("DEMO_ENDPOINT", `https://${bucket.bucketDomainName}`);
            }

            f.addLayers(nodeModulesLayer);
        };

        // ( - ) auth
        const lambdaFuncRestAPIAuth = new lambda.Function(this, "ChimeRESTAPIAuth", {
            code: lambda.Code.fromAsset(`${__dirname}/dist`),
            handler: "rest_auth.authorize",
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: Duration.seconds(300),
            memorySize: 256,
        });
        addCommonSetting(lambdaFuncRestAPIAuth);

        const restAPIRole = new Role(this, `ChimeRESTAPIRole`, {
            assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
        });
        const restAPIPolicy = new PolicyStatement({
            effect: Effect.ALLOW,
            resources: [lambdaFuncRestAPIAuth.functionArn],
            actions: ["lambda:InvokeFunction"],
        });
        restAPIRole.addToPolicy(restAPIPolicy);

        //// (1) Function For RestAPI
        const lambdaFunctionForRestAPI: lambda.Function = new lambda.Function(this, "funcHelloWorld", {
            functionName: `${id}_getRoot`,
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.fromAsset(`${__dirname}/dist`),
            handler: "index.handler",
            memorySize: 256,
            timeout: cdk.Duration.seconds(10),
        });
        addCommonSetting(lambdaFunctionForRestAPI);

        //// (2) Function For SlackFederation API
        const lambdaFunctionForSlackFederationRestAPI: lambda.Function = new lambda.Function(this, "funcSlackFederation", {
            functionName: `${id}_slackFederationRoot`,
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.fromAsset(`${__dirname}/dist/federation/slack`),
            handler: "slack.handler",
            memorySize: 256,
            timeout: cdk.Duration.seconds(10),
        });
        addCommonSetting(lambdaFunctionForSlackFederationRestAPI);

        ///////////////////////////////
        //// API Gateway
        ///////////////////////////////
        //// ( - ) Utility
        // https://github.com/aws/aws-cdk/issues/906
        const addCorsOptions = (apiResource: IResource) => {
            let origin;
            if (FRONTEND_LOCAL_DEV) {
                origin = "'https://localhost:3000'";
                // origin = "'https://192.168.0.4:3000'";
            } else {
                if (USE_CDN) {
                    origin = `'https://${cdn!.distributionDomainName}'`;
                } else {
                    origin = `'https://${bucket.bucketDomainName}'`;
                }
            }
            apiResource.addMethod(
                "OPTIONS",
                new MockIntegration({
                    integrationResponses: [
                        {
                            statusCode: "200",
                            responseParameters: {
                                "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent,X-Flect-Access-Token'",
                                "method.response.header.Access-Control-Allow-Origin": origin,
                                "method.response.header.Access-Control-Allow-Credentials": "'true'",
                                "method.response.header.Access-Control-Allow-Methods": "'OPTIONS,GET,PUT,POST,DELETE,PATCH,HEAD'",
                            },
                        },
                    ],
                    passthroughBehavior: PassthroughBehavior.WHEN_NO_MATCH,
                    requestTemplates: {
                        "application/json": '{"statusCode": 200}',
                    },
                }),
                {
                    methodResponses: [
                        {
                            statusCode: "200",
                            responseParameters: {
                                "method.response.header.Access-Control-Allow-Headers": true,
                                "method.response.header.Access-Control-Allow-Methods": true,
                                "method.response.header.Access-Control-Allow-Credentials": true,
                                "method.response.header.Access-Control-Allow-Origin": true,
                            },
                        },
                    ],
                }
            );
        };
        //// ( - ) Rest API
        const restApi: RestApi = new RestApi(this, "ChimeAPI", {
            restApiName: `${id}_restApi`,
        });
        //lambdaFunctionPostAttendeeOperation.addEnvironment("RESTAPI_ENDPOINT", restApi.url) ///// Exception(Circular dependency between resources) -> generate from request context in lambda.

        //// ( - ) Authorizer
        const authorizer2 = new CfnAuthorizer(this, "apiAuthorizerLambda", {
            name: `${id}_authorizerLamda`,
            type: "TOKEN",
            // identitySource: "method.request.header.Authorization",
            identitySource: "method.request.header.X-Flect-Access-Token",
            restApiId: restApi.restApiId,
            authorizerCredentials: restAPIRole.roleArn,
            authorizerUri: `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${lambdaFuncRestAPIAuth.functionArn}/invocations`,
            authorizerResultTtlInSeconds: 0,
        });

        //// (1) Get Root
        const root = restApi.root;
        addCorsOptions(root);
        const addRoot = root.addMethod("GET", new LambdaIntegration(lambdaFunctionForRestAPI), {
            operationName: `${id}_getRoot`,
            // authorizationType: AuthorizationType.CUSTOM,
            // authorizer: {
            //   authorizerId: authorizer2.ref,
            // },
        });

        //// (2) Meeting
        const apiMeetings = restApi.root.addResource("meetings");
        const apiMeeting = apiMeetings.addResource("{meetingName}");
        addCorsOptions(apiMeetings);
        addCorsOptions(apiMeeting);
        //// (2-1) Get Meetings
        // apiMeetings.addMethod("GET", new LambdaIntegration(lambdaFunctionGetMeetings), {
        apiMeetings.addMethod("GET", new LambdaIntegration(lambdaFunctionForRestAPI), {
            operationName: `${id}_getMeetings`,
            authorizationType: AuthorizationType.CUSTOM,
            authorizer: {
                authorizerId: authorizer2.ref,
            },
        });

        //// (2-2) Post Meeting
        // apiMeetings.addMethod("POST", new LambdaIntegration(lambdaFunctionPostMeeting), {
        apiMeetings.addMethod("POST", new LambdaIntegration(lambdaFunctionForRestAPI), {
            operationName: `${id}_postMeeting`,
            authorizationType: AuthorizationType.CUSTOM,
            authorizer: {
                authorizerId: authorizer2.ref,
            },
        });

        //// (2-3) Delete Meeting
        // apiMeeting.addMethod("DELETE", new LambdaIntegration(lambdaFunctionDeleteMeeting), {
        apiMeeting.addMethod("DELETE", new LambdaIntegration(lambdaFunctionForRestAPI), {
            operationName: `${id}_deleteMeeting`,
            authorizationType: AuthorizationType.CUSTOM,
            authorizer: {
                authorizerId: authorizer2.ref,
            },
        });

        //// (2-4) Get Meeting
        // apiMeeting.addMethod("GET", new LambdaIntegration(lambdaFunctionGetMeeting), {
        apiMeeting.addMethod("GET", new LambdaIntegration(lambdaFunctionForRestAPI), {
            operationName: `${id}_getMeeting`,
            authorizationType: AuthorizationType.CUSTOM,
            authorizer: {
                authorizerId: authorizer2.ref,
            },
        });

        ///// (3) Attendee
        const apiAttendees = apiMeeting.addResource("attendees");
        const apiAttendee = apiAttendees.addResource("{attendeeId}");
        addCorsOptions(apiAttendees);
        addCorsOptions(apiAttendee);

        //// (3-1) Get Attendee
        // apiAttendee.addMethod("GET", new LambdaIntegration(lambdaFunctionGetAttendee), {
        apiAttendee.addMethod("GET", new LambdaIntegration(lambdaFunctionForRestAPI), {
            operationName: `${id}_getAttendee`,
            authorizationType: AuthorizationType.CUSTOM,
            authorizer: {
                authorizerId: authorizer2.ref,
            },
        });

        //// (3-2) Post Attendee
        // apiAttendees.addMethod("POST", new LambdaIntegration(lambdaFunctionPostAttendee), {
        apiAttendees.addMethod("POST", new LambdaIntegration(lambdaFunctionForRestAPI), {
            operationName: `${id}_postAttendee`,
            authorizationType: AuthorizationType.CUSTOM,
            authorizer: {
                authorizerId: authorizer2.ref,
            },
        });
        //// (3-3) List Attendees
        // apiAttendees.addMethod("GET", new LambdaIntegration(lambdaFunctionGetAttendees), {
        apiAttendees.addMethod("GET", new LambdaIntegration(lambdaFunctionForRestAPI), {
            operationName: `${id}_getAttendees`,
            authorizationType: AuthorizationType.CUSTOM,
            authorizer: {
                authorizerId: authorizer2.ref,
            },
        });

        ///// (4) Attendee Operations // Operation under Meeting
        const apiAttendeeOperations = apiAttendee.addResource("operations");
        const apiAttendeeOperation = apiAttendeeOperations.addResource("{operation}");
        addCorsOptions(apiAttendeeOperations);
        addCorsOptions(apiAttendeeOperation);

        //// (4-1) Post Attendee Operation
        // apiAttendeeOperation.addMethod("POST", new LambdaIntegration(lambdaFunctionPostAttendeeOperation), {
        apiAttendeeOperation.addMethod("POST", new LambdaIntegration(lambdaFunctionForRestAPI), {
            operationName: `${id}_postAttendeeOperation`,
            authorizationType: AuthorizationType.CUSTOM,
            authorizer: {
                authorizerId: authorizer2.ref,
            },
        });
        // lambdaFunctionPostAttendeeOperation.addEnvironment("RESTAPI_ENDPOINT", restApi.url) ///// Exception(Circular dependency between resources) -> generate from request context in lambda.

        //// (5) Log
        const apiLogs = restApi.root.addResource("logs");
        addCorsOptions(apiLogs);
        //// (5-1) Post Log
        // apiLogs.addMethod("POST", new LambdaIntegration(lambdaFunctionPostLog), {
        apiLogs.addMethod("POST", new LambdaIntegration(lambdaFunctionForRestAPI), {
            operationName: `${id}_postLog`,
        });

        //// (a) Operation  // Global Operation(before signin)
        const apiOperations = restApi.root.addResource("operations");
        const apiOperation = apiOperations.addResource("{operation}");
        addCorsOptions(apiOperations);
        addCorsOptions(apiOperation);
        //// (a-1) Post Onetime Code Signin Request
        // apiOperation.addMethod("POST", new LambdaIntegration(lambdaFunctionPostOperation), {
        apiOperation.addMethod("POST", new LambdaIntegration(lambdaFunctionForRestAPI), {
            operationName: `${id}_postOperation`,
        });

        ///// (b) slack federation
        const apiSlack = restApi.root.addResource("slack");
        const apiSlackOAuthRedirect = apiSlack.addResource("oauth_redirect");
        const apiSlackInstall = apiSlack.addResource("install");
        const apiSlackEvents = apiSlack.addResource("events");
        const apiSlackApi = apiSlack.addResource("api");
        const apiSlackOperation = apiSlackApi.addResource("{operation}");
        addCorsOptions(apiSlackOAuthRedirect);
        addCorsOptions(apiSlackInstall);
        addCorsOptions(apiSlackEvents);
        addCorsOptions(apiSlackOperation);
        apiSlackOAuthRedirect.addMethod("GET", new LambdaIntegration(lambdaFunctionForSlackFederationRestAPI), {
            operationName: `${id}_slackOAuthRedirect`,
        });
        apiSlackInstall.addMethod("GET", new LambdaIntegration(lambdaFunctionForSlackFederationRestAPI), {
            operationName: `${id}_slackInstall`,
        });
        apiSlackEvents.addMethod("POST", new LambdaIntegration(lambdaFunctionForSlackFederationRestAPI), {
            operationName: `${id}_slackEvents`,
        });
        apiSlackOperation.addMethod("POST", new LambdaIntegration(lambdaFunctionForSlackFederationRestAPI), {
            operationName: `${id}_slackApi`,
        });

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
        const lambdaFuncMessageConnect = new lambda.Function(this, "ChimeMessageAPIConnect", {
            code: lambda.Code.fromAsset(`${__dirname}/dist`),
            handler: "message.connect",
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: Duration.seconds(300),
            memorySize: 256,
        });
        addCommonSetting(lambdaFuncMessageConnect);

        // (2) disconnect
        const lambdaFuncMessageDisconnect = new lambda.Function(this, "ChimeMessageAPIDisconnect", {
            code: lambda.Code.fromAsset(`${__dirname}/dist`),
            handler: "message.disconnect",
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: Duration.seconds(300),
            memorySize: 256,
        });
        addCommonSetting(lambdaFuncMessageDisconnect);

        // (3) message
        const lambdaFuncMessageMessage = new lambda.Function(this, "ChimeMessageAPIMessage", {
            code: lambda.Code.fromAsset(`${__dirname}/dist`),
            handler: "message.message",
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: Duration.seconds(300),
            memorySize: 256,
        });
        addCommonSetting(lambdaFuncMessageMessage);

        // (4) auth
        const lambdaFuncMessageAuth = new lambda.Function(this, "ChimeMessageAPIAuth", {
            code: lambda.Code.fromAsset(`${__dirname}/dist`),
            handler: "message.authorize",
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: Duration.seconds(300),
            memorySize: 256,
        });
        addCommonSetting(lambdaFuncMessageAuth);

        const policy = new PolicyStatement({
            effect: Effect.ALLOW,
            resources: [lambdaFuncMessageConnect.functionArn, lambdaFuncMessageDisconnect.functionArn, lambdaFuncMessageMessage.functionArn, lambdaFuncMessageAuth.functionArn],
            actions: ["lambda:InvokeFunction"],
        });

        const role = new Role(this, `ChimeMessageAPIRole`, {
            assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
        });
        role.addToPolicy(policy);

        const messageAuthorizer = new v2.CfnAuthorizer(this, "messageAuthorizer", {
            name: `${id}_authorizer`,
            authorizerType: "REQUEST",
            identitySource: [],
            apiId: webSocketApi.ref,
            authorizerUri: `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${lambdaFuncMessageAuth.functionArn}/invocations`,
            authorizerCredentialsArn: role.roleArn,
        });

        //// Integration
        const connectIntegration = new v2.CfnIntegration(this, "ChimeMessageAPIConnectIntegration", {
            apiId: webSocketApi.ref,
            integrationType: "AWS_PROXY",
            integrationUri: "arn:aws:apigateway:" + this.region + ":lambda:path/2015-03-31/functions/" + lambdaFuncMessageConnect.functionArn + "/invocations",
            credentialsArn: role.roleArn,
        });

        const disconnectIntegration = new v2.CfnIntegration(this, "ChimeMessageAPIDisconnectIntegration", {
            apiId: webSocketApi.ref,
            integrationType: "AWS_PROXY",
            integrationUri: "arn:aws:apigateway:" + this.region + ":lambda:path/2015-03-31/functions/" + lambdaFuncMessageDisconnect.functionArn + "/invocations",
            credentialsArn: role.roleArn,
        });

        const messageIntegration = new v2.CfnIntegration(this, "ChimeMessageAPIMessageIntegration", {
            apiId: webSocketApi.ref,
            integrationType: "AWS_PROXY",
            integrationUri: "arn:aws:apigateway:" + this.region + ":lambda:path/2015-03-31/functions/" + lambdaFuncMessageMessage.functionArn + "/invocations",
            credentialsArn: role.roleArn,
        });

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
            authorizerId: messageAuthorizer.ref,
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
        const deployment = new v2.CfnDeployment(this, "ChimeMessageAPIDep", {
            apiId: webSocketApi.ref,
        });

        const stage = new v2.CfnStage(this, `ChimeMessageAPIStage`, {
            apiId: webSocketApi.ref,
            autoDeploy: true,
            deploymentId: deployment.ref,
            stageName: "Prod",
        });

        const dependencies = new ConcreteDependable();
        dependencies.add(connectRoute);
        dependencies.add(disconnectRoute);
        dependencies.add(messageRoute);
        deployment.node.addDependency(dependencies);

        /////////////////////////////////////////////
        /// add env info after api gateway
        ////////////////////////////////////////////
        // lambdaFunctionForSlackFederationRestAPI.addEnvironment("RESTAPI_ENDPOINT", restApi.url); /// Exception(Circular dependency between resources) -> generate from request context in lambda.

        ///////////////////////////////
        //// Output
        ///////////////////////////////
        new CfnOutput(this, "UserPoolId", {
            description: "UserPoolId",
            value: userPool.userPoolId,
        });

        new CfnOutput(this, "UserPoolClientId", {
            description: "UserPoolClientId",
            value: userPoolClient.userPoolClientId,
        });

        new CfnOutput(this, "Bucket", {
            description: "Bucket",
            value: bucket.bucketName,
        });

        new CfnOutput(this, "BucketWebsiteDomainName", {
            description: "BucketWebsiteDomainName",
            value: bucket.bucketWebsiteDomainName,
        });

        new CfnOutput(this, "BucketDomainName", {
            description: "BucketDomainName",
            value: bucket.bucketDomainName,
        });

        new CfnOutput(this, "RestAPIEndpoint", {
            description: "RestAPIEndpoint",
            value: restApi.url,
        });

        new CfnOutput(this, "WebSocketEndpoint", {
            description: "WebSocketEndpoint",
            value: webSocketApi.attrApiEndpoint,
        });

        if (USE_CDN) {
            new CfnOutput(this, "CDNComainName", {
                description: "CDNComainName",
                value: cdn!.distributionDomainName,
            });
        }

        //// DEMO URL
        if (USE_CDN) {
            new CfnOutput(this, "DemoEndpoint", {
                description: "DemoEndpoint",
                value: `https://${cdn!.distributionDomainName}`,
            });
            new CfnOutput(this, "DistributionId", {
                description: "DistributionId",
                value: cdn!.distributionId,
            });
        } else {
            new CfnOutput(this, "DemoEndpoint", {
                description: "DemoEndpoint",
                value: `https://${bucket.bucketDomainName}`,
            });
        }

        // new cdk.CfnOutput(this, "AmongLoadBalancerDNS", {
        //   value: lb_among.loadBalancerDnsName
        // });
        // new cdk.CfnOutput(this, "AmongServiceArn", {
        //   value: ecsService_among.serviceArn
        // });
        // new cdk.CfnOutput(this, "AmongServiceName", {
        //   value: ecsService_among.serviceName
        // });
    }
}
