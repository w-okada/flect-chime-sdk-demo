import { useEffect, useState } from "react"
import { getUserNameByAttendeeId } from "../../../api/api"
import { useAppState } from "../../../providers/AppStateProvider"

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
    'JOIN',
    'LEAVE',
    'KILL',
    'COLOR_CHANGE',
    'FORCE_UPDATE',
    'DISCONNECT',
    'EXILE'
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
    'lime'
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
    attendeeId:string

    meetingName?: string
    idToken?: string
    accessToken?: string
    refreshToken?: string
}

export const useAmongUs = (props:UseAmongUsProps) =>{
    const [ gameState, setGameState] = useState(initialState)

    const updateGameState = (ev:string, data:string) => {
        const newGameState = JSON.parse(data) as GameState
        newGameState.hmmAttendeeId = props.attendeeId
        gameState.players.forEach(x =>{
            if(x.attendeeId){
                const newPlayer = newGameState.players.find(y=>{return x.name === y.name})
                if(newPlayer){
                    newPlayer.attendeeId = x.attendeeId
                    newPlayer.chimeName  = x.chimeName
                }
            }
        })


        setGameState(newGameState)
        // switch(ev){
        //     case "connectCode":
        //         setGameState({...initialState, hmmAttendeeId:props.attendeeId})
        //         break
        //     case "state":
        //         const state = parseInt(data)
        //         if(state === 0 || state === 3){
        //             // gameState.players = [...Array(16)].map((x,index)=>{
        //             //     const player:PlayerState = {
        //             //         name:"",
        //             //         isDead:true,
        //             //         disconnected:true,
        //             //         color:index,
        //             //         action:0
        //             //     }
        //             //     return player
        //             // })
        //             gameState.players = []
        //         }
        //         setGameState({...gameState, state:state})
        //         break
        //     case "lobby":
        //         const lobbyData = JSON.parse(data)
        //         setGameState({...gameState, 
        //             lobbyCode:lobbyData.LobbyCode, 
        //             gameRegion:parseInt(lobbyData.Region),
        //             map:parseInt(lobbyData.Map)
        //         })

        //         break
        //     case "player":
        //         const playerData = JSON.parse(data)
        //         const newPlayers = gameState.players.filter(x=>{return x.name !== playerData.Name})
        //         const newPlayer:PlayerState = {
        //             name: playerData.Name,
        //             isDead: playerData.IsDead,
        //             disconnected: playerData.Disconnected,
        //             action: parseInt(playerData.Action),
        //             color: parseInt(playerData.Color)
        //         }
        //         if(parseInt(playerData.Action) !== 1){ // leave
        //             newPlayers.push(newPlayer)
        //         }
        //         // const colorId = parseInt(playerData.Color)
        //         // gameState.players[colorId].color = colorId
        //         // gameState.players[colorId].name = playerData.Name
        //         // gameState.players[colorId].isDead = playerData.IsDead
        //         // gameState.players[colorId].disconnected = playerData.Disconnected 
        //         // gameState.players[colorId].action = playerData.Action
        //         setGameState({...gameState, players:newPlayers})

        //         break
        //     case "disconnect":
        //         setGameState({...initialState, hmmAttendeeId:props.attendeeId})
        //         break
        // }
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
        targetPlayer.chimeName  =  (await getUserNameByAttendeeId(props.meetingName!, attendeeId, props.idToken!, props.accessToken!, props.refreshToken!)).name
        console.log(`${targetPlayer.name} is registaerd as ${targetPlayer.attendeeId}`)
        setGameState({...gameState})
    }


    return {gameState, updateGameState, registerUserName}
}
