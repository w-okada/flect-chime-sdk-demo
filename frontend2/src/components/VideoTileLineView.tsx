import { useEffect } from "react"
import { GridListTileBar } from '@material-ui/core'
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { VideoTileState } from "amazon-chime-sdk-js";
import { AttendeeState, useMeetingState } from "../providers/MeetingStateProvider";

type Props = {
    attendees: { [attendeeId: string]: AttendeeState }
    videoTileStates:  { [attendeeId: string]: VideoTileState }
    excludeSpeaker: boolean
    width:number
    height:number
};



const useStyles = makeStyles((theme) => ({
    gridList: {
        width: '100%',
        flexWrap: 'nowrap',
        transform: 'translateZ(0)',
        // height: 450,
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

export const VideoTilesLineView = ({ attendees, videoTileStates, excludeSpeaker, width, height}: Props) =>  {
    const classes = useStyles()
    const { meetingSession } = useMeetingState()
    const attendeeStates = Object.values(attendees).filter(s=>{return !s.isSharedContent})
    // const attendeeStates = Object.values(attendees)

    const lineVideoElementIdPrefix = "focus-video-element"
    const lineVideoElementId = (attendeeId:string) => `${lineVideoElementIdPrefix}-${attendeeId}`

    useEffect(()=>{
        attendeeStates.forEach((s)=>{
            const elementId =  lineVideoElementId(s.attendeeId)
            const lineVideoElement = document.getElementById(elementId)! as HTMLVideoElement
            if(lineVideoElement){
                meetingSession?.audioVideo.bindVideoElement(videoTileStates[s.attendeeId].tileId!, lineVideoElement)
            }
        })
    })

    return (
        <div style={{display:"flex", flexWrap:"wrap", width:`${width}px`, height:`${height}px`, overflowX:"auto" }}>
            {attendeeStates?.map((s, i) => {
                return (
                    <div key={s.attendeeId} style={{height:height-2, margin:"1px", flex:"0 0 auto", position:"relative"}} >
                        {videoTileStates[s.attendeeId] && videoTileStates[s.attendeeId].tileId!>=0?
                            <video id={ lineVideoElementId(s.attendeeId)} style={{height:"100%"}}/>
                            :
                            <div style={{height:"100%"}}>no image</div>

                        }
                        <div style={{position:"absolute", lineHeight:1, fontSize:14, height:15, top:height-20, left:5, background:s.active?"#ee7777cc":"#777777cc"}}>
                            {s.name}
                        </div>
                    </div>
                )
            })}
        </div>
    )

}
