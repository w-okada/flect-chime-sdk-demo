
import { HTTPCreateMeetingRequest, HTTPListMeetingsRequest, RestApiClient, RestApiClientContext } from "../002_rest/001_RestApiClient";
import {
    ConsoleLogger,
    DefaultActiveSpeakerPolicy,
    DefaultDeviceController,
    DefaultMeetingSession,
    LogLevel,
    MeetingSessionConfiguration,
    VideoTileState
} from 'amazon-chime-sdk-js';
import { DeviceChangeObserverImpl } from "./observer/DeviceChangeObserverImpl";
import AudioVideoObserverTemplate from "./observer/AudioVideoObserverTemplate";
import { ChimeDemoException } from "../../000_exception/Exception";
import { RestJoinMeetingRequest } from "../002_rest/013_attendees";
import { Chime } from "aws-sdk";
import { ChimeAudioInputDevice, ChimeAudioOutputDevice, ChimeAudioOutputElement, ChimeVideoInputDevice } from "../../002_hooks/004_useDeviceState";

export type MeetingInfo = {
    meetingName: string;
    meetingId: string;
    // meeting: Chime.Meeting;
    // metadata: Metadata;
    isOwner?: boolean;
    useCode: boolean;
}
export type AttendeeState = {
    attendeeId: string;
    attendeeName: string | null;
    active: boolean;
    score: number; // active score
    volume: number; // volume
    muted: boolean;
    cameraOn: boolean;
    signalStrength: number;
    isSharedContent: boolean;
    ownerId: string;
    isVideoPaused: boolean;
};

export interface FlectChimeClientListener {
    meetingStateUpdated: () => void;
    activeSpekaerUpdated: (activeSpeakerId: string | null) => void;
    attendeesUpdated: (list: { [attendeeId: string]: AttendeeState }) => void;
    videoTileStateUpdated: (list: { [attendeeId: string]: VideoTileState }) => void;
}


export class FlectChimeClient {
    constructor() { }

    private _meetingSession: DefaultMeetingSession | null = null;
    get meetingSession(): DefaultMeetingSession | null {
        return this._meetingSession;
    }
    private _videoTileStates: { [attendeeId: string]: VideoTileState } = {};
    get videoTileStates(): { [attendeeId: string]: VideoTileState } {
        return this._videoTileStates;
    }
    private _attendees: { [attendeeId: string]: AttendeeState } = {};
    get attendees(): { [attendeeId: string]: AttendeeState } {
        return this._attendees;
    }
    ///////////////////////////////////////////
    // Listener
    ///////////////////////////////////////////
    private _flectChimeClientListener: FlectChimeClientListener | null = null;
    setFlectChimeClientListener = (l: FlectChimeClientListener) => {
        this._flectChimeClientListener = l;
    };

    // (X) Meeing Setup Process
    // (1) join and creating meeting session
    joinMeeting = async (meetingInfo: Chime.Meeting, attendeeInfo: Chime.Attendee) => {
        // clear cache
        this._attendees = {}
        this._videoTileStates = {}
        if (this._meetingSession) {
            this._meetingSession.audioVideo.stopLocalVideoTile();
            this._meetingSession.audioVideo.stop()
            this._meetingSession = null
        }

        console.log("join meeting!!!!!!!!!!")
        //// (1-1) creating configuration
        const configuration = new MeetingSessionConfiguration(meetingInfo, attendeeInfo);
        //// (1-2) creating logger
        const logger = new ConsoleLogger("MeetingLogs", LogLevel.OFF);
        //// (1-3) creating device controller
        const deviceController = new DefaultDeviceController(logger, {
            enableWebAudio: true,
        });
        const deviceChangeObserver = new DeviceChangeObserverImpl();
        deviceController.addDeviceChangeObserver(deviceChangeObserver);
        //// (1-4) create meeting session
        this._meetingSession = new DefaultMeetingSession(configuration, logger, deviceController);


        //// 一度リストアップしないと使えないバグ(?)がaudio outputのみに残っている。
        // await this._meetingSession.audioVideo.listAudioInputDevices()
        // await this._meetingSession.audioVideo.listVideoInputDevices()
        await this._meetingSession.audioVideo.listAudioOutputDevices()
    }

