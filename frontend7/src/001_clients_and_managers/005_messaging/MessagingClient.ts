import { AuthenticationDetails, CognitoUser, CognitoUserAttribute, CognitoUserPool } from "amazon-cognito-identity-js";
import { UserPoolClientId, UserPoolId } from "../../BackendConfig";
import * as Chime from "@aws-sdk/client-chime"
import * as STS from "@aws-sdk/client-sts"
import { MessagingSessionConfiguration } from "amazon-chime-sdk-js";
import { CredentialProvider, Credentials } from "@aws-sdk/types";

export class MessagingClient {
    private chimeClient: Chime.Chime | null = null
    connect = async (messagingCred: STS.Credentials, globalChannelArn?: string) => {
        const prov: CredentialProvider = async () => {
            return {
                accessKeyId: messagingCred.AccessKeyId!,
                secretAccessKey: messagingCred.SecretAccessKey!,
                sessionToken: messagingCred.SessionToken!,
                // expiration: messagingCred.Expiration,
            }
        }

        console.log("endpoint:::1")
        this.chimeClient = new Chime.Chime({ region: 'us-east-1', credentials: prov });
        // this.chimeClient = new Chime.Chime({ region: 'us-east-1' });
        console.log("endpoint:::2")
        const endpoint = await this.chimeClient.getMessagingSessionEndpoint({})
        console.log("endpoint:::3", endpoint)
        //         // this.chimeClient.sendChannelMessage
        // this.configuration = new MessagingSessionConfiguration(this.userArn, null, endpoint.Endpoint.Url, chime, AWS);

    }
}
