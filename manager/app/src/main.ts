import fs from 'fs';
import path from 'path';
import p from "child_process"
import aws from "aws-sdk"

import { BrowserWindow, app, session, ipcMain, dialog } from 'electron';
import { searchDevtools } from 'electron-search-devtools';

import http from 'http'
import * as io from "socket.io";
import AsyncLock from "async-lock"

// import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg"
// import { createFFmpegCore } from "@ffmpeg/core"
// // const { createFFmpeg, fetchFile } = require("./ffmpeg.min.js")

// console.log("----------------- 111 1")
// console.log(require.resolve("@ffmpeg/ffmpeg"))
// console.log("----------------- 111 2")
// console.log(require.resolve("@ffmpeg/core"))
// console.log("----------------- 111 3")

// const ffmpeg = createFFmpeg({     
//     // corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
//     // corePath: '/app/node_modules/@ffmpeg/core/dist/ffmpeg-core.js',
//     // corePath: './ffmpeg-core.js',
//     // corePath: 'ffmpeg-core.js',
//     log: true
// }) 


const bucketName = process.env.BUCKET_NAME
console.log(`BUCKET_NAME::::::::::::::::::::::::::::::::::${bucketName}`)
var s3 = new aws.S3();

const isDev = process.env.NODE_ENV === 'development';

/// #if DEBUG
const execPath =
	process.platform === 'win32'
		? '../node_modules/electron/dist/electron.exe'
		: '../node_modules/.bin/electron';

if (isDev) {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	require('electron-reload')(__dirname, {
		electron: path.resolve(__dirname, execPath),
		forceHardReset: true,
		hardResetMethod: 'exit',
	});
}
/// #endif


/////////////////////////
// Among Us Section   ///
/////////////////////////
const now = () => new Date().toISOString().substr(14, 9);
type PlayerState = {
    name: string
    isDead: boolean
    isDeadDiscovered: boolean
    disconnected: boolean
    color: number
    action: number
    attendeeId?: string
    chimeName?: string
}
type GameState = {
    hmmAttendeeId: string
    state: number
    lobbyCode: string
    gameRegion: number
    map: number
    connectCode: string
    players: PlayerState[]
}

const initialState: GameState = {
    hmmAttendeeId: "",
    state: 3,
    lobbyCode: "",
    gameRegion: 0,
    map: 0,
    connectCode: "",
    players: [],
}

var lock = new AsyncLock();
let gameState: GameState = { ...initialState, players: [] }

