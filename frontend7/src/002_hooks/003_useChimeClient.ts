import { VideoTileState } from "amazon-chime-sdk-js";
import * as Chime from "@aws-sdk/client-chime"
import { useEffect, useMemo, useState } from "react";
import { AttendeeState, FlectChimeClient, FlectChimeClientListener, MeetingInfo } from "../001_clients_and_managers/003_chime/FlectChimeClient";
import { GetAttendeeInfoRequest, GetAttendeeInfoResponse } from "./002_useBackendManager";
import { ChimeAudioInputDevice, ChimeAudioOutputDevice, ChimeAudioOutputElement, ChimeVideoInputDevice } from "./004_useDeviceState";


export type UseChimeClientProps = {
    // 名前の解決のためにRestAPIをパラメータとして渡す
    getAttendeeInfo: (params: GetAttendeeInfoRequest) => Promise<GetAttendeeInfoResponse | null>
};

export type ChimeClientState = {
    chimeClient: FlectChimeClient
    meetingName: string,
    attendees: AttendeeList
    videoTileStates: VideoTileStateList
    activeSpeakerId: string | null
}
export type ChimeClientStateAndMethods = ChimeClientState & {
    joinMeeting: (meetingName: string, meetingInfo: Chime.Meeting, attendeeInfo: Chime.Attendee) => Promise<void>
    enterMeeting: (audioInput: ChimeAudioInputDevice, videoInput: ChimeVideoInputDevice, audioOutput: ChimeAudioOutputDevice, audioOutputElement: ChimeAudioOutputElement) => Promise<void>
    leaveMeeting: () => void

    setAudioInput: (audioInput: ChimeAudioInputDevice) => Promise<void>
    setVideoInput: (videoInput: ChimeVideoInputDevice) => Promise<void>
    setAudioOutput: (audioOutput: ChimeAudioOutputDevice) => Promise<void>
    isLocalVideoStarted: () => boolean

    startScreenShare: () => Promise<boolean>
    stopScreenShare: () => void

    bindVideoElement: (tileId: number, videoElement: HTMLVideoElement) => void

}

export type AttendeeList = { [attendeeId: string]: AttendeeState; }
export type VideoTileStateList = { [attendeeId: string]: VideoTileState; }
export const useChimeClient = (props: UseChimeClientProps): ChimeClientStateAndMethods => {
    const [meetingName, setMeetingName] = useState<string>("")
    const [attendees, setAttendees] = useState<AttendeeList>({})
    const [videoTileStates, setVideoTileStates] = useState<VideoTileStateList>({})
    const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null)

    const chimeClient = useMemo(() => {
        return new FlectChimeClient()
    }, [])

    // console.log("meeting state::Attendee:", attendees)
    // console.log("meeting state::VideoTiles:", videoTileStates)
    // console.log("meeting state::ActiveSpeaker:", activeSpeakerId)

    // () リスナーの設定
    // useEffectで設定する。REST APIが有効になったタイミングか、会議室名が変わったとき(入室時 joinMeeting)に再設定
    // updateされる値が関数内に保存されないように、配列全体をclientクラスからパラメータとしてもらい、全体をstateに設定しなおすことに注意。
    useEffect(() => {
        const l: FlectChimeClientListener = {
            meetingStateUpdated: (): void => {
                console.log("meeting state update....")
            },
            activeSpekaerUpdated: (activeSpeakerId: string | null): void => {
                setActiveSpeakerId(activeSpeakerId) // 冪等性
            },
            attendeesUpdated: (list: { [attendeeId: string]: AttendeeState; }): void => {
                const updateAttendeeList = async () => {
                    for (let x of Object.values(list)) {
                        if (x.attendeeName === null) {
                            if (!x.isSharedContent) {
                                const info = await props.getAttendeeInfo({
                                    meetingName: meetingName,
                                    attendeeId: x.attendeeId
                                })
                                x.attendeeName = info?.attendeeName || null
                            } else {
                                console.log("OWNER:::", x.ownerId)
                                const info = await props.getAttendeeInfo({
                                    meetingName: meetingName,
                                    attendeeId: x.ownerId
                                })
                                x.attendeeName = info?.attendeeName || null
                                if (x.attendeeName) {
                                    x.attendeeName = `Content(${x.attendeeName})`
                                }
                            }
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



    //// (1) join
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

    //// (2) enter
    const enterMeeting = useMemo(() => {
        return async (audioInput: ChimeAudioInputDevice, videoInput: ChimeVideoInputDevice, audioOutput: ChimeAudioOutputDevice, audioOutputElement: ChimeAudioOutputElement) => {
            if (!chimeClient) {
                console.warn("chime client is not initialized.")
                return
            }
            await chimeClient.enterMeeting(audioInput, videoInput, audioOutput, audioOutputElement);
        }
    }, [chimeClient])

    //// (3) leave
    const leaveMeeting = useMemo(() => {
        return () => {
            chimeClient.leaveMeeting()
        }
    }, [])

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
    const isLocalVideoStarted = () => {
        return chimeClient.isLocalVideoStarted()
    }

    // Tiles
    const bindVideoElement = (tileId: number, videoElement: HTMLVideoElement) => {
        chimeClient.bindVideoElement(tileId, videoElement)
    }

    // Feature
    const startScreenShare = async () => {
        const ms = await chimeClient.startScreenShare()
        if (!ms) {
            return false
        } else {
            return true
        }
    }
    const stopScreenShare = () => {
        chimeClient.stopScreenShare()
    }

    const returnValue: ChimeClientStateAndMethods = {
        chimeClient,
        meetingName,
        attendees,
        videoTileStates,
        activeSpeakerId,
        // (1) Meetings
        joinMeeting,
        enterMeeting,
        leaveMeeting,

        setAudioInput,
        setVideoInput,
        setAudioOutput,
        isLocalVideoStarted,

        startScreenShare,
        stopScreenShare,

        bindVideoElement,
    }
    return returnValue
}
