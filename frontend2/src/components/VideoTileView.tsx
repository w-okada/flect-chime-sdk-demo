import React, { useEffect } from "react"
import clsx from 'clsx';
import { GridList, GridListTile, GridListTileBar } from '@material-ui/core'
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { VideoTile, VideoTileState } from "amazon-chime-sdk-js";
import { AttendeeState } from "../providers/MeetingStateProvider";
import { VideoTilesFeatureView } from "./VideoTileFeatureView";
import { VideoTilesLineView } from "./VideoTileLineView";

type Props = {
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

export const VideoTilesView = ({ attendees, videoTileStates, width, height}: Props) =>  {
        
    return (
        <div style={{width:"100%", height:height}}>
            <VideoTilesFeatureView attendees={attendees} videoTileStates={videoTileStates} pictureInPicture="TOP_RIGHT" focusTarget="SharedContent" height={height-lineTileHeight} width={width}/>
            <VideoTilesLineView attendees={attendees} videoTileStates={videoTileStates} excludeSpeaker={false} height={lineTileHeight} width={width}/>
        </div>

    )
}


