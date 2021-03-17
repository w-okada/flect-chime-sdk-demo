import React, { memo, useEffect, useState } from "react"
import { Divider, GridListTileBar, Typography } from '@material-ui/core'
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { MeetingSession, VideoTileState } from "amazon-chime-sdk-js";
import { AttendeeState, useMeetingState } from "../providers/MeetingStateProvider";

export type FocustTarget = "SharedContent" | "Speaker"

type Props = {
    attendees: { [attendeeId: string]: AttendeeState }
    videoTileStates: { [attendeeId: string]: VideoTileState }
    focusTarget: FocustTarget

    onlyCameraView: boolean
    width: number
    height: number
    setRecorderCanvasElement: (val: HTMLCanvasElement | null) => void

};
const lineTileHeight = 150
const useStyles = makeStyles((theme) => ({
    gridList: {
        width: '100%',


    },
    videoTile: {
        width: '100%',
        height: '100%',
    },
    videoTileActive: {
        width: '100%',
        height: '100%',
    },
    videoTileBar: {
    },
    videoTileBarActive: {
        backgroundColor: "#ee7777"
    }

}));

const GridListTileBar2 = withStyles({
    root: {
        height: 15,
    },
    title: {
        fontSize: 10,
    },
})(GridListTileBar);

interface PreviousVideoSize {
    videoWidth: number,
    videoHeight: number,
    localWidth: number,
    localHeight: number,
    offsetX: number,
    offsetY: number,
}

class CanvasRenderer {
    width = 1920
    height = 1080
    id = performance.now()
    meetingSession: MeetingSession
    alive = true
    previousVideoSizes: PreviousVideoSize[] = []


    constructor(meetingSession: MeetingSession) {
        this.meetingSession = meetingSession
        console.log("RENDEREREREaaa", this.id)
    }
    start(canvas: HTMLCanvasElement) {
        this.renderVideos(canvas)
    }
    destroy() {
        console.log("destroy renderer!!", this.id)
        this.alive = false
    }

    focusVideoElements: HTMLVideoElement[] = []

    renderVideos = (canvas: HTMLCanvasElement) => {
        const num = this.focusVideoElements.length
        const gridWidth = this.width / num
        const ctx = canvas.getContext("2d")!
        if (canvas.width !== this.width || canvas.height !== this.height) {
            console.log("[Recoerder View] change canvs size")
            canvas.width = this.width
            canvas.height = this.height
        }

        this.focusVideoElements.forEach((e, i) => {
            if (this.previousVideoSizes[i] && this.previousVideoSizes[i].videoWidth === e.videoWidth && this.previousVideoSizes[i].videoHeight === e.videoHeight) {
                ctx.drawImage(e, gridWidth * i + this.previousVideoSizes[i].offsetX, this.previousVideoSizes[i].offsetY,
                    this.previousVideoSizes[i].localWidth, this.previousVideoSizes[i].localHeight)
            } else {
                if (this.previousVideoSizes[i]) {
                    console.log("NEW VIDEO SIZE", this.previousVideoSizes[i], this.previousVideoSizes[i].videoWidth, e.videoWidth, this.previousVideoSizes[i].videoHeight, e.videoHeight)
                } else {
                    console.log("NEW VIDEO SIZE", this.previousVideoSizes[i])

                }
                const ratio = Math.min(gridWidth / e.videoWidth, this.height / e.videoHeight)
                const localWidth = ratio * e.videoWidth
                const localHeight = ratio * e.videoHeight
                const offsetX = gridWidth / 2 - localWidth / 2
                const offsetY = this.height / 2 - localHeight / 2
                ctx.clearRect(gridWidth * i, 0, gridWidth, this.height)
                ctx.drawImage(e, gridWidth * i + offsetX, offsetY, localWidth, localHeight)
                this.previousVideoSizes[i] = {
                    videoWidth: e.videoWidth,
                    videoHeight: e.videoHeight,
                    localWidth: localWidth,
                    localHeight: localHeight,
                    offsetX: offsetX,
                    offsetY: offsetY,
                }
            }
        })

        if (this.alive) {
            console.log("[Recoerder View] request next frame")
            requestAnimationFrame(() => { this.renderVideos(canvas) })
        } else {
            console.log("[Recoerder View] stop request next frame")
        }
    }

