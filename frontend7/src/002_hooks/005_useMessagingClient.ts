import { useMemo, useRef, useState } from "react"
import { MessageItem, MessagingClient } from "../001_clients_and_managers/005_messaging/MessagingClient"
import * as STS from "@aws-sdk/client-sts"
import { ChannelMessageType } from "@aws-sdk/client-chime"
import { ControlTypes, MessageFormat, MessageTypes } from "../messaging_format"



// export type UseMessagingClientProps = {
export type ConnectProps = {
    userArn: string
    globalChannelArn: string
    credentials: STS.Credentials
}

export type MessagingClientState = {
    meetingChannelArn: string | null,
    globalMessages: MessageItem[],
    meetingMessages: MessageItem[]
}
export type MessagingClientStateAndMethod = MessagingClientState & {
    connect: (props: ConnectProps) => Promise<void>
    setMeetingChannelArn: (arn: string) => void
    sendGlobalMessage: (message: string) => Promise<void>
    sendChannelMessage: (mesage: string) => Promise<void>
    setMessageControlLsiterner: (l: MessageControlListener) => void
}

export type MessageControlListener = {
    roomCreated: () => void
    roomDeleted: () => void
}


export const useMessagingClient = (): MessagingClientStateAndMethod => {
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
    const messageControlListenerRef = useRef<MessageControlListener | null>(null)
    const [_messageControlListener, _setMessageControlListener] = useState<MessageControlListener | null>(messageControlListenerRef.current)
    const setMessageControlLsiterner = (l: MessageControlListener) => {
        messageControlListenerRef.current = l
        _setMessageControlListener(messageControlListenerRef.current)
    }

    const connectPropsRef = useRef<ConnectProps | null>(null)


    const client = useMemo(() => {
        const c = new MessagingClient()
        return c
    }, [])
    const connect = async (_props: ConnectProps) => {
        connectPropsRef.current = _props
        console.log("connect called", connectPropsRef.current.credentials)
        await client.connect(connectPropsRef.current.credentials, connectPropsRef.current.userArn!)
        const message: MessageFormat = {
            type: MessageTypes.CONNECTED,
            data: "initialize message"
        }
        await client.send(connectPropsRef.current.globalChannelArn!, JSON.stringify(message))
        client.setListener(connectPropsRef.current.globalChannelArn!, {
            updated: (messages: MessageItem[]) => {
                setGlobalMessages([...messages])
                if (messages[0].type == ChannelMessageType.CONTROL && messageControlListenerRef.current) {
                    if (messages[0].content == ControlTypes.RoomCreated) {
                        messageControlListenerRef.current.roomCreated()
                    } else if (messages[0].content == ControlTypes.RoomDeleted) {
                        messageControlListenerRef.current.roomDeleted()
                    }
                }
            }
        })
        if (globalMessages.length == 0) {
            listGlobalMessage()
        }
    }
    const sendGlobalMessage = async (data: string) => {
        if (!connectPropsRef.current?.globalChannelArn) {
            console.warn("global channel arn is not set.")
            return
        }
        const message: MessageFormat = {
            type: MessageTypes.MESSAGE,
            data: data
        }
        await client.send(connectPropsRef.current.globalChannelArn!, JSON.stringify(message))
    }
    const listGlobalMessage = async () => {
        if (!connectPropsRef.current?.globalChannelArn) {
            console.warn("global channel arn is not set.")
            return
        }
        await client.listMessages(connectPropsRef.current.globalChannelArn!)
    }


    const sendChannelMessage = async (data: string) => {
        if (!meetingChannelArnRef.current) {
            console.warn("meeting channel arn is not set.")
            return
        }
        console.log("[messaging] meetingChannelArnRef.current:", meetingChannelArnRef.current)
        const message: MessageFormat = {
            type: MessageTypes.MESSAGE,
            data: data
        }
        await client.send(meetingChannelArnRef.current!, JSON.stringify(message))

    }

    const retVal: MessagingClientStateAndMethod = {
        connect,
        meetingChannelArn,
        setMeetingChannelArn,
        sendGlobalMessage,
        sendChannelMessage,
        setMessageControlLsiterner,
        globalMessages,
        meetingMessages
    }
    return retVal
}