let hostname = '0.0.0.0';
let port = 3000;
let protocol = 'http';
const server = http.createServer({}, async (request, response) => {
    console.log(`${request.method} ${request.url} BEGIN`);
})
server.listen(port, hostname, () => {
    console.log(`server listen: ${hostname}:${port}`)
});
var io_server = new io.Server(server, {
    allowEIO3: true
})
io_server.on('connection', client => {
    ///////////////////////////////////////////////////////
    // handle socket io event start
    ///////////////////////////////////////////////////////
    //@ts-ignore
    client.on('connectCode', (connectCode) => {
		console.log("connectCode", connectCode)
        lock.acquire('io_on', async () => {
            console.log("AMONG: [connectCode]", connectCode)
            //@ts-ignore
            client.connectCode = connectCode;
            gameState = { ...initialState, players: [] }

            return 'Successful';
        }, (error, result) => {
            if (error) {
                console.log(now(), 'Connect Failure : ', error);
            }
            else {
                console.log(now(), 'Connect Success : ', result);
            }
        })
    });

    //@ts-ignore
    client.on('lobby', (data) => {
		console.log("lobby", data)

        lock.acquire('io_on', async () => {
            console.log("AMONG: [lobby]", data)

            const lobbyData = JSON.parse(data)
            gameState.lobbyCode = lobbyData.LobbyCode
            gameState.gameRegion = lobbyData.Region
            gameState.map = lobbyData.Map


            // request data ID 
            // enum GameDataType{
            //     GameState = 1,
            //     Players = 2,
            //     LobbyCode = 4
            // }
            client.emit("requestdata", 2)
            return 'Successful';
        }, (error, result) => {
            if (error) {
                console.log(now(), 'Lobby Failure : ', error);
            }
            else {
                console.log(now(), 'Lobby Success : ', result);
            }
        })

    })

    //@ts-ignore
    client.on('state', (index) => {
		console.log("state", index)

        lock.acquire('io_on', async () => {
            console.log("AMONG: [state]", index)

            if (index == 0 || index == 3) { // Lobby(0),Menu(3)
                gameState.players = []
            }

            // if(index == 2){// discussion update player status
            if (index == 2) {// discussion update discovered status
                // client.emit("requestdata", 2)
                gameState.players.forEach(x => {
                    if (x.isDead) {
                        x.isDeadDiscovered = true
                    }
                })
            }

            gameState.state = index

            return 'Successful';
        }, (error, result) => {
            if (error) {
                console.log(now(), 'State Failure : ', error);
            }
            else {
                console.log(now(), 'State Success : ', result);
            }
        })
    });

    //@ts-ignore
    client.on('player', (data) => {
		console.log("player", data)

        lock.acquire('io_on', async () => {
            console.log("AMONG: [player]", data)

            //// change to realtime update
            // if(gameState.state == 1){ // tasks, skip update player status
            //     return
            // }

            const playerData = JSON.parse(data)
            const otherPlayers = gameState.players.filter(x => { return x.name !== playerData.Name }) // list up not target players
            let targetPlayers = gameState.players.filter(x => { return x.name === playerData.Name })  // target players
            if (targetPlayers.length == 0) { // target players not found.
                const newPlayer = {
                    name: playerData.Name,
                    isDead: playerData.IsDead,
                    isDeadDiscovered: false,
                    disconnected: playerData.Disconnected,
                    action: parseInt(playerData.Action),
                    color: parseInt(playerData.Color)
                }
                targetPlayers.push(newPlayer)
            } else {
                targetPlayers[0].name = playerData.Name
                targetPlayers[0].isDead = playerData.IsDead
                // keep isDeadDiscovered state
                targetPlayers[0].disconnected = playerData.Disconnected
                targetPlayers[0].action = parseInt(playerData.Action)
                targetPlayers[0].color = parseInt(playerData.Color)
                if (targetPlayers[0].action == 6) { // When user is purged, the user status is discovered immidiately
                    targetPlayers[0].isDeadDiscovered = true
                }
            }


            if (parseInt(playerData.Action) !== 1) { // when action is leave, not add the new player(= delete the user)
                otherPlayers.push(...targetPlayers)
            }
            gameState.players = otherPlayers

            return 'Successful';
        }, (error, result) => {
            if (error) {
                console.log(now(), 'Player Failure : ', error);
            }
            else {
                console.log(now(), 'Player Success : ', result);
            }
        })
    });

    //@ts-ignore
    client.on('disconnect', () => {
		console.log("disconnect")

        lock.acquire('io_on', async () => {
            console.log("AMONG: [disconnect]")
            gameState.players = []
            return 'Successful';
        }, (error, result) => {
            if (error) {
                console.log(now(), 'Disconnect Failure : ', error);
            }
            else {
                console.log(now(), 'Disconnect Success : ', result);
            }
        })

    });

    ///////////////////////////////////////////////////////
    // handle socket io event end
    ///////////////////////////////////////////////////////
});









