import { DataMessage } from "amazon-chime-sdk-js"
import { RestApiClient } from "../../rest/RestApiClient"
import { FlectChimeClient } from "../FlectChimeClient"
import { RealtimeData, RealtimeDataApp } from "./const"
import { v4 } from 'uuid';
export const HMMCmd = {
    START_RECORD: "START_RECORD",
    STOP_RECORD: "STOP_RECORD",
    // START_RECORD_TILEVIEW  : "START_RECORD_TILEVIEW",
    // STOP_RECORD_TILEVIEW   : "STOP_RECORD_TILEVIEW",
    START_SHARE_TILEVIEW: "START_SHARE_TILEVIEW",
    STOP_SHARE_TILEVIEW: "STOP_SHARE_TILEVIEW",
    TERMINATE: "TERMINATE",
    NOTIFY_STATUS: "NOTIFY_STATUS",

    NOTIFY_AMONGUS_STATUS: "NOTIFY_AMONGUS_STATUS",
    REGISTER_AMONGUS_USER_NAME: "REGISTER_AMONGUS_USER_NAME",
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

type PlayerState = {
    name: string
    isDead: boolean
    isDeadDiscovered: boolean
    disconnected: boolean
    color: number
    action: number
    attendeeId?: string
    chimeName?: string
}

export type GameState = {
    hmmAttendeeId: string
    state: number
    lobbyCode: string
    gameRegion: number
    map: number
    connectCode: string
    players: PlayerState[]

}


export interface RealtimeSubscribeHMMClientListener {
    startRecordRequestReceived: () => void
    stopRecordRequestReceived: () => void
    startShareTileviewRequestReceived: () => void
    stopShareTileviewRequestReceived: () => void

    terminateRequestReceived: () => void
    notificationReceived: (status: HMMStatus) => void

    amongusNotificationReceived: (gameState: GameState) => void
    registerAmongusUserNameRequestReceived: (userName: string, attendeeId: string) => void
}


export class RealtimeSubscribeHMMClient {
    private _chimeClient: FlectChimeClient
    private _restApiClient: RestApiClient
    constructor(chimeClient: FlectChimeClient, restApiClient: RestApiClient) {
        this._chimeClient = chimeClient
        this._restApiClient = restApiClient
        this._chimeClient.meetingSession?.audioVideo?.realtimeSubscribeToReceiveDataMessage(
            RealtimeDataApp.HMM,
            this.receiveHMMData
        )
    }

    private _hMMCommandData: RealtimeData[] = []
    private _listener: RealtimeSubscribeHMMClientListener = {
        startRecordRequestReceived: () => { },
        stopRecordRequestReceived: () => { },
        startShareTileviewRequestReceived: () => { },
        stopShareTileviewRequestReceived: () => { },
        terminateRequestReceived: () => { },
        notificationReceived: (status: HMMStatus) => { },
        amongusNotificationReceived: (gameState: GameState) => { },
        registerAmongusUserNameRequestReceived: (userName: string, attendeeId: string) => { },
    }
    set realtimeSubscribeHMMClientListener(l: RealtimeSubscribeHMMClientListener) {
        this._listener = l
    }

    private _hmmPublicIp: string | null = null
    get hmmPublicIp(): string | null { return this._hmmPublicIp }
    private _hmmLastStatus: string | null = null
    get hmmLastStatus(): string | null { return this._hmmLastStatus }

    private _hmmActive: boolean = false
    get hmmActive(): boolean { return this._hmmActive }
    private _hmmRecording: boolean = false
    get hmmRecording(): boolean { return this._hmmRecording }
    private _hmmShareTileview: boolean = false
    get hmmShareTileview(): boolean { return this._hmmShareTileview }

    private _hmmLastUpdate: number = 0
    get hmmLastUpdate(): number { return this._hmmLastUpdate }


    /////////
    // Manage HMM via RestAPI
    /////////
    startHMM = async () => {
        const res = await this._restApiClient.startManager(this._chimeClient.meetingName!, this._chimeClient.attendeeId!)
        console.log("[RealtimeSubscribeHMMClient] start HMM", res)
        this._hMMCommandData = []
    }

    updateHMMInfo = async () => {
        const res = await this._restApiClient.getManagerInfo(this._chimeClient.meetingName!, this._chimeClient.attendeeId!)
        console.log("[RealtimeSubscribeHMMClient] updateHMMInfo", res)
        if (res.code === "EXIST_CHECK_EXCEPTION") {
            this._hmmPublicIp = "N/A"
            this._hmmLastStatus = "N/A"
            this._hmmActive = false
            this._hmmRecording = false
            this._hmmShareTileview = false
        } else if (res.code === "SUCCESS") {
            this._hmmPublicIp = res.publicIp
            this._hmmLastStatus = res.lastStatus
        }
    }

    ///////////////////////////////
    // Send Command
    ///////////////////////////////
    //// 1. Common
    sendHMMCommand = (mess: HMMMessage) => {
        const reatimeData: RealtimeData = {
            uuid: v4(),
            action: 'sendmessage',
            app: RealtimeDataApp.HMM,
            data: mess,
            createdDate: new Date().getTime(),
            senderId: this._chimeClient.attendeeId!
        }
        this._chimeClient.meetingSession!.audioVideo!.realtimeSendDataMessage(RealtimeDataApp.HMM, JSON.stringify(reatimeData))
    }


    //// 2. for client
    sendStartRecord = () => {
        this.sendHMMCommand( {command: HMMCmd.START_RECORD} )
    }
    sendStopRecord = () => {
        this.sendHMMCommand( {command: HMMCmd.STOP_RECORD} )
    }
    sendStartShareTileView = () => {
        this.sendHMMCommand( {command: HMMCmd.START_SHARE_TILEVIEW} )
    }
    sendStopShareTileView = () => {
        this.sendHMMCommand( {command: HMMCmd.STOP_SHARE_TILEVIEW} )
    }
    sendTerminate = () =>{
        this.sendHMMCommand( {command: HMMCmd.TERMINATE} )
    }

    sendRegisterAmongUsUserName = (userName:string, attendeeId:string) =>{
        this.sendHMMCommand({command:HMMCmd.REGISTER_AMONGUS_USER_NAME, data:[userName, attendeeId]})
    }


    //// 3. for hmm
    sendHMMStatus = (active:boolean, recording:boolean, shareTileView:boolean) =>{
        const status:HMMStatus = {
            active,
            recording,
            shareTileView
        }
        this.sendHMMCommand({command:HMMCmd.NOTIFY_STATUS, data:status})
    }

    sendAmongusStatus = (gameState:GameState) =>{
        this.sendHMMCommand({command:HMMCmd.NOTIFY_AMONGUS_STATUS, data:gameState})
    }




    ///////////////////////////////
    // Receive Command
    ///////////////////////////////
    receiveHMMData = (dataMessage: DataMessage) => {
        const senderId = dataMessage.senderAttendeeId
        const data = JSON.parse(dataMessage.text()) as RealtimeData
        data.senderId = senderId
        console.log("[RealtimeSubscribeHMMClient] ReceiveData:", data)

        if (this._hMMCommandData.length === 0) {
            this.updateHMMInfo()
        }

        const mess = data.data as HMMMessage
        console.log("RECEIVE REALTIME DATA", mess.command)
        switch (mess.command) {
            case "START_RECORD":
                console.log("RECEIVE REALTIME DATA1", JSON.stringify(mess))
                this._listener.startRecordRequestReceived()
                break
            case "STOP_RECORD":
                console.log("RECEIVE REALTIME DATA2", JSON.stringify(mess))
                this._listener.stopRecordRequestReceived()
                break
            case "START_SHARE_TILEVIEW":
                console.log("RECEIVE REALTIME DATA3", JSON.stringify(mess))
                this._listener.startShareTileviewRequestReceived()
                break
            case "STOP_SHARE_TILEVIEW":
                console.log("RECEIVE REALTIME DATA4", JSON.stringify(mess))
                this._listener.stopShareTileviewRequestReceived()
                break
            case "TERMINATE":
                console.log("RECEIVE REALTIME DATA5", JSON.stringify(mess))
                this._listener.terminateRequestReceived()
                break
            case "NOTIFY_STATUS":
                console.log("RECEIVE REALTIME DATA6-1", JSON.stringify(mess))
                const status = mess.data as HMMStatus
                console.log("RECEIVE REALTIME DATA6-2", status)
                this._hmmShareTileview = status.active
                this._hmmRecording = status.recording
                this._hmmShareTileview = status.shareTileView
                this._hmmLastUpdate = new Date().getTime() 
                this._listener.notificationReceived(status)
                break
            case "NOTIFY_AMONGUS_STATUS": // handle by client
                console.log("RECEIVE REALTIME DATA7-1", JSON.stringify(mess))
                const gameState = mess.data as GameState
                console.log("RECEIVE REALTIME DATA7-2", JSON.stringify(gameState))
                this._listener.amongusNotificationReceived(gameState)
                break
            case "REGISTER_AMONGUS_USER_NAME": // handle by hmm
                console.log("RECEIVE REALTIME DATA8-1", JSON.stringify(mess))
                const [userName, attendeeId] = mess.data as string[]
                console.log("RECEIVE REALTIME DATA8-2", userName, attendeeId)
                this._listener.registerAmongusUserNameRequestReceived(userName, attendeeId)
                break

        }
        this._hMMCommandData.push(data)
    }
}