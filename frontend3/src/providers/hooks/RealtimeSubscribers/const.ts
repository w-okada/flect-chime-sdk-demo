type RealtimeDataAction = "sendmessage"
export const RealtimeDataApp = {
    CHAT:"CHAT",
    WHITEBOARD:"WHITEBOARD"
} as const


export type RealtimeData = {
    uuid: string
    senderId: string
    createdDate: number
    action: RealtimeDataAction
    app: keyof typeof RealtimeDataApp
    data: any
}
