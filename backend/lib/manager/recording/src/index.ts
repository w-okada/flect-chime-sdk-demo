import puppeteer, { Page } from 'puppeteer';
import http from 'http'
import * as io from "socket.io";
import AsyncLock from "async-lock"
import * as os from 'os'
import * as fs from 'fs'

import * as aws from 'aws-sdk'


// var lock = new AsyncLock({timeout: 1000 * 30 });
var lock = new AsyncLock();
var finalize = false;
let page:Page;

let hostname = '0.0.0.0';
let port = 3000;
let protocol = 'http';
const server = http.createServer({}, async (request, response) => {
    console.log(`${request.method} ${request.url} BEGIN`);
})
server.listen(port, hostname, () => {
    console.log(`${hostname}:${port}`)
});

var io_server = new io.Server(server, {
    allowEIO3: true
})

const now = () => new Date().toISOString().substr(14, 9);
const sleep = async (ms:number) => {
    const p =  new Promise<void>((resolve,reject) => {
        setTimeout(()=>{
            console.log("SLEEP RESOLVED!")
            resolve()
        }, ms);
    });
    await p
}

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
type GameState = {
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

let gameState:GameState = {...initialState, players:[]}


io_server.on('connection', client => {
        
    ///////////////////////////////////////////////////////
    // handle socket io event start
    ///////////////////////////////////////////////////////
    //@ts-ignore
    client.on('connectCode', (connectCode) => {
        lock.acquire('io_on',  async () => {
            console.log("AMONG: [connectCode]", connectCode)
            //@ts-ignore
            client.connectCode = connectCode;
            gameState = {...initialState, players:[]}

            return 'Successful';
        }, (error, result) => {
            if(error) {
              console.log(now(), 'Connect Failure : ', error);
            }
            else {
              console.log(now(), 'Connect Success : ', result);
            }
        })

    });

    //@ts-ignore
    client.on('lobby', (data) => {
        lock.acquire('io_on',  async () => {
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
        },(error, result) => {
            if(error) {
              console.log(now(), 'Lobby Failure : ', error);
            }
            else {
              console.log(now(), 'Lobby Success : ', result);
            }
        })
            
    })

    //@ts-ignore
    client.on('state', (index) => {
        lock.acquire('io_on',  async () => {
            console.log("AMONG: [state]", index)

            if(index == 0 || index == 3){ // Lobby(0),Menu(3)
                gameState.players = []
            }

            // if(index == 2){// discussion update player status
            if(index == 2){// discussion update discovered status
                // client.emit("requestdata", 2)
                gameState.players.forEach(x=>{
                    if(x.isDead){
                        x.isDeadDiscovered = true
                    }
                })
            } 

            gameState.state = index

            return 'Successful';
        },(error, result) => {
            if(error) {
              console.log(now(), 'State Failure : ', error);
            }
            else {
              console.log(now(), 'State Success : ', result);
            }
        })
    });

    //@ts-ignore
    client.on('player', (data) => {
        lock.acquire('io_on', async() => {
            console.log("AMONG: [player]", data)

            //// change to realtime update
            // if(gameState.state == 1){ // tasks, skip update player status
            //     return
            // }

            const playerData = JSON.parse(data)
            const otherPlayers = gameState.players.filter(x=>{return x.name !== playerData.Name}) // list up not target players
            let targetPlayers = gameState.players.filter(x=>{return x.name === playerData.Name})  // target players
            if(targetPlayers.length == 0){ // target players not found.
                const newPlayer = {
                    name: playerData.Name,
                    isDead: playerData.IsDead,
                    isDeadDiscovered:false,
                    disconnected: playerData.Disconnected,
                    action: parseInt(playerData.Action),
                    color: parseInt(playerData.Color)
                }
                targetPlayers.push(newPlayer)
            }else{
                targetPlayers[0].name = playerData.Name
                targetPlayers[0].isDead = playerData.IsDead
                // keep isDeadDiscovered state
                targetPlayers[0].disconnected = playerData.Disconnected
                targetPlayers[0].action = parseInt(playerData.Action)
                targetPlayers[0].color = parseInt(playerData.Color)
                if(targetPlayers[0].action == 6){ // When user is purged, the user status is discovered immidiately
                    targetPlayers[0].isDeadDiscovered = true
                }
            }
        

            if(parseInt(playerData.Action) !== 1){ // when action is leave, not add the new player(= delete the user)
                otherPlayers.push(...targetPlayers)
            }
            gameState.players = otherPlayers

            return 'Successful';
        },(error, result) => {
            if(error) {
              console.log(now(), 'Player Failure : ', error);
            }
            else {
              console.log(now(), 'Player Success : ', result);
            }
        })
    });

    //@ts-ignore
    client.on('disconnect', () => {
        lock.acquire('io_on',  async() => {
            console.log("AMONG: [disconnect]")
            gameState.players = []
            return 'Successful';
        },(error, result) => {
            if(error) {
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

const uploadGameState = (_finalize:boolean) =>{
    // console.log("upload game state1-1[cpu]", os.cpus())
    // console.log("upload game state1-2[total mem]", os.totalmem())
    // console.log("upload game state1-3[free mem]", os.freemem())
    if(page){
        console.log(`upload game state ${_finalize}, ${finalize}`)
        lock.acquire('io_on',  async () => {
            // @ts-ignore
            await page.$eval('#io_data', (el, value) => el.value = value, JSON.stringify(gameState));
            await page.click("#io_click")
    
            return 'Successful';
        },(error, result) => {
            if(error) {
              console.log(now(), 'Upload game state Failure : ', error);
            }
            else {
              console.log(now(), 'Upload game state Success : ', result);
            }
            if(_finalize){

            }else{
                setTimeout(()=>{
                    uploadGameState(finalize)
                }, 1000 * 2)
            }
        })
    }else{
        setTimeout(()=>{
            uploadGameState(finalize)
        }, 1000 * 2)
    }
}
uploadGameState(finalize)






const args = process.argv.slice(2);
const meetingURL = args[0]
const bucketName = args[1]
const browserWidth = args[1];
const browserHeight = args[2];


console.log(`meetingURL: ${meetingURL}, bucketName:${bucketName}, width:${browserWidth}, height:${browserHeight}`);

const downloadPath = './download';

puppeteer.launch({ 
    headless: false,
    executablePath: '/usr/bin/google-chrome-stable',
    ignoreHTTPSErrors: true,
    ignoreDefaultArgs: ['--mute-audio'],
    args: [
        '--enable-usermedia-screen-capturing',
        '--allow-http-screen-capture',
        '--auto-select-desktop-capture-source=pickme',
        '--autoplay-policy=no-user-gesture-required',

        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
    ]
}).then(async(browser)=>{
    page = await browser.newPage();
    page.on(`console`, msg => {
        for (let i = 0; i < msg.args().length; ++i) {
            console.log(`${i}: ${msg.args()[i]}`);
        }
    });

    await page.exposeFunction('onCustomEvent', async(e:any) => {
        console.log(`!!!!!!! Event Fired!!! !!!!!! ${e.type} fired`, e.detail || '');
        const s3 = new aws.S3({ params: { Bucket: bucketName } });
        let promises:Promise<any>[] = []

        switch (e.type) {
            case "terminate":
                console.log("TERMINATE----------------!")                
                console.log("wait 20sec for download process")
                await sleep(1000 * 20)
                console.log("wait 20sec for download process done")

                try{
                    io_server.disconnectSockets();
                }catch(exception){
                    console.log(`io_server disconnecting exception ..., ${exception}`)
                }
                try{
                    server.close();
                }catch(exception){
                    console.log(`server closing exception ..., ${exception}`)
                }
                finalize = true
                console.log(`Terminating,,, finalize3 flag:${finalize}`)


                try{
                    fs.readdirSync(downloadPath).forEach(file => {
                        const filePath = `${downloadPath}/${file}`
                        console.log("FILE:::", filePath)
    
                        let params:aws.S3.PutObjectRequest = {
                            Bucket: bucketName,
                            Key: `recording/${file}`
                        };
                        params.Body = fs.readFileSync(filePath);
    
                        const p = s3.putObject(params, function (err, data) {
                            if (err) console.log(err, err.stack);
                            else console.log(data);
                        }).promise();
    
                        promises.push(p)
    
                    });
                }catch(exception){
                    console.log(`file upload to s3 exception ..., ${exception}`)
                }
                await Promise.all(promises)
                
                console.log(`Terminating,,, done`)

                try{
                    browser.close();
                }catch(exception){
                    console.log(`browser closing exception ..., ${exception}`)
                }
                
                break
            case "uploadVideo":
                console.log("uploadVideo----------------!")                
                console.log("wait 20sec for upload process")
                await sleep(1000 * 20)
                console.log("wait 20sec for upload process done")


                fs.readdirSync(downloadPath).forEach(file => {
                    const filePath = `${downloadPath}/${file}`
                    console.log("FILE:::", filePath)

                    let params:aws.S3.PutObjectRequest = {
                        Bucket: bucketName,
                        Key: `recording/${file}`
                    };
                    params.Body = fs.readFileSync(filePath);

                    const p = s3.putObject(params, function (err, data) {
                        if (err) console.log(err, err.stack);
                        else console.log(data);
                    }).promise();

                    promises.push(p)

                });
                console.log("uploadVideo----------------! done!")                
                break

        }
    });

    function listenFor() {
        return page.evaluateOnNewDocument(() => {
            document.addEventListener('terminate', e => {
                // @ts-ignore
                window.onCustomEvent({ type: 'terminate', detail: e.detail });
            });
            document.addEventListener('uploadVideo', e => {
                // @ts-ignore
                window.onCustomEvent({ type: 'uploadVideo', detail: e.detail });
            })
        });
    }

    await listenFor();

    await page.goto(meetingURL)
    // @ts-ignore
    await page._client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: downloadPath
    });

})



