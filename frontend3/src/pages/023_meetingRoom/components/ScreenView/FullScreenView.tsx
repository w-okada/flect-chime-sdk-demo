import React, { useMemo } from "react";
import { useAppState } from "../../../../providers/AppStateProvider";
import { FocustTarget, PictureInPictureType } from "./const";
import { DrawableVideoTile } from "./DrawableVideoTile";

type FullScreenProps = {
    pictureInPicture: PictureInPictureType
    focusTarget: FocustTarget
    width:number
    height:number
};

export const FullScreenView = ({ pictureInPicture, focusTarget, width, height}: FullScreenProps) =>  {
    // const classes = useStyles()
    const { videoTileStates, activeSpeakerId } = useAppState()
    
    const contentsTiles = Object.values(videoTileStates).filter(tile=>{return tile.isContent})
    const activeSpekerTile = activeSpeakerId && videoTileStates[activeSpeakerId] ? videoTileStates[activeSpeakerId] : null

    const targetTiles = contentsTiles.length > 0 ? contentsTiles : [activeSpekerTile]
    const targetTile1 = targetTiles[0] ? targetTiles[0] : null 
    const targetTile2 = targetTiles[1] ? targetTiles[1] : null 
    

    const view = useMemo(()=>{
        const targetTiles = [targetTile1, targetTile2].filter(tile => tile != null)
        const contentWidth = width/targetTiles.length
        console.log("[VideoTileFeatureView] render view")
        return(
            <div style={{display:"flex", flexWrap:"nowrap", width:`${width}px`, height:`${height}px`, objectFit:"contain", position:"absolute"}}>
                {targetTiles.map((tile,index)=>{
                    if(!tile){
                        return <div key={index}>no share contets, no active speaker</div>
                    }
                    const idPrefix = `drawable-videotile-${tile.boundAttendeeId}`
                    return <DrawableVideoTile key={idPrefix} idPrefix={idPrefix} tile={tile} width={contentWidth} height={height}/>
                })}
            </div>
        )
    },[targetTile1, targetTile2, width, height])

    return(<>{view}</>)

}