    setAttendees = (attendees: { [attendeeId: string]: AttendeeState }, videoTileStates: { [attendeeId: string]: VideoTileState }, focusTarget: FocustTarget) => {
        const sharedContentStates = Object.values(attendees).filter(a => { return a.isSharedContent })
        const speakerStates = Object.values(attendees).filter(a => { return a.active })
        const focusStates = (() => {
            if (sharedContentStates.length === 0 && speakerStates.length === 0) {
                return null
            } else if (sharedContentStates.length === 0 && speakerStates.length > 0) {
                return speakerStates
            } else if (sharedContentStates.length > 0 && speakerStates.length === 0) {
                return sharedContentStates
            } else {
                switch (focusTarget) {
                    case "SharedContent":
                        return sharedContentStates
                    case "Speaker":
                        return speakerStates
                }
            }
        })()

        const div = document.getElementById("video") as HTMLDivElement | null
        this.focusVideoElements.forEach(e => {
            try {
                div?.removeChild(e)
            } catch (e) {
                console.log(e)
            }
        })

        this.focusVideoElements = focusStates?.filter(s => videoTileStates[s.attendeeId]).map((s, i) => {
            const videoElem = this.focusVideoElements[i] ? this.focusVideoElements[i] : document.createElement("video")

            this.meetingSession.audioVideo.bindVideoElement(videoTileStates[s.attendeeId].tileId!, videoElem)
            videoElem.height = videoTileStates[s.attendeeId].videoStreamContentHeight!
            videoElem.width = videoTileStates[s.attendeeId].videoStreamContentWidth!
            videoElem.style.width = "5%"
            videoElem.style.height = "5%"

            div?.appendChild(videoElem)
            return videoElem
        }) || []
    }

}

const RecorderCanvas = memo(props => {
    return <canvas width="1920" height="1080" id="recorderCanvas" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
})

export const VideoRecorderView = ({ attendees, videoTileStates, onlyCameraView, focusTarget, width, height, setRecorderCanvasElement }: Props) => {
    const classes = useStyles()
    const { meetingSession } = useMeetingState()
    const [renderer, setRenderer] = useState(null as CanvasRenderer | null)
    if (!renderer) {
        console.log("RENDER NEW!")
        setRenderer(new CanvasRenderer(meetingSession!))
    }
    renderer?.setAttendees(attendees, videoTileStates, focusTarget)

    useEffect(() => {
        if (renderer) {
            console.log("Render: Start")
            const canvas = document.getElementById("recorderCanvas") as HTMLCanvasElement
            renderer.start(canvas)

        } else {
            console.log("Render:no renderer")
        }
        return () => {
            console.log("destroy renderer", renderer)
            renderer?.destroy()
        }
    }, [renderer])

    useEffect(() => {
        console.log("RecorderView USEEFFECT")
        const canvasElem = document.getElementById("recorderCanvas") as HTMLCanvasElement
        canvasElem.getContext("2d")!.fillRect(0, 0, canvasElem.width, canvasElem.height)
        setRecorderCanvasElement(canvasElem)
        return () => {
            console.log("RecorderView UseEffect unmount")
            setRecorderCanvasElement(null)
        }
    }, [])

    return (
        <div style={{ width: "100%", height: height }}>

            <canvas id="recorderCanvas" style={{ width: "100%", height: "80%", objectFit: "contain" }} />

            <div style={{ width: "100%", height: "20%", objectFit: "contain" }}>
                <Divider />
                <Typography variant="body2" color="textSecondary">
                    resources
                </Typography>
                <div id="video" />
            </div>
        </div>
    )
}


