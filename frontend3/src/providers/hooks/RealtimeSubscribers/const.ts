type RealtimeDataAction = "sendmessage"
export const RealtimeDataApp = {
    CHAT:"CHAT",
    WHITEBOARD:"WHITEBOARD",
    HMM: "HMM" //HEADLESS_MEETING_MANAGER
} as const


export type RealtimeData = {
    uuid: string
    senderId: string
    createdDate: number
    action: RealtimeDataAction
    app: keyof typeof RealtimeDataApp
    data: any
}
