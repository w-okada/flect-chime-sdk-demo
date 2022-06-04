export const ChimeDemoException = {
    NoMeetingRoomCreated: "NoMeetingRoomCreated"
} as const
export type ChimeDemoException = typeof ChimeDemoException[keyof typeof ChimeDemoException]


