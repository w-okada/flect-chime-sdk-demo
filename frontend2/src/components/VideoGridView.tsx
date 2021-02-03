import React, { useEffect } from "react"
import { GridList, GridListTile, GridListTileBar } from '@material-ui/core'
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { VideoTileState } from "amazon-chime-sdk-js";
import { AttendeeState, useMeetingState } from "../providers/MeetingStateProvider";

type Props = {
    attendees: { [attendeeId: string]: AttendeeState }
    videoTileStates:  { [attendeeId: string]: VideoTileState }
    onlyCameraView: boolean
    width: number
    height: number

};
const lineTileHeight = 150
const useStyles = makeStyles((theme) => ({
    gridList: {
        width: '100%',
        

    },
    videoTile:{
        width:'100%', 
        height:'100%',
    },
    videoTileActive:{
        width:'100%', 
        height:'100%',
    },
    videoTileBar:{
    },
    videoTileBarActive:{
        backgroundColor:"#ee7777"
    }

}));

const GridListTileBar2 = withStyles({
    root: {
      height: 15,
    },
    title: {
        fontSize:10,
    },
})(GridListTileBar);


export const VideoGridView = ({ attendees, videoTileStates, onlyCameraView, width, height}: Props) =>  {
    const classes = useStyles()
    const { meetingSession } = useMeetingState()
    const targetStates = onlyCameraView? Object.values(attendees).filter(s=>{
        const cameraAttendees = Object.keys(videoTileStates)
        return s.attendeeId in cameraAttendees
    }):Object.values(attendees)

    const cols = Math.min(Math.ceil(Math.sqrt(targetStates.length)), 5)
    
    const gridVideoElementIdPrefix = "grid-video-element"
    const gridVideoElementId = (attendeeId:string) => `${gridVideoElementIdPrefix}-${attendeeId}`

    useEffect(()=>{
        targetStates.forEach((s)=>{
            if(videoTileStates[s.attendeeId]){
                const elementId =  gridVideoElementId(s.attendeeId)
                const gridVideoElement = document.getElementById(elementId)! as HTMLVideoElement
                if(gridVideoElement){
                    meetingSession?.audioVideo.bindVideoElement(videoTileStates[s.attendeeId].tileId!, gridVideoElement)
                }
            }
        })
    })

    return (
        <div style={{width:"100%", height:height}}>
            <GridList cellHeight='auto' className={classes.gridList} cols={ cols }>
                {targetStates.map((s) => {
                    return (
                        <GridListTile key={s.attendeeId} cols={1}>
                            {videoTileStates[s.attendeeId] && videoTileStates[s.attendeeId].tileId!>=0?
                                <video id={ gridVideoElementId(s.attendeeId) } className={classes.videoTile}/>
                                :
                                <>no image</>
                            }


                            <GridListTileBar2 className={s.active?classes.videoTileBarActive:classes.videoTileBar} title={s.name} />
                        </GridListTile>
                    )
                })}
            </GridList>
        </div>

    )
}


