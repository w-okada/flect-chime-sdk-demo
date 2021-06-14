import { Tooltip } from "@material-ui/core"
import React, { useMemo } from "react"
import { useAppState } from "../../../providers/AppStateProvider"

export const AudienceList = () => {
    const {attendees} = useAppState()
    const audienceList = useMemo(()=>{
        const l = Object.values(attendees).map((x)=>{
            return(
                <>
                    <Tooltip title={`${x.attendeeId}`}>
                        <div>
                            {x.name}
                        </div>
                    </Tooltip>
                </>
            )
        })

        return(
            <div style={{display:"flex", flexDirection:"column"}}>
                {l}
            </div>
        )
    },[attendees])

    return(
        <> 
            <div style={{color:"burlywood"}}>
                Spacemen
            </div>
            <div style={{marginLeft:"15pt"}}>
                {audienceList}
            </div>
        </>
    )
}

