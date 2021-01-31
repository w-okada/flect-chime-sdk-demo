import React, { useEffect } from "react"
import clsx from 'clsx';
import { GridList, GridListTile, GridListTileBar } from '@material-ui/core'
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { VideoTile, VideoTileState } from "amazon-chime-sdk-js";
import { AttendeeState } from "../providers/MeetingStateProvider";
import { VideoTilesFeatureView } from "./VideoTileFeatureView";
import { VideoTilesLineView } from "./VideoTileLineView";

type Props = {
    tiles: VideoTile[]
    attendees: { [attendeeId: string]: AttendeeState }
    videoTileStates:  { [attendeeId: string]: VideoTileState }
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

export const VideoTilesView = ({ tiles, attendees, videoTileStates, width, height}: Props) =>  {
    

    const generateVideoElementId = (tile:VideoTile) => `video-tile-${tile.id()}`
    const classes = useStyles()
    const sharedContents = tiles.filter(t =>{return t.state().isContent})
    const sharedTileCols = Math.ceil(Math.sqrt(sharedContents.length))
    const speakerUserIds = Object.values(attendees).filter(s=>{
        return s.active
    }).map(s=>{
        return s.attendeeId
    })
    const speakerUserTiles = tiles.filter(t=>{
        return speakerUserIds.indexOf(t.state().boundAttendeeId!)!==-1
    })

    const normalTiles = tiles.filter(t =>{return !t.state().isContent}).filter(t=>{return t.state().boundAttendeeId! in speakerUserIds})
    const normalTilecols = Math.ceil(Math.sqrt(normalTiles.length))


    
    return (
        <div style={{width:"100%", height:height}}>
            <VideoTilesFeatureView  tiles={tiles} attendees={attendees} videoTileStates={videoTileStates} pictureInPicture="TOP_RIGHT" focusTarget="SharedContent" height={height-lineTileHeight} width={width}/>
            <VideoTilesLineView tiles={tiles} attendees={attendees} videoTileStates={videoTileStates} excludeSpeaker={false} height={lineTileHeight} width={width}/>

            {/* <GridList cellHeight='auto' className={classes.gridList} cols={ sharedTileCols }>
                {sharedContents.map((tile) => {
                    // console.log("TILELENGTH:", tiles.length)
                    return (
                        <GridListTile key={tile.id()} cols={1}>
                            <video controls id={ generateVideoElementId(tile) } className={attendees[tile.state().boundAttendeeId!]?.active?classes.videoTileActive:classes.videoTile}/>
                            <GridListTileBar2 className={attendees[tile.state().boundAttendeeId!]?.active?classes.videoTileBarActive:classes.videoTileBar}
                                title={
                                    tile.state().boundAttendeeId! in attendees? 
                                    attendees[tile.state().boundAttendeeId!].name
                                    :
                                    tile.state().boundAttendeeId
                                }
                            />
                        </GridListTile>
                    )
                })}
            </GridList>
 */}





            {/* <GridList cellHeight='auto' className={classes.gridList} cols={ normalTilecols }>
                {normalTiles.map((tile) => {
                    // console.log("TILELENGTH:", tiles.length)
                    return (
                        <GridListTile key={tile.id()} cols={1}>
                            <video controls id={ generateVideoElementId(tile) } className={attendees[tile.state().boundAttendeeId!]?.active?classes.videoTileActive:classes.videoTile}/>
                            <GridListTileBar2 className={attendees[tile.state().boundAttendeeId!]?.active?classes.videoTileBarActive:classes.videoTileBar}
                                title={
                                    tile.state().boundAttendeeId! in attendees? 
                                    attendees[tile.state().boundAttendeeId!].name
                                    :
                                    tile.state().boundAttendeeId

                                }
                            />
                        </GridListTile>
                    )
                })}
            </GridList> */}

{/* 
            <GridList cellHeight='auto' className={classes.gridList} cols={ normalTilecols }>
                {tiles.map((tile) => {
                    // console.log("TILELENGTH:", tiles.length)
                    return (
                        <GridListTile key={tile.id()} cols={1}>
                            <video controls id={ generateVideoElementId(tile) } className={attendees[tile.state().boundAttendeeId!]?.active?classes.videoTileActive:classes.videoTile}/>
                            <GridListTileBar2 className={attendees[tile.state().boundAttendeeId!]?.active?classes.videoTileBarActive:classes.videoTileBar}
                                title={
                                    tile.state().boundAttendeeId! in attendees? 
                                    attendees[tile.state().boundAttendeeId!].name
                                    :
                                    tile.state().boundAttendeeId

                                }
                            />
                        </GridListTile>
                    )
                })}
            </GridList> */}





        </div>

    )
}



// export const VideoTilesView_old = ({ tiles, attendees}: Props) =>  {


//     const generateVideoElementId = (tile:VideoTile) => `video-tile-${tile.id()}`
//     // useEffect(()=>{
//     //     try{
//     //         tiles.forEach(tile=>{
//     //             const videoElementId = generateVideoElementId(tile)
//     //             const videoElement = document.getElementById(videoElementId)! as HTMLVideoElement
//     //             console.log(">>>?????>>>",videoElement)
//     //             tile.bindVideoElement(videoElement)
//     //         })
//     //     }catch(e){
//     //         console.log("EXCEPTION!!",e)
//     //     }
//     // })

//     const classes = useStyles()
//     const sharedContents = tiles.filter(t =>{return t.state().isContent})
//     const sharedTileCols = Math.ceil(Math.sqrt(sharedContents.length))
//     const speakerUserIds = Object.values(attendees).filter(s=>{
//         return s.active
//     }).map(s=>{
//         return s.attendeeId
//     })
//     const speakerUserTiles = tiles.filter(t=>{
//         return speakerUserIds.indexOf(t.state().boundAttendeeId!)!==-1
//     })

//     const normalTiles = tiles.filter(t =>{return !t.state().isContent}).filter(t=>{return t.state().boundAttendeeId! in speakerUserIds})
//     const normalTilecols = Math.ceil(Math.sqrt(normalTiles.length))

    
//     return (
//         <div style={{width:"auto", height:"auto"}}>
//             <VideoTilesFeatureView  speakerUserTiles={speakerUserTiles} sharedContents={sharedContents} attendees={attendees} pictureInPicture="TOP_RIGHT" focusTarget="SharedContent"/>
//             <VideoTilesLineView tiles={tiles} attendees={attendees} excludeSpeaker={false}/>
//             {/* <GridList cellHeight='auto' className={classes.gridList} cols={ sharedTileCols }>
//                 {sharedContents.map((tile) => {
//                     // console.log("TILELENGTH:", tiles.length)
//                     return (
//                         <GridListTile key={tile.id()} cols={1}>
//                             <video controls id={ generateVideoElementId(tile) } className={attendees[tile.state().boundAttendeeId!]?.active?classes.videoTileActive:classes.videoTile}/>
//                             <GridListTileBar2 className={attendees[tile.state().boundAttendeeId!]?.active?classes.videoTileBarActive:classes.videoTileBar}
//                                 title={
//                                     tile.state().boundAttendeeId! in attendees? 
//                                     attendees[tile.state().boundAttendeeId!].name
//                                     :
//                                     tile.state().boundAttendeeId
//                                 }
//                             />
//                         </GridListTile>
//                     )
//                 })}
//             </GridList>
//  */}





//             {/* <GridList cellHeight='auto' className={classes.gridList} cols={ normalTilecols }>
//                 {normalTiles.map((tile) => {
//                     // console.log("TILELENGTH:", tiles.length)
//                     return (
//                         <GridListTile key={tile.id()} cols={1}>
//                             <video controls id={ generateVideoElementId(tile) } className={attendees[tile.state().boundAttendeeId!]?.active?classes.videoTileActive:classes.videoTile}/>
//                             <GridListTileBar2 className={attendees[tile.state().boundAttendeeId!]?.active?classes.videoTileBarActive:classes.videoTileBar}
//                                 title={
//                                     tile.state().boundAttendeeId! in attendees? 
//                                     attendees[tile.state().boundAttendeeId!].name
//                                     :
//                                     tile.state().boundAttendeeId

//                                 }
//                             />
//                         </GridListTile>
//                     )
//                 })}
//             </GridList> */}

// {/* 
//             <GridList cellHeight='auto' className={classes.gridList} cols={ normalTilecols }>
//                 {tiles.map((tile) => {
//                     // console.log("TILELENGTH:", tiles.length)
//                     return (
//                         <GridListTile key={tile.id()} cols={1}>
//                             <video controls id={ generateVideoElementId(tile) } className={attendees[tile.state().boundAttendeeId!]?.active?classes.videoTileActive:classes.videoTile}/>
//                             <GridListTileBar2 className={attendees[tile.state().boundAttendeeId!]?.active?classes.videoTileBarActive:classes.videoTileBar}
//                                 title={
//                                     tile.state().boundAttendeeId! in attendees? 
//                                     attendees[tile.state().boundAttendeeId!].name
//                                     :
//                                     tile.state().boundAttendeeId

//                                 }
//                             />
//                         </GridListTile>
//                     )
//                 })}
//             </GridList> */}





//         </div>

//     )
// }
