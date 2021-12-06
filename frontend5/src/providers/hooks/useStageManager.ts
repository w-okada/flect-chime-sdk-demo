import { useState } from "react";

type UseStageManagerProps = {
    initialStage: STAGE | null;
};

// export type STAGE = "SIGNIN" | "SIGNUP" | "VERIFY" | "REQUEST_NEW_PASSWORD" | "NEW_PASSWORD" | "ENTRANCE" | "CREATE_MEETING_ROOM" | "WAITING_ROOM" | "MEETING_ROOM" | "MEETING_MANAGER_SIGN" | "MEETING_MANAGER" | "HEADLESS_MEETING_MANAGER" | "HEADLESS_MEETING_MANAGER2" | "MEETING_MANAGER_SIGNIN3" | "MEETING_MANAGER3";
export type STAGE = "SIGNIN" | "SIGNUP" | "VERIFY" | "REQUEST_NEW_PASSWORD" | "NEW_PASSWORD" | "ENTRANCE" | "ENTRANCE_AS_GUEST" | "CREATE_MEETING_ROOM" | "WAITING_ROOM" | "MEETING_ROOM";

export const useStageManager = (props: UseStageManagerProps) => {
    const [stage, setStage] = useState<STAGE>(props.initialStage || "SIGNIN");
    return { stage, setStage };
};
