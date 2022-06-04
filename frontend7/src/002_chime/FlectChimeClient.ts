import { HTTPJoinMeetingRequest } from "../http_request";
import { HTTPCreateMeetingRequest, HTTPListMeetingsRequest, RestApiClient, GetMeetingInfoRequest, RestApiClientContext } from "./rest/RestApiClient";
import {
    ConsoleLogger,
    DefaultDeviceController,
    DefaultMeetingSession,
    LogLevel,
    MeetingSessionConfiguration,
    VideoTileState
} from 'amazon-chime-sdk-js';
import { DeviceChangeObserverImpl } from "./observer/DeviceChangeObserverImpl";
import AudioVideoObserverTemplate from "./observer/AudioVideoObserverTemplate";
import { AudioInputDeviceSetting } from "./io/AudioInputDeviceSetting";
import { VideoInputDeviceSetting } from "./io/VideoInputDeviceSetting";
import { AudioOutputDeviceSetting } from "./io/AudioOutputDeviceSetting";
import { ChimeDemoException } from "../000_exception/Exception";

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
    constructor(restEndPoint: string, idToken: string, accessToken: string, refreshToken: string) {
        const restApiContext: RestApiClientContext = {
            baseUrl: restEndPoint,
            idToken: idToken,
            accessToken: accessToken,
            refreshToken: refreshToken
        }
        this._restApiClient = new RestApiClient(restApiContext);
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
    private _attendeeName: string | null = null;
    get attendeeName(): string | null {
        return this._attendeeName;
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
    //  private _isShareContent: boolean = false;
    //  get isShareContent(): boolean {
    //      return this._isShareContent;
    //  }
    //  private _activeSpeakerId: string | null = null;
    //  get activeSpeakerId(): string | null {
    //      return this._activeSpeakerId;
    //  }
    //  private _isOwner: boolean = false;
    //  get isOwner(): boolean {
    //      return this._isOwner;
    //  }


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

    ///////////////////////////////////////////
    // Listener
    ///////////////////////////////////////////
    private _flectChimeClientListener: FlectChimeClientListener | null = null;
    setFlectChimeClientListener = (l: FlectChimeClientListener) => {
        this._flectChimeClientListener = l;
    };





    ///////////////////////////////////////////
    // Meeting Management
    ///////////////////////////////////////////
    // (1) Meetings
    //// (1-1) list meetings
    listMeetings = async () => {
        const props: HTTPListMeetingsRequest = {}
        const res = await this._restApiClient.listMeetings(props)
        const meetings: MeetingInfo[] = res.meetings.map(x => {
            return {
                meetingName: x.meetingName,
                meetingId: x.meetingId,
                isOwner: x.isOwner,
                useCode: x.metadata["UseCode"]
            }
        })
        return meetings

    }
    //// (1-2) create meeting
    createMeeting = async (meetingName: string, region: string, secret: boolean, useCode: boolean, code: string) => {
        const props: HTTPCreateMeetingRequest = {
            meetingName, region, secret, useCode, code
        }
        const res = await this._restApiClient.createMeeting(props);
        if (!res.created) {
            console.log("[FlectChimeClient][createMeeting] meeting create failed", res);
            throw new Error(ChimeDemoException.NoMeetingRoomCreated);
        }
        return res;
    };

    // (2) Meeting
    //// (2-1) getMeetingInfo
    getMeetingInfo = async (meetingName: string, userName: string | null = null) => {
        // this._meetingName = meetingName;
        // this._userName = userName;
        const props: GetMeetingInfoRequest = {
            meetingName
        }
        const res = await this._restApiClient.getMeetingInfo(props);
        console.log(res);
        return res;
    };

    // (3) attendees
    //// (3-1) join meeting
    joinMeeting = async (meetingName: string, attendeeName: string, code: string) => {
        if (meetingName === "") {
            throw new Error("Meeting name is invalid");
        }
        if (attendeeName === "") {
            throw new Error("Username is invalid");
        }
        this._meetingName = meetingName;
        this._attendeeName = attendeeName;

        const props: HTTPJoinMeetingRequest = { meetingName, attendeeName, code }
        console.log("Code2:", props);

        const joinMeetingResponse = await this._restApiClient.joinMeeting(props);

        console.log("[FlectChimeClient][joinMeeting] joinMeetingRespons:", JSON.stringify(joinMeetingResponse));
        const meetingInfo = joinMeetingResponse.meeting;
        const attendeeInfo = joinMeetingResponse.attendee;
        console.log("[FlectChimeClient][joinMeeting] ", meetingInfo, attendeeInfo);
        this._meetingName = meetingName;
        this._meetingId = meetingInfo.MeetingId!;
        this._joinToken = attendeeInfo.JoinToken!;
        this._attendeeName = attendeeName;
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


    }
}