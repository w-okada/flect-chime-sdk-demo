
export class LocalLogger{
    private module
    constructor(module:string){
        this.module = module
    }
    log = (...strs:any[]) =>{
        console.log(`[${this.module}]`, ...strs)
    }
}