import { AudioVideoObserver, MeetingSessionStatus, MeetingSessionStatusCode, VideoTileState, ClientMetricReport, MeetingSessionVideoAvailability } from "amazon-chime-sdk-js";

class AudioVideoObserverTemplate implements AudioVideoObserver {
    // videoElements:HTMLVideoElement[]=[]
    // audioVideo:AudioVideoFacade
    // constructor(audioVideo:AudioVideoFacade, videoElements:HTMLVideoElement[]){
    //     this.videoElements=videoElements
    //     this.audioVideo = audioVideo
    // }

    audioVideoDidStartConnecting(reconnecting: boolean): void {
        console.log(`[FlectChimeClient][AudioVideoObserver] session connecting. reconnecting: ${reconnecting}`);
    }
    audioVideoDidStart(): void {
        console.log("session started");
    }
    audioVideoDidStop(sessionStatus: MeetingSessionStatus): void {
        console.log(`[FlectChimeClient][AudioVideoObserver] session stopped from1 ${JSON.stringify(sessionStatus)}`);
        console.log(`[FlectChimeClient][AudioVideoObserver] session stopped from2 ${sessionStatus.isFailure()}`);
        console.log(`[FlectChimeClient][AudioVideoObserver] session stopped from3 ${sessionStatus.isAudioConnectionFailure()}`);
        console.log(`[FlectChimeClient][AudioVideoObserver] session stopped from4 ${sessionStatus.isTerminal()}`);
        console.log(`[FlectChimeClient][AudioVideoObserver] session stopped from5 ${sessionStatus.statusCode()}`);
        console.log(`[FlectChimeClient][AudioVideoObserver] session stopped from6 ${sessionStatus.toString!()}`);
        if (sessionStatus.statusCode() === MeetingSessionStatusCode.AudioCallEnded) {
            console.log(`meeting ended`);
            // @ts-ignore
            //window.location = window.location.pathname;
        }
    }

    videoTileDidUpdate(tileState: VideoTileState): void {
        // // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! tile did update")
        // const videoTiles = this.audioVideo.getAllVideoTiles()
        // for(let i=0; i<videoTiles.length; i++){
        //     this.audioVideo.bindVideoElement(videoTiles[i].state().tileId!, this.videoElements[i])
        //     // console.log("video!!!!!!!!!!!!!!!!!", videoTiles[i].state().tileId!, this.videoElements[i])
        //     this.videoElements[i].play()
        // }
        // // console.log("videotiledid", tileState)
        // // console.log("videotiledid111", videoTiles, videoTiles.length)
    }

    videoTileWasRemoved(tileId: number): void {
        console.log("[FlectChimeClient][AudioVideoObserver] !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! tile removed");
    }
    videoAvailabilityDidChange(availability: MeetingSessionVideoAvailability): void {
        //this.canStartLocalVideo = availability.canStartLocalVideo;
        console.log(`[FlectChimeClient][AudioVideoObserver] video availability changed: canStartLocalVideo `, availability);
        console.log(`[FlectChimeClient][AudioVideoObserver] video availability changed: canStartLocalVideo  ${availability.canStartLocalVideo}`);
    }

    ////// videoSendHealthDidChange
    ////// videoSendBandwidthDidChange
    ////// videoReceiveBandwidthDidChange
    estimatedDownlinkBandwidthLessThanRequired(estimatedDownlinkBandwidthKbps: number, requiredVideoDownlinkBandwidthKbps: number): void {
        console.log(`[FlectChimeClient][AudioVideoObserver] Estimated downlink bandwidth is ${estimatedDownlinkBandwidthKbps} is less than required bandwidth for video ${requiredVideoDownlinkBandwidthKbps}`);
    }
    ////// videoNotReceivingEnoughData?(receivingDataMap

    metricsDidReceive(clientMetricReport: ClientMetricReport): void {
        //const metricReport = clientMetricReport.getObservableMetrics();
        //console.log("metricsDidReceive", metricReport)
        // if (typeof metricReport.availableSendBandwidth === 'number' && !isNaN(metricReport.availableSendBandwidth)) {
        //     (document.getElementById('video-uplink-bandwidth') as HTMLSpanElement).innerHTML =
        //         'Available Uplink Bandwidth: ' + String(metricReport.availableSendBandwidth / 1000) + ' Kbps';
        // } else if (typeof metricReport.availableOutgoingBitrate === 'number' && !isNaN(metricReport.availableOutgoingBitrate)) {
        //     (document.getElementById('video-uplink-bandwidth') as HTMLSpanElement).innerHTML =
        //         'Available Uplink Bandwidth: ' + String(metricReport.availableOutgoingBitrate / 1000) + ' Kbps';
        // } else {
        //     (document.getElementById('video-uplink-bandwidth') as HTMLSpanElement).innerHTML =
        //         'Available Uplink Bandwidth: Unknown';
        // }
        // if (typeof metricReport.availableReceiveBandwidth === 'number' && !isNaN(metricReport.availableReceiveBandwidth)) {
        //     (document.getElementById('video-downlink-bandwidth') as HTMLSpanElement).innerHTML =
        //         'Available Downlink Bandwidth: ' + String(metricReport.availableReceiveBandwidth / 1000) + ' Kbps';
        // } else if (typeof metricReport.availableIncomingBitrate === 'number' && !isNaN(metricReport.availableIncomingBitrate)) {
        //     (document.getElementById('video-downlink-bandwidth') as HTMLSpanElement).innerHTML =
        //         'Available Downlink Bandwidth: ' + String(metricReport.availableIncomingBitrate / 1000) + ' Kbps';
        // } else {
        //     (document.getElementById('video-downlink-bandwidth') as HTMLSpanElement).innerHTML =
        //         'Available Downlink Bandwidth: Unknown';
        // }
    }
    ////// connectionHealthDidChange

    connectionDidBecomePoor(): void {
        console.log("[FlectChimeClient][AudioVideoObserver] connection is poor");
    }
    connectionDidSuggestStopVideo(): void {
        console.log("[FlectChimeClient][AudioVideoObserver] suggest turning the video off");
    }
    videoSendDidBecomeUnavailable(): void {
        console.log("[FlectChimeClient][AudioVideoObserver] sending video is not available");
    }
}

export default AudioVideoObserverTemplate;
