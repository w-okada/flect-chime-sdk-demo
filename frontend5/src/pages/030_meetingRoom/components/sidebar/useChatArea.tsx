import { Button, IconButton, TextField, Tooltip } from "@material-ui/core";
import { Mic, MicOff, Videocam, VideocamOff } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { useMemo } from "react";
import { useAppState } from "../../../../providers/AppStateProvider";
import { CustomTextField } from "../../../000_common/CustomTextField";

export const useChatArea = () => {
    const { chimeClientState } = useAppState();
    const [message, setMessage] = useState("");
    const sendMessage = () => {
        chimeClientState.sendChatData(message);
        setMessage("");
    };

    useEffect(() => {
        const area = document.getElementById("chatArea") as HTMLDivElement;
        if (area) {
            area.scrollTo(0, area.scrollHeight);
        }
    }, [chimeClientState.chatData]);
    const chatArea = useMemo(() => {
        return (
            <div id="chatArea" style={{ display: "flex", flexDirection: "column", width: "100%", maxHeight: "100%", wordBreak: "break-all", overflow: "auto", background: "#ffffffaa" }}>
                <div>Chat</div>
                {chimeClientState.chatData.map((x, i) => {
                    let ownerName = chimeClientState.getUserNameByAttendeeIdFromList(x.senderId);
                    if (ownerName.length > 10) {
                        ownerName = ownerName.substr(0, 8) + "...";
                    }
                    const date = new Date(x.createdDate).toLocaleTimeString();

                    return (
                        <Tooltip key={`message_${i}`} title={date}>
                            <div>
                                <div style={{ fontSize: "10px", color: "#005500" }}>{ownerName}</div>
                                <div style={{ fontSize: "12px", color: "#333333" }}>{x.data}</div>
                            </div>
                        </Tooltip>
                    );
                })}

                <div>
                    <textarea
                        value={message}
                        style={{ width: "80%", height: "10%" }}
                        onChange={(e) => {
                            setMessage(e.target.value);
                        }}
                    ></textarea>
                </div>
                <div>
                    <Button variant="outlined" color="primary" size="small" onClick={sendMessage}>
                        send
                    </Button>
                </div>
            </div>
        );
    }, [chimeClientState.chatData, message]);

    return { chatArea };
};
