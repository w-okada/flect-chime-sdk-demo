import { DefaultWebSocketAdapter, Logger, WebSocketAdapter } from "amazon-chime-sdk-js";


export type WebSocketMessage = {
    action: string
    topic: string
    senderId: string
    data: any
}
const listener:{[topic:string]:((wsMessages:WebSocketMessage[])=>void)[]} = {}
const wsMessages:{[topic:string]:WebSocketMessage[]} = {}

export class WebSocketClient{
    //// CHANGE: This class is no more SINGLETON. Other WSS URL can be used.
    // private static _instance:WebSocketClient
    // public static getInstance(attendeeId:string, messagingURLWithQuery:string, logger:Logger){
    //     if(!this._instance){
    //         this._instance = new WebSocketClient(attendeeId, messagingURLWithQuery, logger)
    //     }
    //     return this._instance
    // }
    // private wsMessages:{[topic:string]:WebSocketMessage[]} = {}
//    private wsMessages:{[topic:string]:WebSocketMessage[]} = {}

    private attendeeId:string
    private messagingURLWithQuery:string
    private logger:Logger
    private websocketAdapter:WebSocketAdapter|null = null
    private recreate:()=>void
    constructor(attendeeId:string, messagingURLWithQuery:string, logger:Logger, recreate:()=>void){
        console.log("NEW WEBSOCKET CLIENT")
        this.attendeeId = attendeeId
        this.messagingURLWithQuery = messagingURLWithQuery
        this.logger = logger
        this.recreate=recreate
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
        console.log("WebSocket Created!!", this.websocketAdapter, (new Date()).toLocaleTimeString())
    }
    
    // private listener:{[topic:string]:((wsMessages:WebSocketMessage[])=>void)[]} = {}
    // addEventListener = (topic:string, f:(wsMessages:WebSocketMessage[])=>void) =>{
    //     if(!this.listener[topic]){
    //         this.listener[topic] = []
    //     }
    //     this.listener[topic].push(f)
    //     // console.log("Listener", this.listener)
    // }
    // removeEventListener = (topic:string, f:(wsMessages:WebSocketMessage[])=>void) =>{
    //     if(this.listener[topic]){
    //         this.listener[topic] = this.listener[topic].filter(x=>x!==f)
    //     }
    // }

    addEventListener = (topic:string, f:(wsMessages:WebSocketMessage[])=>void) =>{
        if(!listener[topic]){
            listener[topic] = []
        }
        listener[topic].push(f)
        // console.log("Listener", this.listener)
    }
    removeEventListener = (topic:string, f:(wsMessages:WebSocketMessage[])=>void) =>{
        if(listener[topic]){
            listener[topic] = listener[topic].filter(x=>x!==f)
        }
    }


    reconnect = (e:Event) => {
        // setTimeout(()=>{
            console.log("reconnecting... ", e, (new Date()).toLocaleTimeString())
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
        // console.log("receive message", this.listener)
        console.log("receive message", listener)
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

        // notify
        // if(this.listener[topic]){
        //     this.listener[topic].forEach(messageReceived=>{
        //         messageReceived(this.wsMessages[topic])
        //     })
        // }
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
        const res = this.websocketAdapter!.send(message)
        console.log("send data(ws):", message.length, "sending result:", res)
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
