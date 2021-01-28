import React, { useEffect } from "react"
import clsx from 'clsx';
import { GridList, GridListTile, GridListTileBar } from '@material-ui/core'
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { VideoTile } from "amazon-chime-sdk-js";
import { AttendeeState } from "../providers/MeetingStateProvider";

type Props = {
    tiles: VideoTile[]
    attendees: { [attendeeId: string]: AttendeeState }
};


const useStyles = makeStyles((theme) => ({
    gridList: {
        width: '100%',
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

export const VideoTilesView = ({ tiles, attendees}: Props) =>  {


    const generateVideoElementId = (tile:VideoTile) => `video-tile-${tile.id()}`
    useEffect(()=>{
        tiles.forEach(tile=>{
            const videoElementId = generateVideoElementId(tile)
            const videoElement = document.getElementById(videoElementId)! as HTMLVideoElement
            tile.bindVideoElement(videoElement)
        })
    })

    const classes = useStyles()
    const cols = Math.ceil(Math.sqrt(tiles.length))
    const heightRate = (100 / Math.ceil((tiles.length / cols))) + '%'
    
    return (
        <>
            <GridList cellHeight='auto' className={classes.gridList} cols={ cols }>
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
            </GridList>
        </>

    )
}
