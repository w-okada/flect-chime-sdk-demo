fs = require('fs');
const AWS = require('aws-sdk');
if(process.env.AWS_KEY){
    console.log("AWS_KEY:", process.env.AWS_KEY)
    AWS.config.loadFromPath(process.env.AWS_KEY);
}

const puppeteer = require('puppeteer-core');

// const meetingURL = process.env.MEETING_URL | "NO URL ENV"
// console.log("REQUESTED MEETING URL::::::", meetingURL)
const args = process.argv.slice(2);

const meetingURL    = args[0]
const bucketName    = args[1]
const browserWidth  = args[1];
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
}).then(async(browser)=>{
    const page = await browser.newPage();
    page.on(`console`, msg => {
	for (let i = 0; i < msg._args.length; ++i) {
            console.log(`${i}: ${msg._args[i]}`);
	}
    });

    // // await page.goto('https://f-backendstack-dev-bucket.s3.amazonaws.com/index.html');    


    await page.exposeFunction('onCustomEvent', e => {
        console.log(`ZZZZZZZZZZZZZZZZZZZZZ ${e.type} fired`, e.detail || '');
        switch(e.type){
            case "recordFin":
                (async () =>{
                    console.log("RECORD FIN RECEIVED")
                    // await page._client.send('Page.setDownloadBehavior', {
                    //   behavior : 'allow',
                    //   downloadPath: downloadPath
                    // });
    
                    console.log("RECORD FIN 1")
                    // await page.click('#activeVideoLink');
                    console.log("RECORD FIN 2")
                    // await page.click('#allVideoLink');
                    console.log("RECORD FIN 3")
                })()
                break

            case "terminate":
                console.log("TERMINATE----------------!")
                s3 = new AWS.S3({ params: { Bucket: bucketName } });
                
                (async () =>{
                    await sleep(1000*60)
                    var fs = require('fs');
                    fs.readdirSync(downloadPath).forEach(file => {
                        const filePath = `${downloadPath}/${file}`
                        console.log("FILE:::",filePath)
                        
                        var params = {
                            Bucket: bucketName,
                            Key: `recording/${file}`
                        };
                        params.Body = fs.readFileSync(filePath);
    
                        s3.putObject(params, function(err, data) {
                            if (err) console.log(err, err.stack);
                            else     console.log(data);
                          });
                    });
                    })()
                browser.close();
                break

        }
    });

    function listenFor(type) {
        return page.evaluateOnNewDocument(type => {
            document.addEventListener('recordStart', e => {
                window.onCustomEvent({type:'recordSrart', detail: e.detail});
            });
            document.addEventListener('recordFin', e => {
                window.onCustomEvent({type:'recordFin', detail: e.detail});
            });
            document.addEventListener('terminate', e => {
                window.onCustomEvent({type:'terminate', detail: e.detail});
            });
        }, type);
    }

    await listenFor();

    await page.goto(meetingURL);    
    await page._client.send('Page.setDownloadBehavior', {
        behavior : 'allow',
        downloadPath: downloadPath
    });



})
