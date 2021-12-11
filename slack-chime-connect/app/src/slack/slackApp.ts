import { App, AppOptions, BlockAction, BlockElementAction, DialogSubmitAction, ExpressReceiver, Installation, InstallationQuery, InteractiveAction, SlackAction, View, WorkflowStepEdit } from "@slack/bolt";
import * as express from "express";
import { addTeamInformation, deleteInstallation, fetchInstallation, fetchToken } from "./auth";
import { v4 } from "uuid";
import { ChimeInfo, generateInitialRoom, ROOMS, UserInformation } from "./data";
import { generateControlBlocks, generateJoinModal } from "./blocks";
import { Encrypter } from "./encrypt";
import { User } from "@slack/web-api/dist/response/AdminAppsRequestsListResponse";
import { Failure, NoSuchRoomError, Result, Success } from "../@types/exception";
import { ActionIds } from "./const";
import cors from "cors";
import { HTTPResponseBody, HTTPResponseCode, SlackHTTPGetUserInformationRequest } from "./http_request";

const BASE_URL = process.env.APP_HEROKU_URL;
const CHIME_BASE_URL = process.env.APP_CHIME_BASE_URL;
const STATIC_PATH = __dirname + "/../frontend/dist/";

const rooms: ROOMS = {};
const urlEncrypter = new Encrypter({});

// (1) Express Receiver setting
//// (1-1) Slac Basic setting
const receiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    endpoints: `/slack/events`,
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    stateSecret: process.env.SLACK_STATE_SECRET,
    scopes: ["chat:write", "commands", "users:read"],
    installationStore: {
        storeInstallation: async <AuthVersion extends "v1" | "v2">(installation: Installation<AuthVersion, boolean>) => {
            addTeamInformation(installation);
            return;
        },
        fetchInstallation: async (installQuery: InstallationQuery<boolean>) => {
            return fetchInstallation(installQuery);
        },
        deleteInstallation: async (installQuery: InstallationQuery<boolean>) => {
            deleteInstallation(installQuery);
            return;
        },
    },
    installerOptions: {
        directInstall: true,
    },
});
receiver.app.use(cors());

//// (1-2) Static Setting
receiver.app.use("/static", express.static(STATIC_PATH));

//// (1-3) REST Setting
receiver.app.use(express.json());
receiver.app.post(`/api/decodeInformation`, async (req, res) => {
    const request = req.body as SlackHTTPGetUserInformationRequest;
    try {
        console.log("requested token!", request.token);
        const info = urlEncrypter.decodeInformation<UserInformation>(request.token);
        const response: HTTPResponseBody = {
            success: true,
            code: HTTPResponseCode.SUCCESS,
            data: info,
        };
        res.send(JSON.stringify(response));
    } catch (exception) {
        console.log(exception);
        const response: HTTPResponseBody = {
            success: false,
            code: HTTPResponseCode.INVALID_TOKEN_EXCEPTION,
            data: exception,
        };
        res.send(JSON.stringify(response));
    }
});

//// (1-4) Create App
const config: AppOptions = {
    receiver,
};
const app = new App(config);

//// (1-5) Slack App setting
////// (1-5-1) helper funcs
const generateUserInformatiion = async (token: string, body: SlackAction, action: DialogSubmitAction | WorkflowStepEdit | BlockElementAction | InteractiveAction): Promise<UserInformation> => {
    console.log("body", JSON.stringify(body));
    console.log("action", JSON.stringify(action));
    // @ts-ignore
    const roomKey = action.value;
    console.log("RoomKey", roomKey);
    const roomName = rooms[roomKey] ? rooms[roomKey].roomName : null;
    const teamId = body.team.id;
    const channelId = body.channel.id;
    const channelName = body.channel.name;
    const userId = body.user.id;
    // @ts-ignore
    const userName = body.user.username;

    const userInfo = await app.client.users.info({ user: userId, token: token });
    const imageUrl = userInfo["user"]["profile"]["image_192"];

    const user: UserInformation = {
        roomKey,
        roomName,
        teamId,
        channelId,
        channelName,
        userId,
        userName,
        imageUrl,
    };
    return user;
};

const generateChimeUrl = (userInfo: UserInformation) => {
    const encInfo = urlEncrypter.encodeInformation<UserInformation>(userInfo);
    const url = `${CHIME_BASE_URL}/default/index.html?slack_token=${encInfo}&restapi_endpoint_base=${BASE_URL}`;
    return url;
};

