import * as Chime from "@aws-sdk/client-chime"
import { ChimeClient } from "@aws-sdk/client-chime";
import { useMemo, useState } from "react";
import { StateControlCheckbox, useStateControlCheckbox } from "../100_components/hooks/useStateControlCheckbox";
import { StateControlRadioButtons, useStateControlRadioButton } from "../100_components/hooks/useStateControlRadioButton";
import { generateDateString } from "../999_misc/dateString";
import { Recorder } from "../999_misc/Recorder";
import { CognitoClientStateAndMethods } from "./001_useCognitoClient";
import { BackendManagerStateAndMethod } from "./002_useBackendManager";
import { ChimeClientStateAndMethods } from "./003_useChimeClient";
import { DeviceInfoStateAndMethods } from "./004_useDeviceState";
import { MessagingClientStateAndMethod } from "./005_useMessagingClient";
import { S3ClientStateAndMethod } from "./006_useS3Client";

export type UseFrontendProps = {
    cognitoClientState: CognitoClientStateAndMethods;
    backendManagerState: BackendManagerStateAndMethod;
    chimeClientState: ChimeClientStateAndMethods;
    deviceState: DeviceInfoStateAndMethods;
    messagingClientState: MessagingClientStateAndMethod;
    s3ClinetState: S3ClientStateAndMethod
}


export const ViewTypes = {
    feature: "feature",
    grid: "grid",
} as const;
export type ViewTypes = typeof ViewTypes[keyof typeof ViewTypes];

export type FrontendMeetingInfo = {
    meetingInfo: Chime.Meeting,
    attendeeInfo: Chime.Attendee,
    meetingName: string,
    attendeeName: string,
}

export type StateControls = {
    openSidebarCheckbox: StateControlCheckbox

    openBottomNavCheckbox: StateControlCheckbox
    openRightSidebarCheckbox: StateControlCheckbox

    micEnableCheckbox: StateControlCheckbox
    cameraEnableCheckbox: StateControlCheckbox
    speakerEnableCheckbox: StateControlCheckbox

    viewRadioButtons: StateControlRadioButtons

    shareScreenCheckbox: StateControlCheckbox
    startTranscribeCheckbox: StateControlCheckbox
    startRecordingCheckbox: StateControlCheckbox

    settingCheckbox: StateControlCheckbox
    leaveCheckbox: StateControlCheckbox


    signInCheckbox: StateControlCheckbox,
    createRoomCheckbox: StateControlCheckbox,
    joinRoomCheckbox: StateControlCheckbox,
    loadingUserInformationCheckbox: StateControlCheckbox,

    showSelfCameraViewCheckbox: StateControlCheckbox,
}
export type JoinRoomDialogProps = {
    exMeetingId: string,
    meetingName: string,
    useCode: boolean,
    secret: boolean,

    //// ↓ secret roomの時に確定できないので、ここでは設定しない。
    ////  join後にroominfoを取得してchannelArnを特定することにする。 
    //channelArn: string;
}

export type FrontendState = {
    // (1) User Information
    username: string
    setUserName: (name: string) => void
    viewType: ViewTypes
    setViewType: (val: ViewTypes) => void
    currentMeetingInfo: FrontendMeetingInfo | undefined
    setCurrentMeetingInfo: (val: FrontendMeetingInfo) => void

    // // (2) GUI Control
    stateControls: StateControls
    joinRoomDialogProps: JoinRoomDialogProps
    setJoinRoomDialogProps: (val: JoinRoomDialogProps) => void

    // (x) Recorder
    recorder: Recorder
};

