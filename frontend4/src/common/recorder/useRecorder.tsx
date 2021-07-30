import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg"
import { DefaultDeviceController } from "amazon-chime-sdk-js"
import { useEffect, useMemo, useState } from "react"
import { FlectChimeClient } from "../chime/FlectChimeClient"

type RecorderCanvasProps = {
    sourceVideo: HTMLCanvasElement | HTMLVideoElement | MediaStream | null
    chimeClient: FlectChimeClient
    filename: string
}

export const useRecorder = (props: RecorderCanvasProps) => {
    const [chunks, setChunks] = useState<Blob[]>([])
    const ffmpeg = useMemo(() => { return createFFmpeg({ log: true, corePath: "./ffmpeg/ffmpeg-core.js" }) }, [])

    const [start, setStart] = useState(false)

    useEffect(() => {
        let recorder: MediaRecorder | null = null
        if (start) {
            const stream = new MediaStream();

            //// Adding Video Track
            if (props.sourceVideo instanceof HTMLCanvasElement || props.sourceVideo instanceof HTMLVideoElement) {
                // @ts-ignore
                const videoStream = sourceVideo!.captureStream() as MediaStream
                videoStream.getTracks().forEach(t => {
                    console.log("added tracks:", t)
                    stream.addTrack(t)
                })
            } else if (props.sourceVideo instanceof MediaStream) {
                props.sourceVideo.getTracks().forEach(t => {
                    console.log("added tracks:", t)
                    stream.addTrack(t)
                })
            }


            const sourceLocalAudioStream = props.chimeClient.audioInputDeviceSetting!.audioInputForRecord
            // @ts-ignore    
            const sourceRemoteAudioStream = props.chimeClient.audioOutputDeviceSetting!.outputAudioElement?.captureStream()
            const audioContext = DefaultDeviceController.getAudioContext();
            const outputNode = audioContext.createMediaStreamDestination();
            const sourceNode1 = audioContext.createMediaStreamSource(sourceRemoteAudioStream);
            sourceNode1.connect(outputNode)
            if(sourceLocalAudioStream){
                const sourceNode2 = audioContext.createMediaStreamSource(sourceLocalAudioStream as MediaStream);
                sourceNode2.connect(outputNode)
            }

            [outputNode.stream].forEach(s=>{
                s?.getTracks().forEach(t=>{
                    console.log("added tracks:", t)
                    stream.addTrack(t)
                })
            });

            const options = {
                mimeType: 'video/webm;codecs=h264,opus'
            }
            console.log("create media recorder")
            recorder = new MediaRecorder(stream, options)
            recorder.ondataavailable = (e: BlobEvent) => {
                console.log(`ondataavailable datasize ${e.data.size}`)
                chunks.push(e.data)
            }
            console.log("create media start")
            recorder.start(1000)
            console.log("create media start")
        }

        return () => {
            if (recorder) {
                console.log("recorder stop!!!!!!!!!")

                recorder.stop()
                const a = document.createElement("a")
                a.download = props.filename

                let ffmpegWaitPromise
                if (ffmpeg.isLoaded() === false) {
                    ffmpegWaitPromise = new Promise<void>(async (resolve, reject) => {
                        await ffmpeg.load()
                        ffmpeg.setProgress(({ ratio }) => {
                            console.log("progress:", ratio);
                        });
                        resolve()
                    })
                } else {
                    ffmpegWaitPromise = new Promise<void>(async (resolve, reject) => {
                        resolve()
                    })
                }

                ffmpegWaitPromise.then(async () => {
                    const name = 'record.webm'

                    ffmpeg.FS('writeFile', name, await fetchFile(new Blob(chunks)));
                    console.log("FFMPEG START!")
                    await ffmpeg.run('-i', name, '-c', 'copy', props.filename)
                    const data = ffmpeg.FS('readFile', props.filename)
                    a.href = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
                    a.click()
                    console.log("FFMPEG DONE!")
                    setChunks([])
                })
            }
        }
    }, [start]) // eslint-disable-line

    return {
        started: start,
        start: () => { setStart(true) },
        stop: () => { setStart(false) }
    }

}