import { ConsoleLogger, DefaultActiveSpeakerPolicy, DefaultDeviceController, DefaultMeetingSession, LogLevel, MeetingSessionConfiguration, Transcript, TranscriptEvent, TranscriptionStatus, TranscriptionStatusType, VideoTileState } from "amazon-chime-sdk-js";
import { DeviceChangeObserverImpl } from "./observer/DeviceChangeObserverImpl";
import AudioVideoObserverTemplate from "./observer/AudioVideoObserverTemplate";
import { AudioInputDeviceSetting } from "./io/AudioInputDeviceSetting";
import { VideoInputDeviceSetting } from "./io/VideoInputDeviceSetting";
import { AudioOutputDeviceSetting } from "./io/AudioOutputDeviceSetting";
import { RealtimeSubscribeChatClient, RealtimeSubscribeChatClientListener } from "./realtime/RealtimeSubscribeChatClient";
import { RestApiClient } from "../rest/RestApiClient";
import { RealtimeSubscribeHMMClient, RealtimeSubscribeHMMClientListener } from "./realtime/RealtimeSubscribeHMMClient";
import { RealtimeSubscribeTranscriptionClient, RealtimeSubscribeTranscriptionClientListener } from "./realtime/RealtimeSubscribeTranscriptionClient";

export type AttendeeState = {
    attendeeId: string;
    name: string;
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
    private _restApiClient: RestApiClient;
    /**
     * creadentials
     */
    private _userId: string | null = null;
    private _idToken: string | null = null;
    private _accessToken: string | null = null;
    private _refreshToken: string | null = null;
    private _codeToAccess: string | null = null; // Currently, slackCode and guestCode

    constructor(restEndPoint: string) {
        this._restApiClient = new RestApiClient(restEndPoint);
    }
    ///////////////////////////////////////////
    // Initializer
    ///////////////////////////////////////////
    init(userId: string, idToken: string, accessToken: string, refreshToken: string) {
        this._userId = userId;
        this._idToken = idToken;
        this._accessToken = accessToken;
        this._refreshToken = refreshToken;
        this._restApiClient.init(idToken, accessToken, refreshToken);
    }
    initWithCode(codeToAccess: string) {
        this._codeToAccess = codeToAccess;
        this._restApiClient.initWithCode(codeToAccess);
        //TBD: モードフラグを作る
    }

    /**
     * meeting infos
     */
    private _meetingName: string | null = null;
    get meetingName(): string | null {
        return this._meetingName;
    }
    private _meetingId: string | null = null;
    get meetingId(): string | null {
        return this._meetingId;
    }
    private _joinToken: string | null = null;
    get joinToken(): string | null {
        return this._joinToken;
    }
    private _userName: string | null = null;
    get userName(): string | null {
        return this._userName;
    }
    private _attendeeId: string | null = null;
    get attendeeId(): string | null {
        return this._attendeeId;
    }
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
    private _isShareContent: boolean = false;
    get isShareContent(): boolean {
        return this._isShareContent;
    }
    private _activeSpeakerId: string | null = null;
    get activeSpeakerId(): string | null {
        return this._activeSpeakerId;
    }
    private _isOwner: boolean = false;
    get isOwner(): boolean {
        return this._isOwner;
    }

    //// I/O
    private _audioInputDeviceSetting: AudioInputDeviceSetting | null = null;
    private _videoInputDeviceSetting: VideoInputDeviceSetting | null = null;
    private _audioOutputDeviceSetting: AudioOutputDeviceSetting | null = null;
    get audioInputDeviceSetting(): AudioInputDeviceSetting | null {
        return this._audioInputDeviceSetting;
    }
    get videoInputDeviceSetting(): VideoInputDeviceSetting | null {
        return this._videoInputDeviceSetting;
    }
    get audioOutputDeviceSetting(): AudioOutputDeviceSetting | null {
        return this._audioOutputDeviceSetting;
    }

    ///////////////////////////////////////////////////////////
    // Tools
    // Note: whiteboard is independent from ChimeClient (use websocket)
    ///////////////////////////////////////////////////////
    private _chatClient: RealtimeSubscribeChatClient | null = null;
    // sendMessage = (text: string) => {
    //     this._chatClient?.sendChatData(text);
    // };
    // get chatData(): RealtimeData[] {
    //     return this._chatClient ? this._chatClient.chatData : []
    // }
    get chatClient(): RealtimeSubscribeChatClient | null {
        return this._chatClient;
    }

    private _transcriptionClient: RealtimeSubscribeTranscriptionClient | null = null;
    get transcriptionClient(): RealtimeSubscribeTranscriptionClient | null {
        return this._transcriptionClient;
    }

    private _hmmClient: RealtimeSubscribeHMMClient | null = null;
    get hmmClient(): RealtimeSubscribeHMMClient | null {
        return this._hmmClient;
    }

    ///////////////////////////////////////////
    // Listener
    ///////////////////////////////////////////
    private _flectChimeClientListener: FlectChimeClientListener | null = null;
    setFlectChimeClientListener = (l: FlectChimeClientListener) => {
        this._flectChimeClientListener = l;
    };

    private _realtimeSubscribeChatClientListener: RealtimeSubscribeChatClientListener | null = null;
    setRealtimeSubscribeChatClientListener = (l: RealtimeSubscribeChatClientListener) => {
        this._realtimeSubscribeChatClientListener = l;
        if (this._chatClient) {
            this._chatClient.setRealtimeSubscribeChatClientListener(l);
        }
    };

    private _realtimeSubscribeTranscriptionClientListener: RealtimeSubscribeTranscriptionClientListener | null = null;
    setRealtimeSubscribeTranscriptionClientListener = (l: RealtimeSubscribeTranscriptionClientListener) => {
        this._realtimeSubscribeTranscriptionClientListener = l;
        if (this._transcriptionClient) {
            this._transcriptionClient.setRealtimeSubscribeTranscriptionClientListener(l);
        }
    };

    private _realtimeSubscribeHMMClientListener: RealtimeSubscribeHMMClientListener | null = null;
    setRealtimeSubscribeHMMClientListener = (hmmListener: RealtimeSubscribeHMMClientListener | null) => {
        this._realtimeSubscribeHMMClientListener = hmmListener;
        if (this._hmmClient) {
            this._hmmClient.setRealtimeSubscribeHMMClientListener(hmmListener);
        }
    };

    ///////////////////////////////////////////
    // Feature Management
    ///////////////////////////////////////////
    startShareContent = async (media: MediaStream) => {
        await this.meetingSession!.audioVideo.startContentShare(media);
        this._isShareContent = true;
    };
    stopShareContent = async () => {
        await this.meetingSession!.audioVideo.stopContentShare();
        this._isShareContent = false;
    };

    ///////////////////////////////////////////
    // Meeting Management
    ///////////////////////////////////////////
    /**
     * (A-) create meeting
     */
    getMeetingInfo = async (meetingName: string, userName: string | null = null) => {
        this._meetingName = meetingName;
        this._userName = userName;
        const res = await this._restApiClient.getMeetingInfo({ meetingName });
        console.log(res);
        return res;
    };

    /**
     * (A) create meeting
     */
    createMeeting = async (meetingName: string, region: string) => {
        this._meetingName = meetingName;
        const res = await this._restApiClient.createMeeting({ meetingName, region });
        if (!res.created) {
            console.log("[FlectChimeClient][createMeeting] meeting create failed", res);
            throw new Error(`Meeting Create Failed`);
        }
        return res;
    };

    /**
     * (B) Join Meeting Room
     */
    joinMeeting = async (meetingName: string, userName: string) => {
        if (meetingName === "") {
            throw new Error("Meeting name is invalid");
        }
        if (userName === "") {
            throw new Error("Username is invalid");
        }
        this._meetingName = meetingName;
        this._userName = userName;

        const joinMeetingResponse = await this._restApiClient.joinMeeting({ meetingName, attendeeName: userName });
        console.log("[FlectChimeClient][joinMeeting] joinMeetingRespons:", JSON.stringify(joinMeetingResponse));
        const meetingInfo = joinMeetingResponse.meeting;
        const attendeeInfo = joinMeetingResponse.attendee;
        console.log("[FlectChimeClient][joinMeeting] ", meetingInfo, attendeeInfo);
        this._meetingName = meetingName;
        this._meetingId = meetingInfo.MeetingId!;
        this._joinToken = attendeeInfo.JoinToken!;
        this._userName = userName;
        this._attendeeId = attendeeInfo.AttendeeId!;

        // (1) creating meeting session
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

        //// (1-5) create AudioVideoObserver
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
        this._meetingSession.audioVideo.addObserver(audioVideoOserver);

        // (2) DeviceSetting
        this._audioInputDeviceSetting = new AudioInputDeviceSetting(this._meetingSession);
        this._videoInputDeviceSetting = new VideoInputDeviceSetting(this._meetingSession);
        this._audioOutputDeviceSetting = new AudioOutputDeviceSetting(this._meetingSession);

        // (3) List devices
        //// chooseAudioOutputDevice uses the internal cache
        //// so beforehand, we must get thses information. (auidoinput, videoinput are maybe optional)
        await this.meetingSession?.audioVideo.listAudioInputDevices();
        await this.meetingSession?.audioVideo.listVideoInputDevices();
        await this.meetingSession?.audioVideo.listAudioOutputDevices();
    };

    /**
     * (C) Enter Meeting Room
     */
    enterMeeting = async () => {
        if (!this.meetingSession) {
            console.log("[FlectChimeClient][enterMeeting] meetingsession is null?", this.meetingSession);
            throw new Error("meetingsession is null?");
        }

        // (1) prepair
        //// https://github.com/aws/amazon-chime-sdk-js/issues/502#issuecomment-652665492
        //// When stop preview, camera stream is terminated!!? So when enter meeting I rechoose Devices as workaround. (2)
        this.videoInputDeviceSetting?.stopPreview();

        // (2) subscribe AtttendeeId presence
        this.meetingSession.audioVideo.realtimeSubscribeToAttendeeIdPresence(async (attendeeId: string, present: boolean) => {
            console.log(`[FlectChimeClient][AttendeeIdPresenceSubscriber] ${attendeeId} present = ${present}`);
            if (present) {
                if (attendeeId in this._attendees === false) {
                    let userName = "";
                    if (attendeeId.indexOf("#") > 0) {
                        const strippedAttendeeId = attendeeId.substring(0, attendeeId.indexOf("#"));
                        try {
                            const result = await this._restApiClient.getUserNameByAttendeeId({ meetingName: this._meetingName!, attendeeId: strippedAttendeeId });
                            userName = `Shared Contents[${result.attendeeName}]`;
                        } catch (e) {
                            console.log(`attendee is not found ${attendeeId}`, e);
                            userName = `Shared Contents[${attendeeId}]`;
                        }
                    } else {
                        try {
                            const result = await this._restApiClient.getUserNameByAttendeeId({ meetingName: this._meetingName!, attendeeId });
                            userName = result.attendeeName;
                        } catch (e) {
                            console.log(`attendee is not found ${attendeeId}`, e);
                            userName = attendeeId;
                        }
                    }
                    // Add to Attendee List
                    const new_attendee: AttendeeState = {
                        attendeeId: attendeeId,
                        name: userName,
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
        });

        // (3) subscribe ActiveSpeakerDetector
        this.meetingSession.audioVideo.subscribeToActiveSpeakerDetector(
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
                if (this._activeSpeakerId !== activeSpeakerId) {
                    this._activeSpeakerId = activeSpeakerId;
                    this._flectChimeClientListener?.activeSpekaerUpdated(this._activeSpeakerId);
                }
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

        // // (3-2) Transcription
        // this.meetingSession.audioVideo.transcriptionController?.subscribeToTranscriptEvent((transcriptEvent: TranscriptEvent) => {
        //     const LANGUAGES_NO_WORD_SEPARATOR = new Set([
        //         'ja-JP',
        //         'zh-CN',
        //     ]);
        //     console.log("[FlectChimeClient][TRANSCRIBE] Receive Event:", transcriptEvent)

        //     if (transcriptEvent instanceof TranscriptionStatus) {
        //         console.log(`[FlectChimeClient][TRANSCRIBE] Status, type: ${transcriptEvent.type}, time:${transcriptEvent.eventTimeMs}, message:${transcriptEvent.message}, region:${transcriptEvent.transcriptionRegion}`)
        //         console.log(`[FlectChimeClient][TRANSCRIBE] Status, conf: ${transcriptEvent.transcriptionConfiguration}`)

        //         if (transcriptEvent.type === TranscriptionStatusType.STARTED) {
        //             console.log("[FlectChimeClient][TRANSCRIBE] Status: Started", transcriptEvent.transcriptionConfiguration)
        //             const transcriptionConfiguration = JSON.parse(transcriptEvent.transcriptionConfiguration);
        //             if (transcriptionConfiguration) {
        //                 if (transcriptionConfiguration.EngineTranscribeSettings) {
        //                     this._languageCode = transcriptionConfiguration.EngineTranscribeSettings.LanguageCode;
        //                 } else if (transcriptionConfiguration.EngineTranscribeMedicalSettings) {
        //                     this._languageCode = transcriptionConfiguration.EngineTranscribeMedicalSettings.languageCode;
        //                 }
        //             }

        //             if (this._languageCode && LANGUAGES_NO_WORD_SEPARATOR.has(this._languageCode!)) {
        //                 this._noWordSeparatorForTranscription = true
        //             }else{
        //                 this._noWordSeparatorForTranscription = false
        //             }
        //             console.log(`[FlectChimeClient][TRANSCRIBE] Lang:${this._languageCode} noSeparateor:${this._noWordSeparatorForTranscription}`)
        //             this._isTranscriptionEnabled = true
        //             this._flectChimeClientTranscriptionListener?.transcriptionStarted(this._languageCode||"")
        //         } else if (transcriptEvent.type === TranscriptionStatusType.STOPPED) {
        //             console.log("[FlectChimeClient][TRANSCRIBE] Status: Stopped")
        //             this._isTranscriptionEnabled = false
        //             this._flectChimeClientTranscriptionListener?.transcriptionStopped()
        //         } else{
        //             console.log("[FlectChimeClient][TRANSCRIBE] Status: other", transcriptEvent.type)
        //         }

        //     } else if (transcriptEvent instanceof Transcript) {
        //         console.log("[FlectChimeClient][TRANSCRIBE] Scripts:", transcriptEvent.results)

        //         for (const result of transcriptEvent.results) {
        //             console.log(`[FlectChimeClient][TRANSCRIBE] result: id:${result.resultId} channel:${result.channelId} time(${result.startTimeMs}-${result.endTimeMs}) partial:${result.isPartial}`)

        //             for(const alt of result.alternatives){
        //                 console.log(`[FlectChimeClient][TRANSCRIBE] alt: ${alt.transcript}`)
        //                 let userName = ""
        //                 for(const item of alt.items){
        //                     // console.log(`[FlectChimeClient][TRANSCRIBE] item: attendeeId:${item.attendee.attendeeId}, time:(${item.startTimeMs}-${item.endTimeMs}) type:${item.type}`)
        //                     // console.log(`[FlectChimeClient][TRANSCRIBE] item: content:${item.content}`)
        //                     userName = this.getUserNameByAttendeeIdFromList(item.attendee.attendeeId)
        //                 }
        //                 this._flectChimeClientTranscriptionListener?.scriptRecieved(result.startTimeMs, result.endTimeMs, userName, this._languageCode||"", alt.transcript, result.isPartial)
        //             }
        //         }
        //     } else {
        //         console.log("[TRANSCRIBE] unknown type", transcriptEvent)
        //     }
        // })

        // (4) start
        this.meetingSession!.audioVideo.start();
        await this.videoInputDeviceSetting!.setVideoInputEnable(true);
        await this.audioInputDeviceSetting!.setAudioInputEnable(true);
        await this.audioOutputDeviceSetting!.setAudioOutputEnable(true);

        // (5) enable chat
        this._chatClient = new RealtimeSubscribeChatClient(this);
        this._chatClient.setRealtimeSubscribeChatClientListener(this._realtimeSubscribeChatClientListener);

        // (5-2) enable transcription
        this._transcriptionClient = new RealtimeSubscribeTranscriptionClient(this);
        this._transcriptionClient.setRealtimeSubscribeTranscriptionClientListener(this._realtimeSubscribeTranscriptionClientListener);

        // (6) enable hmm
        this._hmmClient = new RealtimeSubscribeHMMClient(this, this._restApiClient);
        this._hmmClient.setRealtimeSubscribeHMMClientListener(this._realtimeSubscribeHMMClientListener);

        // (7) update
        this.updateMeetingInfo();
    };

    /**
     * (D) leave meeting
     */
    leaveMeeting = async () => {
        if (!this.meetingSession) {
            console.log("[FlectChimeClient][leaveMeeting] meetingsession is null?", this.meetingSession);
            throw new Error("meetingsession is null?");
        }

        await this.audioInputDeviceSetting!.setAudioInput(null);
        await this.videoInputDeviceSetting!.setVideoInput(null);
        await this.audioOutputDeviceSetting!.setAudioOutput(null);

        this.videoInputDeviceSetting!.stopPreview();
        this.meetingSession.audioVideo.stopLocalVideoTile();
        this.meetingSession.audioVideo.stop();
        this.stopShareContent();

        this._userName = "";
        this._meetingName = "";
        this._attendees = {};
        this._videoTileStates = {};
    };

    /***
     * (x)
     */
    // generateOnetimeCode = async () => {
    //     return this._restApiClient.generateOnetimeCode(this._meetingName!, this._attendeeId!);
    // };

    startTranscribe = async (lang: string) => {
        return this._restApiClient.startTranscribe({
            meetingName: this._meetingName!,
            attendeeId: this._attendeeId!,
            lang: lang,
        });
    };

    stopTranscribe = async () => {
        return this._restApiClient.stopTranscribe({
            meetingName: this._meetingName!,
            attendeeId: this._attendeeId!,
        });
    };

    ///////////////////////////////////////////
    // Utility
    ///////////////////////////////////////////
    getContentTiles = () => {
        return Object.values(this._videoTileStates).filter((tile) => {
            return tile.isContent;
        });
    };
    getActiveSpeakerTile = () => {
        if (this._activeSpeakerId && this._videoTileStates[this._activeSpeakerId]) {
            return this._videoTileStates[this._activeSpeakerId];
        } else {
            return null;
        }
    };

    getAllTiles = () => {
        return Object.values(this._videoTileStates);
    };

    getContentTilesExcludeMe = () => {
        return Object.values(this._videoTileStates).filter((tile) => {
            return tile.boundAttendeeId!.indexOf(this._attendeeId!) < 0;
        });
    };

    //// deprecated
    getTilesWithFilter = (excludeSpeaker: boolean, excludeSharedContent: boolean, excludeLocal: boolean) => {
        let targetTiles = Object.values(this._videoTileStates).filter((tile) => {
            if (excludeSharedContent && tile.isContent === true) {
                return false;
            }
            if (excludeSpeaker && tile.boundAttendeeId === this._activeSpeakerId) {
                return false;
            }
            if (excludeLocal && tile.localTile) {
                return false;
            }

            if (!this._attendees[tile.boundAttendeeId!]) {
                // if attendees not found, show tile.
                return true;
            }

            return this._attendees[tile.boundAttendeeId!].isVideoPaused === false;
        });
        return targetTiles;
    };

    ///// Improved version of getTilesWithFilters
    private gatherTiles = (remoteActiveSpeaker: boolean, remoteNonActiveSpeaker: boolean, remoteSharedContent: boolean, localActiveSpeaker: boolean, localNonActiveSpeaker: boolean, localSharedContent: boolean) => {
        const targetTiles = Object.values(this._videoTileStates).filter((tile) => {
            if (tile.localTile || tile.boundAttendeeId!.includes(this._attendeeId!)) {
                ///(1) Local
                if (tile.isContent) {
                    if (localSharedContent) {
                        return true; /// (1-1) Local Shared Content
                    }
                } else if (tile.boundAttendeeId === this._activeSpeakerId) {
                    if (localActiveSpeaker) {
                        return true; /// (1-2) Local Active Speaker
                    }
                } else {
                    if (localNonActiveSpeaker) {
                        return true; /// (1-3) Local Non Active Speaker
                    }
                }
            } else {
                ///(2) Remote
                if (tile.isContent) {
                    if (remoteSharedContent) {
                        return true; /// (2-1) Remote Shared Content
                    }
                } else if (tile.boundAttendeeId === this._activeSpeakerId) {
                    if (remoteActiveSpeaker) {
                        return true; /// (2-2) Remote Active Speaker
                    }
                } else {
                    if (remoteNonActiveSpeaker) {
                        return true; /// (2-3) Remote Non Active Speaker
                    }
                }
            }
        });

        const nonPausedTargetTiles = targetTiles.filter((tile) => {
            if (this._attendees[tile.boundAttendeeId!]) {
                return this._attendees[tile.boundAttendeeId!].isVideoPaused === false;
            } else {
                return false;
            }
        });
        return nonPausedTargetTiles;
    };

    getTilesForRecorder = () => {
        return this.gatherTiles(true, true, true, false, false, false);
    };
    // getSharedContentTiles = (excludeLocal: boolean) => {
    //     if (excludeLocal) {
    //         return this.gatherTiles(false, false, true, false, false, false);
    //     } else {
    //         return this.gatherTiles(false, false, true, false, false, true);
    //     }
    // };

    setPauseVideo = async (attendeeId: string, pause: boolean) => {
        if (this._attendees[attendeeId]) {
            this._attendees[attendeeId].isVideoPaused = pause;
            console.log(`pause!! 1user ${attendeeId} ${pause}`);
            console.log(this._attendees);
            if (pause) {
                console.log(`pause!! 2user ${attendeeId} ${pause}`);
                if (this.meetingSession?.audioVideo.getVideoTile(this._videoTileStates[attendeeId].tileId!)?.state().localTile === false) {
                    console.log(`pause!! 3user ${attendeeId} ${pause} ${this._videoTileStates[attendeeId].tileId!}`);
                    await this.meetingSession!.audioVideo.unbindVideoElement(this._videoTileStates[attendeeId].tileId!);
                    await this.meetingSession!.audioVideo.pauseVideoTile(this._videoTileStates[attendeeId].tileId!);
                }
            } else {
                await this.meetingSession!.audioVideo.unpauseVideoTile(this._videoTileStates[attendeeId].tileId!);
            }
            this._flectChimeClientListener?.attendeesUpdated(this._attendees);
        } else {
            console.log(`no user ${attendeeId} ${pause}`);
            console.log(this._attendees);
        }
    };

    getUserNameByAttendeeIdFromList = (attendeeId: string) => {
        return this._attendees[attendeeId] ? this._attendees[attendeeId].name : attendeeId;
    };

    updateMeetingInfo = async () => {
        const meetingInfo = await this._restApiClient.getMeetingInfo({ meetingName: this._meetingName! });
        this._isOwner = meetingInfo.isOwner || false;
        this._flectChimeClientListener?.meetingStateUpdated();
    };
}
