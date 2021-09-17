import { FlectChimeClient } from "@dannadori/flect-amazon-chime-lib";
import { DefaultDeviceController } from "amazon-chime-sdk-js"
import { createFFmpeg, fetchFile, FFmpeg } from "@ffmpeg/ffmpeg"


export class Recorder{
    private _ffmpeg:FFmpeg
    constructor(){
        this._ffmpeg = createFFmpeg({ log: true, corePath: "./ffmpeg/ffmpeg-core.js" })
    }

    private _chimeClient: FlectChimeClient|null = null
    set chimeClient(_chimeClient:FlectChimeClient){
        this._chimeClient = _chimeClient
    }
    private _sourceVideo : HTMLCanvasElement | HTMLVideoElement | MediaStream | null = null
    set sourceVideo(_sourceVideo:HTMLCanvasElement | HTMLVideoElement | MediaStream | null ){
        this._sourceVideo = _sourceVideo
        // this._stream.getVideoTracks().forEach((x)=>{
        //     this._stream.removeTrack(x)
        // })
        // if(this._sourceVideo instanceof HTMLCanvasElement || this._sourceVideo instanceof HTMLVideoElement){
        //     // @ts-ignore
        //     const videoStream = sourceVideo!.captureStream() as MediaStream
        //     videoStream.getTracks().forEach(t => {
        //         console.log("added tracks:", t)
        //         this._stream.addTrack(t)
        //     })
        // }else if (this._sourceVideo instanceof MediaStream) {
        //     this._sourceVideo.getTracks().forEach(t => {
        //         console.log("added tracks:", t)
        //         this._stream.addTrack(t)
        //     })
        // }

    }

    private _isRecording:boolean = false
    get isRecording():boolean{
        return this._isRecording
    }
    private _mediaRecorder:MediaRecorder | null = null
    private _chunks:Blob[] = []
    // private _stream = new MediaStream();


    startRecord = () =>{
        this._isRecording = true
        const stream = new MediaStream();
        this._chunks = []
        if(this._sourceVideo instanceof HTMLCanvasElement || this._sourceVideo instanceof HTMLVideoElement){
            // @ts-ignore
            const videoStream = this._sourceVideo!.captureStream() as MediaStream
            videoStream.getTracks().forEach(t => {
                console.log("added tracks:", t)
                stream.addTrack(t)
            })
        }else if (this._sourceVideo instanceof MediaStream) {
            this._sourceVideo.getTracks().forEach(t => {
                console.log("added tracks:", t)
                stream.addTrack(t)
            })
        }

        const sourceLocalAudioStream = this._chimeClient!.audioInputDeviceSetting!.audioInputForRecord
        // @ts-ignore
        const sourceRemoteAudioStream = this._chimeClient!.audioOutputDeviceSetting!.outputAudioElement!.captureStream()

        const audioContext = DefaultDeviceController.getAudioContext();
        const outputNode = audioContext.createMediaStreamDestination();
        let sourceNode1
        try{
            sourceNode1 = audioContext.createMediaStreamSource(sourceRemoteAudioStream);
        }catch(e){
            console.log(JSON.stringify(e))
        }
        if(sourceNode1){
            sourceNode1.connect(outputNode)
        }
        if(sourceLocalAudioStream){
            const sourceNode2 = audioContext.createMediaStreamSource(sourceLocalAudioStream as MediaStream);
            sourceNode2.connect(outputNode)
        }

        [outputNode.stream].forEach(s=>{
            s?.getTracks().forEach(t=>{
                console.log("added tracks:", t)
                // this._stream.addTrack(t)
                stream.addTrack(t)
            })
        });

        const options = {
            mimeType: 'video/webm;codecs=h264,opus'
        }
        console.log("create media recorder")
        // this._mediaRecorder = new MediaRecorder(this._stream, options)
        this._mediaRecorder = new MediaRecorder(stream, options)
        this._mediaRecorder.ondataavailable = (e: BlobEvent) => {
            console.log(`ondataavailable datasize ${e.data.size}`)
            this._chunks.push(e.data)
        }
        console.log("create media start")
        this._mediaRecorder.start(1000)
        console.log("create media start")
    }
    
    stopRecord = async () =>{
        this._mediaRecorder?.stop()
        const data = await fetchFile(new Blob(this._chunks))
        
        this._isRecording = false
        return data
    }
}