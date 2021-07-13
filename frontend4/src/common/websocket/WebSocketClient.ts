import { DefaultWebSocketAdapter, Logger, WebSocketAdapter, WebSocketReadyState } from "amazon-chime-sdk-js";

export type WebSocketMessage = {
    action: string
    topic: string
    senderId: string
    data: any
}
const listener:{[topic:string]:((wsMessages:WebSocketMessage[])=>void)[]} = {}
const wsMessages:{[topic:string]:WebSocketMessage[]} = {}

export class WebSocketClient{
    private attendeeId:string
    private messagingURLWithQuery:string
    private logger:Logger
    private websocketAdapter:WebSocketAdapter|null = null
    private recreate:()=>void
    constructor(attendeeId:string, messagingURLWithQuery:string, logger:Logger, recreate:()=>void){
        console.log("[FlectChimeClient][WebSocketClient] create new websocket client")
        this.attendeeId = attendeeId
        this.messagingURLWithQuery = messagingURLWithQuery
        this.logger = logger
        this.recreate = recreate
    }
    connect = () =>{
        this.websocketAdapter =  new DefaultWebSocketAdapter(this.logger)
        this.websocketAdapter.create(
            this.messagingURLWithQuery,
            []
        )
        this.websocketAdapter.addEventListener('message', this.receiveMessage)
        this.websocketAdapter.addEventListener('close', this.reconnect)
        // this.websocketAdapter.addEventListener('error', this.reconnect)
        console.log("[FlectChimeClient][WebSocketClient] created websocket client", this.websocketAdapter, (new Date()).toLocaleTimeString())
    }
    
    addEventListener = (topic:string, f:(wsMessages:WebSocketMessage[])=>void) =>{
        if(!listener[topic]){
            listener[topic] = []
        }
        listener[topic].push(f)
    }
    removeEventListener = (topic:string, f:(wsMessages:WebSocketMessage[])=>void) =>{
        if(listener[topic]){
            listener[topic] = listener[topic].filter(x=>x!==f)
        }
    }


    reconnect = (e:Event) => {
        // setTimeout(()=>{
            console.log("[FlectChimeClient][WebSocketClient] reconnecting... ", e, (new Date()).toLocaleTimeString())
            this.recreate()
            // this.websocketAdapter =  new DefaultWebSocketAdapter(this.logger)
            // this.websocketAdapter!.create(
            //     this.messagingURLWithQuery,
            //     []
            // )
            // this.websocketAdapter!.addEventListener('message', this.receiveMessage)
            // this.websocketAdapter!.addEventListener('close', this.reconnect)
        // },1*1000)
    }
    
    receiveMessage = (e:Event) => {
        console.log("[FlectChimeClient][WebSocketClient] receive message", listener)
        const event = e as MessageEvent
        const message = JSON.parse(event.data)  as WebSocketMessage

        // specify topic name
        const topic = message.topic
        this.updateWSMessageData(topic, message)
    }

    updateWSMessageData = (topic:string, wsMessage:WebSocketMessage) =>{
        // update buffer
        if(!wsMessages[topic]){
            wsMessages[topic] = []
        }
        wsMessages[topic] = [...wsMessages[topic], wsMessage ]

        if(listener[topic]){
            listener[topic].forEach(messageReceived=>{
                messageReceived(wsMessages[topic])
            })
        }
    }
    
    sendMessage = (topic:string,data:any) =>{
        const mess:WebSocketMessage = {
            action   : 'sendmessage',
            senderId: this.attendeeId,
            topic: topic,
            data: data
        }
        const message = JSON.stringify(mess)
        try{
            if(this.websocketAdapter?.readyState() === WebSocketReadyState.Open || this.websocketAdapter?.readyState() === WebSocketReadyState.Connecting){
                const res = this.websocketAdapter!.send(message)
                console.log("[FlectChimeClient][WebSocketClient] send data(ws):", message.length, "sending result:", res)
            }else{
                throw Error("adapter is not open")
            }
        }catch(excpetion){
            console.log("[FlectChimeClient][WebSocketClient] send data(ws) Exception:", message.length, excpetion)
            this.recreate()
        }
    }

    loopbackMessage = (topic:string,data:any) =>{
        const mess:WebSocketMessage = {
            action   : 'sendmessage',
            senderId: this.attendeeId,
            topic: topic,
            data: data
        }
        this.updateWSMessageData(topic, mess)
    }
}
