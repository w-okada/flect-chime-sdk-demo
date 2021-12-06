import { useMemo, useState } from "react";
import { FlectChimeClient, RealtimeData, VideoTileState, VirtualBackgroundSegmentationType, NoiseSuppressionType, AttendeeState } from "@dannadori/flect-amazon-chime-lib2";

export type UseChimeClientProps = {
    RestAPIEndpoint: string;
};
export type ChimeClientState = {
    // chimeClient: FlectChimeClient;
    meetingName: string | null;
    userName: string | null;
    attendeeId: string | null;
    attendees: { [attendeeId: string]: AttendeeState };
    initialize: (userId: string, idToken: string, accessToken: string, refreshToken: string) => void;
    initializeWithCode: (codeToAccess: string) => void;
    ///////////////////////////////////////////
    // Feature Management
    ///////////////////////////////////////////
    isShareContent: boolean;
    startShareContent: (media: MediaStream) => Promise<void>;
    stopShareContent: () => Promise<void>;

    ///////////////////////////////////////////
    // Meeting Management
    ///////////////////////////////////////////
    getMeetingInfo: (meetingName: string, userName?: string | null) => Promise<void>;
    createMeeting: (meetingName: string, region: string) => Promise<void>;
    joinMeeting: (meetingName: string, userName: string) => Promise<void>;
    enterMeeting: () => Promise<void>;
    leaveMeeting: () => Promise<void>;

    ///////////////////////////////////////////
    // AuditoVideo
    ///////////////////////////////////////////
    startLocalVideoTile: () => void;
    stopLocalVideoTile: () => void;
    setPreviewVideoElement: (val: HTMLVideoElement) => void;
    setOutputAudioElement: (val: HTMLAudioElement) => void;
    startPreview: () => void;
    stopPreview: () => void;
    bindVideoElement: (tileId: number, videoElement: HTMLVideoElement) => void;
    unbindVideoElement: (tileId: number) => void;

    //////////////////////////////////////////////
    // Device Setting
    //////////////////////////////////////////////
    audioInputDevice: string | MediaStream;
    noiseSuppressionType: NoiseSuppressionType;
    videoInputDevice: string | MediaStream;
    virtualBackgroundSegmentationType: VirtualBackgroundSegmentationType;
    virtualBackgroundEnable: boolean;
    audioOutputDevice: string;
    audioInputEnable: boolean;
    isMuted: boolean;
    noiseSuppressionEnable: boolean;
    videoInputEnable: boolean;
    audioOutputEnable: boolean;
    setVideoInput: (val: string | MediaStream | null) => Promise<void>;
    setVirtualBackgroundSegmentationType: (val: VirtualBackgroundSegmentationType) => Promise<void>;
    setVirtualBackgroundEnable: (val: boolean) => Promise<void>;
    setBackgroundImagePath: (path: string) => Promise<void>;
    setAudioInput: (val: string | MediaStream | null) => Promise<void>;
    setAudioOutput: (val: string | null) => Promise<void>;
    setAudioInputEnable: (val: boolean) => Promise<void>;
    setMute: (val: boolean) => Promise<void>;
    setNoiseSuppressionEnable: (val: boolean) => Promise<void>;
    setNoiseSuppressionType: (value: NoiseSuppressionType) => Promise<void>;
    setVideoInputEnable: (val: boolean) => Promise<void>;
    setAudioOutputEnable: (val: boolean) => Promise<void>;

    pauseVideo: (attendeeId: string, pause: boolean) => Promise<void>;
    ///////////////////////////////////////////
    // Utility
    ///////////////////////////////////////////
    getContentTiles: () => VideoTileState[];
    getActiveSpeakerTile: () => VideoTileState | null;
    getAllTiles: () => VideoTileState[];
    setBackgroundMusic: (stream: MediaStream) => void;
    setBackgroundMusicVolume: (volume: number) => void;
    getUserNameByAttendeeIdFromList: (attendeeId: string) => string;

    //////////////////////////////////////////
    /// chat
    //////////////////////////////////////////
    sendChatData: (text: string) => void;
    chatData: RealtimeData[];
};

