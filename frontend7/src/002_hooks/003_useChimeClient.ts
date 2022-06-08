import { VideoTileState } from "amazon-chime-sdk-js";
import { Chime } from "aws-sdk";
import { useEffect, useMemo, useState } from "react";
import { AttendeeState, FlectChimeClient, FlectChimeClientListener, MeetingInfo } from "../001_clients_and_managers/003_chime/FlectChimeClient";
import { GetAttendeeInfoRequest, GetAttendeeInfoResponse } from "./002_useBackendManager";
import { ChimeAudioInputDevice, ChimeAudioOutputDevice, ChimeAudioOutputElement, ChimeVideoInputDevice } from "./004_useDeviceState";


export type UseChimeClientProps = {
    getAttendeeInfo: (params: GetAttendeeInfoRequest) => Promise<GetAttendeeInfoResponse | null>
};

export type ChimeClientState = {
    chimeClient: FlectChimeClient
    attendees: AttendeeList
    videoTileStates: VideoTileStateList
    activeSpeakerId: string | null
    // getMeetingInfo: (meetingName: string, userName?: string | null) => Promise<void>;

    // (3)


}
export type ChimeClientStateAndMethods = ChimeClientState & {
    joinMeeting: (meetingName: string, meetingInfo: Chime.Meeting, attendeeInfo: Chime.Attendee) => Promise<void>
    enterMeeting: (audioInput: ChimeAudioInputDevice, videoInput: ChimeVideoInputDevice, audioOutput: ChimeAudioOutputDevice, audioOutputElement: ChimeAudioOutputElement) => Promise<void>

    setAudioInput: (audioInput: ChimeAudioInputDevice) => Promise<void>
    setVideoInput: (videoInput: ChimeVideoInputDevice) => Promise<void>
    setAudioOutput: (audioOutput: ChimeAudioOutputDevice) => Promise<void>

    bindVideoElement: (tileId: number, videoElement: HTMLVideoElement) => void

}

export type AttendeeList = { [attendeeId: string]: AttendeeState; }
export type VideoTileStateList = { [attendeeId: string]: VideoTileState; }
export const useChimeClient = (props: UseChimeClientProps): ChimeClientStateAndMethods => {
    const [meetingName, setMeetingName] = useState<string>()
    const [attendees, setAttendees] = useState<AttendeeList>({})
    const [videoTileStates, setVideoTileStates] = useState<VideoTileStateList>({})
    const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null)

    const chimeClient = useMemo(() => {
        return new FlectChimeClient()
    }, [])

    console.log("meeting state::1:", attendees)
    console.log("meeting state::2:", videoTileStates)
    useEffect(() => {
        const l: FlectChimeClientListener = {
            meetingStateUpdated: (): void => {
                console.log("meeting state update....")
            },
            activeSpekaerUpdated: (activeSpeakerId: string | null): void => {
                setActiveSpeakerId(activeSpeakerId)
            },
            attendeesUpdated: (list: { [attendeeId: string]: AttendeeState; }): void => {
                const updateAttendeeList = async () => {
                    for (let x of Object.values(list)) {
                        if (x.attendeeName === null) {
                            const info = await props.getAttendeeInfo({
                                meetingName: meetingName!,
                                attendeeId: x.attendeeId
                            })
                            x.attendeeName = info?.attendeeName || null
                        }
                    }
                    const nameUnresolved = Object.values(list).find(x => { return x.attendeeName === null })
                    if (nameUnresolved) {
                        console.log("retry resolve attendee name", nameUnresolved)
                        setTimeout(updateAttendeeList, 1000 * 2)
                    }
                    setAttendees({ ...list })
                }
                updateAttendeeList()
            },
            videoTileStateUpdated: (list: { [attendeeId: string]: VideoTileState; }): void => {
                setVideoTileStates({ ...list })
            }
        }
        chimeClient.setFlectChimeClientListener(l)
    }, [props.getAttendeeInfo, meetingName])



    //// (3) Create Meeting
    const joinMeeting = useMemo(() => {
        return async (meetingName: string, meetingInfo: Chime.Meeting, attendeeInfo: Chime.Attendee) => {
            if (!chimeClient) {
                console.warn("chime client is not initialized.")
                return
            }
            setMeetingName(meetingName)
            await chimeClient.joinMeeting(meetingInfo, attendeeInfo);
        }
    }, [chimeClient])

    const enterMeeting = useMemo(() => {
        return async (audioInput: ChimeAudioInputDevice, videoInput: ChimeVideoInputDevice, audioOutput: ChimeAudioOutputDevice, audioOutputElement: ChimeAudioOutputElement) => {
            if (!chimeClient) {
                console.warn("chime client is not initialized.")
                return
            }
            await chimeClient.enterMeeting(audioInput, videoInput, audioOutput, audioOutputElement);
        }
    }, [chimeClient])


    // Device
    const setAudioInput = async (audioInput: ChimeAudioInputDevice) => {
        await chimeClient.setAudioInputDevice(audioInput)
    }
    const setVideoInput = async (videoInput: ChimeVideoInputDevice) => {
        await chimeClient.setVideoInputDevice(videoInput)
    }
    const setAudioOutput = async (audioOutput: ChimeAudioOutputDevice) => {
        await chimeClient.setAudioOutputDevoce(audioOutput)
    }

    // Tiles
    const bindVideoElement = (tileId: number, videoElement: HTMLVideoElement) => {
        chimeClient.bindVideoElement(tileId, videoElement)
    }

    const returnValue: ChimeClientStateAndMethods = {
        chimeClient,
        attendees,
        videoTileStates,
        activeSpeakerId,
        // (1) Meetings
        joinMeeting,
        enterMeeting,
        setAudioInput,
        setVideoInput,
        setAudioOutput,

        bindVideoElement,
    }
    return returnValue
}

