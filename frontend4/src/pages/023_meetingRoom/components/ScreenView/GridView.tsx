import { GridList, GridListTile, GridListTileBar, makeStyles, withStyles } from "@material-ui/core";
import React, { useMemo } from "react";
import { useAppState } from "../../../../providers/AppStateProvider";


const GridListTileBar2 = withStyles({
    root: {
      height: 15,
    },
    title: {
        fontSize:10,
    },
})(GridListTileBar);


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


type Props = {
    excludeSharedContent: boolean
    width:number
    height:number
};

type VideoState = "ENABLED" | "PAUSED" | "NOT_SHARE"


export const GridView = ({ excludeSharedContent, width, height}: Props) =>  {
    // const classes = useStyles()
    // const { attendees, videoTileStates, activeSpeakerId, getUserNameByAttendeeIdFromList } = useAppState()

    // let targetTiles = Object.values(videoTileStates).filter(tile =>{
    //     return attendees[tile.boundAttendeeId!].isVideoPaused === false
    // })
    // if(excludeSharedContent){
    //     targetTiles = targetTiles.filter(tile =>{return tile.isContent !== true})
    // }

    // // rendering flag
    // const targetIds = targetTiles.reduce<string>((ids,cur)=>{return `${ids}_${cur.boundAttendeeId}`},"")
    // const targetNames = Object.values(attendees).reduce<string>((names,cur)=>{return `${names}_${cur.name}`},"")
    // const targetVideoStates:VideoState[] = Object.values(attendees).map(x=>{
    //     if(!videoTileStates[x.attendeeId]){
    //         return "NOT_SHARE"
    //     }
    //     if(x.isVideoPaused){
    //         return "PAUSED"
    //     }else{
    //         return "ENABLED"
    //     }
    // })
    // const targetVideoStatesString = targetVideoStates.reduce<string>((states, cur)=>{return `${states}_${cur}`}, "")



    // const cols = Math.min(Math.ceil(Math.sqrt(targetTiles.length)), 5)
    // const rows = Math.ceil(targetTiles.length / cols)
    // const grid = useMemo(()=>{
    //     return(
    //         <GridList cellHeight='auto' className={classes.gridList} cols={ cols }>
    //             {targetTiles.map((tile) => {
    //                 const idPrefix = `drawable-videotile-${tile.boundAttendeeId}`
    //                 return (
    //                     <GridListTile key={tile.boundAttendeeId} cols={1}>
    //                         <DrawableVideoTile key={idPrefix} idPrefix={idPrefix} idSuffix="GridView" tile={tile} width={width/cols} height={height/rows}/>                        
    //                         <GridListTileBar2 style={{background:tile.boundAttendeeId === activeSpeakerId?"#ee7777cc":"#777777cc"}} title={getUserNameByAttendeeIdFromList(tile.boundAttendeeId?tile.boundAttendeeId:"")} />
    //                     </GridListTile>
    //                 )
    //             })}
    //         </GridList>
    //     )
    // },[targetIds, targetNames, targetVideoStatesString]) // eslint-disable-line

    // return (
    //     <>
    //         {grid}
    //     </>
    // )



    return(<></>)
}