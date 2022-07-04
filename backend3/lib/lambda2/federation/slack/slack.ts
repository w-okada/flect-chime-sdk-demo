import { APIGatewayEvent, Context as LambdaContext } from "aws-lambda";
import * as awsServerlessExpress from "aws-serverless-express";
import { App, ExpressReceiver, ViewSubmitAction, Context, LogLevel, CodedError, BlockAction, StaticSelectAction, RadioButtonsAction, GlobalShortcut, Installation, InstallationQuery, AppOptions, View } from "@slack/bolt";
import { addTeamInformation, deleteInstallation, fetchInstallation, fetchToken } from "./auth";
import { v4 } from "uuid";
import { ActionIds, generateControlBlocks, generateJoinModal } from "./blocks";
import { RoomInfo } from "./data/room";
import { ChimeInfo, UserInformation } from "./data/userInfo";
import { Encrypter } from "./encrypter";

const receiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET || "",
    endpoints: `/slack/events`,
    clientId: process.env.SLACK_CLIENT_ID || "",
    clientSecret: process.env.SLACK_CLIENT_SECRET || "",
    stateSecret: process.env.SLACK_STATE_SECRET || "",
    scopes: ["channels:history", "chat:write", "commands", "groups:history", "users:read"],
    installationStore: {
        storeInstallation: async <AuthVersion extends "v1" | "v2">(installation: Installation<AuthVersion, boolean>) => {
            await addTeamInformation(installation);
            return;
        },
        // @ts-ignore
        fetchInstallation: async (installQuery: InstallationQuery<boolean>) => {
            const token = await fetchInstallation(installQuery);
            console.log(`FETCH: ${JSON.stringify(token)}`);
            return token;
        },
        deleteInstallation: async (installQuery: InstallationQuery<boolean>) => {
            await deleteInstallation(installQuery);
            return;
        },
    },
    installerOptions: {
        directInstall: true,
    },
});
const config: AppOptions = {
    receiver,
    // token: process.env.SLACK_BOT_TOKEN, // for one workspace複数ワークスペースの場合はoauth installer or authorizeを使えと。
    // signingSecret: process.env.SLACK_SIGNING_SECRET,
    // logLevel: LogLevel.DEBUG,
    // processBeforeResponse: true,
};

const app = new App(config);

//////// (a) slash command
app.command("/chime-meeting", async ({ command, ack, say }) => {
    // await ack(); //　(★１)なぜかack後にpostができないので最後にackする。なお、ackしないとslack側でtimeoutが発生してしまう。
    const token = await fetchToken(command.team_id);
    console.log(`GET TOKEN: ${token.substring(0, 10)}...`);
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
    const roomName = command.text;
    const roomInfo: RoomInfo = {
        roomName: roomName,
        teamId: "",
        channelId: "",
        channelName: "",
        ts: "",
        attendees: [],
        ttl: 0,
    };
    const controlBlocks = generateControlBlocks(roomInfo);

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
    roomInfo.ts = ts;

    ack(); // (★１)
});