// export type ChimeClientState = {
//     // chimeClient: FlectChimeClient;
//     meetingName: string | null;
//     meetingId: string | null;
//     userName: string | null;
//     attendeeId: string | null;
//     joinToken: string | null;
//     attendees: { [attendeeId: string]: AttendeeState };
//     initialize: (userId: string, idToken: string, accessToken: string, refreshToken: string) => void;
//     initializeWithCode: (codeToAccess: string) => void;
//     ///////////////////////////////////////////
//     // Feature Management
//     ///////////////////////////////////////////
//     isShareContent: boolean;
//     startShareContent: (media: MediaStream) => Promise<void>;
//     stopShareContent: () => Promise<void>;

//     ///////////////////////////////////////////
//     // Meeting Management
//     ///////////////////////////////////////////
//     getMeetingInfo: (meetingName: string, userName?: string | null) => Promise<void>;
//     createMeeting: (meetingName: string, region: string) => Promise<void>;
//     joinMeeting: (meetingName: string, userName: string) => Promise<void>;
//     enterMeeting: () => Promise<void>;
//     leaveMeeting: () => Promise<void>;

//     ///////////////////////////////////////////
//     // AuditoVideo
//     ///////////////////////////////////////////
//     startLocalVideoTile: () => void;
//     stopLocalVideoTile: () => void;
//     setPreviewVideoElement: (val: HTMLVideoElement) => void;
//     setOutputAudioElement: (val: HTMLAudioElement) => void;
//     startPreview: () => void;
//     stopPreview: () => void;
//     bindVideoElement: (tileId: number, videoElement: HTMLVideoElement) => void;
//     unbindVideoElement: (tileId: number) => void;

