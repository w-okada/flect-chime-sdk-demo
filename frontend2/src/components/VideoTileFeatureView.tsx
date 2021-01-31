import React, { useEffect } from "react"
import clsx from 'clsx';
import { GridList, GridListTile, GridListTileBar } from '@material-ui/core'
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { VideoTile, VideoTileState } from "amazon-chime-sdk-js";
import { AttendeeState, useMeetingState } from "../providers/MeetingStateProvider";

export type PictureInPictureType = "None" | "TOP_LEFT" | "TOP_RIGHT" | "BOTTOM_LEFT" | "BOTTOM_RIGHT"
export type FocustTarget = "SharedContent" | "Speaker"
type Props = {
    // sharedContents: VideoTile[]
    // speakerUserTiles: VideoTile[]
    tiles: VideoTile[]
    attendees: { [attendeeId: string]: AttendeeState }
    videoTileStates:  { [attendeeId: string]: VideoTileState }
    pictureInPicture: PictureInPictureType
    focusTarget: FocustTarget
    width:number
    height:number
};


const useStyles = makeStyles((theme) => ({
    // root:{
    //     width: `calc(100%-1000)`,
    //     height: `calc(100%-1000)`
    // },
    gridList: {
        width: '100%',
        // height: `calc(100%-1000)`
        // height: 450,
    },
    // videoTile:{
    //     width:'100%', 
    //     height:'100%',
    // },
    // videoTileActive:{
    //     width:'100%', 
    //     height:'100%',
    // },
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
        fontSize:4,
    },
})(GridListTileBar);


export const VideoTilesFeatureView = ({ tiles, attendees, videoTileStates, pictureInPicture, focusTarget, width, height}: Props) =>  {
    const classes = useStyles()
    const { meetingSession } = useMeetingState()

    const sharedContentStates = Object.values(attendees).filter(a=>{return a.isSharedContent})
    const speakerStates = Object.values(attendees).filter(a=>{return a.active})

    const focusStates = (()=>{
        if(sharedContentStates.length === 0 && speakerStates.length === 0){
            return null
        }else if(sharedContentStates.length === 0 && speakerStates.length > 0){
            return speakerStates
        }else if(sharedContentStates.length > 0 && speakerStates.length === 0){
            return sharedContentStates
        }else{
            switch(focusTarget){
                case "SharedContent":
                    return sharedContentStates
                case "Speaker":
                    return speakerStates
            }
        }
    })()

    const focusVideoElementIdPrefix = "focus-video-element"
    const pictureInPictureElementIdPrefix = "picture-in-picture-element"
    const focusVideoElementId = (attendeeId:string) => `${focusVideoElementIdPrefix}-${attendeeId}`
    const pictureInPictureElementId = (attendeeId:string) => `${pictureInPictureElementIdPrefix}-${attendeeId}`

    useEffect(()=>{
        focusStates?.forEach((s)=>{
            const elementId =  focusVideoElementId(s.attendeeId)
            const focusVideoElement = document.getElementById(elementId)! as HTMLVideoElement
            console.log("ELEMENT:USEFOCoS::", elementId, focusVideoElement, videoTileStates[s.attendeeId]?.tileId!)
            if(focusVideoElement){
                meetingSession?.audioVideo.bindVideoElement(videoTileStates[s.attendeeId].tileId!, focusVideoElement)
            }
            if(s.isSharedContent){
                const owner = attendees[s.ownerId]
                // if(owner && owner.tileId > 0 ){
                //     const elementId =  pictureInPictureElementId(owner.attendeeId)
                //     const pictureInPictureVideoElement = document.getElementById(elementId)! as HTMLVideoElement
                //     console.log("ELEMENT:USEFOCoS22::", elementId, pictureInPictureVideoElement)
                //     if(pictureInPictureVideoElement){
                //         meetingSession?.audioVideo.bindVideoElement(owner.tileId, pictureInPictureVideoElement)
                //     }
                // }
            }
        })
    })
    useEffect(()=>{
        const wb = document.getElementById("whiteboard") as HTMLCanvasElement
        if(wb){
            console.log("WB:", wb.width, wb.height)
            console.log("WB:", wb.clientWidth, wb.clientHeight)
            console.log("WB:", wb.offsetWidth, wb.offsetHeight)
            console.log("WB:", wb.scrollWidth, wb.scrollHeight)
            focusStates?.forEach((s)=>{
                const elementId =  focusVideoElementId(s.attendeeId)
                const focusVideoElement = document.getElementById(elementId)! as HTMLVideoElement
                console.log("VIDEOELEM:", focusVideoElement.width, focusVideoElement.height, focusVideoElement.videoWidth)
                
            })


        }
    })

    // return (
    //     // <div className={classes.root}>
    //         <GridList cellHeight='auto' className={classes.gridList} cols={ focusStates? focusStates.length : 1 } style={{height:height}}>
    //             {focusStates?.map((s, i) => {
    //                 console.log("ELEMENT:USEFOCoS1111::", focusVideoElementId(s.attendeeId), s.tileId>=0)
    //                 return (
    //                     <GridListTile key={s.attendeeId} cols={1} style={{ position:"relative"}}>
    //                         <video id={ focusVideoElementId(s.attendeeId)} style={{width:width, height:height }}/>
    //                         {s.isSharedContent?
    //                             <></>
    //                             :
    //                             <GridListTileBar2 title={s.name} />
    //                         }
    //                         <div style={{ width:"100px",  position:"absolute", left:"0px", top:"0px", margin:"30px"}}>
    //                             {s.isSharedContent?

    //                                 <GridList cellHeight='auto' className={classes.gridList} cols={ 1 }>
    //                                     <video id={ pictureInPictureElementId(s.ownerId)} style={{width:"100%", border:"1px solid #cccccc"}}/>
    //                                     <GridListTileBar2 title={attendees[s.ownerId].name} style={{height:"15px"}} /> 
    //                                 </GridList>

    //                                 :
    //                                 <></>
    //                             }
    //                         </div>
    //                         {/* <div style={{ width:"100%", height:"100%", position:"absolute", left:"0px", top:"0px", margin:"0px", border:"4px solid #00cccc"}}> */}
    //                             <canvas id="whiteboard" style={{ width:"100%", height:"100%", position:"absolute", left:"0px", top:"0px", margin:"0px"}}/>
    //                         {/* </div> */}

 
    //                     </GridListTile>
    //                 )
    //             })}
    //         </GridList>
    //     // </div>
    // )

    return (
        <div style={{display:"flex", flexWrap:"nowrap", width:`${width}px`, height:`${height}px`}}>
            {focusStates?.map((s, i) => {
                console.log("ELEMENT:USEFOCoS1111::", focusVideoElementId(s.attendeeId), videoTileStates[s.attendeeId].tileId!>=0)
                console.log("ELEMENT:USEFOCoS1112::", attendees)
                return (
                    <div key={s.attendeeId} style={{height:height-2, margin:"1px", flex:"0 0 auto", position:"relative"}} >
                        {videoTileStates[s.attendeeId] && videoTileStates[s.attendeeId].tileId!>=0?
                            <video id={ focusVideoElementId(s.attendeeId)} style={{width:width, height:height }}/>
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


