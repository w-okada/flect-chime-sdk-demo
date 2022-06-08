import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { aws_lambda as lambda } from "aws-cdk-lib"
import { Construct } from 'constructs';

import { createUserPool } from './001_UserPool/001_UserPool';

import { FRONTEND_LOCAL_DEV, USE_DOCKER, USE_CDN, SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, SLACK_SIGNING_SECRET, SLACK_STATE_SECRET, SLACK_APP_DB_PASSWORD, SLACK_APP_DB_SALT, SLACK_APP_DB_SECRET, LOCAL_CORS_ORIGIN } from "../bin/config";
import { createFrontendS3 } from './002_S3/001_FrontendBucket';
import { createMeetingTable } from './003_DynamoDB/001_MeetingTable';
import { createAttendeeTable } from './003_DynamoDB/002_AttendeeTable';
import { createConnectionTable } from './003_DynamoDB/003_ConnectionTable';
import { createSlackFederationAuthsTable } from './003_DynamoDB/004_SlackFederationAuthsTable';
import { createRestApiPolicyStatement } from './004_Role/001_RestApiPolicyStatement';
import { createNodeModulesLayer } from './005_Lambda/001_nodeModulesLayer';
import { createLambdas } from './005_Lambda/002_lambdas';
import { createRoleForAPIAuthorizer } from './006_APIGateway/001_RoleForAPIAuthorizer';
import { createRestApi } from './006_APIGateway/002_RestApi';
import { createLambdaForWebsocket } from './005_Lambda/003_lamdaForWebsocket';
import { createAuthorizer } from './006_APIGateway/003_Authorizer';
import { createApis } from './006_APIGateway/004_Apis';
import { createApisForSlack } from './006_APIGateway/005_ApisForSlack';
import { createRoleForWebsocketAuthorizer } from './006_APIGateway/011_RoleForWebsocketAuthorizer';
import { createWebsocket } from './006_APIGateway/012_Websocket';
import { createWebsocketAuthorizer } from './006_APIGateway/013_WebsocketAuthorizer';
import { createMessages } from './006_APIGateway/014_Messages';

