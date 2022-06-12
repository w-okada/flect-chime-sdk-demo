import { useMemo } from "react"
import { MessagingClient } from "../001_clients_and_managers/005_messaging/MessagingClient"
import * as STS from "@aws-sdk/client-sts"

export type UseMessagingClientProps = {
    credentials?: STS.Credentials | null
}

export type MessagingClientState = {
}
export type MessagingClientStateAndMethod = MessagingClientState & {
    connect: () => void
}


export const useMessagingClient = (props: UseMessagingClientProps): MessagingClientStateAndMethod => {
    const client = useMemo(() => {
        const c = new MessagingClient()
        return c
    }, [])
    const connect = () => {
        console.log("connect called", props.credentials)
        if (props.credentials) {
            client.connect(props.credentials)
        }
    }

    const retVal: MessagingClientStateAndMethod = {
        connect
    }
    return retVal
}