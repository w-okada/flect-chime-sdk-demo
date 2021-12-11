import fs from "fs";
import path from "path";
import p from "child_process";
// import aws from "aws-sdk";
import { BrowserWindow, app, session, ipcMain, dialog } from "electron";
import { searchDevtools } from "electron-search-devtools";

import http from "http";
import * as io from "socket.io";
import AsyncLock from "async-lock";
import { getDateString } from "./utils";
import { startSlackApp } from "./slack/slackApp";

const isDev = process.env.NODE_ENV === "development";
const port: number = Number(process.env.PORT) || 3000;
console.log("PORT!", port);
var lock = new AsyncLock();

console.log("START APP!!!!!!!!");
console.log(`PORT:::${port}`);
/////////////////////////
// Among Us Section   ///
/////////////////////////
// const now = () => new Date().toISOString().substr(14, 9);
// type PlayerState = {
//     name: string
//     isDead: boolean
//     isDeadDiscovered: boolean
//     disconnected: boolean
//     color: number
//     action: number
//     attendeeId?: string
//     chimeName?: string
// }
// type GameState = {
//     hmmAttendeeId: string
//     state: number
//     lobbyCode: string
//     gameRegion: number
//     map: number
//     connectCode: string
//     players: PlayerState[]
// }

// const initialState: GameState = {
//     hmmAttendeeId: "",
//     state: 3,
//     lobbyCode: "",
//     gameRegion: 0,
//     map: 0,
//     connectCode: "",
//     players: [],
// }

// let gameState: GameState = { ...initialState, players: [] }

// let hostname = '0.0.0.0';
// let port = 3000;
// let protocol = 'http';
// const server = http.createServer({}, async (request, response) => {
//     console.log(`${request.method} ${request.url} BEGIN`);
// })
// server.listen(port, hostname, () => {
//     console.log(`server listen: ${hostname}:${port}`)
// });
// var io_server = new io.Server(server, {
//     allowEIO3: true
// })
// io_server.on('connection', client => {
//     ///////////////////////////////////////////////////////
//     // handle socket io event start
//     ///////////////////////////////////////////////////////
//     //@ts-ignore
//     client.on('connectCode', (connectCode) => {
// 		console.log("connectCode", connectCode)
//         lock.acquire('io_on', async () => {
//             console.log("AMONG: [connectCode]", connectCode)
//             //@ts-ignore
//             client.connectCode = connectCode;
//             gameState = { ...initialState, players: [] }

//             return 'Successful';
//         }, (error, result) => {
//             if (error) {
//                 console.log(now(), 'Connect Failure : ', error);
//             }
//             else {
//                 console.log(now(), 'Connect Success : ', result);
//             }
//         })
//     });

//     //@ts-ignore
//     client.on('lobby', (data) => {
// 		console.log("lobby", data)

//         lock.acquire('io_on', async () => {
//             console.log("AMONG: [lobby]", data)

//             const lobbyData = JSON.parse(data)
//             gameState.lobbyCode = lobbyData.LobbyCode
//             gameState.gameRegion = lobbyData.Region
//             gameState.map = lobbyData.Map

//             // request data ID
//             // enum GameDataType{
//             //     GameState = 1,
//             //     Players = 2,
//             //     LobbyCode = 4
//             // }
//             client.emit("requestdata", 2)
//             return 'Successful';
//         }, (error, result) => {
//             if (error) {
//                 console.log(now(), 'Lobby Failure : ', error);
//             }
//             else {
//                 console.log(now(), 'Lobby Success : ', result);
//             }
//         })

//     })

//     //@ts-ignore
//     client.on('state', (index) => {
// 		console.log("state", index)

//         lock.acquire('io_on', async () => {
//             console.log("AMONG: [state]", index)

//             if (index == 0 || index == 3) { // Lobby(0),Menu(3)
//                 gameState.players = []
//             }

//             // if(index == 2){// discussion update player status
//             if (index == 2) {// discussion update discovered status
//                 // client.emit("requestdata", 2)
//                 gameState.players.forEach(x => {
//                     if (x.isDead) {
//                         x.isDeadDiscovered = true
//                     }
//                 })
//             }

//             gameState.state = index

//             return 'Successful';
//         }, (error, result) => {
//             if (error) {
//                 console.log(now(), 'State Failure : ', error);
//             }
//             else {
//                 console.log(now(), 'State Success : ', result);
//             }
//         })
//     });

//     //@ts-ignore
//     client.on('player', (data) => {
// 		console.log("player", data)

//         lock.acquire('io_on', async () => {
//             console.log("AMONG: [player]", data)

//             //// change to realtime update
//             // if(gameState.state == 1){ // tasks, skip update player status
//             //     return
//             // }

