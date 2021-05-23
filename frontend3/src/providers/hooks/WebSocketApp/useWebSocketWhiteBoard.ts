import { useEffect, useMemo, useState } from "react"
import { Logger } from "amazon-chime-sdk-js";
import { DrawingData, WebSocketWhiteBoardClient } from "./helper/WebSocketWhiteBoardClient";
import { WebSocketEndpoint } from "../../../BackendConfig";
import { WebSocketMessage } from "./helper/WebSocketClient";

export const DrawingMode = {
    DRAW:"DRAW",
    ERASE:"ERASE",
    DISABLE: "DISABLE"
} as const

type UseWebSocketWhiteBoardProps = {
    meetingId:string
    attendeeId:string
    joinToken:string
    logger?:Logger
}

export const useWebSocketWhiteBoard = (props:UseWebSocketWhiteBoardProps) =>{
    const [drawingData, setDrawingData] = useState<DrawingData[]>([])
    const [lineWidth, setLineWidth] = useState(3)
    const [drawingStroke, setDrawingStroke] = useState("#aaaaaaaa")
    const [drawingMode, setDrawingMode] = useState<keyof typeof DrawingMode>(DrawingMode.DISABLE)
    const [recreateCount, setRecreateCount ] = useState(0)
    const recreate = () =>{
        console.log("websocket recreate!!!!")
        setRecreateCount(recreateCount+1)
    }
    
    const WSWBClient = useMemo(()=>{
        if(props.meetingId === "" || props.attendeeId === "" || props.joinToken === "" || !props.logger){
            return null
        }else{
            const messagingURLWithQuery = `${WebSocketEndpoint}/Prod?joinToken=${props.joinToken}&meetingId=${props.meetingId}&attendeeId=${props.attendeeId}`
            const WSWBClient = new WebSocketWhiteBoardClient(props.attendeeId, messagingURLWithQuery, props.logger, recreate)
            return WSWBClient
        }
    },[props.meetingId, props.attendeeId, props.joinToken, props.logger])

    useEffect(()=>{
        const f = (wsMessages:WebSocketMessage[])=>{
            const newDrawingData = wsMessages.reduce<DrawingData[]>((sum:any[],cur:WebSocketMessage)=>{return [...sum, ...(cur.data as DrawingData[])]},[])
            setDrawingData(newDrawingData)
        }
        WSWBClient?.addEventListener(f)
        return ()=>{WSWBClient?.removeEventListener(f)}
    },[WSWBClient, drawingData])

    const addDrawingData = WSWBClient?.addDrawindData 

    return {addDrawingData, drawingData, lineWidth, setLineWidth, drawingStroke, setDrawingStroke, drawingMode, setDrawingMode}

}
