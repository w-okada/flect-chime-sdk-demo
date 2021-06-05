import { useEffect, useState } from "react"
import { useAppState } from "../../../providers/AppStateProvider"

// export const STATES = [
//     'LOBBY', // 0
//     'TASKS', // 1
//     'DISCUSSION',  // 2
//     'MENU' // 3
// ]
// export const REGIONS = [
//     'North America',
//     'Asia',
//     'Europe'
// ]
// export const ACTIONS = [
//     'JOIN',
//     'LEAVE',
//     'KILL',
//     'COLOR_CHANGE',
//     'FORCE_UPDATE',
//     'DISCONNECT',
//     'EXILE'
// ]
// export const COLORS = [
//     'red',
//     'blue',
//     'green',
//     'pink',
//     'orange',
//     'yellow',
//     'black',
//     'white',
//     'purple',
//     'brown',
//     'cyan',
//     'lime'
// ]

// export const ICONS_ALIVE = COLORS.map(x=>{
//     return `resources/amongus/${x}.png`
// })
// export const ICONS_DEAD = COLORS.map(x=>{
//     return `resources/amongus/${x}_dead.png`
// })




// type PlayerState = {
//     name:string
//     isDead:boolean
//     disconnected:boolean
//     color:number
//     action:number
// }
// type GameState = {
//     state:number
//     lobbyCode:string
//     gameRegion:number
//     map:number
//     connectCode:string
//     players:PlayerState[]
// }

// const initialState:GameState = {
//     state:0,
//     lobbyCode:"",
//     gameRegion:0,
//     map:0,
//     connectCode:"",
//     players: [],
// } 


// export const useAmongUs = () =>{
//     const { amongUsStates } = useAppState()
//     // const [ state, setState] = useState(0)
//     // const [ lobbyCode, setLobbyCode] = useState("")    
//     // const [ gameRegion, setGameRegion] = useState(0)
//     // const [ map, setMap] = useState(0)
//     // const [ connectCode, stConnectCode ] = useState("")
//     // const [ players, setPlayers] = useState<PlayerState[]>([])

//     const [ gameState, setGameState] = useState(initialState)

//     useEffect(()=>{
//         const newState = amongUsStates.slice(-1)[0]
//         if(!newState){
//             return
//         }
//         switch(newState.event){
//             case "connectCode":
//                 setGameState(initialState)
//                 break
//             case "state":
//                 const state = parseInt(newState.data)
//                 if(state === 0 || state === 3){
//                     // gameState.players = [...Array(16)].map((x,index)=>{
//                     //     const player:PlayerState = {
//                     //         name:"",
//                     //         isDead:true,
//                     //         disconnected:true,
//                     //         color:index,
//                     //         action:0
//                     //     }
//                     //     return player
//                     // })
//                     gameState.players = []
//                 }
//                 setGameState({...gameState, state:state})
//                 break
//             case "lobby":
//                 const lobbyData = JSON.parse(newState.data)
//                 setGameState({...gameState, 
//                     lobbyCode:lobbyData.LobbyCode, 
//                     gameRegion:parseInt(lobbyData.Region),
//                     map:parseInt(lobbyData.Map)
//                 })

//                 break
//             case "player":
//                 const playerData = JSON.parse(newState.data)
//                 const newPlayers = gameState.players.filter(x=>{return x.name !== playerData.Name})
//                 const newPlayer:PlayerState = {
//                     name: playerData.Name,
//                     isDead: playerData.IsDead,
//                     disconnected: playerData.Disconnected,
//                     action: parseInt(playerData.Action),
//                     color: parseInt(playerData.Color)
//                 }
//                 if(parseInt(playerData.Action) !== 1){ // leave
//                     newPlayers.push(newPlayer)
//                 }
//                 // const colorId = parseInt(playerData.Color)
//                 // gameState.players[colorId].color = colorId
//                 // gameState.players[colorId].name = playerData.Name
//                 // gameState.players[colorId].isDead = playerData.IsDead
//                 // gameState.players[colorId].disconnected = playerData.Disconnected 
//                 // gameState.players[colorId].action = playerData.Action
//                 setGameState({...gameState, players:newPlayers})

//                 break
//             case "disconnect":
//                 setGameState(initialState)
//                 break
//         }
//     },[amongUsStates])


//     return {gameState}
// }