////// (1-5-2) main funcs
//////// (a) slash command
app.command("/chime-meeting", async ({ command, ack, say }) => {
    await ack();
    const token = await fetchToken(command.team_id);
    // //// helpを入力された場合
    // if (command.text === "help") {
    //     const helpBlocks = generateHelpBlocks();
    //     app.client.chat.postEphemeral({
    //         channel: command.channel_id,
    //         blocks: helpBlocks,
    //         user: command.user_id,
    //         token: token,
    //     });
    //     return;
    // }

    /// 通常ケース
    const uuid = v4();
    const room = generateInitialRoom(uuid, command.team_id, command.channel_id, command.channel_name, "", command.text, null, null, true);
    const controlBlocks = generateControlBlocks(room);

    const msg = {
        // @ts-ignore
        channel: command.channel_id,
        // token: process.env.SLACK_BOT_TOKEN,
        token: token,
        blocks: controlBlocks,
        text: "rendering failed??",
    };

    const postResult = await app.client.chat.postMessage(msg);
    const ts = postResult.ts;
    room.ts = ts;
    rooms[uuid] = room;
});

//////// (b) Join button clicked.
app.action("join", async ({ body, action, ack, logger }) => {
    await ack();
    const token = await fetchToken(body.team.id);
    const userInfo = await generateUserInformatiion(token, body, action);
    if (!userInfo.roomName) {
        app.client.chat.postEphemeral({
            channel: userInfo.channelId,
            text: `ROOM[${userInfo.roomKey}] not found`,
            user: userInfo.userId,
            token: token,
        });
        return;
    }

    const chimeInfo: ChimeInfo = {
        attendeeName: userInfo.userName,
        useDefault: true,
    };
    userInfo.chimeInfo = chimeInfo;

    const url = generateChimeUrl(userInfo);

    const res = await app.client.views.open({
        // @ts-ignore
        trigger_id: body.trigger_id,
        token: token,
        view: generateJoinModal(userInfo, url) as View,
    });
    if (!res.ok) {
        logger.info(`Failed to open a modal - ${JSON.stringify(res)}`);
    }
    return;
});

//////// (c) Join Modal
/** show */
app.view("join_modal", async ({ payload, view, body, ack }) => {
    console.log("VIEW_TOP CALLED!");
    console.log("payload", JSON.stringify(payload));
    console.log("view", JSON.stringify(view));
    console.log("body", JSON.stringify(body));
    await ack({
        response_action: "update",
        view: {
            type: "modal",
            callback_id: "view_completion",

            title: {
                type: "plain_text",
                text: "My Apaasd-",
                emoji: true,
            },
            blocks: [],
        },
    });
});
/** close action */
app.view({ callback_id: "join_modal", type: "view_closed" }, async ({ ack, logger }) => {
    logger.info("view_top closed.");
    await ack();
});
/** change paramater action */
const joinActionPattern = `${ActionIds.AttendeeNameInputAction}|${ActionIds.DefaultSettingChangeAction}`;
app.action(new RegExp(joinActionPattern), async ({ body, action, ack, respond }) => {
    await ack();
    const token = await fetchToken(body.team.id);
    // @ts-ignore
    const actionId = action.action_id;
    // @ts-ignore
    const userInfo = JSON.parse(body.view.private_metadata) as UserInformation;

    if (actionId === ActionIds.AttendeeNameInputAction) {
        // @ts-ignore
        userInfo.chimeInfo.attendeeName = action.value;
    } else if (actionId === ActionIds.DefaultSettingChangeAction) {
        // @ts-ignore
        const selected = action.selected_options.filter((x) => {
            return x.value === "use-default";
        });
        if (selected.length > 0) {
            userInfo.chimeInfo.useDefault = true;
        } else {
            userInfo.chimeInfo.useDefault = false;
        }
    } else {
        console.log(`unknown action id... ${actionId}`);
    }

    const url = generateChimeUrl(userInfo);

    app.client.views.update({
        view_id: (body as BlockAction).view.id,
        view: generateJoinModal(userInfo, url) as View,
        hash: (body as BlockAction).view.hash,
        token: token,
    });
    return;
});

/** enter clicked action (Currently nop) */
app.action(ActionIds.EnterMeeting, async ({ body, action, ack, respond }) => {
    console.log("Enter Meeting clicked!");
    ack();
    // Todo: How to close modal...?
});

export const startSlackApp = async (port: number) => {
    return await app.start(port);
};
