import { MutableRefObject, useEffect, useState } from "react"
import { GridListTileBar } from '@material-ui/core'
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { VideoTileState } from "amazon-chime-sdk-js";
import { AttendeeState, useMeetingState } from "../providers/MeetingStateProvider";
import { DrawingData, useWebSocketWhiteboardState } from "../providers/websocket/WebScoketWhiteboardProvider";

export type PictureInPictureType = "None" | "TOP_LEFT" | "TOP_RIGHT" | "BOTTOM_LEFT" | "BOTTOM_RIGHT"
export type FocustTarget = "SharedContent" | "Speaker"
const THROTTLE_MSEC = 20

type Props = {
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


export const VideoTilesFeatureView = ({ attendees, videoTileStates, pictureInPicture, focusTarget, width, height}: Props) =>  {
    const classes = useStyles()
    const { meetingSession } = useMeetingState()
    const [inDrawing, setInDrawing] = useState(false)
    const [previousPosition, setPreviousPosition] = useState([0, 0])
    const [lastSendingTime, setLastSendingTime] = useState(Date.now())
    const { sendDrawingData, drawingDatas, drawingMode, drawingStroke } = useWebSocketWhiteboardState()

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
    const whiteboardCanvasElementIdPrefix = "whiteboard-canvas"
    const focusVideoElementId = (attendeeId:string) => `${focusVideoElementIdPrefix}-${attendeeId}`
    const pictureInPictureElementId = (attendeeId:string) => `${pictureInPictureElementIdPrefix}-${attendeeId}`
    const whiteboardCanvasElementId = (attendeeId:string) => `${whiteboardCanvasElementIdPrefix}-${attendeeId}`


    ///// Bind Video
    useEffect(()=>{
        focusStates?.forEach((s)=>{
            const elementId =  focusVideoElementId(s.attendeeId)
            const focusVideoElement = document.getElementById(elementId)! as HTMLVideoElement
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


    ///// Whiteboard
    const drawingStart = (e: MouseEvent) => {
        setInDrawing(true)
        setPreviousPosition([e.offsetX, e.offsetY])
    }
    const drawingEnd = (e: MouseEvent) => { setInDrawing(false) }
    const drawing = (e: MouseEvent) => {
        if (Date.now() - lastSendingTime < THROTTLE_MSEC) {
            return
        }
        if (inDrawing) {
            const startX = previousPosition[0]
            const startY = previousPosition[1]
            const endX = e.offsetX
            const endY = e.offsetY
            const drawingData = generateDrawingData(e, startX, startY, endX, endY)
            setLastSendingTime(Date.now())
            setPreviousPosition([e.offsetX, e.offsetY])
            sendDrawingData(drawingData)
        }
    }

    const generateDrawingData = (e:MouseEvent|TouchEvent, startX: number, startY: number, endX: number, endY: number) => {
        const source = e.target as HTMLCanvasElement
        const cs = getComputedStyle(source)
        const width = parseInt(cs.getPropertyValue("width"))
        const height = parseInt(cs.getPropertyValue("height"))
        const rateX = width / source.width
        const rateY = height / source.height

        const drawingData = (() => {
            if (rateX > rateY) { //  widthにあまりがある。
                const trueWidth = source.width * rateY
                const trueHeight = source.height * rateY
                const restW = (width - trueWidth) / 2

                const startXR = (startX - restW) / trueWidth
                const startYR = startY / trueHeight
                const endXR = (endX - restW) / trueWidth
                const endYR = endY / trueHeight
                const drawingData: DrawingData = {
                    drawingCmd: drawingMode === "DRAW" ? "DRAW" : "ERASE",
                    startXR: startXR,
                    startYR: startYR,
                    endXR: endXR,
                    endYR: endYR,
                    stroke: drawingStroke,
                    lineWidth: 2
                }
                return drawingData
            } else { // heightにあまりがある
                const trueWidth = source.width * rateX
                const trueHeight = source.height * rateX
                const restH = (height - trueHeight) / 2

                const startXR = startX / trueWidth
                const startYR = (startY - restH) / trueHeight
                const endXR = endX / trueWidth
                const endYR = (endY - restH) / trueHeight
                const drawingData: DrawingData = {
                    drawingCmd: drawingMode === "DRAW" ? "DRAW" : "ERASE",
                    startXR: startXR,
                    startYR: startYR,
                    endXR: endXR,
                    endYR: endYR,
                    stroke: drawingStroke,
                    lineWidth: 2
                }
                return drawingData
            }
        })()
        return drawingData
    }
    const touchStart = (e: TouchEvent) => {        
        setInDrawing(true)
        const source = e.target as HTMLCanvasElement
        const x = e.changedTouches[0].clientX - source.getBoundingClientRect().left
        const y = e.changedTouches[0].clientY - source.getBoundingClientRect().top
        setPreviousPosition([x, y])
    }
    const touchEnd = (e: TouchEvent) => {
        setInDrawing(false)
    }
    const touchMove = (e: TouchEvent) => {
        e.preventDefault();
        const source = e.target as HTMLCanvasElement
        if (Date.now() - lastSendingTime < THROTTLE_MSEC) {
            return
        }

        if (inDrawing) {
            const startX = previousPosition[0]
            const startY = previousPosition[1]
            const endX = e.changedTouches[0].clientX - source.getBoundingClientRect().left
            const endY = e.changedTouches[0].clientY - source.getBoundingClientRect().top
            const drawingData = generateDrawingData(e, startX, startY, endX, endY)
            sendDrawingData(drawingData)
            setPreviousPosition([endX, endY])
            setLastSendingTime(Date.now())
        }
    }


    useEffect(()=>{
        focusStates?.forEach((s)=>{
            const elementId =  focusVideoElementId(s.attendeeId)
            const focusVideoElement = document.getElementById(elementId)! as HTMLVideoElement
            const canvasElementId = whiteboardCanvasElementId(s.attendeeId) 
            const focusElementCanvas = document.getElementById(canvasElementId)! as HTMLCanvasElement
            focusElementCanvas.width = focusVideoElement.videoWidth
            focusElementCanvas.height = focusVideoElement.videoHeight
            


            focusElementCanvas.addEventListener("mousedown", drawingStart, { passive: false })
            focusElementCanvas.addEventListener("mouseup", drawingEnd, { passive: false })
            focusElementCanvas.addEventListener("mouseleave", drawingEnd, { passive: false })
            focusElementCanvas.addEventListener("mousemove", drawing, { passive: false })
    
            focusElementCanvas.addEventListener("touchstart", touchStart, { passive: false })
            focusElementCanvas.addEventListener("touchend", touchEnd, { passive: false })
            focusElementCanvas.addEventListener("touchmove", touchMove, { passive: false })
            
            

            const ctx = focusElementCanvas.getContext("2d")!
            ctx.strokeStyle='blue'
            ctx.lineWidth = 3;
            ctx.clearRect(0,0, focusElementCanvas.width,  focusElementCanvas.height)
            drawingDatas.forEach((data)=>{
                ctx.beginPath();
                ctx.moveTo(data.startXR * focusElementCanvas.width, data.startYR * focusElementCanvas.height);
                ctx.lineTo(data.endXR   * focusElementCanvas.width, data.endYR   * focusElementCanvas.height);
                ctx.strokeStyle = data.stroke
                ctx.lineWidth   = data.lineWidth
                ctx.stroke();
                ctx.closePath();
            })


        })

        return ()=>{
            focusStates?.forEach((s)=>{
                try{
                    const canvasElementId = whiteboardCanvasElementId(s.attendeeId) 
                    const focusElementCanvas = document.getElementById(canvasElementId)! as HTMLCanvasElement
                    if(focusElementCanvas===null){
                        return
                    }
                    focusElementCanvas.removeEventListener("mousedown", drawingStart)
                    focusElementCanvas.removeEventListener("mouseup", drawingEnd)
                    focusElementCanvas.removeEventListener("mouseleave", drawingEnd)
                    focusElementCanvas.removeEventListener("mousemove", drawing)
    
                    focusElementCanvas.removeEventListener("touchstart", touchStart)
                    focusElementCanvas.removeEventListener("touchend", touchEnd)
                    focusElementCanvas.removeEventListener("touchmove", touchMove) 
    
                }catch(e){
                    console.log("canvas already removed")
                }

            })
        }
    })

    return (
        <div style={{display:"flex", flexWrap:"nowrap", width:`${width}px`, height:`${height}px`}}>
            {focusStates?.map((s, i) => {
                return (
                    <div key={s.attendeeId} style={{height:height-2, margin:"1px", flex:"0 0 auto", position:"relative"}} >
                        {videoTileStates[s.attendeeId] && videoTileStates[s.attendeeId].tileId!>=0?
                            <video id={ focusVideoElementId(s.attendeeId)} style={{objectFit:"contain", position:"absolute", height:height-2, width:width}}/>
                            :
                            <div style={{height:"100%"}}>no image</div>

                        }
                        {/* <div style={{position:"absolute", lineHeight:1, fontSize:14, height:15, top:height-20, left:5, background:s.active?"#ee7777cc":"#777777cc"}}>
                            {s.name}
                        </div> */}
                        <canvas id={whiteboardCanvasElementId(s.attendeeId)} style={{objectFit:"contain", position:"absolute", height:height-2, width:width}} />
                    </div>
                )
            })}
        </div>
    )



}


