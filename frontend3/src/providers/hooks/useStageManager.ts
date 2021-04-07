import { useState } from "react"

type UseStageManagerProps = {
    initialStage?:STAGE
}

export type STAGE = "SIGNIN" | "SIGNUP" | "VERIFY" | "REQUEST_NEW_PASSWORD" | "NEW_PASSWORD" 
                    | "ENTRANCE" | "CREATE_MEETING_ROOM" | "WAITING_ROOM" | "MEETING_ROOM"
                    | "MEETING_MANAGER"

export const useStageManager = (props:UseStageManagerProps) =>{
    const [stage, setStage] = useState<STAGE>(props.initialStage||"SIGNIN")
    return {stage, setStage}
}