//             const playerData = JSON.parse(data)
//             const otherPlayers = gameState.players.filter(x => { return x.name !== playerData.Name }) // list up not target players
//             let targetPlayers = gameState.players.filter(x => { return x.name === playerData.Name })  // target players
//             if (targetPlayers.length == 0) { // target players not found.
//                 const newPlayer = {
//                     name: playerData.Name,
//                     isDead: playerData.IsDead,
//                     isDeadDiscovered: false,
//                     disconnected: playerData.Disconnected,
//                     action: parseInt(playerData.Action),
//                     color: parseInt(playerData.Color)
//                 }
//                 targetPlayers.push(newPlayer)
//             } else {
//                 targetPlayers[0].name = playerData.Name
//                 targetPlayers[0].isDead = playerData.IsDead
//                 // keep isDeadDiscovered state
//                 targetPlayers[0].disconnected = playerData.Disconnected
//                 targetPlayers[0].action = parseInt(playerData.Action)
//                 targetPlayers[0].color = parseInt(playerData.Color)
//                 if (targetPlayers[0].action == 6) { // When user is purged, the user status is discovered immidiately
//                     targetPlayers[0].isDeadDiscovered = true
//                 }
//             }

//             if (parseInt(playerData.Action) !== 1) { // when action is leave, not add the new player(= delete the user)
//                 otherPlayers.push(...targetPlayers)
//             }
//             gameState.players = otherPlayers

//             return 'Successful';
//         }, (error, result) => {
//             if (error) {
//                 console.log(now(), 'Player Failure : ', error);
//             }
//             else {
//                 console.log(now(), 'Player Success : ', result);
//             }
//         })
//     });

//     //@ts-ignore
//     client.on('disconnect', () => {
// 		console.log("disconnect")

//         lock.acquire('io_on', async () => {
//             console.log("AMONG: [disconnect]")
//             gameState.players = []
//             return 'Successful';
//         }, (error, result) => {
//             if (error) {
//                 console.log(now(), 'Disconnect Failure : ', error);
//             }
//             else {
//                 console.log(now(), 'Disconnect Success : ', result);
//             }
//         })

//     });

//     ///////////////////////////////////////////////////////
//     // handle socket io event end
//     ///////////////////////////////////////////////////////
// });