/////////////////////////
// Main Section       ///
/////////////////////////
const createWindow = () => {
	const mainWindow = new BrowserWindow({
		width: 1280,
		height: 960,
		show: false,
		title: 'Electron',
		frame: false,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
		},
	});

	ipcMain.handle('finalize', ()=>{
		console.log("[main] receive finalize")
		mainWindow.close()
		app.quit()
	})


    const generateAndStoreRecord = (file:string, data:Uint8Array) =>{
        const dstDir="/tmp"
        const dateString = getDateString()
        // const dstDir="/work/tmp"
        const dstFilenameWebm = `${dateString}_${file}.webm`
        const dstFilenameMP4  = `${dateString}_${file}.mp4`
        const dstPathWebm =`${dstDir}/${dstFilenameWebm}`
        const dstPathMP4 =`${dstDir}/${dstFilenameMP4}`
        /// (1) create folder
        if (!fs.existsSync(dstDir)) {
            try{
                fs.mkdirSync(dstDir);
            }catch(e){
                console.log(e)
            }
        }

        /// (2) write wbem
        fs.writeFileSync(dstPathWebm, data)

        // /// (3) mp4
        // // const stdout = p.execSync(`ffmpeg -y -i ${dstFileWbem} ${dstFileMP4}`);
        // // console.log(stdout)
        // try{
        //     const stdout = p.execSync(`ffmpeg -y -i ${dstFileWebm} ${dstFileMP4}`);
        //     console.log(stdout)
        // }catch(e){
        //     console.log(JSON.stringify(e))
        // }

        // // const name = 'record.webm'

        // // ffmpeg.FS('writeFile', name, data);
        // // console.log("FFMPEG START!")
        // // ffmpeg.run('-i', name, '-c', 'copy', dstFileMP4).then(()=>{
        // //     const stream = ffmpeg.FS('readFile', dstFileMP4)
        // //     console.log("ffmpeg done")
        // // })

        


        /// (4) put to s3
        var fileStream = fs.createReadStream(dstPathWebm);
        // var fileStream = fs.createReadStream(dstFileMP4);
        const params = {
            // Body: data,
            Body: fileStream,
            Bucket: bucketName!,
            Key: `recording/${dstFilenameWebm}`
        }
        s3.putObject(params).promise().then(x=>{
            console.log("S3 SUCCESS", JSON.stringify(x))
        }).catch(e=>{
            console.log("S3 ERROR", JSON.stringify(e))
        })
        

    }

    ipcMain.handle('recorder-data-available1', (ev:Electron.IpcMainInvokeEvent, file:string, data:Uint8Array)=>{
        console.log(data)
        generateAndStoreRecord(file, data)
    })

    ipcMain.handle('recorder-data-available2', (ev:Electron.IpcMainInvokeEvent, file:string, data:Uint8Array)=>{
        console.log(data)
        generateAndStoreRecord(file, data)
    })

	if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });

	mainWindow.loadFile('dist/index.html');
	mainWindow.once('ready-to-show', () => mainWindow.show());


	const uploadGameState = () => {
		console.log("upload game state!")
		lock.acquire('io_on', async () => {
			// @ts-ignore
			mainWindow.webContents.send('amongus-gamestate-updated', JSON.stringify(gameState))
			// await page.$eval('#io_data', (el, value) => el.value = value, JSON.stringify(gameState));
			// await page.click("#io_click")
	
			return 'Successful';
		}, (error, result) => {
			if (error) {
			}else {
				console.log(now(), 'Upload game state Success : ', result);
			}
			setTimeout(() => {
				uploadGameState()
			}, 1000 * 1)
		})
	}
	uploadGameState()
};

app.whenReady().then(async () => {
	if (isDev) {
		const devtools = await searchDevtools('REACT');
		if (devtools) {
			await session.defaultSession.loadExtension(devtools, {
				allowFileAccess: true,
			});
		}
	}


    // await ffmpeg.load()
    // ffmpeg.setProgress((ratio:any) => {
    //     console.log("progress:", JSON.stringify(ratio));
    // });

	createWindow();
});



const getDateString = () => {
    const date = new Date()
    const Y = date.getFullYear()
    const M = ("00" + (date.getMonth()+1)).slice(-2)
    const D = ("00" + date.getDate()).slice(-2)
    const h = ("00" + date.getHours()).slice(-2)
    const m = ("00" + date.getMinutes()).slice(-2)
    const s = ("00" + date.getSeconds()).slice(-2)
  
    return Y + M + D + h + m + s
}



app.once('window-all-closed', () => app.quit());

