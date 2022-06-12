import { AuthenticationDetails, CognitoUser, CognitoUserAttribute, CognitoUserPool } from "amazon-cognito-identity-js";
import { UserPoolClientId, UserPoolId } from "../../BackendConfig";
import * as Chime from "@aws-sdk/client-chime"
import * as STS from "@aws-sdk/client-sts"
import { ConsoleLogger, DefaultMessagingSession, LogLevel, Message, MessagingSessionConfiguration } from "amazon-chime-sdk-js";
import { CredentialProvider, Credentials } from "@aws-sdk/types";
import { v4 } from "uuid"


export enum Persistence {
    Persistent = 'PERSISTENT',
    NonPersistent = 'NON_PERSISTENT',
}
export class MessagingClient {
    private chimeClient: Chime.Chime | null = null
    connect = async (messagingCred: STS.Credentials, userArn: string, globalChannelArn: string) => {
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
        const endpoint = await this.chimeClient.getMessagingSessionEndpoint({})!
        const configuration = new MessagingSessionConfiguration(userArn, null, endpoint.Endpoint!.Url!, this.chimeClient);
        console.log("endpoint:::3", configuration)
        //         // this.chimeClient.sendChannelMessage
        // this.configuration = new MessagingSessionConfiguration(this.userArn, null, endpoint.Endpoint.Url, chime, AWS);
        const session = new DefaultMessagingSession(configuration, new ConsoleLogger('SDK', LogLevel.INFO));
        session.addObserver({
            messagingSessionDidStart: () => { console.log("session start!") },
            messagingSessionDidStartConnecting: (reconnecting: boolean) => { console.log("session connecting", reconnecting) },
            messagingSessionDidStop: (event: CloseEvent) => { console.log("session event", event) },
            messagingSessionDidReceiveMessage: (message: Message) => { console.log("session event", message) },
        });
        session.start();

        await this.chimeClient.sendChannelMessage({
            ChannelArn: globalChannelArn,
            ClientRequestToken: v4(),
            Content: "sending message...",
            Persistence: Persistence.Persistent,
            Type: 'STANDARD',
            ChimeBearer: userArn,
        });
    }
}
