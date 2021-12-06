import { useState } from "react";

export type MessageType = "None" | "Info" | "Exception";

export type MessageState = {
    messageActive: boolean;
    messageType: MessageType;
    messageTitle: string;
    messageDetail: string[];
};

export const useMessageState = () => {
    const [messageState, setMessageState] = useState<MessageState>({
        messageActive: false,
        messageType: "None",
        messageTitle: "",
        messageDetail: [],
    });

    const resolveMessage = () => {
        setMessageState({ messageActive: false, messageType: "None", messageTitle: "", messageDetail: [] });
    };
    const setMessage = (type: MessageType, title: string, detail: string[]) => {
        setMessageState({ messageActive: true, messageType: type, messageTitle: title, messageDetail: detail });
    };

    return { messageState, resolveMessage, setMessage };
};
