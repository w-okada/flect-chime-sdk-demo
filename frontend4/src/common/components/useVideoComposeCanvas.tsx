import { useEffect, useMemo, useRef, useState } from "react"
import { FlectChimeClient } from "../chime/FlectChimeClient"
import { v4 } from 'uuid';
import { blueGrey } from "@material-ui/core/colors";

export const RecorderMode = {  
    ALL:"ALL",
    ACTIVE:"ACTIVE",
} as const

type RecorderCanvasProps = {    
    chimeClient: FlectChimeClient,
    mode : keyof typeof RecorderMode,
    canvasWidth:number,
    canvasHeight:number,
    displayWidth:number,
    displayHeight:number,
    drawTitle:boolean,

    notifyVideoStream: (ms:MediaStream) => void,
    framerate:number

    autoplay: boolean

}

export const useVideoComposeCanvas = (props:RecorderCanvasProps ) =>{
    const recorederCanvasId = useMemo(()=>{
        return v4()
    },[])
    const [ enable, setEnable] = useState(props.autoplay)
    const toggleEnable = () =>{
        setEnable(!enable)
    }


    const getTargetTiles = () =>{
        if(props.mode === "ALL"){
            // All
            return Object.values(props.chimeClient.videoTileStates)
        }else if(props.mode === "ACTIVE"){
            // Contents
            const contentsTiles    = props.chimeClient!.getContentTiles()
            if(contentsTiles.length > 0){
                return contentsTiles
            }

            // ActiveSpeaker
            const activeSpekerTile = props.chimeClient!.getActiveSpeakerTile()
            if(activeSpekerTile){
                return [activeSpekerTile]
            }
        }
        return []
    }

    const targetTiles = getTargetTiles()
    // rendering flag
    const targetIds = targetTiles.reduce<string>((ids,cur)=>{return `${ids}_${cur.boundAttendeeId}`},"")


    const videoElements = useMemo(()=>{
        const elems = targetTiles.map((v,index)=>{
            return(
                <video id={`recorder-canvas-video-${recorederCanvasId}-${index}`} style={{width:"6px", height:"4px"}} ></video>
            )
        })
        return elems
    },[targetIds])

    const view = useMemo(()=>{
        return(
            <div style={{width:`${props.displayWidth}px`, height:`${props.displayHeight}px`}}>
                <canvas id={`recorder-canvas-canvas-${recorederCanvasId}`} width={props.canvasWidth} height={props.canvasHeight} style={{objectFit:"contain", position:"absolute", height:props.displayHeight-2, width:props.displayWidth}} />
            </div>
        )
    },[props.displayWidth, props.displayHeight, props.canvasWidth, props.canvasHeight])  // eslint-disable-line

    // Bind
    useEffect(()=>{
        const elems = targetTiles.forEach((v,index)=>{
            const videoId = `recorder-canvas-video-${recorederCanvasId}-${index}`
            const videoElem = document.getElementById(videoId) as HTMLVideoElement
            if(videoElem){
                props.chimeClient.meetingSession?.audioVideo.bindVideoElement(v.tileId!, videoElem)

            }
        })
        return elems
    },[targetIds])

    const renderRef = useRef(0);

    const render = (canvasElem:HTMLCanvasElement, cols:number, rows:number, maxWidth:number, maxHeight:number) => {
        const ctx = canvasElem.getContext("2d")!
        ctx.clearRect(0, 0, canvasElem.width, canvasElem.height)
        const promises = targetTiles.map((v,index)=>{
            const p = new Promise<void>((resolve, reject)=>{
                const videoId = `recorder-canvas-video-${recorederCanvasId}-${index}`
                const videoElem = document.getElementById(videoId) as HTMLVideoElement
                if(!videoElem){
                    resolve()
                    return 
                }

                let rate
                if(videoElem.videoWidth / maxWidth > videoElem.videoHeight / maxHeight){
                    rate = maxWidth / videoElem.videoWidth
                }else{
                    rate = maxHeight / videoElem.videoHeight
                }

                const w = videoElem.videoWidth * rate
                const h = videoElem.videoHeight * rate
                const offset_x_per_area = (maxWidth - w) / 2
                const offset_y_per_area = (maxHeight - h) / 2

                const global_offset_x = (index % cols) * maxWidth  + offset_x_per_area
                const global_offset_y = Math.floor(index / cols) * maxHeight + offset_y_per_area
                const position = [Math.ceil(global_offset_x), Math.ceil(global_offset_y), Math.ceil(w), Math.ceil(h)]

                ctx.drawImage(videoElem, position[0], position[1], position[2], position[3])


                if(props.drawTitle){
                    const attendeeId = v.boundAttendeeId!
                    let title = props.chimeClient.getUserNameByAttendeeIdFromList(attendeeId)

                    ctx.textAlign='left'
                    ctx.textBaseline='top'
    
                    const fontsize = Math.ceil(Math.floor(h/ 10))
                    ctx.font = `${fontsize}px Arial`
                    if(title.length > 10){
                        title = title.substring(0,10)
                    }
                    const textWidth = ctx.measureText(title).width
                    ctx.fillStyle="#ffffff99"
                    const textAreaposition = [position[0]+5, position[1] + position[3] - fontsize - 5, textWidth, fontsize]
                    
                    ctx.fillRect(textAreaposition[0], textAreaposition[1], textAreaposition[2], textAreaposition[3])
    
                    ctx.fillStyle=blueGrey[900]
                    ctx.fillText(title, position[0]+5, position[1] + position[3] - fontsize - 5)
                }
                resolve()
            })
            return p
        })
        Promise.all(promises).then(()=>{
            if(enable){
                renderRef.current = requestAnimationFrame(()=>{render(canvasElem, cols, rows, maxWidth, maxHeight)})
            }
        })
    };    


    // Render
    useEffect(()=>{
        const targetNum = targetTiles.length
        const cols = Math.ceil(Math.sqrt(targetNum))
        const rows = Math.ceil(targetNum / cols)
        const maxWidth = props.canvasWidth / cols
        const maxHeight = props.canvasHeight / rows

        const canvasElem = document.getElementById(`recorder-canvas-canvas-${recorederCanvasId}`) as HTMLCanvasElement
        const ctx = canvasElem.getContext("2d")!
        renderRef.current = requestAnimationFrame(()=>{render(canvasElem, cols, rows, maxWidth, maxHeight)})
        return ()=>{
            console.log("CANCEL", renderRef.current)
            cancelAnimationFrame(renderRef.current)
        }
    },[targetIds, enable])


    // Notify the mediastream
    useEffect(()=>{
        const canvasElem = document.getElementById(`recorder-canvas-canvas-${recorederCanvasId}`) as HTMLCanvasElement

        // @ts-ignore
        const videoStream = canvasElem.captureStream(props.framerate) as MediaStream
        props.notifyVideoStream(videoStream)
    },[])

    const videoComposeCanvas = useMemo(()=>{
        return (
            <div style={{display:"flex", flexDirection:"column"}}>
                <div>
                    {view}
                </div>
                <div>
                    {videoElements}
                </div>
            </div>
        )
    
    },[targetIds])
    

    return { videoComposeCanvas, enable, toggleEnable }
}

