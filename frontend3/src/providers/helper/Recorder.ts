import {FFmpeg, createFFmpeg, fetchFile} from "@ffmpeg/ffmpeg"

export class Recorder{
    isRecording = false
    chunks: Blob[] = []
    recorder:MediaRecorder|null = null
    ffmpeg:FFmpeg|null = createFFmpeg({log:true})

    startRecording = (stream:MediaStream) => {
        console.log("[Recorder] recorder start!!!!!!!!!!!!!!!!!")
        const options = {
            mimeType : 'video/webm;codecs=h264,opus'
        };
        this.chunks = []

        this.recorder = new MediaRecorder(stream, options)
        this.recorder.ondataavailable = (e:BlobEvent) => {
            this.chunks!.push(e.data)
        }
        this.recorder!.start(1000)
        this.isRecording=true
    }
    
    stopRecording = () => {
        console.log("[Recorder] recorder stop!!!!!!!!!!!!!!!!!")
        this.recorder?.stop()
        this.isRecording=false
    }


    toMp4 = async () => {    
        console.log("[Recorder] recorder mp4!!!!!!!!!!!!!!!!!")
        const name = 'record.webm'
        const outName = 'out.mp4'
        const a = document.createElement("a")
        a.download = outName
        
        if(this.ffmpeg!.isLoaded() === false){
          await this.ffmpeg!.load()
          this.ffmpeg!.setProgress(({ ratio }) => {
            console.log("progress:", ratio);
          });
        }


        // var videoBlob = new Blob(this.chunks);
        // const blobUrl = window.URL.createObjectURL(videoBlob);
        // a.href=blobUrl
        // a.download = 'recorded.webm';
        // a.click()

        // @ts-ignore
        this.ffmpeg.FS('writeFile', name, await fetchFile(new Blob(this.chunks)));
        console.log("FFMPEG START!")
        await this.ffmpeg!.run('-i', name,  '-c', 'copy', outName);
        const data = this.ffmpeg!.FS('readFile', outName)
    
        a.href = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
        a.click()
        console.log("FFMPEG DONE!")

    }
}