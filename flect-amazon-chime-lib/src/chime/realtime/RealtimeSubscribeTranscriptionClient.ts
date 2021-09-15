
import { DataMessage, Transcript, TranscriptEvent, TranscriptionStatus, TranscriptionStatusType } from "amazon-chime-sdk-js";
import { RealtimeData, RealtimeDataApp } from "./const";
import { v4 } from 'uuid';
import { FlectChimeClient } from "../FlectChimeClient";



const LANGUAGES_NO_WORD_SEPARATOR = new Set([
    'ja-JP',
    'zh-CN',
]);


export type TranscriptionScript = {
    userName: string
    startTime: number
    endTime: number
    script: string
    langCode: string
}

export interface RealtimeSubscribeTranscriptionClientListener {
    transcriptionStatusUpdated: () => void
}

export class RealtimeSubscribeTranscriptionClient {
    private _chimeClient: FlectChimeClient
    constructor(chimeClient: FlectChimeClient) {
        this._chimeClient = chimeClient

        this._chimeClient.meetingSession?.audioVideo.transcriptionController?.subscribeToTranscriptEvent(this.transcriptionEventRecieved)
    }


    private _noWordSeparatorForTranscription = false
    private _languageCode = null

    private _isTranscriptionEnabled = false
    get isTranscriptionEnabled(): boolean {
        return this._isTranscriptionEnabled
    }

    private _transcriptionPartialScript: TranscriptionScript | null = null
    get transcriptionPartialScript(): TranscriptionScript | null {
        return this._transcriptionPartialScript
    }

    private _transcriptionScripts: TranscriptionScript[] = []
    get transcriptionScripts(): TranscriptionScript[] {
        return this._transcriptionScripts
    }


    ///////
    // Listener
    ///////
    private _realtimeSubscribeTranscriptionClientListener: RealtimeSubscribeTranscriptionClientListener | null = null
    setRealtimeSubscribeTranscriptionClientListener = (l: RealtimeSubscribeTranscriptionClientListener | null) => {
        this._realtimeSubscribeTranscriptionClientListener = l
    }


    transcriptionEventRecieved = (transcriptEvent: TranscriptEvent) => {
        console.log("[FlectChimeClient][TRANSCRIBE] Receive Event:", transcriptEvent)

        if (transcriptEvent instanceof TranscriptionStatus) {
            console.log(`[FlectChimeClient][TRANSCRIBE] Status, type: ${transcriptEvent.type}, time:${transcriptEvent.eventTimeMs}, message:${transcriptEvent.message}, region:${transcriptEvent.transcriptionRegion}`)
            console.log(`[FlectChimeClient][TRANSCRIBE] Status, conf: ${transcriptEvent.transcriptionConfiguration}`)

            if (transcriptEvent.type === TranscriptionStatusType.STARTED) {
                console.log("[FlectChimeClient][TRANSCRIBE] Status: Started", transcriptEvent.transcriptionConfiguration)
                const transcriptionConfiguration = JSON.parse(transcriptEvent.transcriptionConfiguration);
                if (transcriptionConfiguration) {
                    if (transcriptionConfiguration.EngineTranscribeSettings) {
                        this._languageCode = transcriptionConfiguration.EngineTranscribeSettings.LanguageCode;
                    } else if (transcriptionConfiguration.EngineTranscribeMedicalSettings) {
                        this._languageCode = transcriptionConfiguration.EngineTranscribeMedicalSettings.languageCode;
                    }
                }

                if (this._languageCode && LANGUAGES_NO_WORD_SEPARATOR.has(this._languageCode!)) {
                    this._noWordSeparatorForTranscription = true
                } else {
                    this._noWordSeparatorForTranscription = false
                }
                console.log(`[FlectChimeClient][TRANSCRIBE] Lang:${this._languageCode} noSeparateor:${this._noWordSeparatorForTranscription}`)
                this._isTranscriptionEnabled = true
                this._realtimeSubscribeTranscriptionClientListener?.transcriptionStatusUpdated()
            } else if (transcriptEvent.type === TranscriptionStatusType.STOPPED) {
                console.log("[FlectChimeClient][TRANSCRIBE] Status: Stopped")
                this._isTranscriptionEnabled = false
                this._realtimeSubscribeTranscriptionClientListener?.transcriptionStatusUpdated()
            } else {
                console.log("[FlectChimeClient][TRANSCRIBE] Status: other", transcriptEvent.type)
            }

        } else if (transcriptEvent instanceof Transcript) {
            console.log("[FlectChimeClient][TRANSCRIBE] Scripts:", transcriptEvent.results)

            for (const result of transcriptEvent.results) {
                console.log(`[FlectChimeClient][TRANSCRIBE] result: id:${result.resultId} channel:${result.channelId} time(${result.startTimeMs}-${result.endTimeMs}) partial:${result.isPartial}`)

                for (const alt of result.alternatives) {
                    console.log(`[FlectChimeClient][TRANSCRIBE] alt: ${alt.transcript}`)
                    let userName = ""
                    for (const item of alt.items) {
                        // console.log(`[FlectChimeClient][TRANSCRIBE] item: attendeeId:${item.attendee.attendeeId}, time:(${item.startTimeMs}-${item.endTimeMs}) type:${item.type}`)
                        // console.log(`[FlectChimeClient][TRANSCRIBE] item: content:${item.content}`)
                        userName = this._chimeClient.getUserNameByAttendeeIdFromList(item.attendee.attendeeId)
                    }

                    const newScript: TranscriptionScript = {
                        startTime: result.startTimeMs,
                        endTime: result.endTimeMs,
                        userName: userName,
                        script: alt.transcript,
                        langCode: this._languageCode || "",
                    }
                    if (result.isPartial) {
                        this._transcriptionPartialScript = newScript
                    } else {
                        this._transcriptionScripts = [...this._transcriptionScripts, newScript]
                        this._transcriptionPartialScript = null
                    }
                    this._realtimeSubscribeTranscriptionClientListener?.transcriptionStatusUpdated()
                }
            }
        } else {
            console.log("[TRANSCRIBE] unknown type", transcriptEvent)
        }
    }
}
