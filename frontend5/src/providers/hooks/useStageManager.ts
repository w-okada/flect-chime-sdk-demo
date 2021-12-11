import { useState } from "react";

type UseStageManagerProps = {
    initialStage: STAGE | FOR_FEDERATION | null;
};

// export type STAGE = "SIGNIN" | "SIGNUP" | "VERIFY" | "REQUEST_NEW_PASSWORD" | "NEW_PASSWORD" | "ENTRANCE" | "CREATE_MEETING_ROOM" | "WAITING_ROOM" | "MEETING_ROOM" | "MEETING_MANAGER_SIGN" | "MEETING_MANAGER" | "HEADLESS_MEETING_MANAGER" | "HEADLESS_MEETING_MANAGER2" | "MEETING_MANAGER_SIGNIN3" | "MEETING_MANAGER3";
// export type STAGE = "SIGNIN" | "SIGNUP" | "VERIFY" | "REQUEST_NEW_PASSWORD" | "NEW_PASSWORD" | "ENTRANCE" | "ENTRANCE_AS_GUEST" | "CREATE_MEETING_ROOM" | "WAITING_ROOM" | "MEETING_ROOM";
//export type FOR_FEDERATION = "SLACK_SIGNUP";

export const STAGE = {
    SIGNIN: "SIGNIN",
    SIGNUP: "SIGNUP",
    VERIFY: "VERIFY",
    REQUEST_NEW_PASSWORD: "REQUEST_NEW_PASSWORD",
    NEW_PASSWORD: "NEW_PASSWORD",
    ENTRANCE: "ENTRANCE",
    ENTRANCE_AS_GUEST: "ENTRANCE_AS_GUEST",
    CREATE_MEETING_ROOM: "CREATE_MEETING_ROOM",
    WAITING_ROOM: "WAITING_ROOM",
    MEETING_ROOM: "MEETING_ROOM",
} as const;
export type STAGE = typeof STAGE[keyof typeof STAGE];

export const FOR_FEDERATION = {
    SLACK_SIGNUP: "SLACK_SIGNUP",
    SLACK_SIGNUP2: "SLACK_SIGNUP2",
} as const;
export type FOR_FEDERATION = typeof FOR_FEDERATION[keyof typeof FOR_FEDERATION];

export const useStageManager = (props: UseStageManagerProps) => {
    const [stage, setStage] = useState<STAGE | FOR_FEDERATION>(props.initialStage || "SIGNIN");
    return { stage, setStage };
};
