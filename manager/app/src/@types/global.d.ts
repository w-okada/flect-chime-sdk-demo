declare global {
  interface Window {
    myAPI: Sandbox;
  }
}

export interface Sandbox {
  getWindowId: () => Promise<null | string>
  getEnvVars: ()=> {[key:string]:string} 
  finalize: ()=> void
  onAmongusUpdateMessage: (listener: (message: string) => void) => void
}
