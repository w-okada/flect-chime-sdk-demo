fs = require('fs');

const puppeteer = require('puppeteer-core');

// const meetingURL = process.env.MEETING_URL | "NO URL ENV"
// console.log("REQUESTED MEETING URL::::::", meetingURL)
const args = process.argv.slice(2);

const meetingURL    = args[0]
const bucketARN     = args[1]
const browserWidth  = args[1];
const browserHeight = args[2];

console.log(`meetingURL: ${meetingURL}, bucketARN:${bucketARN}, width:${browserWidth}, height:${browserHeight}`);


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
    await page.goto(meetingURL);    

    // // await page.goto('https://f-backendstack-dev-bucket.s3.amazonaws.com/index.html');    

    // await page.exposeFunction('onCustomEvent', e => {
    //     console.log(`ZZZZZZZZZZZZZZZZZZZZZ ${e.type} fired`, e.detail || '');
    // });

    // function listenFor(type) {
    //     return page.evaluateOnNewDocument(type => {
    //       document.addEventListener(type, e => {
    //         window.onCustomEvent({type, detail: e.detail});
    //       });
    //     }, type);
    // }

    // await listenFor('recordeFin1111');


    // await page.$eval("#email", element => element.value = 'mail2wokada@gmail.com');
    // await page.$eval("#password", element => element.value = 'test22');

    // let loadPromise = page.waitForNavigation();
    // await page.click('#submit');
    // await loadPromise;


    // //await page.$eval("#MeetingName", element => element.value = 'lab');
    // //await page.$eval("#UserName", element => element.value = 'recorder');
    // await page.type("#MeetingName", 'lab');
    // await page.type("#UserName", 'recorder');

    // try{
	// loadPromise = page.waitForNavigation();
	// await page.click('#submit');
	// await loadPromise;
    // }catch(e){
	// console.log(e)
    // }

    // loadPromise = page.waitForNavigation();
    // await page.click('#submit');
    // await loadPromise;
    
    // await page.click('#open-drawer');
    // await sleep(1000);
    // await page.click('#recorder-start');

    // const stop = async () =>{
	// client = await page.target().createCDPSession();
	// client.send('Page.setDownloadBehavior', {
    //         behavior: 'allow', // ダウンロードを許可
    //         downloadPath: 'downloads', // ダウンロード先のフォルダを指定
    //     });
	
	// await page.click('#recorder-stop');
	// await page.screenshot({path: 'example.png'});
		
	// let filename;
	// while ( ! filename || filename.endsWith('.crdownload')) {
	//     console.log("WAITING....")
	//     filename = fs.readdirSync("downloads")[0];
	//     await sleep(5000);
	// }

	// const stop2 = async() =>{
	//     await browser.close();
	// }	

	// setTimeout(stop2, 55000)
    // }
    
    // setTimeout(stop,3000)
    
    
})
