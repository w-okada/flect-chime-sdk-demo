import * as Chime from "@aws-sdk/client-chime"
import * as STS from "@aws-sdk/client-sts"
import { ConsoleLogger, DefaultMessagingSession, LogLevel, Message, MessagingSessionConfiguration } from "amazon-chime-sdk-js";
import { CredentialProvider } from "@aws-sdk/types";
import { v4 } from "uuid"
import { SortOrder } from "@aws-sdk/client-chime";


export enum Persistence {
    Persistent = 'PERSISTENT',
    NonPersistent = 'NON_PERSISTENT',
}
export type MessageItem = {
    content: string,
    createdTimestamp: number,
    senderName: string,
    senderArn: string
}
export type MessageItems = { [channelArn: string]: MessageItem[] }
export type MessageListener = {
    updated: (messages: MessageItem[]) => void
}

export class MessagingClient {
    private chime: Chime.Chime | null = null
    private userArn: string | null = null
    private messages: MessageItems = {}
    private listeners: { [channelArn: string]: MessageListener } = {}

    setListener = (channelArn: string, listener: MessageListener) => {
        this.listeners[channelArn] = listener
    }
    removeListener = (channelArn: string) => {
        delete this.listeners[channelArn]
    }

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
            messagingSessionDidReceiveMessage: (message: Message) => {
                console.log("[messaging] message recieved", message)
                if (message.payload) {
                    const payload = JSON.parse(message.payload)
                    console.log("[messaging] payload:", payload)
                    const channelArn = payload.ChannelArn
                    if (!this.messages[channelArn]) {
                        this.messages[channelArn] = []
                    }
                    this.messages[channelArn].unshift({
                        content: payload.Content,
                        createdTimestamp: Date.parse(payload.CreatedTimestamp),
                        senderName: payload.Sender.Name,
                        senderArn: payload.Sender.Arn,
                    })
                    console.log("[messaging] messages", this.messages)
                    if (this.listeners[channelArn]) {
                        this.listeners[channelArn].updated(this.messages[channelArn])
                    }

                }
            },
        });
        await session.start();
    }

    listMessages = async (channelArn: string) => {
        if (!this.chime || !this.userArn) {
            console.warn("[MessageClient] chime for messaging is not initialized")
            return
        }
        let i = 0;
        let messages: Chime.ListChannelMessagesCommandOutput | null = null
        if (!this.messages[channelArn]) {
            this.messages[channelArn] = []
        }
        const startDate = new Date();
        startDate.setHours(startDate.getHours() - 1)
        while (true) {
            const nextToken: string | undefined = (messages && messages?.NextToken) ? messages.NextToken : undefined
            messages = await this.chime.listChannelMessages({
                ChannelArn: channelArn,
                SortOrder: SortOrder.DESCENDING,
                NotBefore: startDate,
                // NotAfter?: Date;
                MaxResults: 50,
                NextToken: nextToken,
                ChimeBearer: this.userArn,
            })
            messages.ChannelMessages?.forEach(x => {
                this.messages[channelArn].push({
                    content: x.Content || "",
                    createdTimestamp: x.CreatedTimestamp?.getTime() || 0,
                    senderName: x.Sender?.Name || "",
                    senderArn: x.Sender?.Arn || "",
                })
            })
            if (this.listeners[channelArn]) {
                this.listeners[channelArn].updated(this.messages[channelArn])
            }

            if (!messages.NextToken) {
                break
            }

            i++;
            if (i > 10) {
                console.log("break list message:", i)
                break
            }
        }
    }

    send = async (channelArn: string, message: string) => {
        if (!this.chime || !this.userArn) {
            console.warn("[MessageClient] chime for messaging is not initialized")
            return
        }
        await this.chime.sendChannelMessage({
            ChannelArn: channelArn,
            ClientRequestToken: v4(),
            Content: message,
            Persistence: Persistence.Persistent,
            Type: 'STANDARD',
            ChimeBearer: this.userArn,
        });
    }
}
