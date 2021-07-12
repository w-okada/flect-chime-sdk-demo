import React, { useMemo } from "react";
import { DrawableVideoTile } from "../../../../common/websocket/WebSocketWhiteboard/DrawableVideoTile";
import { useAppState } from "../../../../providers/AppStateProvider";

type Props = {
    excludeSpeaker: boolean
    excludeSharedContent: boolean
    width:number
    height:number
    viewInLine: number
};
export const LineView = ({ excludeSpeaker, excludeSharedContent, width, height, viewInLine}: Props) =>  {
    const { chimeClient, whiteboardClient } = useAppState()
    const targetTiles = chimeClient!.getTilesWithFilter(excludeSpeaker, excludeSharedContent)
    
    // rendering flag
    const targetIds = targetTiles.reduce<string>((ids,cur)=>{return `${ids}_${cur.boundAttendeeId}`},"")
    const targetNames = targetTiles.reduce<string>((names,cur)=>{return `${names}_${chimeClient!.getUserNameByAttendeeIdFromList(cur.boundAttendeeId!)}`},"")
    const view = useMemo(()=>{
        console.log("[LineView] Rendering")
        return (
            <div style={{display:"flex", flexWrap:"wrap", width:`${width}px`, height:`${height}px`, overflowX:"auto" }}>
                {targetTiles?.map((tile, i) => {
                    const idPrefix = `drawable-videotile-list-${tile.boundAttendeeId}`
                    return (
                        <div key={`line-view-${i}`} style={{height:height-2, margin:"1px", flex:"0 0 auto", position:"relative"}} >
                            <DrawableVideoTile chimeClient={chimeClient!} whiteboardClient={whiteboardClient!} key={idPrefix} idPrefix={idPrefix} idSuffix="LineView" tile={tile} width={width/viewInLine} height={height}/>                        
                            <div style={{position:"absolute", lineHeight:1, fontSize:14, height:15, top:height-20, left:5, background:tile.boundAttendeeId === chimeClient!.activeSpeakerId?"#ee7777cc":"#777777cc"}}>
                                {chimeClient!.getUserNameByAttendeeIdFromList(tile.boundAttendeeId?tile.boundAttendeeId:"")}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }, [targetIds, targetNames])  // eslint-disable-line

    return (
        <>
            {view}
        </>
    )
}
