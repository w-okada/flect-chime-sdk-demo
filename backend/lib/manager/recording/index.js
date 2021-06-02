var fs = require('fs');
var os = require('os');
var AsyncLock = require('async-lock');
const AWS = require('aws-sdk');

var lock = new AsyncLock({timeout: 1000 * 30 });
let page


let hostname = '0.0.0.0';
let port = 3000;
let protocol = 'http';
const server = require(protocol).createServer({}, async (request, response) => {
    console.log(`${request.method} ${request.url} BEGIN`);
})

server.listen(port, hostname, () => {
    console.log(`${hostname}:${port}`)
});

var io = require('socket.io')
var io_server = new io.Server(server, {
    allowEIO3: true
})
const now = () => new Date().toISOString().substr(14, 9);

io_server.on('connection', client => {
        
    ///////////////////////////////////////////////////////
    // handle socket io event start
    ///////////////////////////////////////////////////////
    //@ts-ignore
    client.on('connectCode', async (connectCode) => {
        lock.acquire('io_on',  async () => {
            console.log(now(), '  Lock Function Start');
    
            console.log("AMONG: [connectCode]", connectCode)
            //@ts-ignore
            client.connectCode = connectCode;
            await page.$eval('#io_event', (el, value) => el.value = "connectCode");
            await page.$eval('#io_data', (el, value) => el.value = value, "");
            await page.click("#io_click")

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
    client.on('lobby', async(data) => {
        lock.acquire('io_on',  async () => {
            console.log(now(), '  Lock Function Start');

            console.log("AMONG: [lobby]", data)
            await page.$eval('#io_event', (el, value) => el.value = "lobby");
            await page.$eval('#io_data', (el, value) => el.value = value, data);
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
        })
            
    })

    //@ts-ignore
    client.on('state', async(index) => {
        lock.acquire('io_on',  async () => {
            console.log(now(), '  Lock Function Start');

            console.log("AMONG: [state]", index)
            await page.$eval('#io_event', (el, value) => el.value = "state");
            await page.$eval('#io_data', (el, value) => el.value = value, index);
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
        })
    });

    //@ts-ignore
    client.on('player', async(data) => {
        lock.acquire('io_on',  async () => {
            console.log(now(), '  Lock Function Start');

            console.log("AMONG: [player]", data)
            await page.$eval('#io_event', (el, value) => el.value = "player");
            await page.$eval('#io_data', (el, value) => el.value = value, data);
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
        })
    });

    //@ts-ignore
    client.on('disconnect', async() => {
        lock.acquire('io_on',  async () => {
            console.log(now(), '  Lock Function Start');

            console.log("AMONG: [dissconnect]")
            await page.$eval('#io_event', (el, value) => el.value = "disconnect");
            await page.$eval('#io_data', (el, value) => el.value = value, "");
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
        })

    });

    ///////////////////////////////////////////////////////
    // handle socket io event end
    ///////////////////////////////////////////////////////


});




// function getLocalAddress() {
//     var ifacesObj = {}
//     ifacesObj.ipv4 = [];
//     ifacesObj.ipv6 = [];
//     var interfaces = os.networkInterfaces();

//     for (var dev in interfaces) {
//         interfaces[dev].forEach(function (details) {
//             if (!details.internal) {
//                 switch (details.family) {
//                     case "IPv4":
//                         ifacesObj.ipv4.push({ name: dev, address: details.address });
//                         break;
//                     case "IPv6":
//                         ifacesObj.ipv6.push({ name: dev, address: details.address })
//                         break;
//                 }
//             }
//         });
//     }
//     return ifacesObj;
// };


if (process.env.AWS_KEY) {
    console.log("AWS_KEY:", process.env.AWS_KEY)
    AWS.config.loadFromPath(process.env.AWS_KEY);
}

const puppeteer = require('puppeteer-core');

// const meetingURL = process.env.MEETING_URL | "NO URL ENV"
// console.log("REQUESTED MEETING URL::::::", meetingURL)
const args = process.argv.slice(2);

const meetingURL = args[0]
const bucketName = args[1]
const browserWidth = args[1];
const browserHeight = args[2];


console.log(`meetingURL: ${meetingURL}, bucketName:${bucketName}, width:${browserWidth}, height:${browserHeight}`);

const downloadPath = './download';

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


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
}).then(async (browser) => {
    page = await browser.newPage();
    page.on(`console`, msg => {
        for (let i = 0; i < msg._args.length; ++i) {
            console.log(`${i}: ${msg._args[i]}`);
        }
    });

    // // await page.goto('https://f-backendstack-dev-bucket.s3.amazonaws.com/index.html');    


    await page.exposeFunction('onCustomEvent', async(e) => {
        console.log(`ZZZZZZZZZZZZZZZZZZZZZ ${e.type} fired`, e.detail || '');
        switch (e.type) {
            // case "recordFin":
            //     (async () => {
            //         console.log("RECORD FIN RECEIVED")
            //         // await page._client.send('Page.setDownloadBehavior', {
            //         //   behavior : 'allow',
            //         //   downloadPath: downloadPath
            //         // });

            //         console.log("RECORD FIN 1")
            //         // await page.click('#activeVideoLink');
            //         console.log("RECORD FIN 2")
            //         // await page.click('#allVideoLink');
            //         console.log("RECORD FIN 3")
            //     })()
            //     break

            // case "get_local_ip":

            //     (async () => {

            //         console.log("get local ip !")
            //         const ip = getLocalAddress()
            //         console.log(ip)
            //         const myLocalValue = "ip4::::::" + ip.ipv4[0].address
            //         await page.$eval('#pup', (el, value) => el.value = value, myLocalValue);
            //         page.click("#pup_click")


            //     })()


            //     break

            case "terminate":
                console.log("TERMINATE----------------!")
                s3 = new AWS.S3({ params: { Bucket: bucketName } });

                console.log("wait 20sec for download process")
                await sleep(1000 * 20)
                console.log("wait 20sec for download process done")
                var fs = require('fs');
                fs.readdirSync(downloadPath).forEach(file => {
                    const filePath = `${downloadPath}/${file}`
                    console.log("FILE:::", filePath)

                    var params = {
                        Bucket: bucketName,
                        Key: `recording/${file}`
                    };
                    params.Body = fs.readFileSync(filePath);

                    s3.putObject(params, function (err, data) {
                        if (err) console.log(err, err.stack);
                        else console.log(data);
                    });

                });
                browser.close();
                server.close();
                break

        }
    });

    function listenFor(type) {
        return page.evaluateOnNewDocument(type => {
            // document.addEventListener('recordStart', e => {
            //     window.onCustomEvent({ type: 'recordSrart', detail: e.detail });
            // });
            // document.addEventListener('recordFin', e => {
            //     window.onCustomEvent({ type: 'recordFin', detail: e.detail });
            // });
            document.addEventListener('terminate', e => {
                window.onCustomEvent({ type: 'terminate', detail: e.detail });
            });
            // document.addEventListener('get_local_ip', e => {
            //     window.onCustomEvent({ type: 'get_local_ip', detail: e.detail });
            // });

        }, type);
    }

    await listenFor();

    await page.goto(meetingURL);
    await page._client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: downloadPath
    });
})