    // (2) enter meeting
    enterMeeting = async (audioInput: ChimeAudioInputDevice, videoInput: ChimeVideoInputDevice, audioOutput: ChimeAudioOutputDevice, audioOutputElement: ChimeAudioOutputElement) => {
        if (!this._meetingSession) {
            console.warn("meeting session is not initialized")
            return
        }
        const p1 = this.setDeivces(audioInput, videoInput, audioOutput, audioOutputElement)
        console.log("setting devices...")
        // await this.setDeivces(audioInput, videoInput, audioOutput, audioOutputElement)
        console.log("setting devices... done.")
        this.addAudioVideoOserver()
        this.addAttendeeChangeSubscriber()
        this.addActiveSpeakerDetector()
        await p1
        console.log("starting...")
        this._meetingSession.audioVideo.start(); // start -> startLocalVideoTileの順番でないと接続時にカメラが有効にならない！
        this._meetingSession.audioVideo.startLocalVideoTile()
        console.log("starting... done.")

    }
    private setDeivces = async (audioInput: ChimeAudioInputDevice, videoInput: ChimeVideoInputDevice, audioOutput: ChimeAudioOutputDevice, audioOutputElement: ChimeAudioOutputElement) => {
        let p1
        if (audioInput) {
            p1 = this._meetingSession!.audioVideo.startAudioInput(audioInput)
        } else {
            p1 = this._meetingSession!.audioVideo.stopAudioInput()
        }
        let p2
        if (videoInput) {
            p2 = this._meetingSession!.audioVideo.startVideoInput(videoInput)
        } else {
            p2 = this._meetingSession!.audioVideo.stopVideoInput()
        }
        let p3
        p3 = this._meetingSession!.audioVideo.chooseAudioOutput(audioOutput)
        let p4
        if (audioOutputElement) {
            p4 = this._meetingSession?.audioVideo.bindAudioElement(audioOutputElement)
        }
        await Promise.all([p1, p2, p3, p4])
    }

    private addAudioVideoOserver = () => {
        //// (2-1) create AudioVideoObserver
        const audioVideoOserver = new AudioVideoObserverTemplate();
        audioVideoOserver.videoTileDidUpdate = (tileState: VideoTileState) => {
            if (!tileState.boundAttendeeId) {
                console.log("[FlectChimeClient][AudioVideoObserver] updated tile have no boundAttendeeID", tileState);
                return;
            }
            if (this._attendees[tileState.boundAttendeeId]) {
                this._attendees[tileState.boundAttendeeId].cameraOn = true;
            }
            if (!this._videoTileStates[tileState.boundAttendeeId]) {
                console.log("[FlectChimeClient][AudioVideoObserver] new tile added", tileState);
                this._videoTileStates[tileState.boundAttendeeId] = tileState;
                this._flectChimeClientListener?.videoTileStateUpdated(this._videoTileStates);
                return;
            }
            console.log("[FlectChimeClient][AudioVideoObserver] no change?", tileState);
        };
        audioVideoOserver.videoTileWasRemoved = (tileId: number) => {
            // There are the risk to overwrite new commer who is assgined same tileid, but tile id is generally incremented one by one
            // so, the probability to have this problem is very low: TODO: fix
            this._meetingSession!.audioVideo.unbindVideoElement(tileId);
            console.log("[FlectChimeClient][AudioVideoObserver] videoTileWasRemoved", tileId);
            const removedAttendeeId = Object.values(this._videoTileStates).find((x) => {
                return x.tileId === tileId;
            })?.boundAttendeeId;
            console.log("[FlectChimeClient][AudioVideoObserver] removedAttendeeId", removedAttendeeId);
            if (removedAttendeeId) {
                delete this._videoTileStates[removedAttendeeId];
                this._flectChimeClientListener?.videoTileStateUpdated(this._videoTileStates);
                this._attendees[removedAttendeeId].cameraOn = false;
                this._flectChimeClientListener?.attendeesUpdated(this._attendees);
            }
        };
        this._meetingSession!.audioVideo.addObserver(audioVideoOserver);
    }

