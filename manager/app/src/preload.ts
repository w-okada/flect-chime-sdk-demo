import { app, contextBridge, ipcRenderer, desktopCapturer } from 'electron';
import { IpcRendererEvent } from 'electron/main'

contextBridge.exposeInMainWorld('myAPI', {
    getWindowId: async (): Promise<string | null> => {
        const sources = await desktopCapturer.getSources({ types: ['window', 'screen'] })
        let targetId: string | null = null
        for (let source of sources) {
            console.log(`name ${source.name}, ${source.display_id}, ${source.id}`);
            if (source.name === "Entire Screen" || source.name === "CHIME_MANAGER") {
                targetId = source.id
            }
        }
        return targetId
    },
    getEnvVars: (): { [key: string]: string|undefined } => {
        console.log(process.env)

        const {CODE, UUID, MEETING_NAME, ATTENDEE_ID, RESTAPI_ENDPOINT} = process.env
        return  {CODE, UUID, MEETING_NAME, ATTENDEE_ID, RESTAPI_ENDPOINT}

    },
    finalize: (): void => {
        ipcRenderer.invoke('finalize', 'ping')
    },
    onAmongusUpdateMessage: (listener: (message: string) => void) =>{
        ipcRenderer.on('amongus-gamestate-updated', (ev: IpcRendererEvent, message: string) => listener(message))
    }
});