//     //////////////////////////////////////////////
//     // Device Setting
//     //////////////////////////////////////////////
//     audioInputDevice: string | MediaStream;
//     noiseSuppressionType: NoiseSuppressionType;
//     videoInputDevice: string | MediaStream;
//     virtualBackgroundSegmentationType: VirtualBackgroundSegmentationType;
//     virtualBackgroundEnable: boolean;
//     audioOutputDevice: string;
//     audioInputEnable: boolean;
//     isMuted: boolean;
//     noiseSuppressionEnable: boolean;
//     videoInputEnable: boolean;
//     audioOutputEnable: boolean;
//     setVideoInput: (val: string | MediaStream | null) => Promise<void>;
//     setVirtualBackgroundSegmentationType: (val: VirtualBackgroundSegmentationType) => Promise<void>;
//     setVirtualBackgroundEnable: (val: boolean) => Promise<void>;
//     setBackgroundImagePath: (path: string) => Promise<void>;
//     setAudioInput: (val: string | MediaStream | null) => Promise<void>;
//     setAudioOutput: (val: string | null) => Promise<void>;
//     setAudioInputEnable: (val: boolean) => Promise<void>;
//     setMute: (val: boolean) => Promise<void>;
//     setNoiseSuppressionEnable: (val: boolean) => Promise<void>;
//     setNoiseSuppressionType: (value: NoiseSuppressionType) => Promise<void>;
//     setVideoInputEnable: (val: boolean) => Promise<void>;
//     setAudioOutputEnable: (val: boolean) => Promise<void>;

//     pauseVideo: (attendeeId: string, pause: boolean) => Promise<void>;
//     ///////////////////////////////////////////
//     // Utility
//     ///////////////////////////////////////////
//     getContentTiles: () => VideoTileState[];
//     getActiveSpeakerTile: () => VideoTileState | null;
//     getAllTiles: () => VideoTileState[];
//     setBackgroundMusic: (stream: MediaStream) => void;
//     setBackgroundMusicVolume: (volume: number) => void;
//     getUserNameByAttendeeIdFromList: (attendeeId: string) => string;

//     //////////////////////////////////////////
//     /// chat
//     //////////////////////////////////////////
//     sendChatData: (text: string) => void;
//     chatData: RealtimeData[];
//     //////////////////////////////////////////
//     // transcribe
//     //////////////////////////////////////////
//     setTranscribeEnable: (val: boolean) => void;
//     setTranscribeLang: (val: TranscribeLangs) => Promise<void>;
//     transcribeEnable: boolean;
//     transcribeLang: TranscribeLangs;
//     transcriptionScripts: TranscriptionScript[];
//     transcriptionPartialScript: TranscriptionScript | null;
// };

// export const TranscribeLangs = {
//     English_US: "en-US",
//     English_British: "en-GB",
//     English_Australian: "en-AU",
//     Spanish_US: "es-US",
//     French_Canadian: "fr-CA",
//     French: "fr-FR",
//     Italian: "it-IT",
//     German: "de-DE",
//     Portuguese_Brazilian: "pt-BR",
//     Japanese: "ja-JP",
//     Korean: "ko-KR",
//     Chinese_Mandarin: "zh-CN",
// } as const;
// export type TranscribeLangs = typeof TranscribeLangs[keyof typeof TranscribeLangs];

// export const useChimeClient = (props: UseChimeClientProps) => {
//     const [_lastUpdateTime, setLastUpdateTime] = useState(0);
//     const [transcribeEnable, _setTranscribeEnable] = useState(false);
//     const [transcribeLang, _setTranscribeLang] = useState<TranscribeLangs>(TranscribeLangs.Japanese);
//     const setTranscribeEnable = async (val: boolean) => {
//         if (val) {
//             await chimeClient.startTranscribe(transcribeLang);
//         } else {
//             await chimeClient.stopTranscribe();
//         }
//         _setTranscribeEnable(val);
//     };
//     const setTranscribeLang = async (val: TranscribeLangs) => {
//         if (transcribeEnable) {
//             await chimeClient.stopTranscribe();
//             await chimeClient.startTranscribe(val);
//         }
//         _setTranscribeLang(val);
//     };

//     const chimeClient = useMemo(() => {
//         const c = new FlectChimeClient(props.RestAPIEndpoint);
//         c.setFlectChimeClientListener({
//             meetingStateUpdated: () => {
//                 setLastUpdateTime(new Date().getTime());
//             },
//             activeSpekaerUpdated: (activeSpeakerId: string | null) => {
//                 setLastUpdateTime(new Date().getTime());
//             },
//             attendeesUpdated: (attendeeList: { [attendeeId: string]: AttendeeState }) => {
//                 setLastUpdateTime(new Date().getTime());
//             },
//             videoTileStateUpdated: (videoTileStateList: { [attendeeId: string]: VideoTileState }) => {
//                 setLastUpdateTime(new Date().getTime());
//             },
//         });