/////////////////////////
// Main Section       ///
/////////////////////////
const createWindow = async () => {
    console.log("START APP!!!!!!!! CREATE WINDOW1");

    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 960,
        show: false,
        title: "Electron",
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    ipcMain.handle("finalize", () => {
        console.log("[main] receive finalize");
        mainWindow.close();
        app.quit();
    });

    // if (isDev) mainWindow.webContents.openDevTools({ mode: "detach" });

    mainWindow.loadFile("dist/index.html");
    mainWindow.once("ready-to-show", () => mainWindow.show());

    // const uploadGameState = () => {
    //     console.log("upload game state!");
    //     lock.acquire(
    //         "io_on",
    //         async () => {
    //             // @ts-ignore
    //             mainWindow.webContents.send("amongus-gamestate-updated", JSON.stringify(gameState));
    //             // await page.$eval('#io_data', (el, value) => el.value = value, JSON.stringify(gameState));
    //             // await page.click("#io_click")

    //             return "Successful";
    //         },
    //         (error, result) => {
    //             if (error) {
    //             } else {
    //                 console.log(now(), "Upload game state Success : ", result);
    //             }
    //             setTimeout(() => {
    //                 uploadGameState();
    //             }, 1000 * 1);
    //         }
    //     );
    // };
    // uploadGameState();
    console.log("START APP!!!!!!!! CREATE WINDOW2");

    const server = await startSlackApp(port);
    console.log("START APP!!!!!!!! CREATE WINDOW3");
    var io_server = new io.Server(server, {
        allowEIO3: true,
    });

    console.log("START APP!!!!!!!! CREATE WINDOW4");
    io_server.on("connection", (client) => {
        client.on("connectCode", (connectCode) => {
            console.log("connectCode", connectCode);
        });
    });
    //     console.log("connection!!!", JSON.stringify(client));
    //     ///////////////////////////////////////////////////////
    //     // handle socket io event start
    //     ///////////////////////////////////////////////////////
    //     //@ts-ignore
    //     client.on("connectCode", (connectCode) => {
    //         console.log("connectCode", connectCode);
    //         // lock.acquire(
    //         //     "io_on",
    //         //     async () => {
    //         //         console.log("AMONG: [connectCode]", connectCode);
    //         //         //@ts-ignore
    //         //         client.connectCode = connectCode;
    //         //         gameState = { ...initialState, players: [] };

    //         //         return "Successful";
    //         //     },
    //         //     (error, result) => {
    //         //         if (error) {
    //         //             console.log(now(), "Connect Failure : ", error);
    //         //         } else {
    //         //             console.log(now(), "Connect Success : ", result);
    //         //         }
    //         //     }
    //         // );
    //     });

    //     //@ts-ignore
    //     client.on("lobby", (data) => {
    //         console.log("lobby", data);

    //         // lock.acquire(
    //         //     "io_on",
    //         //     async () => {
    //         //         console.log("AMONG: [lobby]", data);

    //         //         const lobbyData = JSON.parse(data);
    //         //         gameState.lobbyCode = lobbyData.LobbyCode;
    //         //         gameState.gameRegion = lobbyData.Region;
    //         //         gameState.map = lobbyData.Map;

    //         //         // request data ID
    //         //         // enum GameDataType{
    //         //         //     GameState = 1,
    //         //         //     Players = 2,
    //         //         //     LobbyCode = 4
    //         //         // }
    //         //         client.emit("requestdata", 2);
    //         //         return "Successful";
    //         //     },
    //         //     (error, result) => {
    //         //         if (error) {
    //         //             console.log(now(), "Lobby Failure : ", error);
    //         //         } else {
    //         //             console.log(now(), "Lobby Success : ", result);
    //         //         }
    //         //     }
    //         // );
    //     });

    //     //@ts-ignore
    //     client.on("state", (index) => {
    //         console.log("state", index);

    //         // lock.acquire(
    //         //     "io_on",
    //         //     async () => {
    //         //         console.log("AMONG: [state]", index);

    //         //         if (index == 0 || index == 3) {
    //         //             // Lobby(0),Menu(3)
    //         //             gameState.players = [];
    //         //         }

    //         //         // if(index == 2){// discussion update player status
    //         //         if (index == 2) {
    //         //             // discussion update discovered status
    //         //             // client.emit("requestdata", 2)
    //         //             gameState.players.forEach((x) => {
    //         //                 if (x.isDead) {
    //         //                     x.isDeadDiscovered = true;
    //         //                 }
    //         //             });
    //         //         }

    //         //         gameState.state = index;

    //         //         return "Successful";
    //         //     },
    //         //     (error, result) => {
    //         //         if (error) {
    //         //             console.log(now(), "State Failure : ", error);
    //         //         } else {
    //         //             console.log(now(), "State Success : ", result);
    //         //         }
    //         //     }
    //         // );
    //     });

    //     //@ts-ignore
    //     client.on("player", (data) => {
    //         console.log("player", data);

    //         // lock.acquire(
    //         //     "io_on",
    //         //     async () => {
    //         //         console.log("AMONG: [player]", data);

    //         //         //// change to realtime update
    //         //         // if(gameState.state == 1){ // tasks, skip update player status
    //         //         //     return
    //         //         // }

    //         //         const playerData = JSON.parse(data);
    //         //         const otherPlayers = gameState.players.filter((x) => {
    //         //             return x.name !== playerData.Name;
    //         //         }); // list up not target players
    //         //         let targetPlayers = gameState.players.filter((x) => {
    //         //             return x.name === playerData.Name;
    //         //         }); // target players
    //         //         if (targetPlayers.length == 0) {
    //         //             // target players not found.
    //         //             const newPlayer = {
    //         //                 name: playerData.Name,
    //         //                 isDead: playerData.IsDead,
    //         //                 isDeadDiscovered: false,
    //         //                 disconnected: playerData.Disconnected,
    //         //                 action: parseInt(playerData.Action),
    //         //                 color: parseInt(playerData.Color),
    //         //             };
    //         //             targetPlayers.push(newPlayer);
    //         //         } else {
    //         //             targetPlayers[0].name = playerData.Name;
    //         //             targetPlayers[0].isDead = playerData.IsDead;
    //         //             // keep isDeadDiscovered state
    //         //             targetPlayers[0].disconnected = playerData.Disconnected;
    //         //             targetPlayers[0].action = parseInt(playerData.Action);
    //         //             targetPlayers[0].color = parseInt(playerData.Color);
    //         //             if (targetPlayers[0].action == 6) {
    //         //                 // When user is purged, the user status is discovered immidiately
    //         //                 targetPlayers[0].isDeadDiscovered = true;
    //         //             }
    //         //         }

    //         //         if (parseInt(playerData.Action) !== 1) {
    //         //             // when action is leave, not add the new player(= delete the user)
    //         //             otherPlayers.push(...targetPlayers);
    //         //         }
    //         //         gameState.players = otherPlayers;

    //         //         return "Successful";
    //         //     },
    //         //     (error, result) => {
    //         //         if (error) {
    //         //             console.log(now(), "Player Failure : ", error);
    //         //         } else {
    //         //             console.log(now(), "Player Success : ", result);
    //         //         }
    //         //     }
    //         // );
    //     });

    //     //@ts-ignore
    //     client.on("disconnect", () => {
    //         console.log("disconnect");

    //         // lock.acquire(
    //         //     "io_on",
    //         //     async () => {
    //         //         console.log("AMONG: [disconnect]");
    //         //         gameState.players = [];
    //         //         return "Successful";
    //         //     },
    //         //     (error, result) => {
    //         //         if (error) {
    //         //             console.log(now(), "Disconnect Failure : ", error);
    //         //         } else {
    //         //             console.log(now(), "Disconnect Success : ", result);
    //         //         }
    //         //     }
    //         // );
    //     });

    //     ///////////////////////////////////////////////////////
    //     // handle socket io event end
    //     ///////////////////////////////////////////////////////
    // });
};

app.whenReady().then(async () => {
    console.log("START APP!!!!!!!! READY");

    if (isDev) {
        const devtools = await searchDevtools("REACT");
        if (devtools) {
            await session.defaultSession.loadExtension(devtools, {
                allowFileAccess: true,
            });
        }
    }
    createWindow();
});

app.once("window-all-closed", () => app.quit());
