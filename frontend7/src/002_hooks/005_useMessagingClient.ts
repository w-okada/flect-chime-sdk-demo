import { useMemo, useRef, useState } from "react"
import { MessageItem, MessagingClient } from "../001_clients_and_managers/005_messaging/MessagingClient"
import * as STS from "@aws-sdk/client-sts"



export type UseMessagingClientProps = {
    userArn?: string | null
    globalChannelArn?: string | null
    globalUserId?: string | null
    credentials?: STS.Credentials | null
}

export type MessagingClientState = {
    meetingChannelArn: string | null,
    globalMessages: MessageItem[],
    meetingMessages: MessageItem[]
}
export type MessagingClientStateAndMethod = MessagingClientState & {
    connect: () => Promise<void>
    setMeetingChannelArn: (arn: string) => void
    sendGlobalMessage: (message: string) => Promise<void>
    sendChannelMessage: (mesage: string) => Promise<void>
}


export const useMessagingClient = (props: UseMessagingClientProps): MessagingClientStateAndMethod => {
    const meetingChannelArnRef = useRef<string | null>(null)
    const [meetingChannelArn, _setMeetingChannelArn] = useState<string | null>(meetingChannelArnRef.current)
    const setMeetingChannelArn = (arn: string) => {
        // Message Listener 初期化
        setMeetingMessages([])
        if (meetingChannelArnRef.current) {
            client.removeListener(meetingChannelArnRef.current)
        }

        // channelArn設定
        meetingChannelArnRef.current = arn
        client.setListener(meetingChannelArnRef.current, {
            updated: (messages: MessageItem[]) => {
                setMeetingMessages([...messages])
            }
        })
        _setMeetingChannelArn(meetingChannelArnRef.current)
    }
    const [globalMessages, setGlobalMessages] = useState<MessageItem[]>([])
    const [meetingMessages, setMeetingMessages] = useState<MessageItem[]>([])

    const client = useMemo(() => {
        const c = new MessagingClient()
        return c
    }, [])
    const connect = async () => {
        console.log("connect called", props.credentials)
        if (props.credentials) {
            await client.connect(props.credentials, props.userArn!)
            await client.send(props.globalChannelArn!, "initialize message")
            client.setListener(props.globalChannelArn!, {
                updated: (messages: MessageItem[]) => {
                    setGlobalMessages([...messages])
                }
            })
            listGlobalMessage()
        }
    }
    const sendGlobalMessage = async (message: string) => {
        if (!props.globalChannelArn) {
            console.warn("global channel arn is not set.")
            return
        }
        await client.send(props.globalChannelArn!, message)

    }
    const listGlobalMessage = async () => {
        if (!props.globalChannelArn) {
            console.warn("global channel arn is not set.")
            return
        }
        await client.listMessages(props.globalChannelArn!)
    }


    const sendChannelMessage = async (message: string) => {
        if (!meetingChannelArnRef.current) {
            console.warn("meeting channel arn is not set.")
            return
        }
        console.log("[messaging] meetingChannelArnRef.current:", meetingChannelArnRef.current)
        await client.send(meetingChannelArnRef.current!, message)

    }

    const retVal: MessagingClientStateAndMethod = {
        connect,
        meetingChannelArn,
        setMeetingChannelArn,
        sendGlobalMessage,
        sendChannelMessage,
        globalMessages,
        meetingMessages
    }
    return retVal
}