//         c.setRealtimeSubscribeChatClientListener({
//             chatDataUpdated: (list: RealtimeData[]) => {
//                 console.log("chat data updated!", list);
//                 setLastUpdateTime(new Date().getTime());
//             },
//         });
//         c.setRealtimeSubscribeTranscriptionClientListener({
//             transcriptionStatusUpdated: () => {
//                 setLastUpdateTime(new Date().getTime());
//             },
//         });
//         return c;
//     }, []);

//     ///////////////////////////////////////////
//     // Feature Management
//     ///////////////////////////////////////////
//     const initialize = (userId: string, idToken: string, accessToken: string, refreshToken: string) => {
//         chimeClient.init(userId, idToken, accessToken, refreshToken);
//         setLastUpdateTime(new Date().getTime());
//     };
//     const initializeWithCode = (codeToAccess: string) => {
//         chimeClient.initWithCode(codeToAccess);
//         setLastUpdateTime(new Date().getTime());
//     };

//     ///////////////////////////////////////////
//     // Feature Management
//     ///////////////////////////////////////////
//     const startShareContent = async (media: MediaStream) => {
//         await chimeClient.startShareContent(media); // await is needed to update the featureenbaler, because on/off falg is changed after shared
//         setLastUpdateTime(new Date().getTime());
//     };
//     const stopShareContent = async () => {
//         await chimeClient.stopShareContent();
//         setLastUpdateTime(new Date().getTime());
//     };

//     ///////////////////////////////////////////
//     // Meeting Management
//     ///////////////////////////////////////////
//     /**
//      * (A-) create meeting
//      */
//     const getMeetingInfo = async (meetingName: string, userName: string | null = null) => {
//         await chimeClient.getMeetingInfo(meetingName, userName);
//         setLastUpdateTime(new Date().getTime());
//     };
//     /**
//      * (A) create meeting
//      */
//     const createMeeting = async (meetingName: string, region: string) => {
//         await chimeClient.createMeeting(meetingName, region);
//         setLastUpdateTime(new Date().getTime());
//     };
//     /**
//      * (B) Join Meeting Room
//      */
//     const joinMeeting = async (meetingName: string, userName: string) => {
//         await chimeClient.joinMeeting(meetingName, userName);
//         setLastUpdateTime(new Date().getTime());
//     };
//     /**
//      * (C) Enter Meeting Room
//      */
//     const enterMeeting = async () => {
//         await chimeClient.enterMeeting();
//         setLastUpdateTime(new Date().getTime());
//     };
//     /**
//      * (D) leave meeting
//      */
//     const leaveMeeting = async () => {
//         await chimeClient.leaveMeeting();
//         setLastUpdateTime(new Date().getTime());
//     };

//     ///////////////////////////////////////////
//     // AuditoVideo
//     ///////////////////////////////////////////
//     const startLocalVideoTile = () => {
//         chimeClient.videoInputDeviceSetting!.startLocalVideoTile();
//     };
//     const stopLocalVideoTile = () => {
//         chimeClient.videoInputDeviceSetting!.stopLocalVideoTile();
//     };

//     const setPreviewVideoElement = (val: HTMLVideoElement) => {
//         chimeClient.videoInputDeviceSetting!.setPreviewVideoElement(val);
//     };
//     const setOutputAudioElement = (val: HTMLAudioElement) => {
//         chimeClient.audioOutputDeviceSetting!.setOutputAudioElement(val);
//     };

//     const startPreview = () => {
//         chimeClient.videoInputDeviceSetting!.startPreview();
//     };
//     const stopPreview = () => {
//         chimeClient.videoInputDeviceSetting!.stopPreview();
//     };

//     const bindVideoElement = (tileId: number, videoElement: HTMLVideoElement) => {
//         chimeClient.meetingSession!.audioVideo.bindVideoElement(tileId, videoElement);
//     };
//     const unbindVideoElement = (tileId: number) => {
//         chimeClient.meetingSession!.audioVideo.unbindVideoElement(tileId);
//     };

