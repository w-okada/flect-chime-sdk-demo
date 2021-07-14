
export interface RealtimeSubscribeHMMModuleAmongUsListener {
    serverGameStateUpdated: (gameState:GameState) => void
}

export const STATES = [
    'LOBBY', // 0
    'TASKS', // 1
    'DISCUSSION',  // 2
    'MENU' // 3
]
export const REGIONS = [
    'North America',
    'Asia',
    'Europe'
]
export const ACTIONS = [
    'JOIN',             // 0
    'LEAVE',            // 1
    'KILL',             // 2
    'COLOR_CHANGE',     // 3
    'FORCE_UPDATE',     // 4
    'DISCONNECT',       // 5
    'EXILE'             // 6
]
export const COLORS = [
    'red',
    'blue',
    'green',
    'pink',
    'orange',
    'yellow',
    'black',
    'white',
    'purple',
    'brown',
    'cyan',
    'lime',
    'maroon',
    'rose',
    'banana',
    'tan',
    'sunset',
    'sunset',
    'sunset',
]

export const ICONS_ALIVE = COLORS.map(x=>{
    return `resources/amongus/${x}.png`
})
export const ICONS_DEAD = COLORS.map(x=>{
    return `resources/amongus/${x}_dead.png`
})

// public enum PlayMap {
//     Skeld = 0,
//     Mira = 1,
//     Polus = 2,
//     dlekS = 3,
//     Airship = 4,
// }


type PlayerState = {
    name:string
    isDead:boolean
    isDeadDiscovered:boolean
    disconnected:boolean
    color:number
    action:number
    attendeeId?:string
    chimeName?:string
}
export type GameState = {
    hmmAttendeeId:string
    state:number
    lobbyCode:string
    gameRegion:number
    map:number
    connectCode:string
    players:PlayerState[]

}

const initialState:GameState = {
    hmmAttendeeId:"",
    state:3,
    lobbyCode:"",
    gameRegion:0,
    map:0,
    connectCode:"",
    players: [],
}


export class RealtimeSubscribeHMMModuleAmongUsServer{
    private _gameState:GameState = initialState
    private _hmmAttendeeId = ""
    private _realtimeSubscribeHMMModuleAmongUsListener:RealtimeSubscribeHMMModuleAmongUsListener|null = null

    constructor(hmmAttendeeId:string){
        this._hmmAttendeeId = hmmAttendeeId
    }

    setRealtimeSubscribeHMMModuleAmongUsListener(l:RealtimeSubscribeHMMModuleAmongUsListener|null){
        this._realtimeSubscribeHMMModuleAmongUsListener = l
    }


    updateGameState = (ev:string, data:string) => {
        const newGameState = JSON.parse(data) as GameState
        newGameState.hmmAttendeeId = this._hmmAttendeeId
        // Copy user name
        this._gameState.players.forEach(x =>{
            if(x.attendeeId){
                const newPlayer = newGameState.players.find(y=>{return x.name === y.name})
                if(newPlayer){
                    newPlayer.attendeeId = x.attendeeId
                    newPlayer.chimeName  = x.chimeName
                }
            }
        })
        // console.log(`[RealtimeSubscribeHMMModuleAmongUs][updateGameState] Old GameState ${JSON.stringify(this._gameState)}`)
        // console.log(`[RealtimeSubscribeHMMModuleAmongUs][updateGameState] New GameState ${JSON.stringify(newGameState)}`)
        this._gameState = newGameState
        this._realtimeSubscribeHMMModuleAmongUsListener?.serverGameStateUpdated(this._gameState)
    }

    registerUserName = (userName:string, attendeeId:string, chimeUserName:string) =>{
        const unregisterTarget = this._gameState.players.find(x=>{return x.attendeeId === attendeeId})
        if(unregisterTarget){
            unregisterTarget.attendeeId = undefined
            unregisterTarget.chimeName = undefined
        }
        console.log(`Register User Name ${JSON.stringify(this._gameState)}`)
        const targetPlayer = this._gameState.players.find(x=>{return x.name === userName})
        if(!targetPlayer){
            console.log(`user ${userName} is not found`)
            return
        }
        if(targetPlayer.attendeeId){
            console.log(`${targetPlayer.name} is already registered as ${targetPlayer.attendeeId}`)
            return
        }
        targetPlayer.attendeeId = attendeeId
        targetPlayer.chimeName  = chimeUserName
        console.log(`${targetPlayer.name} is registaerd as ${targetPlayer.attendeeId}`)
        this._realtimeSubscribeHMMModuleAmongUsListener?.serverGameStateUpdated(this._gameState)
    }

}