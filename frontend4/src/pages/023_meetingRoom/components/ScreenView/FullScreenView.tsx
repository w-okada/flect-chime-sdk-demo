import React, { useMemo } from "react";
import { useAppState } from "../../../../providers/AppStateProvider";
import { FocustTarget, PictureInPictureType } from "./const";
import { VideoTileState } from "amazon-chime-sdk-js";
// import { DrawableVideoTile } from "./DrawableVideoTile";
import { DrawableVideoTile } from "@dannadori/flect-chime-lib"
type FullScreenProps = {
    pictureInPicture: PictureInPictureType
    focusTarget: FocustTarget
    width:number
    height:number
};

export const FullScreenView = ({ pictureInPicture, focusTarget, width, height}: FullScreenProps) =>  {
    const {chimeClient, whiteBoardClient} = useAppState()
    
    const contentsTiles    = chimeClient!.getContentTiles()
    const activeSpekerTile = chimeClient!.getActiveSpeakerTile()

    const targetTiles:VideoTileState[] = []

    if(contentsTiles.length > 0){
        targetTiles.concat(contentsTiles)
    }else if(activeSpekerTile){
        targetTiles.push(activeSpekerTile)
    }

    // rendering flag
    const targetIds = targetTiles.reduce<string>((ids,cur)=>{return `${ids}_${cur.boundAttendeeId}`},"")


    const view = useMemo(()=>{
        const contentWidth = width/targetTiles.length
        console.log("[VideoTileFeatureView] render view")
        return(
            <div style={{display:"flex", flexWrap:"nowrap", width:`${width}px`, height:`${height}px`, objectFit:"contain", position:"absolute"}}>
                {targetTiles.map((tile,index)=>{
                    if(!tile){
                        return <div key={index}>no share contets, no active speaker</div>
                    }
                    const idPrefix = `drawable-videotile-${tile.boundAttendeeId}`
                    return <DrawableVideoTile chimeClient={chimeClient!} whiteBoardClient={whiteBoardClient!} key={idPrefix} idPrefix={idPrefix} tile={tile} width={contentWidth} height={height}/>
                })}
            </div>
        )
    },[targetIds, width, height])

    return(<>{view}</>)

}