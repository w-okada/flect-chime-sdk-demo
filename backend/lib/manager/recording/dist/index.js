"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var puppeteer_1 = __importDefault(require("puppeteer"));
var http_1 = __importDefault(require("http"));
var io = __importStar(require("socket.io"));
var async_lock_1 = __importDefault(require("async-lock"));
var fs = __importStar(require("fs"));
var aws = __importStar(require("aws-sdk"));
// var lock = new AsyncLock({timeout: 1000 * 30 });
var lock = new async_lock_1.default();
var finalize = false;
var page;
var hostname = '0.0.0.0';
var port = 3000;
var protocol = 'http';
var server = http_1.default.createServer({}, function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log(request.method + " " + request.url + " BEGIN");
        return [2 /*return*/];
    });
}); });
server.listen(port, hostname, function () {
    console.log(hostname + ":" + port);
});
var io_server = new io.Server(server, {
    allowEIO3: true
});
var now = function () { return new Date().toISOString().substr(14, 9); };
var sleep = function (ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
};
var initialState = {
    hmmAttendeeId: "",
    state: 3,
    lobbyCode: "",
    gameRegion: 0,
    map: 0,
    connectCode: "",
    players: [],
};
var gameState = __assign(__assign({}, initialState), { players: [] });
io_server.on('connection', function (client) {
    ///////////////////////////////////////////////////////
    // handle socket io event start
    ///////////////////////////////////////////////////////
    //@ts-ignore
    client.on('connectCode', function (connectCode) {
        lock.acquire('io_on', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log(now(), '  Lock Function Start');
                console.log("AMONG: [connectCode]", connectCode);
                //@ts-ignore
                client.connectCode = connectCode;
                // await page.$eval('#io_event', (el, value) => el.value = "connectCode");
                // await page.$eval('#io_data', (el, value) => el.value = value, "");
                // await page.click("#io_click")
                gameState = __assign(__assign({}, initialState), { players: [] });
                console.log(now(), '  Lock Function End');
                return [2 /*return*/, 'Successful'];
            });
        }); }, function (error, result) {
            console.log(now(), '  Lock Result Start');
            if (error) {
                console.log(now(), '    Failure : ', error);
            }
            else {
                console.log(now(), '    Success : ', result);
            }
            console.log(now(), '  Lock Result End');
        });
    });
    //@ts-ignore
    client.on('lobby', function (data) {
        lock.acquire('io_on', function () { return __awaiter(void 0, void 0, void 0, function () {
            var lobbyData;
            return __generator(this, function (_a) {
                console.log(now(), '  Lock Function Start');
                console.log("AMONG: [lobby]", data);
                lobbyData = JSON.parse(data);
                gameState.lobbyCode = lobbyData.LobbyCode;
                gameState.gameRegion = lobbyData.Region;
                gameState.map = lobbyData.Map;
                // request data ID 
                // enum GameDataType{
                //     GameState = 1,
                //     Players = 2,
                //     LobbyCode = 4
                // }
                client.emit("requestdata", 2);
                console.log(now(), '  Lock Function End');
                return [2 /*return*/, 'Successful'];
            });
        }); }, function (error, result) {
            console.log(now(), '  Lock Result Start');
            if (error) {
                console.log(now(), '    Failure : ', error);
            }
            else {
                console.log(now(), '    Success : ', result);
            }
            console.log(now(), '  Lock Result End');
        });
    });
    //@ts-ignore
    client.on('state', function (index) {
        lock.acquire('io_on', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log(now(), '  Lock Function Start');
                console.log("AMONG: [state]", index);
                // await page.$eval('#io_event', (el, value) => el.value = "state");
                // await page.$eval('#io_data', (el, value) => el.value = value, index);
                // await page.click("#io_click")
                if (index == 0 || index == 3) { // Lobby(0),Menu(3)
                    gameState.players = [];
                }
                if (index == 2) { // discussion update player status
                    // request data ID 
                    // enum GameDataType{
                    //     GameState = 1,
                    //     Players = 2,
                    //     LobbyCode = 4
                    // }
                    client.emit("requestdata", 2);
                }
                gameState.state = index;
                console.log(now(), '  Lock Function End');
                return [2 /*return*/, 'Successful'];
            });
        }); }, function (error, result) {
            console.log(now(), '  Lock Result Start');
            if (error) {
                console.log(now(), '    Failure : ', error);
            }
            else {
                console.log(now(), '    Success : ', result);
            }
            console.log(now(), '  Lock Result End');
        });
    });
    //@ts-ignore
    client.on('player', function (data) {
        lock.acquire('io_on', function () { return __awaiter(void 0, void 0, void 0, function () {
            var playerData, newPlayers, newPlayer;
            return __generator(this, function (_a) {
                console.log(now(), '  Lock Function Start');
                console.log("AMONG: [player]", data);
                // await page.$eval('#io_event', (el, value) => el.value = "player");
                // await page.$eval('#io_data', (el, value) => el.value = value, data);
                // await page.click("#io_click")
                if (gameState.state == 1) { // tasks, skip update player status
                    return [2 /*return*/];
                }
                playerData = JSON.parse(data);
                newPlayers = gameState.players.filter(function (x) { return x.name !== playerData.Name; }) // not target players
                ;
                newPlayer = {
                    name: playerData.Name,
                    isDead: playerData.IsDead,
                    disconnected: playerData.Disconnected,
                    action: parseInt(playerData.Action),
                    color: parseInt(playerData.Color)
                };
                if (parseInt(playerData.Action) !== 1) { // leave
                    newPlayers.push(newPlayer);
                }
                gameState.players = newPlayers;
                console.log(now(), '  Lock Function End');
                return [2 /*return*/, 'Successful'];
            });
        }); }, function (error, result) {
            console.log(now(), '  Lock Result Start');
            if (error) {
                console.log(now(), '    Failure : ', error);
            }
            else {
                console.log(now(), '    Success : ', result);
            }
            console.log(now(), '  Lock Result End');
        });
    });
    //@ts-ignore
    client.on('disconnect', function () {
        lock.acquire('io_on', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log(now(), '  Lock Function Start');
                console.log("AMONG: [dissconnect]");
                // await page.$eval('#io_event', (el, value) => el.value = "disconnect");
                // await page.$eval('#io_data', (el, value) => el.value = value, "");
                // await page.click("#io_click")
                gameState.players = [];
                console.log(now(), '  Lock Function End');
                return [2 /*return*/, 'Successful'];
            });
        }); }, function (error, result) {
            console.log(now(), '  Lock Result Start');
            if (error) {
                console.log(now(), '    Failure : ', error);
            }
            else {
                console.log(now(), '    Success : ', result);
            }
            console.log(now(), '  Lock Result End');
        });
    });
    ///////////////////////////////////////////////////////
    // handle socket io event end
    ///////////////////////////////////////////////////////
});
var uploadGameState = function () {
    // console.log("upload game state1-1[cpu]", os.cpus())
    // console.log("upload game state1-2[total mem]", os.totalmem())
    // console.log("upload game state1-3[free mem]", os.freemem())
    if (page) {
        console.log("upload game state2");
        lock.acquire('io_on', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log(now(), '  Lock Function Start');
                        //        await page.$eval('#io_event', (el, value) => el.value = "lobby");
                        // @ts-ignore
                        return [4 /*yield*/, page.$eval('#io_data', function (el, value) { return el.value = value; }, JSON.stringify(gameState))];
                    case 1:
                        //        await page.$eval('#io_event', (el, value) => el.value = "lobby");
                        // @ts-ignore
                        _a.sent();
                        return [4 /*yield*/, page.click("#io_click")];
                    case 2:
                        _a.sent();
                        console.log(now(), '  Lock Function End');
                        return [2 /*return*/, 'Successful'];
                }
            });
        }); }, function (error, result) {
            console.log(now(), '  Lock Result Start');
            if (error) {
                console.log(now(), '    Failure : ', error);
            }
            else {
                console.log(now(), '    Success : ', result);
            }
            console.log(now(), '  Lock Result End');
            if (finalize) {
            }
            else {
                setTimeout(uploadGameState, 1000 * 2);
            }
        });
    }
    else {
        setTimeout(uploadGameState, 1000 * 2);
    }
};
uploadGameState();
var args = process.argv.slice(2);
var meetingURL = args[0];
var bucketName = args[1];
var browserWidth = args[1];
var browserHeight = args[2];
console.log("meetingURL: " + meetingURL + ", bucketName:" + bucketName + ", width:" + browserWidth + ", height:" + browserHeight);
var downloadPath = './download';
puppeteer_1.default.launch({
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
}).then(function (browser) { return __awaiter(void 0, void 0, void 0, function () {
    function listenFor() {
        return page.evaluateOnNewDocument(function () {
            document.addEventListener('terminate', function (e) {
                // @ts-ignore
                window.onCustomEvent({ type: 'terminate', detail: e.detail });
                // @ts-ignore
                window.onCustomEvent({ type: 'uploadVideo', detail: e.detail });
            });
        });
    }
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, browser.newPage()];
            case 1:
                page = _a.sent();
                page.on("console", function (msg) {
                    for (var i = 0; i < msg.args().length; ++i) {
                        console.log(i + ": " + msg.args()[i]);
                    }
                });
                return [4 /*yield*/, page.exposeFunction('onCustomEvent', function (e) { return __awaiter(void 0, void 0, void 0, function () {
                        var s3, promises, _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    console.log("ZZZZZZZZZZZZZZZZZZZZZ " + e.type + " fired", e.detail || '');
                                    s3 = new aws.S3({ params: { Bucket: bucketName } });
                                    promises = [];
                                    _a = e.type;
                                    switch (_a) {
                                        case "terminate": return [3 /*break*/, 1];
                                        case "uploadVideo": return [3 /*break*/, 3];
                                    }
                                    return [3 /*break*/, 5];
                                case 1:
                                    console.log("TERMINATE----------------!");
                                    console.log("wait 20sec for download process");
                                    return [4 /*yield*/, sleep(1000 * 20)];
                                case 2:
                                    _b.sent();
                                    console.log("wait 20sec for download process done");
                                    // const s3 = new aws.S3({ params: { Bucket: bucketName } });
                                    // let promises:Promise<any>[] = []
                                    fs.readdirSync(downloadPath).forEach(function (file) {
                                        var filePath = downloadPath + "/" + file;
                                        console.log("FILE:::", filePath);
                                        var params = {
                                            Bucket: bucketName,
                                            Key: "recording/" + file
                                        };
                                        params.Body = fs.readFileSync(filePath);
                                        var p = s3.putObject(params, function (err, data) {
                                            if (err)
                                                console.log(err, err.stack);
                                            else
                                                console.log(data);
                                        }).promise();
                                        promises.push(p);
                                    });
                                    Promise.all(promises).then(function () {
                                        try {
                                            browser.close();
                                        }
                                        catch (exception) {
                                            console.log("browser closing exception ..., " + exception);
                                        }
                                        try {
                                            io_server.disconnectSockets();
                                        }
                                        catch (exception) {
                                            console.log("io_server disconnecting exception ..., " + exception);
                                        }
                                        try {
                                            server.close();
                                        }
                                        catch (exception) {
                                            console.log("server closing exception ..., " + exception);
                                        }
                                        finalize = true;
                                    });
                                    return [3 /*break*/, 5];
                                case 3:
                                    console.log("uploadVideo----------------!");
                                    console.log("wait 20sec for download process");
                                    return [4 /*yield*/, sleep(1000 * 20)];
                                case 4:
                                    _b.sent();
                                    console.log("wait 20sec for download process done");
                                    fs.readdirSync(downloadPath).forEach(function (file) {
                                        var filePath = downloadPath + "/" + file;
                                        console.log("FILE:::", filePath);
                                        var params = {
                                            Bucket: bucketName,
                                            Key: "recording/" + file
                                        };
                                        params.Body = fs.readFileSync(filePath);
                                        var p = s3.putObject(params, function (err, data) {
                                            if (err)
                                                console.log(err, err.stack);
                                            else
                                                console.log(data);
                                        }).promise();
                                        promises.push(p);
                                    });
                                    console.log("uploadVideo----------------! done!");
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); })];
            case 2:
                _a.sent();
                return [4 /*yield*/, listenFor()];
            case 3:
                _a.sent();
                return [4 /*yield*/, page.goto(meetingURL)
                    // @ts-ignore
                ];
            case 4:
                _a.sent();
                // @ts-ignore
                return [4 /*yield*/, page._client.send('Page.setDownloadBehavior', {
                        behavior: 'allow',
                        downloadPath: downloadPath
                    })];
            case 5:
                // @ts-ignore
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
