import { UserPoolId, UserPoolClientId,  RestAPIEndpoint } from "./BackendConfig"

export const awsConfiguration = {
    region: 'us-east-1',
    userPoolId: UserPoolId,
    clientId: UserPoolClientId,
}

export const BASE_URL = RestAPIEndpoint

