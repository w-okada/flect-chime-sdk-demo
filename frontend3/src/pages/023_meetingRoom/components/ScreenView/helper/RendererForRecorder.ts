import { MeetingSession } from "amazon-chime-sdk-js"

export class RendererForRecorder {
    meetingSession: MeetingSession
    
    alive = true
    private dstCanvas:HTMLCanvasElement | null = null
    private srcVideos:HTMLVideoElement[] | null = null
    private cols = 0
    private rows = 0
    private maxWidth = 0
    private maxHeight = 0
    private videoPositions:number[][] = []

    constructor(meetingSession: MeetingSession) {
        this.meetingSession = meetingSession
    }
    init(dstCanvas:HTMLCanvasElement){
        this.dstCanvas = dstCanvas
    }
    start() {
        this.alive = true
        this.renderVideos()
    }
    setSrcVideoElements(srcVideos:HTMLVideoElement[]){
        this.srcVideos = srcVideos
        const videoNum = this.srcVideos.length

        // Decide offset and size of each video here 
        //// Max Size
        this.cols = Math.ceil(Math.sqrt(videoNum))
        this.rows = Math.ceil(videoNum / this.cols)
        this.maxWidth = this.dstCanvas ? this.dstCanvas.width / this.cols : 0
        this.maxHeight = this.dstCanvas ? this.dstCanvas.height / this.rows : 0
        
        // //// FitSize
        // this.videoPositions = this.srcVideos.map((video, index) =>{
        //     let rate
        //     // if(video.videoWidth / video.videoHeight > this.dstCanvas!.width / this.dstCanvas!.height){
        //     if(video.videoWidth / this.maxWidth > video.videoHeight / this.maxHeight){
        //         rate = this.maxWidth / video.videoWidth
        //     }else{
        //         rate = this.maxHeight / video.videoHeight
        //     }
        //     const w = video.videoWidth * rate
        //     const h = video.videoHeight * rate
        //     const offset_x_per_area = (this.maxWidth - w) / 2
        //     const offset_y_per_area = (this.maxHeight - h) / 2

        //     const global_offset_x = (index % this.cols) * this.maxWidth  + offset_x_per_area
        //     const global_offset_y = Math.floor(index / this.cols) * this.maxHeight + offset_y_per_area
        //     return [Math.ceil(global_offset_x), Math.ceil(global_offset_y), Math.ceil(w), Math.ceil(h)]
        // })
    }
    destroy() {
        console.log("destroy renderer!!")
        this.alive = false
    }

    focusVideoElements: HTMLVideoElement[] = []

    private renderVideos = () => {
        if(!this.dstCanvas){
            requestAnimationFrame(() => { this.renderVideos() })
            return
        }else if(!this.srcVideos || this.srcVideos.length === 0){
            const date = new Date();
            const utc = date.toUTCString();
            const ctx = this.dstCanvas!.getContext("2d")!
            ctx.clearRect(0,0,this.dstCanvas!.width,this.dstCanvas!.height)
            ctx.fillStyle="#ffffff"
            const fontsize = Math.floor(this.dstCanvas!.height / 15)
            ctx.font = `${fontsize}px Arial`
            ctx.fillText(`${utc}`, this.dstCanvas!.width / 10 , (this.dstCanvas!.height / 10) * 2)
            ctx.fillText(`There is no active speaker or no shared contents.`, this.dstCanvas!.width / 10 , (this.dstCanvas!.height / 10) * 3)
            requestAnimationFrame(() => { this.renderVideos() })
            return
        }

        const ctx = this.dstCanvas!.getContext("2d")!
        ctx.clearRect(0,0,this.dstCanvas!.width,this.dstCanvas!.height)
        ctx.fillRect(0,0,this.dstCanvas!.width,this.dstCanvas!.height)
        this.srcVideos.forEach((video,index)=>{
            let rate
            // if(video.videoWidth / video.videoHeight > this.dstCanvas!.width / this.dstCanvas!.height){
            if(video.videoWidth / this.maxWidth > video.videoHeight / this.maxHeight){
                rate = this.maxWidth / video.videoWidth
            }else{
                rate = this.maxHeight / video.videoHeight
            }
            const w = video.videoWidth * rate
            const h = video.videoHeight * rate
            const offset_x_per_area = (this.maxWidth - w) / 2
            const offset_y_per_area = (this.maxHeight - h) / 2

            const global_offset_x = (index % this.cols) * this.maxWidth  + offset_x_per_area
            const global_offset_y = Math.floor(index / this.cols) * this.maxHeight + offset_y_per_area
            const position = [Math.ceil(global_offset_x), Math.ceil(global_offset_y), Math.ceil(w), Math.ceil(h)]

            // console.log(">>>>>>>>>>>>>>>",video, position)
            ctx.drawImage(video, position[0], position[1], position[2], position[3])
        })

        if (this.alive) {
            // console.log("[Recoerder View] request next frame")
            // requestAnimationFrame(() => { this.renderVideos() })
            setTimeout(this.renderVideos, 50)

        } else {
            console.log("[Recoerder View] stop request next frame")
        }
    }

}
