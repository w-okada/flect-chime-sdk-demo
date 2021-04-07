import { GridList, GridListTile, GridListTileBar, makeStyles, withStyles } from "@material-ui/core";
import React, { useMemo } from "react";
import { useAppState } from "../../../../providers/AppStateProvider";
import { DrawableVideoTile } from "./DrawableVideoTile";


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
export const GridView = ({ excludeSharedContent, width, height}: Props) =>  {
    const classes = useStyles()
    const { videoTileStates, activeSpeakerId, getUserNameByAttendeeIdFromList } = useAppState()

    let targetTiles = Object.values(videoTileStates)
    if(excludeSharedContent){
        targetTiles = targetTiles.filter(tile =>{return tile.isContent !== true})
    }

    // rendering flag
    const targetIds = targetTiles.reduce<string>((ids,cur)=>{return `${ids}_${cur.boundAttendeeId}`},"")
    const cols = Math.min(Math.ceil(Math.sqrt(targetTiles.length)), 5)
    const rows = Math.ceil(targetTiles.length / cols)
    const grid = useMemo(()=>{
        return(
            <GridList cellHeight='auto' className={classes.gridList} cols={ cols }>
                {targetTiles.map((tile) => {
                    const idPrefix = `drawable-videotile-${tile.boundAttendeeId}`
                    return (
                        <GridListTile key={tile.boundAttendeeId} cols={1}>
                            <DrawableVideoTile key={idPrefix} idPrefix={idPrefix} idSuffix="GridView" tile={tile} width={width/cols} height={height/rows}/>                        
                            <GridListTileBar2 style={{background:tile.boundAttendeeId === activeSpeakerId?"#ee7777cc":"#777777cc"}} title={getUserNameByAttendeeIdFromList(tile.boundAttendeeId?tile.boundAttendeeId:"")} />
                        </GridListTile>
                    )
                })}
            </GridList>
        )
    },[targetIds]) // eslint-disable-line

    return (
        <>
            {grid}
        </>
    )
}