export const useFrontend = (props: UseFrontendProps) => {
    // (1) User Information
    const [username, setUserName] = useState<string>("")
    const [viewType, setViewType] = useState<ViewTypes>(ViewTypes.feature)
    const [currentMeetingInfo, setCurrentMeetingInfo] = useState<FrontendMeetingInfo>()
    // (2) GUI Control
    //// (2-1) Frame 関連
    const openSidebarCheckbox = useStateControlCheckbox("open-sidebar-checkbox");
    const openBottomNavCheckbox = useStateControlCheckbox("open-bottom-nav-checkbox");
    const openRightSidebarCheckbox = useStateControlCheckbox("open-right-sidebar-checkbox");

    //// (2-2) DeviceEnabler 関連
    const micEnableCheckbox = useStateControlCheckbox("mic-enable-checkbox", (newVal: boolean) => {
        props.deviceState.setAudioInputEnable(newVal);
    });
    const cameraEnableCheckbox = useStateControlCheckbox("camera-enable-checkbox", (newVal: boolean) => {
        props.deviceState.setVideoInputEnable(newVal);
    });
    const speakerEnableCheckbox = useStateControlCheckbox("speaker-enable-checkbox", (newVal: boolean) => {
        props.deviceState.setAudioOutputEnable(newVal);
    });

    //// (2-3) View 関連
    const viewRadioButtons = useStateControlRadioButton("view-radio-button", [ViewTypes.feature, ViewTypes.grid], (suffix: string) => {
        setViewType(suffix as ViewTypes);
    });

    //// (2-4) Util 関連
    const shareScreenCheckbox = useStateControlCheckbox("share-screen-checkbox", (newVal: boolean) => {
        const handleShareScreen = () => {
            if (newVal) {
                props.chimeClientState.startScreenShare().then((res) => {
                    if (!res) {
                        shareScreenCheckbox.updateState(false);
                    }
                });
            } else {
                props.chimeClientState.stopScreenShare();
            }
        };
        handleShareScreen();
    });
    const startTranscribeCheckbox = useStateControlCheckbox("start-transcribe-checkbox");
    const startRecording = useMemo(() => {
        return (newVal: boolean) => {
            if (newVal) {
                recorder.startRecording(1000 * 5, async (data: Blob) => {
                    console.log("[s3] uploading....")
                    const dateString = generateDateString()
                    const key = `recording/${props.chimeClientState.getCurrentExMeetingId()}/${props.backendManagerState.getCurrentEnvironment()?.userInfoInServer.exUserId || "unknown-user"}/${dateString}.mp4`
                    await props.s3ClinetState.putObject(key, data)
                })
            } else {
                recorder.stopRecording()
            }
        }
    }, [props.chimeClientState.exMeetingId, props.backendManagerState.environment?.userInfoInServer.exUserId])
    const startRecordingCheckbox = useStateControlCheckbox("start-recording-checkbox", startRecording);

    //// (2-5) Dialog-1
    const settingCheckbox = useStateControlCheckbox("setting-checkbox");
    const leaveCheckbox = useStateControlCheckbox("leave-checkbox");


    //// (2-6) Dialog-2
    const signInCheckbox = useStateControlCheckbox("sign-in-checkbox");
    const createRoomCheckbox = useStateControlCheckbox("create-room-checkbox");
    const joinRoomCheckbox = useStateControlCheckbox("join-room-checkbox");
    const loadingUserInformationCheckbox = useStateControlCheckbox("loading-user-information-checkbox");

    //// (2-7) Util-2
    const showSelfCameraViewCheckbox = useStateControlCheckbox("show-self-camera-view-checkbox");


    // (3) DialogProp
    const [joinRoomDialogProps, setJoinRoomDialogProps] = useState<JoinRoomDialogProps>({
        exMeetingId: "",
        meetingName: "",
        useCode: false,
        secret: false,
    })

    // (X) Recorder
    const recorder = useMemo(() => {
        return new Recorder()
    }, [])

    const returnValue: FrontendState = {
        // (1) User Information
        username,
        setUserName,
        viewType,
        setViewType,
        currentMeetingInfo,
        setCurrentMeetingInfo,
        // // (2) GUI Control
        stateControls: {
            openSidebarCheckbox,
            openBottomNavCheckbox,
            openRightSidebarCheckbox,

            micEnableCheckbox,
            cameraEnableCheckbox,
            speakerEnableCheckbox,

            viewRadioButtons,

            shareScreenCheckbox,
            startTranscribeCheckbox,
            startRecordingCheckbox,

            settingCheckbox,
            leaveCheckbox,

            signInCheckbox,
            createRoomCheckbox,
            joinRoomCheckbox,
            loadingUserInformationCheckbox,

            showSelfCameraViewCheckbox,
        },
        joinRoomDialogProps,
        setJoinRoomDialogProps,

        // (X) Recorder
        recorder

    };
    return returnValue;
};
