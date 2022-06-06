
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
import { ChimeAudioInputDevice, ChimeAudioOutputDevice, ChimeAudioOutputElement, ChimeVoiceInputDevice } from "../../002_hooks/004_useDeviceState";

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

    // (1) join and creating meeting session
    joinMeeting = async (meetingInfo: Chime.Meeting, attendeeInfo: Chime.Attendee) => {
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
    }

    // (2) enter meeting
    enterMeeting = async (audioInput: ChimeAudioInputDevice, videoInput: ChimeVoiceInputDevice, audioOutput: ChimeAudioOutputDevice, audioOutputElement: ChimeAudioOutputElement) => {
        if (!this._meetingSession) {
            return
        }
        const p1 = this.setDeivces(audioInput, videoInput, audioOutput, audioOutputElement)
        this.addAudioVideoOserver()
        this.addAttendeeChangeSubscriber()
        this.addActiveSpeakerDetector()
        await p1
        this._meetingSession.audioVideo.start();
    }
    private setDeivces = async (audioInput: ChimeAudioInputDevice, videoInput: ChimeVoiceInputDevice, audioOutput: ChimeAudioOutputDevice, audioOutputElement: ChimeAudioOutputElement) => {
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
                this.meetingSession!.audioVideo.realtimeUnsubscribeFromVolumeIndicator(attendeeId);
                delete this._attendees[attendeeId];
                this._flectChimeClientListener?.attendeesUpdated(this._attendees);
                return;
            }
        }
        this.meetingSession!.audioVideo.realtimeSubscribeToAttendeeIdPresence(subscriber);
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

    //     // (2) DeviceSetting
    //     this._audioInputDeviceSetting = new AudioInputDeviceSetting(this._meetingSession);
    //     this._videoInputDeviceSetting = new VideoInputDeviceSetting(this._meetingSession);
    //     this._audioOutputDeviceSetting = new AudioOutputDeviceSetting(this._meetingSession);

    //     // (3) List devices
    //     //// chooseAudioOutputDevice uses the internal cache
    //     //// so beforehand, we must get thses information. (auidoinput, videoinput are maybe optional)
    //     await this.meetingSession?.audioVideo.listAudioInputDevices();
    //     await this.meetingSession?.audioVideo.listVideoInputDevices();
    //     await this.meetingSession?.audioVideo.listAudioOutputDevices();
    // }


    // /**
    //  * meeting infos
    //  */
    // private _meetingName: string | null = null;
    // get meetingName(): string | null {
    //     return this._meetingName;
    // }
    // private _meetingId: string | null = null;
    // get meetingId(): string | null {
    //     return this._meetingId;
    // }
    // private _joinToken: string | null = null;
    // get joinToken(): string | null {
    //     return this._joinToken;
    // }
    // private _attendeeName: string | null = null;
    // get attendeeName(): string | null {
    //     return this._attendeeName;
    // }
    // private _attendeeId: string | null = null;
    // get attendeeId(): string | null {
    //     return this._attendeeId;
    // }

    // //  private _isShareContent: boolean = false;
    // //  get isShareContent(): boolean {
    // //      return this._isShareContent;
    // //  }
    // //  private _activeSpeakerId: string | null = null;
    // //  get activeSpeakerId(): string | null {
    // //      return this._activeSpeakerId;
    // //  }
    // //  private _isOwner: boolean = false;
    // //  get isOwner(): boolean {
    // //      return this._isOwner;
    // //  }


    // //// I/O
    // private _audioInputDeviceSetting: AudioInputDeviceSetting | null = null;
    // private _videoInputDeviceSetting: VideoInputDeviceSetting | null = null;
    // private _audioOutputDeviceSetting: AudioOutputDeviceSetting | null = null;
    // get audioInputDeviceSetting(): AudioInputDeviceSetting | null {
    //     return this._audioInputDeviceSetting;
    // }
    // get videoInputDeviceSetting(): VideoInputDeviceSetting | null {
    //     return this._videoInputDeviceSetting;
    // }
    // get audioOutputDeviceSetting(): AudioOutputDeviceSetting | null {
    //     return this._audioOutputDeviceSetting;
    // }







    // ///////////////////////////////////////////
    // // Meeting Management
    // ///////////////////////////////////////////
    // //// (1) join meeting
    // joinMeeting = async (meetingName: string, meetingInfo: Chime.Meeting, attendeeInfo: Chime.Attendee) => {
    //     if (meetingName === "") {
    //         throw new Error("Meeting name is invalid");
    //     }
    //     this._meetingName = meetingName;
    //     this._meetingName = meetingName;
    //     this._meetingId = meetingInfo.MeetingId!;
    //     this._joinToken = attendeeInfo.JoinToken!;
    //     this._attendeeId = attendeeInfo.AttendeeId!;


    //     // (2) DeviceSetting
    //     this._audioInputDeviceSetting = new AudioInputDeviceSetting(this._meetingSession);
    //     this._videoInputDeviceSetting = new VideoInputDeviceSetting(this._meetingSession);
    //     this._audioOutputDeviceSetting = new AudioOutputDeviceSetting(this._meetingSession);

    //     // (3) List devices
    //     //// chooseAudioOutputDevice uses the internal cache
    //     //// so beforehand, we must get thses information. (auidoinput, videoinput are maybe optional)
    //     await this.meetingSession?.audioVideo.listAudioInputDevices();
    //     await this.meetingSession?.audioVideo.listVideoInputDevices();
    //     await this.meetingSession?.audioVideo.listAudioOutputDevices();
    // }





    // /**
    //  * (C) Enter Meeting Room
    //  */
    // enterMeeting = async () => {
    //     if (!this.meetingSession) {
    //         console.log("[FlectChimeClient][enterMeeting] meetingsession is null?", this.meetingSession);
    //         throw new Error("meetingsession is null?");
    //     }

    //     // (1) prepair
    //     //// https://github.com/aws/amazon-chime-sdk-js/issues/502#issuecomment-652665492
    //     //// When stop preview, camera stream is terminated!!? So when enter meeting I rechoose Devices as workaround. (2)
    //     this.videoInputDeviceSetting?.stopPreview();

    //     // (2) subscribe AtttendeeId presence

    //     // (3) subscribe ActiveSpeakerDetector



    //     // (4) start
    //     this.meetingSession!.audioVideo.start();
    //     await this.videoInputDeviceSetting!.setVideoInputEnable(true);
    //     await this.audioInputDeviceSetting!.setAudioInputEnable(true);
    //     await this.audioOutputDeviceSetting!.setAudioOutputEnable(true);

    //     // // (5) enable chat
    //     // this._chatClient = new RealtimeSubscribeChatClient(this);
    //     // this._chatClient.setRealtimeSubscribeChatClientListener(this._realtimeSubscribeChatClientListener);

    //     // // (5-2) enable transcription
    //     // this._transcriptionClient = new RealtimeSubscribeTranscriptionClient(this);
    //     // this._transcriptionClient.setRealtimeSubscribeTranscriptionClientListener(this._realtimeSubscribeTranscriptionClientListener);

    //     // // (6) enable hmm
    //     // this._hmmClient = new RealtimeSubscribeHMMClient(this, this._restApiClient);
    //     // this._hmmClient.setRealtimeSubscribeHMMClientListener(this._realtimeSubscribeHMMClientListener);

    //     // (7) update
    //     // this.updateMeetingInfo();
    // };

}