import { DefaultDeviceController } from "amazon-chime-sdk-js";
export class Recorder {
    offerOptions = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
    };
    private configuration = {};
    private pc1 = new RTCPeerConnection(this.configuration);
    private pc2 = new RTCPeerConnection(this.configuration);

    private blackVideoCanvas = (() => {
        const canvas = document.createElement("canvas")
        const width = 640;
        const height = 480
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.fillRect(0, 0, width, height);
        setInterval(async () => {
            console.log("update image")
            const ctx = canvas.getContext('2d')!
            ctx.fillStyle = "#ff0000"
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = "#00ff00"
            ctx.font = 'bold 48px serif';
            ctx.fillText(`NOW:${new Date().getTime()}`, 30, 30);

            if (this.videoSender) {
                const rep = await this.videoSender.getStats()
                rep.forEach(x => {
                    console.log("stat;", x)
                })
            }
        }, 1000 * 1)
        return canvas
    })()
    private blackVideoStream = this.blackVideoCanvas.captureStream();
    private silentAudioStream = (() => {
        const ctx = DefaultDeviceController.getAudioContext();
        const dst = ctx.createMediaStreamDestination()

        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.3;
        gainNode.connect(dst);

        const oscillator = ctx.createOscillator();
        oscillator.frequency.value = 440;
        oscillator.connect(gainNode);
        oscillator.start();
        return dst.stream;
    })()
    private blackSilenceStream = new MediaStream([this.blackVideoStream.getVideoTracks()[0], this.silentAudioStream.getAudioTracks()[0]])

    private localStream = this.blackSilenceStream
    private remoteStream: MediaStream | null = null
    private videoSender: RTCRtpSender | null = null
    private audioSender: RTCRtpSender | null = null

    private mediaRecorder: MediaRecorder | null = null

    constructor() {
        this.init()
    }
    init = async () => {
        this.pc1.addEventListener('icecandidate', e => this.onIceCandidate(this.pc1, e));
        this.pc2.addEventListener('icecandidate', e => this.onIceCandidate(this.pc2, e));

        this.pc1.addEventListener('iceconnectionstatechange', e => this.onIceStateChange(this.pc1, e));
        this.pc2.addEventListener('iceconnectionstatechange', e => this.onIceStateChange(this.pc2, e));
        this.pc2.addEventListener('track', this.gotRemoteStream);

        this.localStream.getTracks().forEach((track) => {
            if (track.kind == "video") {
                console.log("video track added")
                this.videoSender = this.pc1.addTrack(track, this.localStream)

            } else if (track.kind == "audio") {
                console.log("audio track added")
                this.audioSender = this.pc1.addTrack(track, this.localStream)
            }
        })

        try {
            const offer = await this.pc1.createOffer(this.offerOptions);
            await this.onCreateOfferSuccess(offer);
        } catch (e) {
            this.onCreateSessionDescriptionError(e);
        }
    }

    onCreateSessionDescriptionError = (error: any) => {
        console.warn(`Failed to create session description: ${error.toString()}`);
    }

    onCreateOfferSuccess = async (desc: any) => {
        console.log(`Offer from pc1\n${desc.sdp}`);
        console.log('pc1 setLocalDescription start');
        try {
            await this.pc1.setLocalDescription(desc);
            this.onSetLocalSuccess(this.pc1);
        } catch (e) {
            this.onSetSessionDescriptionError(e);
        }

        console.log('pc2 setRemoteDescription start');
        try {
            await this.pc2.setRemoteDescription(desc);
            this.onSetRemoteSuccess(this.pc2);
        } catch (e) {
            this.onSetSessionDescriptionError(e);
        }

        console.log('pc2 createAnswer start');
        try {
            const answer = await this.pc2.createAnswer();
            await this.onCreateAnswerSuccess(answer);
        } catch (e) {
            this.onCreateSessionDescriptionError(e);
        }
    }


    onSetLocalSuccess = (pc: any) => {
        console.log(`${this.getName(pc)} setLocalDescription complete`);
    }
    onSetRemoteSuccess = (pc: any) => {
        console.log(`${this.getName(pc)} setRemoteDescription complete`);
    }

    onSetSessionDescriptionError = (error: any) => {
        console.warn(`Failed to set session description: ${error.toString()}`);
    }

    gotRemoteStream = (e: any) => {
        if (this.remoteStream !== e.streams[0]) {
            this.remoteStream = e.streams[0];
            console.log('pc2 received remote stream');
        }
    }

    onCreateAnswerSuccess = async (desc: any) => {
        console.log(`Answer from pc2:\n${desc.sdp}`);
        console.log('pc2 setLocalDescription start');
        try {
            await this.pc2.setLocalDescription(desc);
            this.onSetLocalSuccess(this.pc2);
        } catch (e) {
            this.onSetSessionDescriptionError(e);
        }
        console.log('pc1 setRemoteDescription start');
        try {
            await this.pc1.setRemoteDescription(desc);
            this.onSetRemoteSuccess(this.pc1);
        } catch (e) {
            this.onSetSessionDescriptionError(e);
        }
    }



    onIceCandidate = async (pc: any, event: any) => {
        try {
            await (this.getOtherPc(pc).addIceCandidate(event.candidate));
            this.onAddIceCandidateSuccess(pc);
        } catch (e) {
            this.onAddIceCandidateError(pc, e);
        }
        console.log(`${this.getName(pc)} ICE candidate:\n${event.candidate ? event.candidate.candidate : '(null)'}`);
    }

    onAddIceCandidateSuccess = (pc: any) => {
        console.log(`${this.getName(pc)} addIceCandidate success`);
    }

    onAddIceCandidateError = (pc: any, error: any) => {
        console.log(`${this.getName(pc)} failed to add ICE Candidate: ${error.toString()}`);
    }

    onIceStateChange = (pc: any, event: any) => {
        if (pc) {
            console.log(`${this.getName(pc)} ICE state: ${pc.iceConnectionState}`);
            console.log('ICE state change event: ', event);
        }
    }

    getName = (pc: any) => {
        return (pc === this.pc1) ? 'pc1' : 'pc2';
    }

    getOtherPc = (pc: any) => {
        return (pc === this.pc1) ? this.pc2 : this.pc1;
    }

    /// Public Methods
    replaceVideoTrack = (track: MediaStreamTrack) => {
        this.videoSender?.replaceTrack(track)
    }
    replaceAudioTrack = (track: MediaStreamTrack) => {
        this.audioSender?.replaceTrack(track)
    }

    chunks: Blob[] = [];
    startRecording = async () => {
        // await this.init()


        const recVideo = document.getElementById("video-for-recorder") as HTMLVideoElement
        setTimeout(() => {
            const video = document.getElementById("main-video-area-video-0") as HTMLVideoElement
            // @ts-ignore
            const ms = video.captureStream()

            this.replaceVideoTrack(ms.getVideoTracks()[0])

        }, 1000 * 5)


        recVideo.srcObject = this.remoteStream!
        recVideo.play()

        console.log("start recording", this.remoteStream)
        console.log("start recording", this.remoteStream?.getTracks())
        if (!this.remoteStream) {
            console.warn("remote stream is not ready.")
            return
        }
        this.mediaRecorder = new MediaRecorder(this.remoteStream);
        // this.mediaRecorder = new MediaRecorder(ms);
        this.mediaRecorder.ondataavailable = (e) => {
            console.log("Added Data", e);
            this.chunks.push(e.data);
        }
        this.mediaRecorder.onstop = (e) => {
            console.log("data available after MediaRecorder.stop() called.");
            var blob = new Blob(this.chunks, {
                type: 'video/webm'
            });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            document.body.appendChild(a);
            // @ts-ignore
            a.style = 'display: none';
            a.href = url;
            a.download = 'test.webm';
            a.click();
            window.URL.revokeObjectURL(url);
            this.chunks = [];
        };
        this.mediaRecorder.start();
    }
    stopRecording = () => {
        if (!this.mediaRecorder) {
            console.warn("reacorder is not ready.")
            return
        }
        this.mediaRecorder.stop();
    }

}
