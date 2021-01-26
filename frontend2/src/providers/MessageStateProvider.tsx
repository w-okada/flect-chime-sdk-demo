import React, { useState, ReactNode, useContext } from 'react';
import { getDeviceLists } from '../utils';

type Props = {
    children: ReactNode;
};
type MessageType = "None" | "Info" | "Exception"

interface Message{
    type: MessageType
    title: string
    detail: string[]
}

interface MessageStateValue {
    messageActive: boolean
    message: Message|null
    resolve: () => void
    setMessage: (type: MessageType, title: string, detail: string[]) => void
}

const MessageStateContext = React.createContext<MessageStateValue | null>(null)


export const useMessageState = (): MessageStateValue => {
    const state = useContext(MessageStateContext)
    if (!state) {
        throw new Error("Error using message state context!")
    }
    return state
}


export const MessageStateProvider = ({ children }: Props) => {
    const [messageActive, setMessageActive] = useState(false)
    const [message , internalSetMessage] = useState(null as Message|null)

    const resolve = () =>{
        setMessageActive(false)
    }
    const setMessage = (type:MessageType, title:string, detail:string[]) => {
        const message:Message = {type:type, title:title, detail:detail}
        internalSetMessage(message)
        setMessageActive(true)
    }


    const providerValue: MessageStateValue = {
        messageActive,
        message,

        resolve,
        setMessage
    }

    return (
        <MessageStateContext.Provider value={providerValue}>
            {children}
        </MessageStateContext.Provider>
    )
}