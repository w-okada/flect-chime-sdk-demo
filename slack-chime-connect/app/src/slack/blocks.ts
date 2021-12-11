import { ActionIds } from "./const";
import { ROOM, UserInformation } from "./data";

const MAX_MESSAGE_NUM = 12;

export const generateControlBlocks = (data: ROOM) => {
    const blocks: any[] = [];
    const enbaleLabel = data.enabled ? "enabled" : "disabled";
    const buttonLabel = data.enabled ? "disable" : "enable";

    const headerBlock = {
        type: "header",
        text: {
            type: "plain_text",
            text: data.roomName || "ROOM",
            emoji: true,
        },
    };
    blocks.push(headerBlock);
    const topBlock = {
        type: "section",
        text: {
            type: "mrkdwn",
            text: `Amazon Chime Meeting (${data.roomName || "ROOM"}) is registered.`,
        },
    };
    blocks.push(topBlock);

    const secondBlock = {
        type: "actions",
        elements: [
            {
                type: "button",
                text: {
                    type: "plain_text",
                    emoji: true,
                    text: "join",
                },
                action_id: "join",
                value: data.key,
                style: "primary",
            },
        ],
    };
    blocks.push(secondBlock);
    return blocks;
};

export const generateMessageBlocks = (room: ROOM) => {
    const blocks: any[] = [];

    return room.words.slice(-1 * MAX_MESSAGE_NUM).map((entry) => {
        const text = `*${entry.userName}*: ${entry.word} [${new Date(entry.timestamp).toLocaleTimeString()}]`;
        return {
            type: "context",
            elements: [
                {
                    type: "image",
                    image_url: entry.imageUrl,
                    alt_text: "icon",
                },
                {
                    type: "mrkdwn",
                    text: text,
                },
            ],
        };
    });
};

export const generateWholeBlocks = (room: ROOM) => {
    if (room.enabled) {
        const controlBlocks = generateControlBlocks(room);
        const messageBlocks = generateMessageBlocks(room);
        return [...controlBlocks, ...messageBlocks];
    } else {
        const controlBlocks = generateControlBlocks(room);
        return [...controlBlocks];
    }
};

export const generateJoinModal = (userInfo: UserInformation, url: string) => {
    const intial_options = [];
    if (userInfo.chimeInfo.useDefault) {
        intial_options.push({
            text: {
                type: "mrkdwn",
                text: "Use default setting",
            },
            description: {
                type: "mrkdwn",
                text: "defalut microphone, camera, speaker, etc",
            },
            value: "use-default",
        });
    }
    const block = {
        type: "modal",
        callback_id: "join_modal",
        private_metadata: JSON.stringify(userInfo),
        title: {
            type: "plain_text",
            text: `slack-chime-connect`,
            emoji: true,
        },
        close: {
            type: "plain_text",
            text: "Close",
            emoji: true,
        },
        notify_on_close: true,
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `You are going to join "${userInfo.roomName}"". Please input your name and configrations.`,
                },
            },
            {
                type: "input",
                dispatch_action: true,
                element: {
                    type: "plain_text_input",
                    action_id: ActionIds.AttendeeNameInputAction,
                    initial_value: `${userInfo.chimeInfo.attendeeName}`,
                    dispatch_action_config: {
                        trigger_actions_on: ["on_character_entered", "on_enter_pressed"],
                    },
                },
                label: {
                    type: "plain_text",
                    text: "User Name",
                    emoji: true,
                },
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "Select your favarite.",
                },
                accessory: {
                    type: "checkboxes",
                    options: [
                        {
                            text: {
                                type: "mrkdwn",
                                text: "Use default setting",
                            },
                            description: {
                                type: "mrkdwn",
                                text: "defalut microphone, camera, speaker, etc",
                            },
                            value: "use-default",
                        },
                    ],
                    initial_options: intial_options,
                    action_id: ActionIds.DefaultSettingChangeAction,
                },
            },
            {
                type: "actions",
                elements: [
                    {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: "enter meeting",
                            emoji: true,
                        },
                        url: url,
                        action_id: ActionIds.EnterMeeting,
                    },
                ],
            },
        ],
    };

    return block;
};

export const generateOpenURLBlocks = (url: string) => {
    return [
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `Open new tab to join the meeting.`,
            },
            accessory: {
                type: "button",
                text: {
                    type: "plain_text",
                    emoji: true,
                    text: "openTab",
                },
                url: url,
                action_id: "openTab",
            },
        },
    ];
};

export const generateHelpBlocks = () => {
    return [
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `SHOWING HELP`,
            },
            accessory: {
                type: "button",
                text: {
                    type: "plain_text",
                    emoji: true,
                    text: "openTab",
                },
                action_id: "openTab",
            },
        },
    ];
};
