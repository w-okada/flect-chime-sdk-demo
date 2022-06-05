export const ChimeDemoException = {
    NoMeetingRoomCreated: "NoMeetingRoomCreated",
    RestClientNotInitilized: "RestClientNotInitilized"
} as const
export type ChimeDemoException = typeof ChimeDemoException[keyof typeof ChimeDemoException]


