import puppeteer, { Page } from 'puppeteer';
import http from 'http'
import * as io from "socket.io";
import AsyncLock from "async-lock"
import * as os from 'os'

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


type PlayerState = {
    name:string
    isDead:boolean
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
            console.log(now(), '  Lock Function Start');
    
            console.log("AMONG: [connectCode]", connectCode)
            //@ts-ignore
            client.connectCode = connectCode;
            // await page.$eval('#io_event', (el, value) => el.value = "connectCode");
            // await page.$eval('#io_data', (el, value) => el.value = value, "");
            // await page.click("#io_click")
            gameState = {...initialState, players:[]}

            console.log(now(), '  Lock Function End');
            return 'Successful';
        }, (error, result) => {
            console.log(now(), '  Lock Result Start');
            if(error) {
              console.log(now(), '    Failure : ', error);
            }
            else {
              console.log(now(), '    Success : ', result);
            }
            console.log(now(), '  Lock Result End');
        })

    });

    //@ts-ignore
    client.on('lobby', (data) => {
        lock.acquire('io_on',  async () => {
            console.log(now(), '  Lock Function Start');

            console.log("AMONG: [lobby]", data)
            // await page.$eval('#io_event', (el, value) => el.value = "lobby");
            // await page.$eval('#io_data', (el, value) => el.value = value, data);
            // await page.click("#io_click")

            const lobbyData = JSON.parse(data)
            gameState.lobbyCode = lobbyData.LobbyCode
            gameState.gameRegion = lobbyData.Region
            gameState.map = lobbyData.Map

            console.log(now(), '  Lock Function End');
            return 'Successful';
        },(error, result) => {
            console.log(now(), '  Lock Result Start');
            if(error) {
              console.log(now(), '    Failure : ', error);
            }
            else {
              console.log(now(), '    Success : ', result);
            }
            console.log(now(), '  Lock Result End');
        })
            
    })

    //@ts-ignore
    client.on('state', (index) => {
        lock.acquire('io_on',  async () => {
            console.log(now(), '  Lock Function Start');

            console.log("AMONG: [state]", index)
            // await page.$eval('#io_event', (el, value) => el.value = "state");
            // await page.$eval('#io_data', (el, value) => el.value = value, index);
            // await page.click("#io_click")


            if(index == 0 || index == 3){ // Lobby(0),Menu(3)
                gameState.players = []

            }
            gameState.state = index

            console.log(now(), '  Lock Function End');
            return 'Successful';
        },(error, result) => {
            console.log(now(), '  Lock Result Start');
            if(error) {
              console.log(now(), '    Failure : ', error);
            }
            else {
              console.log(now(), '    Success : ', result);
            }
            console.log(now(), '  Lock Result End');
        })
    });

    //@ts-ignore
    client.on('player', (data) => {
        lock.acquire('io_on', async() => {
            console.log(now(), '  Lock Function Start');

            console.log("AMONG: [player]", data)
            // await page.$eval('#io_event', (el, value) => el.value = "player");
            // await page.$eval('#io_data', (el, value) => el.value = value, data);
            // await page.click("#io_click")

            const playerData = JSON.parse(data)
            const newPlayers = gameState.players.filter(x=>{return x.name !== playerData.Name}) // not target players
            const newPlayer:PlayerState = {
                name: playerData.Name,
                isDead: playerData.IsDead,
                disconnected: playerData.Disconnected,
                action: parseInt(playerData.Action),
                color: parseInt(playerData.Color)
            }
            if(parseInt(playerData.Action) !== 1){ // leave
                newPlayers.push(newPlayer)
            }
            gameState.players = newPlayers

            console.log(now(), '  Lock Function End');
            return 'Successful';
        },(error, result) => {
            console.log(now(), '  Lock Result Start');
            if(error) {
              console.log(now(), '    Failure : ', error);
            }
            else {
              console.log(now(), '    Success : ', result);
            }
            console.log(now(), '  Lock Result End');
        })
    });

    //@ts-ignore
    client.on('disconnect', () => {
        lock.acquire('io_on',  async() => {
            console.log(now(), '  Lock Function Start');

            console.log("AMONG: [dissconnect]")
            // await page.$eval('#io_event', (el, value) => el.value = "disconnect");
            // await page.$eval('#io_data', (el, value) => el.value = value, "");
            // await page.click("#io_click")

            gameState.players = []


            console.log(now(), '  Lock Function End');
            return 'Successful';
        },(error, result) => {
            console.log(now(), '  Lock Result Start');
            if(error) {
              console.log(now(), '    Failure : ', error);
            }
            else {
              console.log(now(), '    Success : ', result);
            }
            console.log(now(), '  Lock Result End');
        })

    });

    ///////////////////////////////////////////////////////
    // handle socket io event end
    ///////////////////////////////////////////////////////
});

const uploadGameState = () =>{
    console.log("upload game state1-1[cpu]", os.cpus())
    console.log("upload game state1-2[total mem]", os.totalmem())
    console.log("upload game state1-3[free mem]", os.freemem())
    if(page){
        console.log("upload game state2")
        lock.acquire('io_on',  async () => {
            console.log(now(), '  Lock Function Start');
    //        await page.$eval('#io_event', (el, value) => el.value = "lobby");
            // @ts-ignore
            await page.$eval('#io_data', (el, value) => el.value = value, JSON.stringify(gameState));
            await page.click("#io_click")
    
            console.log(now(), '  Lock Function End');
            return 'Successful';
        },(error, result) => {
            console.log(now(), '  Lock Result Start');
            if(error) {
              console.log(now(), '    Failure : ', error);
            }
            else {
              console.log(now(), '    Success : ', result);
            }
            console.log(now(), '  Lock Result End');
            if(finalize){

            }else{
                setTimeout(uploadGameState, 1000 * 2)
            }
        })
    }else{
        setTimeout(uploadGameState, 1000 * 2)
    }
}
uploadGameState()






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
        console.log(`ZZZZZZZZZZZZZZZZZZZZZ ${e.type} fired`, e.detail || '');
        switch (e.type) {
            case "terminate":
                console.log("TERMINATE----------------!1111")                
                browser.close();

                io_server.disconnectSockets();
                server.close();

                finalize = true
                // process.exit(0);
                break
        }
    });

    function listenFor() {
        return page.evaluateOnNewDocument(() => {
            document.addEventListener('terminate', e => {
                // @ts-ignore
                window.onCustomEvent({ type: 'terminate', detail: e.detail });
            });
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