export class Backend2Stack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // (1) UserPool
    const { userPool, userPoolClient } = createUserPool(this, id)

    // (2) S3
    const { frontendBucket, frontendCdn } = createFrontendS3(this, id, USE_CDN)

    // (3) DynamoDB
    const { meetingTable } = createMeetingTable(this, id)
    const { attendeeTable } = createAttendeeTable(this, id)
    const { connectionTable } = createConnectionTable(this, id)
    const { slackFederationAuthsTable } = createSlackFederationAuthsTable(this, id)

    // (4) IAM
    const { restApiPolicyStatement } = createRestApiPolicyStatement(userPool.userPoolArn)

    // (5) Lambda
    //// (5-1) Layer
    const { nodeModulesLayer } = createNodeModulesLayer(this, id)
    //// (5-2) Lambda
    const { lambdaFuncRestAPIAuth, lambdaFunctionForRestAPI, lambdaFunctionForSlackFederationRestAPI } = createLambdas(this);
    //// (5-3) Lambda For Websocket
    const { lambdaFuncMessageConnect, lambdaFuncMessageDisconnect, lambdaFuncMessageMessage, lambdaFuncMessageAuth } = createLambdaForWebsocket(this)
    //// (5-4) Configure
    const configureFunctions = (func: lambda.Function) => {
      // (a-1) Table Access
      [meetingTable, attendeeTable, connectionTable, slackFederationAuthsTable].forEach(table => {
        table.grantFullAccess(func)
      })
      // (a-2) Policy
      func.addToRolePolicy(restApiPolicyStatement);
      // (a-3) Environment
      func.addEnvironment("MEETING_TABLE_NAME", meetingTable.tableName);
      func.addEnvironment("ATTENDEE_TABLE_NAME", attendeeTable.tableName);
      func.addEnvironment("CONNECTION_TABLE_NAME", connectionTable.tableName);
      func.addEnvironment("SLACK_FEDERATION_AUTHS_TABLE_NAME", slackFederationAuthsTable.tableName);

      func.addEnvironment("USER_POOL_ID", userPool.userPoolId);
      func.addEnvironment("BUCKET_DOMAIN_NAME", frontendBucket.bucketDomainName);
      func.addEnvironment("BUCKET_ARN", frontendBucket.bucketArn);
      func.addEnvironment("BUCKET_NAME", frontendBucket.bucketName);

      func.addEnvironment("USERPOOL_ID", userPool.userPoolId);
      func.addEnvironment("USERPOOL_CLIENT_ID", userPoolClient.userPoolClientId);

      //// Slack-Chime Connector (slack access)
      func.addEnvironment("SLACK_CLIENT_ID", SLACK_CLIENT_ID);
      func.addEnvironment("SLACK_CLIENT_SECRET", SLACK_CLIENT_SECRET);
      func.addEnvironment("SLACK_SIGNING_SECRET", SLACK_SIGNING_SECRET);
      func.addEnvironment("SLACK_STATE_SECRET", SLACK_STATE_SECRET);
      //// Slack-Chime Connector (db access)
      func.addEnvironment("SLACK_APP_DB_PASSWORD", SLACK_APP_DB_PASSWORD);
      func.addEnvironment("SLACK_APP_DB_SALT", SLACK_APP_DB_SALT);
      func.addEnvironment("SLACK_APP_DB_SECRET", SLACK_APP_DB_SECRET);

      //// DEMO URL
      if (USE_CDN) {
        func.addEnvironment("DEMO_ENDPOINT", `https://${frontendCdn!.distributionDomainName}`);
      } else {
        func.addEnvironment("DEMO_ENDPOINT", `https://${frontendBucket.bucketDomainName}`);
      }

      // (a-4) Layer
      func.addLayers(nodeModulesLayer);
    }
    const functions = [
      lambdaFuncRestAPIAuth, lambdaFunctionForRestAPI, lambdaFunctionForSlackFederationRestAPI, lambdaFuncMessageConnect, lambdaFuncMessageDisconnect, lambdaFuncMessageMessage, lambdaFuncMessageAuth
    ]
    functions.forEach(func => {
      configureFunctions(func)
    })


    // (6) API Gateway
    //// (6-1) APIs
    const { roleForAPIAuthorizer } = createRoleForAPIAuthorizer(this, lambdaFuncRestAPIAuth.functionArn)
    const { restApi } = createRestApi(this, id)
    const authorizerUri = `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${lambdaFuncRestAPIAuth.functionArn}/invocations`
    const { authorizer } = createAuthorizer(this, id, roleForAPIAuthorizer.roleArn, restApi.restApiId, authorizerUri)
    let corsOrigin
    if (FRONTEND_LOCAL_DEV) {
      corsOrigin = LOCAL_CORS_ORIGIN;
    } else {
      if (USE_CDN) {
        corsOrigin = `'https://${frontendCdn!.distributionDomainName}'`;
      } else {
        corsOrigin = `'https://${frontendBucket.bucketDomainName}'`;
      }
    }

    createApis(id, restApi, authorizer.ref, lambdaFunctionForRestAPI, corsOrigin)
    createApisForSlack(id, restApi, lambdaFunctionForSlackFederationRestAPI, corsOrigin)
    //// (6-2) Websocket
    const { roleForWebsocketAuthorizer } = createRoleForWebsocketAuthorizer(this, lambdaFuncMessageAuth.functionArn, lambdaFuncMessageConnect.functionArn, lambdaFuncMessageDisconnect.functionArn, lambdaFuncMessageMessage.functionArn)
    const { webSocketApi } = createWebsocket(this)
    const websocketAuthorizerUri = `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${lambdaFuncMessageAuth.functionArn}/invocations`
    const { websocketAuthorizer } = createWebsocketAuthorizer(this, id, roleForWebsocketAuthorizer.roleArn, webSocketApi.ref, websocketAuthorizerUri)
    createMessages(this, webSocketApi.ref, roleForWebsocketAuthorizer.roleArn, this.region, lambdaFuncMessageConnect.functionArn, lambdaFuncMessageDisconnect.functionArn, lambdaFuncMessageMessage.functionArn, websocketAuthorizer.ref)


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
      value: frontendBucket.bucketName,
    });

    new CfnOutput(this, "BucketWebsiteDomainName", {
      description: "BucketWebsiteDomainName",
      value: frontendBucket.bucketWebsiteDomainName,
    });

    new CfnOutput(this, "BucketDomainName", {
      description: "BucketDomainName",
      value: frontendBucket.bucketDomainName,
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
        value: frontendCdn!.distributionDomainName,
      });
    }

    //// DEMO URL
    if (USE_CDN) {
      new CfnOutput(this, "DemoEndpoint", {
        description: "DemoEndpoint",
        value: `https://${frontendCdn!.distributionDomainName}`,
      });
      new CfnOutput(this, "DistributionId", {
        description: "DistributionId",
        value: frontendCdn!.distributionId,
      });
    } else {
      new CfnOutput(this, "DemoEndpoint", {
        description: "DemoEndpoint",
        value: `https://${frontendBucket.bucketDomainName}`,
      });
    }
  }
}