//     //////////////////////////////////////////////
//     // Device Setting
//     //////////////////////////////////////////////
//     const setVideoInput = async (val: string | MediaStream | null) => {
//         await chimeClient.videoInputDeviceSetting!.setVideoInput(val);
//     };
//     const setVirtualBackgroundEnable = async (val: boolean) => {
//         await chimeClient.videoInputDeviceSetting!.setVirtualBackgrounEnable(val);
//     };
//     const setVirtualBackgroundSegmentationType = async (val: VirtualBackgroundSegmentationType) => {
//         await chimeClient.videoInputDeviceSetting!.setVirtualBackgroundSegmentationType(val);
//     };
//     const setBackgroundImagePath = async (path: string) => {
//         await chimeClient.videoInputDeviceSetting!.setBackgroundImagePath(path);
//     };
//     const setAudioInput = async (val: string | MediaStream | null) => {
//         await chimeClient.audioInputDeviceSetting!.setAudioInput(val);
//     };
//     const setAudioOutput = async (val: string | null) => {
//         await chimeClient.audioOutputDeviceSetting!.setAudioOutput(val);
//     };
//     const setAudioInputEnable = async (val: boolean) => {
//         // await chimeClient.audioInputDeviceSetting!.setAudioInputEnable(val);
//         await chimeClient.audioInputDeviceSetting!.setAudioInputEnable(val);
//         setLastUpdateTime(new Date().getTime());
//     };
//     const setMute = async (val: boolean) => {
//         if (val) {
//             chimeClient.audioInputDeviceSetting?.mute();
//         } else {
//             chimeClient.audioInputDeviceSetting?.unmute();
//         }
//         setLastUpdateTime(new Date().getTime());
//     };
//     const setNoiseSuppressionEnable = async (val: boolean) => {
//         await chimeClient.audioInputDeviceSetting?.setNoiseSuppressionEnable(val);
//     };
//     const setNoiseSuppressionType = async (value: NoiseSuppressionType) => {
//         await chimeClient.audioInputDeviceSetting?.setNoiseSuppressionType(value);
//     };
//     const setVideoInputEnable = async (val: boolean) => {
//         // await chimeClient.videoInputDeviceSetting!.setVideoInputEnable(val);
//         await chimeClient.videoInputDeviceSetting!.setVideoInputEnable(val);
//         setLastUpdateTime(new Date().getTime());
//     };
//     const setAudioOutputEnable = async (val: boolean) => {
//         // await chimeClient.audioOutputDeviceSetting!.setAudioOutputEnable(val);
//         await chimeClient.audioOutputDeviceSetting!.setAudioOutputEnable(val);
//         setLastUpdateTime(new Date().getTime());
//     };

//     const pauseVideo = async (attendeeId: string, pause: boolean) => {
//         await chimeClient.setPauseVideo(attendeeId, pause);
//     };

//     ///////////////////////////////////////////
//     // Utility
//     ///////////////////////////////////////////
//     const getContentTiles = () => {
//         return chimeClient.getContentTiles();
//     };
//     const getActiveSpeakerTile = () => {
//         return chimeClient.getActiveSpeakerTile();
//     };
//     const getAllTiles = () => {
//         return chimeClient.getAllTiles();
//     };

//     const setBackgroundMusic = (stream: MediaStream) => {
//         chimeClient.audioInputDeviceSetting?.setBackgroundMusic(stream);
//     };
//     const setBackgroundMusicVolume = (volume: number) => {
//         chimeClient.audioInputDeviceSetting?.setBackgroundMusicVolume(volume);
//     };
//     const getUserNameByAttendeeIdFromList = (attendeeId: string) => {
//         return chimeClient.getUserNameByAttendeeIdFromList(attendeeId);
//     };

//     //////////////////////////////////////////
//     /// chat
//     //////////////////////////////////////////
//     const sendChatData = (text: string) => {
//         chimeClient.chatClient!.sendChatData(text);
//         chimeClient.chatClient?.chatData;
//     };

