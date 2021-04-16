import { useEffect, useMemo, useState } from "react"
import { OnetimeCodeInfo, singinWithOnetimeCodeRequest } from "../../api/api"

type UseStageManagerProps = {
    initialStage : STAGE | null,
    // uuid  : string | null,
    // meetingName  : string | null, // meeting name is already encoded
    // attendeeId   : string | null,
}

export type STAGE = "SIGNIN" | "SIGNUP" | "VERIFY" | "REQUEST_NEW_PASSWORD" | "NEW_PASSWORD" 
                    | "ENTRANCE" | "CREATE_MEETING_ROOM" | "WAITING_ROOM" | "MEETING_ROOM"
                    | "MEETING_MANAGER_SIGNIN" | "MEETING_MANAGER"



export const useStageManager = (props:UseStageManagerProps) =>{
    const [stage, setStage] = useState<STAGE>(props.initialStage||"SIGNIN")
    return {stage, setStage}
}



