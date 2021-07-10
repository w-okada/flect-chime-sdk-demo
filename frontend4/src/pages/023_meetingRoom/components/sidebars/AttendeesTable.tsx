import React, { useMemo } from 'react';
import { useAppState } from '../../../../providers/AppStateProvider';
import { useStyles } from './css';
import { IconButton, Tooltip } from '@material-ui/core';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';

type VideoState = "ENABLED" | "PAUSED" | "NOT_SHARE"

export const AttendeesTable = () => {
    const classes = useStyles()

    const { chimeClient } = useAppState()
    // const {attendees, videoTileStates, setPauseVideo} = useAppState()

    const targetIds   = Object.values(chimeClient!.videoTileStates).reduce<string>((ids,cur)=>{return `${ids}_${cur.boundAttendeeId}`},"")
    const targetNames = Object.values(chimeClient!.attendees).reduce<string>((names,cur)=>{return `${names}_${cur.name}`},"")
    const targetVideoStates:VideoState[] = Object.values(chimeClient!.attendees).map( x =>{
        if(!chimeClient!.videoTileStates[x.attendeeId]){
            return "NOT_SHARE"
        }
        if( x.attendeeId === chimeClient!.attendeeId){ // For Loca Tile
            if(      chimeClient!.meetingSession!.audioVideo.getLocalVideoTile()?.state().active === true  && x.isVideoPaused === false){
                return "ENABLED"
            }else if(chimeClient!.meetingSession!.audioVideo.getLocalVideoTile()?.state().active === true  && x.isVideoPaused === true){
                return "PAUSED"
            }else if(chimeClient!.meetingSession!.audioVideo.getLocalVideoTile()?.state().active === false && x.isVideoPaused === false){
                return "NOT_SHARE"
            }else if(chimeClient!.meetingSession!.audioVideo.getLocalVideoTile()?.state().active === false && x.isVideoPaused === true){
                return "NOT_SHARE"
            }
        }
        // For Remote Tile
        if(x.isVideoPaused){
            return "PAUSED"
        }else{
            return "ENABLED"
        }
    })

    const targetVideoStatesString = targetVideoStates.reduce<string>((states, cur)=>{return `${states}_${cur}`}, "")

    const audienceList = useMemo(()=>{        
        const l = Object.values(chimeClient!.attendees).map((x, index)=>{
            let videoStateComp 
            console.log("TILE SATTUES", x.attendeeId, targetVideoStates[index])
            switch(targetVideoStates[index]){
                case "ENABLED":
                    videoStateComp = (
                        <Tooltip title={`click to pause`}>
                            <IconButton style={{width: "20px", height:"20px", color:"black"}} onClick={ ()=>{chimeClient!.setPauseVideo(x.attendeeId, true)} } >
                                <VideocamIcon></VideocamIcon>
                            </IconButton>
                        </Tooltip>
                    )
                    break
                case "PAUSED":
                    videoStateComp = (
                        <Tooltip title={`click to play`}>
                            <IconButton style={{width: "20px", height:"20px", color:"black"}} onClick={ ()=>{chimeClient!.setPauseVideo(x.attendeeId, false)} } >
                                <VideocamOffIcon  ></VideocamOffIcon>
                            </IconButton>
                        </Tooltip>
                    )
                    break
                case "NOT_SHARE":
                    videoStateComp = <Tooltip title={`not share`}>
                            <IconButton style={{width: "20px", height:"20px", color:"gray"}} >
                                <VideocamOffIcon  ></VideocamOffIcon>
                            </IconButton>
                    </Tooltip>
                    break
            }

            return(
                <>
                    <div style={{display:"flex", flexDirection:"row"}} key={x.attendeeId}>
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
            <div style={{marginLeft:"15pt"}}>
                {audienceList}
            </div>
        </>
    )

    return (<></>)
}

