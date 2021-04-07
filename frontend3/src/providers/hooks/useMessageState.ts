import { useState } from "react"

export type MessageType = "None" | "Info" | "Exception"

type MessageState = {
    messageActive:  boolean,
    messageType: MessageType,
    messageTitle: string,
    messageDetail: string[],
}

export const useMessageState = () =>{
    const [state, setState] = useState<MessageState>({
        messageActive:false, 
        messageType:"None",
        messageTitle:"",
        messageDetail:[],
    })

    const resolveMessage = () =>{
        setState({...state, messageActive:false, messageType:"None", messageTitle:"", messageDetail:[]})
    }
    const setMessage = (type:MessageType, title:string, detail:string[]) => {
        setState({...state, messageActive:true, messageType:type, messageTitle:title, messageDetail:detail})
    }

    return {...state, resolveMessage, setMessage}
}