//////// (b) Join button clicked.
app.action("join", async ({ client, context, body, action, ack, logger }) => {
    console.log(JSON.stringify(client.slackApiUrl));
    console.log(`JOIN Button Clicked`);
    // await ack();// (★１)
    const token = await fetchToken(body.team.id);
    const user = await app.client.users.info({ user: body.user.id, token: token });
    // @ts-ignore
    const roomName = action.value;
    const userInfo: UserInformation = {
        roomName: roomName,
        teamId: body.team.id,
        channelId: body.channel.id,
        channelName: body.channel.name,
        userId: body.user.id,
        // @ts-ignore
        userName: body.user.username,
        imageUrl: user["user"]["profile"]["image_192"],
        chimeInfo: {
            // @ts-ignore
            attendeeName: body.user.username,
            useDefault: true,
        },
    };
    console.log(`User Info: ${JSON.stringify(userInfo)}`);
    if (!userInfo.roomName) {
        app.client.chat.postEphemeral({
            channel: userInfo.channelId,
            text: `ROOM[${userInfo.roomName}] not found`,
            user: userInfo.userId,
            token: token,
        });
        return;
    }

    const urlEncrypter = new Encrypter<UserInformation>({
        password: process.env.SLACK_APP_DB_PASSWORD || "pass",
        salt: process.env.SLACK_APP_DB_SALT || "salt",
        secret: process.env.SLACK_APP_DB_SECRET || "secret",
        expireSec: 60 * 60, // 60min
    });

    const encInfo = urlEncrypter.encodeInformation(userInfo);
    const CHIME_BASE_URL = process.env.DEMO_ENDPOINT;
    // const url = `${CHIME_BASE_URL}/default/index.html?slack_token=${encInfo}&restapi_endpoint_base=${BASE_URL}`;
    // TODO: REST API BASE URL
    const url = `${CHIME_BASE_URL}/default/index.html?slack_token=${encInfo}`;
    console.log(`URL::: ${url}`);
    const res = await app.client.views.open({
        // @ts-ignore
        trigger_id: body.trigger_id,
        token: token,
        view: generateJoinModal(userInfo, url) as View,
    });
    if (!res.ok) {
        logger.info(`Failed to open a modal - ${JSON.stringify(res)}`);
    }

    ack(); // (★１)
    return;
});

//////// (c) Join Modal
/** show いらない？？*/
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
    console.log(`Parameter Updated.`);
    // await ack();// (★１)
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

    const urlEncrypter = new Encrypter<UserInformation>({
        password: process.env.SLACK_APP_DB_PASSWORD || "pass",
        salt: process.env.SLACK_APP_DB_SALT || "salt",
        secret: process.env.SLACK_APP_DB_SECRET || "secret",
        expireSec: 60 * 60, // 60min
    });

    const encInfo = urlEncrypter.encodeInformation(userInfo);
    const CHIME_BASE_URL = process.env.DEMO_ENDPOINT;
    // const url = `${CHIME_BASE_URL}/default/index.html?slack_token=${encInfo}&restapi_endpoint_base=${BASE_URL}`;
    // TODO: REST API BASE URL
    const url = `${CHIME_BASE_URL}/default/index.html?slack_token=${encInfo}`;
    console.log(`URL:1:: ${url}`);

    app.client.views.update({
        view_id: (body as BlockAction).view.id,
        view: generateJoinModal(userInfo, url) as View,
        hash: (body as BlockAction).view.hash,
        token: token,
    });
    await ack();
    return;
});

/** enter clicked action (Currently nop) */
app.action(ActionIds.EnterMeeting, async ({ body, action, ack, respond }) => {
    console.log("Enter Meeting clicked!");
    // ack();
    // Todo: How to close modal...?
});

const server = awsServerlessExpress.createServer(receiver.app);
module.exports.handler = (event: APIGatewayEvent, context: LambdaContext, callback: any) => {
    console.log("⚡️ Bolt app is running!");
    console.log("Event", JSON.stringify(event));
    console.log("Context", JSON.stringify(context));
    console.log(`resource: ${event.resource}`);
    if (event.resource === "/slack/api/{operation}") {
        const operation = event.pathParameters["operation"];
        console.log(`resource: ${operation}`);
        if (operation === "decodeInformation") {
            console.log(`body: ${event.body}`);
            const token = JSON.parse(event.body)["token"];
            console.log(`token: ${token}`);

            const urlEncrypter = new Encrypter<UserInformation>({
                password: process.env.SLACK_APP_DB_PASSWORD || "pass",
                salt: process.env.SLACK_APP_DB_SALT || "salt",
                secret: process.env.SLACK_APP_DB_SECRET || "secret",
                expireSec: 60 * 60, // 60min
            });

            const userInfo = urlEncrypter.decodeInformation(token);
            console.log(`userInfo: ${JSON.stringify(userInfo)}`);

            var response = {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
                    "Access-Control-Allow-Methods": "*",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({
                    success: true,
                    code: "SUCCESS",
                    data: userInfo,
                }),
                isBase64Encoded: false,
            };
            callback(null, response);
        }
    } else {
        awsServerlessExpress.proxy(server, event, context);
    }
};