export const useChimeClient = (props: UseChimeClientProps) => {
    const [_lastUpdateTime, setLastUpdateTime] = useState(0);

    const chimeClient = useMemo(() => {
        const c = new FlectChimeClient(props.RestAPIEndpoint);
        c.setFlectChimeClientListener({
            meetingStateUpdated: () => {
                setLastUpdateTime(new Date().getTime());
            },
            activeSpekaerUpdated: (activeSpeakerId: string | null) => {
                setLastUpdateTime(new Date().getTime());
            },
            attendeesUpdated: (attendeeList: { [attendeeId: string]: AttendeeState }) => {
                setLastUpdateTime(new Date().getTime());
            },
            videoTileStateUpdated: (videoTileStateList: { [attendeeId: string]: VideoTileState }) => {
                setLastUpdateTime(new Date().getTime());
            },
        });

        c.setRealtimeSubscribeChatClientListener({
            chatDataUpdated: (list: RealtimeData[]) => {
                console.log("chat data updated!", list);
                setLastUpdateTime(new Date().getTime());
            },
        });
        c.setRealtimeSubscribeTranscriptionClientListener({
            transcriptionStatusUpdated: () => {
                setLastUpdateTime(new Date().getTime());
            },
        });
        return c;
    }, []);

    ///////////////////////////////////////////
    // Feature Management
    ///////////////////////////////////////////
    const initialize = (userId: string, idToken: string, accessToken: string, refreshToken: string) => {
        chimeClient.init(userId, idToken, accessToken, refreshToken);
        setLastUpdateTime(new Date().getTime());
    };
    const initializeWithCode = (codeToAccess: string) => {
        chimeClient.initWithCode(codeToAccess);
        setLastUpdateTime(new Date().getTime());
    };

    ///////////////////////////////////////////
    // Feature Management
    ///////////////////////////////////////////
    const startShareContent = async (media: MediaStream) => {
        await chimeClient.startShareContent(media); // await is needed to update the featureenbaler, because on/off falg is changed after shared
        setLastUpdateTime(new Date().getTime());
    };
    const stopShareContent = async () => {
        await chimeClient.stopShareContent();
        setLastUpdateTime(new Date().getTime());
    };

    ///////////////////////////////////////////
    // Meeting Management
    ///////////////////////////////////////////
    /**
     * (A-) create meeting
     */
    const getMeetingInfo = async (meetingName: string, userName: string | null = null) => {
        await chimeClient.getMeetingInfo(meetingName, userName);
        setLastUpdateTime(new Date().getTime());
    };
    /**
     * (A) create meeting
     */
    const createMeeting = async (meetingName: string, region: string) => {
        await chimeClient.createMeeting(meetingName, region);
        setLastUpdateTime(new Date().getTime());
    };
    /**
     * (B) Join Meeting Room
     */
    const joinMeeting = async (meetingName: string, userName: string) => {
        await chimeClient.joinMeeting(meetingName, userName);
        setLastUpdateTime(new Date().getTime());
    };
    /**
     * (C) Enter Meeting Room
     */
    const enterMeeting = async () => {
        await chimeClient.enterMeeting();
        setLastUpdateTime(new Date().getTime());
    };
    /**
     * (D) leave meeting
     */
    const leaveMeeting = async () => {
        await chimeClient.leaveMeeting();
        setLastUpdateTime(new Date().getTime());
    };

    ///////////////////////////////////////////
    // AuditoVideo
    ///////////////////////////////////////////
    const startLocalVideoTile = () => {
        chimeClient.videoInputDeviceSetting!.startLocalVideoTile();
    };
    const stopLocalVideoTile = () => {
        chimeClient.videoInputDeviceSetting!.stopLocalVideoTile();
    };

    const setPreviewVideoElement = (val: HTMLVideoElement) => {
        chimeClient.videoInputDeviceSetting!.setPreviewVideoElement(val);
    };
    const setOutputAudioElement = (val: HTMLAudioElement) => {
        chimeClient.audioOutputDeviceSetting!.setOutputAudioElement(val);
    };

    const startPreview = () => {
        chimeClient.videoInputDeviceSetting!.startPreview();
    };
    const stopPreview = () => {
        chimeClient.videoInputDeviceSetting!.stopPreview();
    };

    const bindVideoElement = (tileId: number, videoElement: HTMLVideoElement) => {
        chimeClient.meetingSession!.audioVideo.bindVideoElement(tileId, videoElement);
    };
    const unbindVideoElement = (tileId: number) => {
        chimeClient.meetingSession!.audioVideo.unbindVideoElement(tileId);
    };

    //////////////////////////////////////////////
    // Device Setting
    //////////////////////////////////////////////
    const setVideoInput = async (val: string | MediaStream | null) => {
        await chimeClient.videoInputDeviceSetting!.setVideoInput(val);
    };
    const setVirtualBackgroundEnable = async (val: boolean) => {
        await chimeClient.videoInputDeviceSetting!.setVirtualBackgrounEnable(val);
    };
    const setVirtualBackgroundSegmentationType = async (val: VirtualBackgroundSegmentationType) => {
        await chimeClient.videoInputDeviceSetting!.setVirtualBackgroundSegmentationType(val);
    };
    const setBackgroundImagePath = async (path: string) => {
        await chimeClient.videoInputDeviceSetting!.setBackgroundImagePath(path);
    };
    const setAudioInput = async (val: string | MediaStream | null) => {
        await chimeClient.audioInputDeviceSetting!.setAudioInput(val);
    };
    const setAudioOutput = async (val: string | null) => {
        await chimeClient.audioOutputDeviceSetting!.setAudioOutput(val);
    };
    const setAudioInputEnable = async (val: boolean) => {
        // await chimeClient.audioInputDeviceSetting!.setAudioInputEnable(val);
        await chimeClient.audioInputDeviceSetting!.setAudioInputEnable(val);
        setLastUpdateTime(new Date().getTime());
    };
    const setMute = async (val: boolean) => {
        if (val) {
            chimeClient.audioInputDeviceSetting?.mute();
        } else {
            chimeClient.audioInputDeviceSetting?.unmute();
        }
        setLastUpdateTime(new Date().getTime());
    };
    const setNoiseSuppressionEnable = async (val: boolean) => {
        await chimeClient.audioInputDeviceSetting?.setNoiseSuppressionEnable(val);
    };
    const setNoiseSuppressionType = async (value: NoiseSuppressionType) => {
        await chimeClient.audioInputDeviceSetting?.setNoiseSuppressionType(value);
    };
    const setVideoInputEnable = async (val: boolean) => {
        // await chimeClient.videoInputDeviceSetting!.setVideoInputEnable(val);
        await chimeClient.videoInputDeviceSetting!.setVideoInputEnable(val);
        setLastUpdateTime(new Date().getTime());
    };
    const setAudioOutputEnable = async (val: boolean) => {
        // await chimeClient.audioOutputDeviceSetting!.setAudioOutputEnable(val);
        await chimeClient.audioOutputDeviceSetting!.setAudioOutputEnable(val);
        setLastUpdateTime(new Date().getTime());
    };

    const pauseVideo = async (attendeeId: string, pause: boolean) => {
        await chimeClient.setPauseVideo(attendeeId, pause);
    };

    ///////////////////////////////////////////
    // Utility
    ///////////////////////////////////////////
    const getContentTiles = () => {
        return chimeClient.getContentTiles();
    };
    const getActiveSpeakerTile = () => {
        return chimeClient.getActiveSpeakerTile();
    };
    const getAllTiles = () => {
        return chimeClient.getAllTiles();
    };

    const setBackgroundMusic = (stream: MediaStream) => {
        chimeClient.audioInputDeviceSetting?.setBackgroundMusic(stream);
    };
    const setBackgroundMusicVolume = (volume: number) => {
        chimeClient.audioInputDeviceSetting?.setBackgroundMusicVolume(volume);
    };
    const getUserNameByAttendeeIdFromList = (attendeeId: string) => {
        return chimeClient.getUserNameByAttendeeIdFromList(attendeeId);
    };

    //////////////////////////////////////////
    /// chat
    //////////////////////////////////////////
    const sendChatData = (text: string) => {
        chimeClient.chatClient!.sendChatData(text);
        chimeClient.chatClient?.chatData;
    };

    const returnValue: ChimeClientState = {
        // chimeClient,
        meetingName: chimeClient.meetingName,
        userName: chimeClient.userName,
        attendeeId: chimeClient.meetingSession?.configuration.credentials?.attendeeId || null,
        attendees: chimeClient.attendees,
        initialize,
        initializeWithCode,
        ///////////////////////////////////////////
        // Feature Management
        ///////////////////////////////////////////
        isShareContent: chimeClient.isShareContent,
        startShareContent,
        stopShareContent,
        ///////////////////////////////////////////
        // Meeting Management
        ///////////////////////////////////////////
        getMeetingInfo,
        createMeeting,
        joinMeeting,
        enterMeeting,
        leaveMeeting,

        ///////////////////////////////////////////
        // AuditoVideo
        ///////////////////////////////////////////
        startLocalVideoTile,
        stopLocalVideoTile,
        setPreviewVideoElement,
        setOutputAudioElement,
        startPreview,
        stopPreview,
        bindVideoElement,
        unbindVideoElement,

        //////////////////////////////////////////////
        // Device Setting
        //////////////////////////////////////////////
        audioInputDevice: chimeClient.audioInputDeviceSetting?.audioInput || "None",
        noiseSuppressionType: chimeClient.audioInputDeviceSetting?.voiceFocusSpec?.variant || "None",
        noiseSuppressionEnable: chimeClient.audioInputDeviceSetting?.audioSuppressionEnable || false,
        videoInputDevice: chimeClient.videoInputDeviceSetting?.videoInput || "None",
        virtualBackgroundSegmentationType: chimeClient.videoInputDeviceSetting?.virtualBackgroundSegmentationType || "None",
        virtualBackgroundEnable: chimeClient.videoInputDeviceSetting?.virtualBackgroundEnable || false,
        audioOutputDevice: chimeClient.audioOutputDeviceSetting?.audioOutput || "None",
        audioInputEnable: chimeClient.audioInputDeviceSetting ? chimeClient.audioInputDeviceSetting.audioInputEnable : false,
        isMuted: chimeClient.meetingSession?.audioVideo.realtimeIsLocalAudioMuted() || false,
        videoInputEnable: chimeClient.videoInputDeviceSetting ? chimeClient.videoInputDeviceSetting.videoInputEnable : false,
        audioOutputEnable: chimeClient.audioOutputDeviceSetting ? chimeClient.audioOutputDeviceSetting.audioOutputEnable : false,
        setAudioInput,
        setVideoInput,
        setVirtualBackgroundSegmentationType,
        setVirtualBackgroundEnable,
        setBackgroundImagePath,
        setAudioOutput,
        setAudioInputEnable,
        setMute,
        setNoiseSuppressionEnable,
        setNoiseSuppressionType,
        setVideoInputEnable,
        setAudioOutputEnable,

        pauseVideo,
        ///////////////////////////////////////////
        // Utility
        ///////////////////////////////////////////
        getContentTiles,
        getActiveSpeakerTile,
        getAllTiles,
        setBackgroundMusic,
        setBackgroundMusicVolume,

        getUserNameByAttendeeIdFromList,

        //////////////////////////////////////////
        /// chat
        //////////////////////////////////////////
        sendChatData,
        chatData: chimeClient.chatClient?.chatData || [],
    };

    return returnValue;
};
