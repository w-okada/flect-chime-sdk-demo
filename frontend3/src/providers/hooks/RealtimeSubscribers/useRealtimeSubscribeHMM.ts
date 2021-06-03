
import { DefaultMeetingSession, DataMessage } from "amazon-chime-sdk-js";
import { useEffect, useMemo, useState } from "react";
import { RealtimeData, RealtimeDataApp} from "./const";
import { v4 } from 'uuid';
import { LocalLogger } from "../../../utils/localLogger";
import { getManagerInfo, startManager } from "../../../api/api";


export const HMMCmd = {
    START_RECORD:"START_RECORD",
    STOP_RECORD: "STOP_RECORD",
    START_SHARE_TILEVIEW: "START_SHARE_TILEVIEW",
    STOP_SHARE_TILEVIEW: "STOP_SHARE_TILEVIEW",
    TERMINATE: "TERMINATE",
    NOTIFY_STATUS: "NOTIFY_STATUS",

    NOTIFY_AMONGUS_STATUS: "NOTIFY_AMONGUS_STATUS",
} as const

export type HMMStatus = {
    active: boolean
    recording: boolean
    shareTileView: boolean
}

export type AmongUsStatus = {
    event: string,
    data: string
}

export type HMMMessage = {
    command: keyof typeof HMMCmd,
    data?: any
}

type UseRealtimeSubscribeHMMProps = {
    meetingSession?:DefaultMeetingSession
    attendeeId:string

    meetingName?: string
    idToken?: string
    accessToken?: string
    refreshToken?: string
}

const logger = new LocalLogger("useRealtimeSubscribeHMM")

