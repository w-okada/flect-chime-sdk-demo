import { ConsoleLogger, DefaultWebSocketAdapter, Logger, LogLevel, WebSocketAdapter, WebSocketReadyState } from "amazon-chime-sdk-js";

export type WebSocketMessage = {
    action: string;
    topic: string;
    senderId: string;
    data: any;
};
export type WebSocketMessages = {
    [topic: string]: WebSocketMessage[];
};
export type WebSocketListener = (wsMessages: WebSocketMessage[]) => void;

export type WebSocketListeners = {
    [topic: string]: WebSocketListener[];
};

const listeners: WebSocketListeners = {};
const wsMessages: WebSocketMessages = {};

export class WebSocketClient {
    private attendeeId: string;
    private messagingURLWithQuery: string;
    private logger: Logger;
    private websocketAdapter: WebSocketAdapter | null = null;
    private recreate: () => void;
    constructor(attendeeId: string, messagingURLWithQuery: string, recreate?: () => void, logger?: Logger) {
        console.log("[FlectChimeClient][WebSocketClient] create new websocket client");
        this.attendeeId = attendeeId;
        this.messagingURLWithQuery = messagingURLWithQuery;
        if (logger) {
            this.logger = logger;
        } else {
            this.logger = new ConsoleLogger("MeetingLogs", LogLevel.INFO);
        }
        if (recreate) {
            this.recreate = recreate;
        } else {
            this.recreate = this.connect;
        }
    }
    connect = () => {
        this.websocketAdapter = new DefaultWebSocketAdapter(this.logger);
        this.websocketAdapter.create(this.messagingURLWithQuery, []);
        this.websocketAdapter.addEventListener("message", this.receiveMessage);
        this.websocketAdapter.addEventListener("close", this.reconnect);
        console.log("[FlectChimeClient][WebSocketClient] created websocket client", this.websocketAdapter, new Date().toLocaleTimeString());
    };

    addEventListener = (topic: string, f: WebSocketListener) => {
        if (!listeners[topic]) {
            listeners[topic] = [];
        }
        listeners[topic].push(f);
    };
    removeEventListener = (topic: string, f: (wsMessages: WebSocketMessage[]) => void) => {
        if (listeners[topic]) {
            listeners[topic] = listeners[topic].filter((x) => x !== f);
        }
    };

    reconnect = (e: Event) => {
        console.log(`[FlectChimeClient][WebSocketClient] reconnecting... JSON.stringify(e) ${new Date().toLocaleTimeString()}`);
        this.recreate();
    };

    receiveMessage = (e: Event) => {
        console.log("[FlectChimeClient][WebSocketClient] receive message", e);
        const event = e as MessageEvent;
        const message = JSON.parse(event.data) as WebSocketMessage;

        // specify topic name
        const topic = message.topic;
        this.updateWSMessageData(topic, message);
    };

    updateWSMessageData = (topic: string, wsMessage: WebSocketMessage) => {
        // update buffer
        if (!wsMessages[topic]) {
            wsMessages[topic] = [];
        }
        wsMessages[topic] = [...wsMessages[topic], wsMessage];

        if (listeners[topic]) {
            listeners[topic].forEach((listener) => {
                listener(wsMessages[topic]);
            });
        }
    };

    sendMessage = (topic: string, data: any) => {
        const mess: WebSocketMessage = {
            action: "sendmessage",
            senderId: this.attendeeId,
            topic: topic,
            data: data,
        };
        const message = JSON.stringify(mess);
        try {
            if (this.websocketAdapter?.readyState() === WebSocketReadyState.Open || this.websocketAdapter?.readyState() === WebSocketReadyState.Connecting) {
                const res = this.websocketAdapter!.send(message);
                console.log("[FlectChimeClient][WebSocketClient] send data(ws):", message.length, "sending result:", res);
            } else {
                throw Error("adapter is not open");
            }
        } catch (excpetion) {
            console.log("[FlectChimeClient][WebSocketClient] send data(ws) Exception:", message.length, excpetion);
            this.recreate();
        }
    };

    loopbackMessage = (topic: string, data: any) => {
        const mess: WebSocketMessage = {
            action: "sendmessage",
            senderId: this.attendeeId,
            topic: topic,
            data: data,
        };
        this.updateWSMessageData(topic, mess);
    };
}
