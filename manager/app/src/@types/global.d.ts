declare global {
  interface Window {
    myAPI: Sandbox;
  }
}

export interface Sandbox {
  getWindowId: () => Promise<null | string>
  getEnvVars: ()=> {[key:string]:string} 
  finalize: ()=> void
  recorderDataAvailable1: (file:string, data:Uint8Array)=> void
  recorderDataAvailable2: (file:string, data:Uint8Array)=> void
  onAmongusUpdateMessage: (listener: (message: string) => void) => void
}