export const useRealtimeSubscribeHMM = (props: UseRealtimeSubscribeHMMProps) =>{    
    const meetingSession = useMemo(()=>{
        return props.meetingSession
    },[props.meetingSession])
    const attendeeId = useMemo(()=>{
        return props.attendeeId
    },[props.attendeeId])
    
    const [ hMMCommandData, setHMMComandData] = useState<RealtimeData[]>([])
    const [ publicIp, setPublicIp] = useState<string>("")

    // const [ recordingEnable, setRecordingEnable]         = useState(false)
    const [ startRecordingCounter, setStartRecordingCounter] = useState(0)
    const [ stopRecordingCounter, setStopRecordingCounter] = useState(0)

    // const [ shareTileViewEnable, setShareTileViewEnable] = useState(false)
    const [ startShareTileViewCounter, setStartShareTileViewCounter ] = useState(0)
    const [ stopShareTileViewCounter, setSopShareTileViewCounter ] = useState(0)

    // const [ terminateTriggerd, setTerminateTriggerd]     = useState(false)
    const [ terminateCounter, setTerminateCounter] = useState(0)
    const [ amongUsStates, setAmongUsStates] = useState<AmongUsStatus[]>([])


    const [ hMMStatus, setHMMStatus] = useState<HMMStatus>({
        active:false,
        recording:false,
        shareTileView:false,
    })
    const [ stateLastUpdate, setStateLastUpdate] = useState(new Date().getTime())

    const startHMM = async () =>{
        const res = await startManager(props.meetingName!, attendeeId!, props.idToken!, props.accessToken!, props.refreshToken!)
        console.log("startHMM RES:",res)
        setHMMComandData([])
    }
    const updateHMMInfo = async () =>{
        const res = await getManagerInfo(props.meetingName!, attendeeId!, props.idToken!, props.accessToken!, props.refreshToken!)
        const publicIp = res.publicIp
        setPublicIp(publicIp)
    }

    const sendStartRecord = () => {
        sendHMMCommand( {command: HMMCmd.START_RECORD} )
    }
    const sendStopRecord = () => {
        sendHMMCommand( {command: HMMCmd.STOP_RECORD} )
    }
    const sendStartShareTileView = () => {
        sendHMMCommand( {command: HMMCmd.START_SHARE_TILEVIEW} )
    }
    const sendStopShareTileView = () => {
        sendHMMCommand( {command: HMMCmd.STOP_SHARE_TILEVIEW} )
    }
    const sendTerminate = () =>{
        sendHMMCommand( {command: HMMCmd.TERMINATE} )
    }
    const sendHMMStatus = (active:boolean, recording:boolean, shareTileView:boolean) =>{
        const status:HMMStatus = {
            active,
            recording,
            shareTileView
        }
        sendHMMCommand({command:HMMCmd.NOTIFY_STATUS, data:status})
    }

    const sendAmongUsStatus = (event:string, data:string) =>{
        const status:AmongUsStatus = {
            event,
            data
        }
        console.log(`AMONGUS SEND STATUS: ${event}, ${data}`)
        sendHMMCommand({command:HMMCmd.NOTIFY_AMONGUS_STATUS, data:status})
    }


    const sendHMMCommand = (mess: HMMMessage) => {
        logger.log(`sendCommand: ${attendeeId}`)
        const reatimeData: RealtimeData = {
            uuid: v4(),
            action: 'sendmessage',
            app: RealtimeDataApp.HMM,
            data: mess,
            createdDate: new Date().getTime(),
            senderId: attendeeId
        }
        meetingSession?.audioVideo!.realtimeSendDataMessage(RealtimeDataApp.HMM , JSON.stringify(reatimeData))
    }

    const receiveData = (dataMessage: DataMessage) => {
        const senderId = dataMessage.senderAttendeeId
        const data = JSON.parse(dataMessage.text()) as RealtimeData
        data.senderId = senderId
        logger.log(data)
        if(hMMCommandData.length === 0){
            updateHMMInfo()
        }

        const mess = data.data as HMMMessage
        console.log("RECEIVE REALTIME DATA", mess)
        switch(mess.command){
            case "START_RECORD":
                // setRecordingEnable(true)
                console.log("RECEIVE REALTIME DATA1", mess)
                setStartRecordingCounter(startRecordingCounter+1)
                break
            case "STOP_RECORD":
                console.log("RECEIVE REALTIME DATA2", mess)
                // setRecordingEnable(false)
                setStopRecordingCounter(stopRecordingCounter+1)
                break
            case "START_SHARE_TILEVIEW":
                console.log("RECEIVE REALTIME DATA3", mess)
                // setShareTileViewEnable(true)
                setStartShareTileViewCounter(startShareTileViewCounter+1)
                break
            case "STOP_SHARE_TILEVIEW":
                console.log("RECEIVE REALTIME DATA4", mess)
                // setShareTileViewEnable(false)
                setSopShareTileViewCounter(stopShareTileViewCounter+1)
                break
            case "TERMINATE":
                //setTerminateTriggerd(true)
                console.log("RECEIVE REALTIME DATA4", mess)
                setTerminateCounter(terminateCounter+1)
                break
            case "NOTIFY_STATUS":
                const status = mess.data as HMMStatus
                setHMMStatus(status)
                setStateLastUpdate(new Date().getTime())
                break
            case "NOTIFY_AMONGUS_STATUS":
                const amongUsStatus = mess.data as AmongUsStatus
                console.log(`AMONGUS recieve STATUS: ${amongUsStatus.event}, ${amongUsStatus.data}`)
                setAmongUsStates([...amongUsStates, amongUsStatus])
                break
        }
        setHMMComandData([...hMMCommandData, data])
    }

    useEffect(() => {
        meetingSession?.audioVideo?.realtimeSubscribeToReceiveDataMessage(
            RealtimeDataApp.HMM,
            receiveData
        )
        return () => {
            meetingSession?.audioVideo?.realtimeUnsubscribeFromReceiveDataMessage(RealtimeDataApp.HMM)
        }
    })
    return {
        sendHMMCommand, hMMCommandData, startHMM, updateHMMInfo, publicIp,
        sendStartRecord, sendStopRecord, sendStartShareTileView, sendStopShareTileView, sendTerminate, sendHMMStatus,
        startRecordingCounter, stopRecordingCounter, startShareTileViewCounter, stopShareTileViewCounter, terminateCounter, hMMStatus, stateLastUpdate,
        sendAmongUsStatus, amongUsStates
    }
}