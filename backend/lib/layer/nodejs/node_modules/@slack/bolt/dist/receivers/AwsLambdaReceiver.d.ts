import { Logger, LogLevel } from '@slack/logger';
import App from '../App';
import { Receiver } from '../types/receiver';
import { StringIndexed } from '../types/helpers';
export interface AwsEvent {
    body: string | null;
    headers: any;
    multiValueHeaders: any;
    httpMethod: string;
    isBase64Encoded: boolean;
    path: string;
    pathParameters: any | null;
    queryStringParameters: any | null;
    multiValueQueryStringParameters: any | null;
    stageVariables: any | null;
    requestContext: any;
    resource: string;
}
export declare type AwsCallback = (error?: Error | string | null, result?: any) => void;
export interface AwsResponse {
    statusCode: number;
    headers?: {
        [header: string]: boolean | number | string;
    };
    multiValueHeaders?: {
        [header: string]: Array<boolean | number | string>;
    };
    body: string;
    isBase64Encoded?: boolean;
}
export declare type AwsHandler = (event: AwsEvent, context: any, callback: AwsCallback) => Promise<AwsResponse>;
export interface AwsLambdaReceiverOptions {
    signingSecret: string;
    logger?: Logger;
    logLevel?: LogLevel;
    customPropertiesExtractor?: (request: AwsEvent) => StringIndexed;
}
export default class AwsLambdaReceiver implements Receiver {
    private signingSecret;
    private app?;
    private logger;
    private customPropertiesExtractor;
    constructor({ signingSecret, logger, logLevel, customPropertiesExtractor, }: AwsLambdaReceiverOptions);
    init(app: App): void;
    start(..._args: any[]): Promise<AwsHandler>;
    stop(..._args: any[]): Promise<void>;
    toHandler(): AwsHandler;
    private getRawBody;
    private parseRequestBody;
    private isValidRequestSignature;
    private getHeaderValue;
}
//# sourceMappingURL=AwsLambdaReceiver.d.ts.map