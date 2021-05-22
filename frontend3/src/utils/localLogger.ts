
export class LocalLogger{
    private module
    constructor(module:string){
        this.module = module
    }
    log = (...strs:string[]) =>{
        console.log(this.module, ...strs)
    }
}