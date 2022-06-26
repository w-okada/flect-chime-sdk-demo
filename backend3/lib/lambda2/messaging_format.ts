/**
 * Frontendと共用する。
 */
export const ControlTypes = {
    RoomRegistered: "RoomRegistered",
    RoomStarted: "RoomStarted",
    RoomEnded: "RoomEnded",
    RoomDeleted: "RoomDeleted"
}
export const MessageTypes = {
    BACKEND: "BACKEND",
    CONNECTED: "CONNECTED",
    MESSAGE: "MESSAGE"
} as const
export type MessageTypes = typeof MessageTypes[keyof typeof MessageTypes]

export type MessageFormat = {
    type: MessageTypes,
    data: string
}