//     const returnValue: ChimeClientState = {
//         // chimeClient,
//         meetingName: chimeClient.meetingName,
//         meetingId: chimeClient.meetingId,
//         userName: chimeClient.userName,
//         attendeeId: chimeClient.meetingSession?.configuration.credentials?.attendeeId || null,
//         joinToken: chimeClient.joinToken,
//         attendees: chimeClient.attendees,
//         initialize,
//         initializeWithCode,
//         ///////////////////////////////////////////
//         // Feature Management
//         ///////////////////////////////////////////
//         isShareContent: chimeClient.isShareContent,
//         startShareContent,
//         stopShareContent,
//         ///////////////////////////////////////////
//         // Meeting Management
//         ///////////////////////////////////////////
//         getMeetingInfo,
//         createMeeting,
//         joinMeeting,
//         enterMeeting,
//         leaveMeeting,

//         ///////////////////////////////////////////
//         // AuditoVideo
//         ///////////////////////////////////////////
//         startLocalVideoTile,
//         stopLocalVideoTile,
//         setPreviewVideoElement,
//         setOutputAudioElement,
//         startPreview,
//         stopPreview,
//         bindVideoElement,
//         unbindVideoElement,

//         //////////////////////////////////////////////
//         // Device Setting
//         //////////////////////////////////////////////
//         audioInputDevice: chimeClient.audioInputDeviceSetting?.audioInput || "None",
//         noiseSuppressionType: chimeClient.audioInputDeviceSetting?.voiceFocusSpec?.variant || "None",
//         noiseSuppressionEnable: chimeClient.audioInputDeviceSetting?.audioSuppressionEnable || false,
//         videoInputDevice: chimeClient.videoInputDeviceSetting?.videoInput || "None",
//         virtualBackgroundSegmentationType: chimeClient.videoInputDeviceSetting?.virtualBackgroundSegmentationType || "None",
//         virtualBackgroundEnable: chimeClient.videoInputDeviceSetting?.virtualBackgroundEnable || false,
//         audioOutputDevice: chimeClient.audioOutputDeviceSetting?.audioOutput || "None",
//         audioInputEnable: chimeClient.audioInputDeviceSetting ? chimeClient.audioInputDeviceSetting.audioInputEnable : false,
//         isMuted: chimeClient.meetingSession?.audioVideo.realtimeIsLocalAudioMuted() || false,
//         videoInputEnable: chimeClient.videoInputDeviceSetting ? chimeClient.videoInputDeviceSetting.videoInputEnable : false,
//         audioOutputEnable: chimeClient.audioOutputDeviceSetting ? chimeClient.audioOutputDeviceSetting.audioOutputEnable : false,
//         setAudioInput,
//         setVideoInput,
//         setVirtualBackgroundSegmentationType,
//         setVirtualBackgroundEnable,
//         setBackgroundImagePath,
//         setAudioOutput,
//         setAudioInputEnable,
//         setMute,
//         setNoiseSuppressionEnable,
//         setNoiseSuppressionType,
//         setVideoInputEnable,
//         setAudioOutputEnable,

//         pauseVideo,
//         ///////////////////////////////////////////
//         // Utility
//         ///////////////////////////////////////////
//         getContentTiles,
//         getActiveSpeakerTile,
//         getAllTiles,
//         setBackgroundMusic,
//         setBackgroundMusicVolume,

//         getUserNameByAttendeeIdFromList,

//         //////////////////////////////////////////
//         /// chat
//         //////////////////////////////////////////
//         sendChatData,
//         chatData: chimeClient.chatClient?.chatData || [],
//         //////////////////////////////////////////
//         // transcribe
//         //////////////////////////////////////////
//         setTranscribeEnable,
//         setTranscribeLang,
//         transcribeEnable,
//         transcribeLang,
//         transcriptionScripts: chimeClient.transcriptionClient?.transcriptionScripts || [],
//         transcriptionPartialScript: chimeClient.transcriptionClient?.transcriptionPartialScript || null,
//     };

//     return returnValue;
// };
