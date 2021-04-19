import { UserPoolId, UserPoolClientId,  RestAPIEndpoint } from "./BackendConfig"

export const awsConfiguration = {
    region: 'us-east-1',
    userPoolId: UserPoolId,
    clientId: UserPoolClientId,
}

export const BASE_URL = RestAPIEndpoint
// export const DEFAULT_USERID = "mail2wokada@gmail.com"
// export const DEFAULT_PASSWORD = "password"
export const DEFAULT_USERID = null
export const DEFAULT_PASSWORD = null