    private addAttendeeChangeSubscriber = () => {
        const subscriber = async (attendeeId: string, present: boolean) => {
            console.log(`[FlectChimeClient][AttendeeIdPresenceSubscriber] ${attendeeId} present = ${present}`);
            if (present) {
                if (attendeeId in this._attendees === false) {
                    // Add to Attendee List
                    const new_attendee: AttendeeState = {
                        attendeeId: attendeeId,
                        attendeeName: null,
                        active: false,
                        score: 0,
                        volume: 0,
                        muted: false,
                        cameraOn: this._videoTileStates[attendeeId] ? true : false,
                        signalStrength: 0,
                        isSharedContent: false,
                        ownerId: "",
                        isVideoPaused: false,
                    };
                    if (attendeeId.split("#").length === 2) {
                        new_attendee.isSharedContent = true;
                        new_attendee.ownerId = attendeeId.split("#")[0];
                    }
                    this._attendees[attendeeId] = new_attendee;

                    // Add Subscribe volume Indicator
                    this.meetingSession!.audioVideo.realtimeSubscribeToVolumeIndicator(attendeeId, async (attendeeId: string, volume: number | null, muted: boolean | null, signalStrength: number | null) => {
                        this._attendees[attendeeId].volume = volume || 0;
                        this._attendees[attendeeId].muted = muted || false;
                        this._attendees[attendeeId].signalStrength = signalStrength || 0;
                        this._flectChimeClientListener?.attendeesUpdated(this._attendees);
                    });
                    this._flectChimeClientListener?.attendeesUpdated(this._attendees);
                } else {
                    console.log(`[FlectChimeClient][AttendeeIdPresenceSubscriber]  ${attendeeId} is already in attendees`);
                }
                return;
            } else {
                // Delete Subscribe volume Indicator
                console.log("delete user", attendeeId)
                this.meetingSession!.audioVideo.realtimeUnsubscribeFromVolumeIndicator(attendeeId);
                delete this._attendees[attendeeId];
                this._flectChimeClientListener?.attendeesUpdated(this._attendees);
                return;
            }
        }
        this._meetingSession!.audioVideo.realtimeSubscribeToAttendeeIdPresence(subscriber);
    }

    private addActiveSpeakerDetector = () => {
        this.meetingSession!.audioVideo.subscribeToActiveSpeakerDetector(
            new DefaultActiveSpeakerPolicy(),
            (activeSpeakers: string[]) => {
                console.log("[FlectChimeClient][AttendeeIdPresenceSubscriber] Active Speaker::::::::::::::::::::", activeSpeakers);
                let activeSpeakerId: string | null = null;
                for (const attendeeId in this._attendees) {
                    this._attendees[attendeeId].active = false;
                }
                for (const attendeeId of activeSpeakers) {
                    if (this._attendees[attendeeId]) {
                        this._attendees[attendeeId].active = true;
                        activeSpeakerId = attendeeId;
                        break;
                    }
                }
                // if (this._activeSpeakerId !== activeSpeakerId) {
                //     this._activeSpeakerId = activeSpeakerId;
                //     this._flectChimeClientListener?.activeSpekaerUpdated(this._activeSpeakerId);
                // }
            },
            (scores: { [attendeeId: string]: number }) => {
                for (const attendeeId in scores) {
                    if (this._attendees[attendeeId]) {
                        this._attendees[attendeeId].score = scores[attendeeId];
                    }
                }
                this._flectChimeClientListener?.attendeesUpdated(this._attendees);
            },
            5000
        );
    }

    // (3) Leave Meeting
    leaveMeeting = () => {
        if (!this._meetingSession) {
            return
        }
        this._meetingSession.audioVideo.stopLocalVideoTile();
        this._meetingSession.audioVideo.stop();
    }

    // (X) Configuration
    //// 
    setAudioInputDevice = async (audioInput: ChimeAudioInputDevice) => {
        await this._meetingSession?.audioVideo.stopAudioInput()
        if (audioInput) {
            await this._meetingSession?.audioVideo.startAudioInput(audioInput)
        }
    }
    setVideoInputDevice = async (videoInput: ChimeVideoInputDevice) => {
        await this._meetingSession?.audioVideo.stopVideoInput()
        await this._meetingSession?.audioVideo.stopLocalVideoTile()
        if (videoInput) {
            await this._meetingSession?.audioVideo.startVideoInput(videoInput)
            await this._meetingSession?.audioVideo.startLocalVideoTile()
        }
    }
    setAudioOutputDevoce = async (audioOutput: ChimeAudioOutputDevice) => {
        if (this._meetingSession) {
            await this._meetingSession.audioVideo.chooseAudioOutput(audioOutput)
        }
    }

    // (X) Tiles
    bindVideoElement = (tileId: number, videoElement: HTMLVideoElement) => {
        if (!this._meetingSession) {
            return
        }
        this._meetingSession.audioVideo.bindVideoElement(tileId, videoElement)
    }

}