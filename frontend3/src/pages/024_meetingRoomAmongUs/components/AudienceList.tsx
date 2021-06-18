import { IconButton, Tooltip } from "@material-ui/core"
import React, { useMemo } from "react"
import { useAppState } from "../../../providers/AppStateProvider"
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';


type VideoState = "ENABLED" | "PAUSED" | "NOT_SHARE"



export const AudienceList = () => {
    const {attendees, videoTileStates, setPauseVideo} = useAppState()

    const targetIds   = Object.values(videoTileStates).reduce<string>((ids,cur)=>{return `${ids}_${cur.boundAttendeeId}`},"")
    const targetNames = Object.values(attendees).reduce<string>((names,cur)=>{return `${names}_${cur.name}`},"")
    const targetVideoStates:VideoState[] = Object.values(attendees).map(x=>{
        if(!videoTileStates[x.attendeeId]){
            return "NOT_SHARE"
        }
        if(x.isVideoPaused){
            return "PAUSED"
        }else{
            return "ENABLED"
        }
    })
    const targetVideoStatesString = targetVideoStates.reduce<string>((states, cur)=>{return `${states}_${cur}`}, "")

    // const audienceList = useMemo(()=>{
    //     const l = Object.values(attendees).map((x)=>{
    //         return(
    //             <>
    //                 <Tooltip title={`${x.attendeeId}`}>
    //                     <div>
    //                         {x.name}
    //                     </div>
    //                 </Tooltip>
    //             </>
    //         )
    //     })

    //     return(
    //         <div style={{display:"flex", flexDirection:"column"}}>
    //             {l}
    //         </div>
    //     )
    // },[attendees])

    const audienceList = useMemo(()=>{        
        const l = Object.values(attendees).map((x, index)=>{
            let videoStateComp 
            switch(targetVideoStates[index]){
                case "ENABLED":
                    videoStateComp = (
                        <Tooltip title={`click to pause`}>
                            <IconButton style={{width: "20px", height:"20px"}} onClick={ ()=>{setPauseVideo(x.attendeeId, true)} } >
                                <VideocamIcon></VideocamIcon>
                            </IconButton>
                        </Tooltip>
                    )
                    break
                case "PAUSED":
                    videoStateComp = (
                        <Tooltip title={`click to play`}>
                            <IconButton style={{width: "20px", height:"20px"}} onClick={ ()=>{setPauseVideo(x.attendeeId, false)} } >
                                <VideocamOffIcon  ></VideocamOffIcon>
                            </IconButton>
                        </Tooltip>
                    )
                    break
                case "NOT_SHARE":
                    videoStateComp = <></>
                    break
            }

            return(
                <>
                    <div style={{display:"flex", flexDirection:"row"}}>
                        <Tooltip title={`${x.attendeeId}`}>
                            <div>
                                {x.name} 
                            </div>
                        </Tooltip>
                            <div>
                                {videoStateComp}
                            </div>
                    </div>
                </>
            )
        })

        return(
            <div style={{display:"flex", flexDirection:"column"}}>
                {l}
            </div>
        )
    },[targetIds, targetNames, targetVideoStatesString])

    
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

