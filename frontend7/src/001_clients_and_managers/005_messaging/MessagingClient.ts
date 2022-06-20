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
    private chime: Chime.Chime | null = null
    private userArn: string | null = null
    connect = async (messagingCred: STS.Credentials, userArn: string) => {
        const prov: CredentialProvider = async () => {
            return {
                accessKeyId: messagingCred.AccessKeyId!,
                secretAccessKey: messagingCred.SecretAccessKey!,
                sessionToken: messagingCred.SessionToken!,
                // expiration: messagingCred.Expiration,
            }
        }
        this.chime = new Chime.Chime({ region: 'us-east-1', credentials: prov });
        this.userArn = userArn

        const endpoint = await this.chime.getMessagingSessionEndpoint({})!
        const configuration = new MessagingSessionConfiguration(userArn, null, endpoint.Endpoint!.Url!, this.chime);

        const session = new DefaultMessagingSession(configuration, new ConsoleLogger('SDK', LogLevel.INFO));
        // セッション情報に channelArnは含まれない。


        session.addObserver({
            messagingSessionDidStart: () => {
                console.log("[messaging] messagingSessionDidStart!")
            },
            messagingSessionDidStartConnecting: (reconnecting: boolean) => {
                console.log(`[messaging] messagingSessionDidStartConnecting: reconnecting?:${reconnecting}`)
            },
            messagingSessionDidStop: (event: CloseEvent) => { console.log("[messaging] session event recieved:", event) },
            messagingSessionDidReceiveMessage: (message: Message) => { console.log("[messaging] message recieved", message) },
        });
        await session.start();
    }

    send = async (channelArn: string, message: string) => {
        if (!this.chime || !this.userArn) {
            console.warn("[MessageClient] chime for messaging is not initialized")
            return
        }

        await this.chime.sendChannelMessage({
            ChannelArn: channelArn,
            ClientRequestToken: v4(),
            Content: `${channelArn}:${message}`,
            Persistence: Persistence.Persistent,
            Type: 'STANDARD',
            ChimeBearer: this.userArn,
        });
    }
}
