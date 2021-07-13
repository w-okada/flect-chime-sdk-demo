import { useState } from "react"
import { FlectChimeClient } from "../chime/FlectChimeClient"

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

type UseAmongUsProps = {
}

export const useAmongUs = (props:UseAmongUsProps) =>{
    const [ chimeClient, setChimeClient ] = useState<FlectChimeClient>()
    const [ gameState, setGameState] = useState(initialState)

    const updateGameState = (ev:string, data:string) => {
        const newGameState = JSON.parse(data) as GameState
        newGameState.hmmAttendeeId = chimeClient?.attendeeId!
        // Copy user name
        gameState.players.forEach(x =>{
            if(x.attendeeId){
                const newPlayer = newGameState.players.find(y=>{return x.name === y.name})
                if(newPlayer){
                    newPlayer.attendeeId = x.attendeeId
                    newPlayer.chimeName  = x.chimeName
                }
            }
        })


        // // update isDead discvoered
        // if(newGameState.state == 2){ // When state is Discussion, isDead state can be discovered
        //     newGameState.players.forEach(x=>{
        //         if(x.isDead){
        //             x.isDeadDiscovered = true
        //         }
        //     })
        // }
        // // update purged
        // if(newGameState.state == 1 && gameState.state == 2){ // When state is changed from Discussion to Tasks, purged state can be discovered
        //     newGameState.players.forEach(x=>{
        //         if(x.isDead){
        //             x.isDeadDiscovered = true
        //         }
        //     })
        // }

        setGameState(newGameState)
    }

    const registerUserName = async (userName:string, attendeeId:string) =>{
        const unregisterTarget = gameState.players.find(x=>{return x.attendeeId === attendeeId})
        if(unregisterTarget){
            unregisterTarget.attendeeId = undefined
            unregisterTarget.chimeName = undefined
        }

        const targetPlayer = gameState.players.find(x=>{return x.name === userName})
        if(!targetPlayer){
            console.log(`user ${userName} is not found`)
            setGameState({...gameState})
            return
        }
        if(targetPlayer.attendeeId){
            console.log(`${targetPlayer.name} is already registered as ${targetPlayer.attendeeId}`)
            setGameState({...gameState})
            return
        }
        targetPlayer.attendeeId = attendeeId
        targetPlayer.chimeName  = await chimeClient?.getUserNameByAttendeeIdFromList(attendeeId)
        console.log(`${targetPlayer.name} is registaerd as ${targetPlayer.attendeeId}`)
        setGameState({...gameState})
    }
    return { setChimeClient, gameState, updateGameState, registerUserName }
}
