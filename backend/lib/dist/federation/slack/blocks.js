"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHelpBlocks = exports.generateOpenURLBlocks = exports.generateJoinModal = exports.generateWholeBlocks = exports.generateControlBlocks = exports.ActionIds = void 0;
exports.ActionIds = {
    AttendeeNameInputAction: "AttendeeNameInputAction",
    DefaultSettingChangeAction: "DefaultSettingChangeAction",
    EnterMeeting: "EnterMeeting",
};
const generateControlBlocks = (data) => {
    const blocks = [];
    const headerBlock = {
        type: "header",
        text: {
            type: "plain_text",
            text: `Room[${data.roomName || "ROOM"}] is opened!`,
            emoji: true,
        },
    };
    blocks.push(headerBlock);
    const topBlock1 = {
        type: "section",
        text: {
            type: "mrkdwn",
            text: `capture_code:${data.roomName}`,
        },
    };
    blocks.push(topBlock1);
    const topBlock2 = {
        type: "section",
        text: {
            type: "mrkdwn",
            text: `please click to enter.`,
        },
    };
    blocks.push(topBlock2);
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
                value: data.roomName,
                style: "primary",
            },
        ],
    };
    blocks.push(secondBlock);
    return blocks;
};
exports.generateControlBlocks = generateControlBlocks;
const generateWholeBlocks = (roomInfo) => {
    const controlBlocks = (0, exports.generateControlBlocks)(roomInfo);
    return [...controlBlocks];
};
exports.generateWholeBlocks = generateWholeBlocks;
const generateJoinModal = (userInfo, url) => {
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
                    text: `You are going to join "${userInfo.roomName}". Please input your name and configrations.  (if you change the name, please press 'enter' to update join button)`,
                },
            },
            {
                type: "input",
                dispatch_action: true,
                element: {
                    type: "plain_text_input",
                    action_id: exports.ActionIds.AttendeeNameInputAction,
                    initial_value: `${userInfo.chimeInfo.attendeeName}`,
                    dispatch_action_config: {
                        // trigger_actions_on: ["on_character_entered", "on_enter_pressed"],
                        trigger_actions_on: ["on_enter_pressed"],
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
                    action_id: exports.ActionIds.DefaultSettingChangeAction,
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
                        action_id: exports.ActionIds.EnterMeeting,
                    },
                ],
            },
        ],
    };
    return block;
};
exports.generateJoinModal = generateJoinModal;
const generateOpenURLBlocks = (url) => {
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
exports.generateOpenURLBlocks = generateOpenURLBlocks;
const generateHelpBlocks = () => {
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
exports.generateHelpBlocks = generateHelpBlocks;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2tzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGFtYmRhMi9mZWRlcmF0aW9uL3NsYWNrL2Jsb2Nrcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHYSxRQUFBLFNBQVMsR0FBRztJQUNyQix1QkFBdUIsRUFBRSx5QkFBeUI7SUFDbEQsMEJBQTBCLEVBQUUsNEJBQTRCO0lBQ3hELFlBQVksRUFBRSxjQUFjO0NBQ3RCLENBQUM7QUFHSixNQUFNLHFCQUFxQixHQUFHLENBQUMsSUFBYyxFQUFFLEVBQUU7SUFDcEQsTUFBTSxNQUFNLEdBQVUsRUFBRSxDQUFDO0lBRXpCLE1BQU0sV0FBVyxHQUFHO1FBQ2hCLElBQUksRUFBRSxRQUFRO1FBQ2QsSUFBSSxFQUFFO1lBQ0YsSUFBSSxFQUFFLFlBQVk7WUFDbEIsSUFBSSxFQUFFLFFBQVEsSUFBSSxDQUFDLFFBQVEsSUFBSSxNQUFNLGNBQWM7WUFDbkQsS0FBSyxFQUFFLElBQUk7U0FDZDtLQUNKLENBQUM7SUFDRixNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3pCLE1BQU0sU0FBUyxHQUFHO1FBQ2QsSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUU7WUFDRixJQUFJLEVBQUUsUUFBUTtZQUNkLElBQUksRUFBRSxnQkFBZ0IsSUFBSSxDQUFDLFFBQVEsRUFBRTtTQUN4QztLQUNKLENBQUM7SUFDRixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRXZCLE1BQU0sU0FBUyxHQUFHO1FBQ2QsSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUU7WUFDRixJQUFJLEVBQUUsUUFBUTtZQUNkLElBQUksRUFBRSx3QkFBd0I7U0FDakM7S0FDSixDQUFDO0lBQ0YsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUV2QixNQUFNLFdBQVcsR0FBRztRQUNoQixJQUFJLEVBQUUsU0FBUztRQUNmLFFBQVEsRUFBRTtZQUNO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LEVBQUUsU0FBUztZQUNmLElBQUksRUFBRTtnQkFDRixJQUFJLEVBQUUsUUFBUTtnQkFDZCxJQUFJLEVBQUUsY0FBYzthQUN2QjtZQUNELFNBQVMsRUFBRTtnQkFDUCxJQUFJLEVBQUUsUUFBUTtnQkFDZCxJQUFJLEVBQUU7b0JBQ0YsSUFBSSxFQUFFLFlBQVk7b0JBQ2xCLEtBQUssRUFBRSxJQUFJO29CQUNYLElBQUksRUFBRSxTQUFTO2lCQUNsQjtnQkFDRCxTQUFTLEVBQUUsU0FBUzthQUN2QjtTQUNKO0tBQ0osQ0FBQztBQUNOLENBQUMsQ0FBQztBQW5CVyxRQUFBLGtCQUFrQixzQkFtQjdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUm9vbUluZm8gfSBmcm9tIFwiLi9kYXRhL3Jvb21cIjtcbmltcG9ydCB7IFVzZXJJbmZvcm1hdGlvbiB9IGZyb20gXCIuL2RhdGEvdXNlckluZm9cIjtcblxuZXhwb3J0IGNvbnN0IEFjdGlvbklkcyA9IHtcbiAgICBBdHRlbmRlZU5hbWVJbnB1dEFjdGlvbjogXCJBdHRlbmRlZU5hbWVJbnB1dEFjdGlvblwiLFxuICAgIERlZmF1bHRTZXR0aW5nQ2hhbmdlQWN0aW9uOiBcIkRlZmF1bHRTZXR0aW5nQ2hhbmdlQWN0aW9uXCIsXG4gICAgRW50ZXJNZWV0aW5nOiBcIkVudGVyTWVldGluZ1wiLFxufSBhcyBjb25zdDtcbmV4cG9ydCB0eXBlIEFjdGlvbklkcyA9IHR5cGVvZiBBY3Rpb25JZHNba2V5b2YgdHlwZW9mIEFjdGlvbklkc107XG5cbmV4cG9ydCBjb25zdCBnZW5lcmF0ZUNvbnRyb2xCbG9ja3MgPSAoZGF0YTogUm9vbUluZm8pID0+IHtcbiAgICBjb25zdCBibG9ja3M6IGFueVtdID0gW107XG5cbiAgICBjb25zdCBoZWFkZXJCbG9jayA9IHtcbiAgICAgICAgdHlwZTogXCJoZWFkZXJcIixcbiAgICAgICAgdGV4dDoge1xuICAgICAgICAgICAgdHlwZTogXCJwbGFpbl90ZXh0XCIsXG4gICAgICAgICAgICB0ZXh0OiBgUm9vbVske2RhdGEucm9vbU5hbWUgfHwgXCJST09NXCJ9XSBpcyBvcGVuZWQhYCxcbiAgICAgICAgICAgIGVtb2ppOiB0cnVlLFxuICAgICAgICB9LFxuICAgIH07XG4gICAgYmxvY2tzLnB1c2goaGVhZGVyQmxvY2spO1xuICAgIGNvbnN0IHRvcEJsb2NrMSA9IHtcbiAgICAgICAgdHlwZTogXCJzZWN0aW9uXCIsXG4gICAgICAgIHRleHQ6IHtcbiAgICAgICAgICAgIHR5cGU6IFwibXJrZHduXCIsXG4gICAgICAgICAgICB0ZXh0OiBgY2FwdHVyZV9jb2RlOiR7ZGF0YS5yb29tTmFtZX1gLFxuICAgICAgICB9LFxuICAgIH07XG4gICAgYmxvY2tzLnB1c2godG9wQmxvY2sxKTtcblxuICAgIGNvbnN0IHRvcEJsb2NrMiA9IHtcbiAgICAgICAgdHlwZTogXCJzZWN0aW9uXCIsXG4gICAgICAgIHRleHQ6IHtcbiAgICAgICAgICAgIHR5cGU6IFwibXJrZHduXCIsXG4gICAgICAgICAgICB0ZXh0OiBgcGxlYXNlIGNsaWNrIHRvIGVudGVyLmAsXG4gICAgICAgIH0sXG4gICAgfTtcbiAgICBibG9ja3MucHVzaCh0b3BCbG9jazIpO1xuXG4gICAgY29uc3Qgc2Vjb25kQmxvY2sgPSB7XG4gICAgICAgIHR5cGU6IFwiYWN0aW9uc1wiLFxuICAgICAgICBlbGVtZW50czogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXG4gICAgICAgICAgICAgICAgdGV4dDoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInBsYWluX3RleHRcIixcbiAgICAgICAgICAgICAgICAgICAgZW1vamk6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiam9pblwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYWN0aW9uX2lkOiBcImpvaW5cIixcbiAgICAgICAgICAgICAgICB2YWx1ZTogZGF0YS5yb29tTmFtZSxcbiAgICAgICAgICAgICAgICBzdHlsZTogXCJwcmltYXJ5XCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgIH07XG4gICAgYmxvY2tzLnB1c2goc2Vjb25kQmxvY2spO1xuICAgIHJldHVybiBibG9ja3M7XG59O1xuXG5leHBvcnQgY29uc3QgZ2VuZXJhdGVXaG9sZUJsb2NrcyA9IChyb29tSW5mbzogUm9vbUluZm8pID0+IHtcbiAgICBjb25zdCBjb250cm9sQmxvY2tzID0gZ2VuZXJhdGVDb250cm9sQmxvY2tzKHJvb21JbmZvKTtcbiAgICByZXR1cm4gWy4uLmNvbnRyb2xCbG9ja3NdO1xufTtcblxuZXhwb3J0IGNvbnN0IGdlbmVyYXRlSm9pbk1vZGFsID0gKHVzZXJJbmZvOiBVc2VySW5mb3JtYXRpb24sIHVybDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgaW50aWFsX29wdGlvbnMgPSBbXTtcbiAgICBpZiAodXNlckluZm8uY2hpbWVJbmZvLnVzZURlZmF1bHQpIHtcbiAgICAgICAgaW50aWFsX29wdGlvbnMucHVzaCh7XG4gICAgICAgICAgICB0ZXh0OiB7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJtcmtkd25cIixcbiAgICAgICAgICAgICAgICB0ZXh0OiBcIlVzZSBkZWZhdWx0IHNldHRpbmdcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjoge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwibXJrZHduXCIsXG4gICAgICAgICAgICAgICAgdGV4dDogXCJkZWZhbHV0IG1pY3JvcGhvbmUsIGNhbWVyYSwgc3BlYWtlciwgZXRjXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdmFsdWU6IFwidXNlLWRlZmF1bHRcIixcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGNvbnN0IGJsb2NrID0ge1xuICAgICAgICB0eXBlOiBcIm1vZGFsXCIsXG4gICAgICAgIGNhbGxiYWNrX2lkOiBcImpvaW5fbW9kYWxcIixcbiAgICAgICAgcHJpdmF0ZV9tZXRhZGF0YTogSlNPTi5zdHJpbmdpZnkodXNlckluZm8pLFxuICAgICAgICB0aXRsZToge1xuICAgICAgICAgICAgdHlwZTogXCJwbGFpbl90ZXh0XCIsXG4gICAgICAgICAgICB0ZXh0OiBgc2xhY2stY2hpbWUtY29ubmVjdGAsXG4gICAgICAgICAgICBlbW9qaTogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgY2xvc2U6IHtcbiAgICAgICAgICAgIHR5cGU6IFwicGxhaW5fdGV4dFwiLFxuICAgICAgICAgICAgdGV4dDogXCJDbG9zZVwiLFxuICAgICAgICAgICAgZW1vamk6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIG5vdGlmeV9vbl9jbG9zZTogdHJ1ZSxcbiAgICAgICAgYmxvY2tzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJzZWN0aW9uXCIsXG4gICAgICAgICAgICAgICAgdGV4dDoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm1ya2R3blwiLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBgWW91IGFyZSBnb2luZyB0byBqb2luIFwiJHt1c2VySW5mby5yb29tTmFtZX1cIi4gUGxlYXNlIGlucHV0IHlvdXIgbmFtZSBhbmQgY29uZmlncmF0aW9ucy4gIChpZiB5b3UgY2hhbmdlIHRoZSBuYW1lLCBwbGVhc2UgcHJlc3MgJ2VudGVyJyB0byB1cGRhdGUgam9pbiBidXR0b24pYCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgZGlzcGF0Y2hfYWN0aW9uOiB0cnVlLFxuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJwbGFpbl90ZXh0X2lucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbl9pZDogQWN0aW9uSWRzLkF0dGVuZGVlTmFtZUlucHV0QWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICBpbml0aWFsX3ZhbHVlOiBgJHt1c2VySW5mby5jaGltZUluZm8uYXR0ZW5kZWVOYW1lfWAsXG4gICAgICAgICAgICAgICAgICAgIGRpc3BhdGNoX2FjdGlvbl9jb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRyaWdnZXJfYWN0aW9uc19vbjogW1wib25fY2hhcmFjdGVyX2VudGVyZWRcIiwgXCJvbl9lbnRlcl9wcmVzc2VkXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJpZ2dlcl9hY3Rpb25zX29uOiBbXCJvbl9lbnRlcl9wcmVzc2VkXCJdLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGFiZWw6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJwbGFpbl90ZXh0XCIsXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiVXNlciBOYW1lXCIsXG4gICAgICAgICAgICAgICAgICAgIGVtb2ppOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwic2VjdGlvblwiLFxuICAgICAgICAgICAgICAgIHRleHQ6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJtcmtkd25cIixcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJTZWxlY3QgeW91ciBmYXZhcml0ZS5cIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGFjY2Vzc29yeToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImNoZWNrYm94ZXNcIixcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJtcmtkd25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJVc2UgZGVmYXVsdCBzZXR0aW5nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm1ya2R3blwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcImRlZmFsdXQgbWljcm9waG9uZSwgY2FtZXJhLCBzcGVha2VyLCBldGNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcInVzZS1kZWZhdWx0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBpbml0aWFsX29wdGlvbnM6IGludGlhbF9vcHRpb25zLFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb25faWQ6IEFjdGlvbklkcy5EZWZhdWx0U2V0dGluZ0NoYW5nZUFjdGlvbixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcImFjdGlvbnNcIixcbiAgICAgICAgICAgICAgICBlbGVtZW50czogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwicGxhaW5fdGV4dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFwiZW50ZXIgbWVldGluZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtb2ppOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uX2lkOiBBY3Rpb25JZHMuRW50ZXJNZWV0aW5nLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgIH07XG4gICAgcmV0dXJuIGJsb2NrO1xufTtcblxuZXhwb3J0IGNvbnN0IGdlbmVyYXRlT3BlblVSTEJsb2NrcyA9ICh1cmw6IHN0cmluZykgPT4ge1xuICAgIHJldHVybiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6IFwic2VjdGlvblwiLFxuICAgICAgICAgICAgdGV4dDoge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwibXJrZHduXCIsXG4gICAgICAgICAgICAgICAgdGV4dDogYE9wZW4gbmV3IHRhYiB0byBqb2luIHRoZSBtZWV0aW5nLmAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYWNjZXNzb3J5OiB7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgICAgICAgICB0ZXh0OiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwicGxhaW5fdGV4dFwiLFxuICAgICAgICAgICAgICAgICAgICBlbW9qaTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJvcGVuVGFiXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgICAgICAgICBhY3Rpb25faWQ6IFwib3BlblRhYlwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICBdO1xufTtcblxuZXhwb3J0IGNvbnN0IGdlbmVyYXRlSGVscEJsb2NrcyA9ICgpID0+IHtcbiAgICByZXR1cm4gW1xuICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiBcInNlY3Rpb25cIixcbiAgICAgICAgICAgIHRleHQ6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcIm1ya2R3blwiLFxuICAgICAgICAgICAgICAgIHRleHQ6IGBTSE9XSU5HIEhFTFBgLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFjY2Vzc29yeToge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXG4gICAgICAgICAgICAgICAgdGV4dDoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInBsYWluX3RleHRcIixcbiAgICAgICAgICAgICAgICAgICAgZW1vamk6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IFwib3BlblRhYlwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYWN0aW9uX2lkOiBcIm9wZW5UYWJcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgXTtcbn07XG4iXX0=