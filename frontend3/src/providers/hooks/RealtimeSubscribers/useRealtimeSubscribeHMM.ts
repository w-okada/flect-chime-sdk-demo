
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


    GET_LOCAL_IP: "GET_LOCAL_IP",
    NOTIFY_LOCAL_IP: "NOTIFY_LOCAL_IP",


} as const

export type HMM_STATUS = {
    active: boolean
    recording: boolean
    local_ip?: string
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
    
    const [hMMCommandData, setHMMComandData] = useState<RealtimeData[]>([])
    const [publicIp, setPublicIp] = useState<string>("")

    const startHMM = async () =>{
        const res = await startManager(props.meetingName!, attendeeId!, props.idToken!, props.accessToken!, props.refreshToken!)
        setHMMComandData([])
        console.log("startHMM", res)
    }
    const updateHMMInfo = async () =>{
        const res = await getManagerInfo(props.meetingName!, attendeeId!, props.idToken!, props.accessToken!, props.refreshToken!)
        const publicIp = res.publicIp
        console.log(" getHMMInfo ", res, publicIp)
        setPublicIp(publicIp)
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

    const receiveData = (mess: DataMessage) => {
        const senderId = mess.senderAttendeeId
        const data = JSON.parse(mess.text()) as RealtimeData
        data.senderId = senderId
        logger.log(data)
        if(hMMCommandData.length === 0){
            updateHMMInfo()
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
    return {sendHMMCommand, hMMCommandData, startHMM, updateHMMInfo, publicIp}
}