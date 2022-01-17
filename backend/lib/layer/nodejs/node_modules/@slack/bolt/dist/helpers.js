"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertNever = exports.getTypeAndConversation = exports.IncomingEventType = void 0;
/**
 * Internal data type for capturing the class of event processed in App#onIncomingEvent()
 */
var IncomingEventType;
(function (IncomingEventType) {
    IncomingEventType[IncomingEventType["Event"] = 0] = "Event";
    IncomingEventType[IncomingEventType["Action"] = 1] = "Action";
    IncomingEventType[IncomingEventType["Command"] = 2] = "Command";
    IncomingEventType[IncomingEventType["Options"] = 3] = "Options";
    IncomingEventType[IncomingEventType["ViewAction"] = 4] = "ViewAction";
    IncomingEventType[IncomingEventType["Shortcut"] = 5] = "Shortcut";
})(IncomingEventType = exports.IncomingEventType || (exports.IncomingEventType = {}));
/**
 * Helper which finds the type and channel (if any) that any specific incoming event is related to.
 *
 * This is analogous to WhenEventHasChannelContext and the conditional type that checks SlackAction for a channel
 * context.
 */
function getTypeAndConversation(body) {
    if (body.event !== undefined) {
        const { event } = body;
        // Find conversationId
        const conversationId = (() => {
            let foundConversationId;
            if ('channel' in event) {
                if (typeof event.channel === 'string') {
                    foundConversationId = event.channel;
                }
                else if ('id' in event.channel) {
                    foundConversationId = event.channel.id;
                }
            }
            if ('channel_id' in event) {
                foundConversationId = event.channel_id;
            }
            if ('item' in event && 'channel' in event.item) {
                // no channel for reaction_added, reaction_removed, star_added, or star_removed with file or file_comment items
                foundConversationId = event.item.channel;
            }
            // Using non-null assertion (!) because the alternative is to use `foundConversation: (string | undefined)`, which
            // impedes the very useful type checker help above that ensures the value is only defined to strings, not
            // undefined. This is safe when used in combination with the || operator with a default value.
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return foundConversationId || undefined;
        })();
        return {
            conversationId,
            type: IncomingEventType.Event,
        };
    }
    if (body.command !== undefined) {
        return {
            type: IncomingEventType.Command,
            conversationId: body.channel_id,
        };
    }
    if (body.name !== undefined || body.type === 'block_suggestion') {
        const optionsBody = body;
        return {
            type: IncomingEventType.Options,
            conversationId: optionsBody.channel !== undefined ? optionsBody.channel.id : undefined,
        };
    }
    if (body.actions !== undefined || body.type === 'dialog_submission' || body.type === 'workflow_step_edit') {
        const actionBody = body;
        return {
            type: IncomingEventType.Action,
            conversationId: actionBody.channel !== undefined ? actionBody.channel.id : undefined,
        };
    }
    if (body.type === 'shortcut') {
        return {
            type: IncomingEventType.Shortcut,
        };
    }
    if (body.type === 'message_action') {
        const shortcutBody = body;
        return {
            type: IncomingEventType.Shortcut,
            conversationId: shortcutBody.channel !== undefined ? shortcutBody.channel.id : undefined,
        };
    }
    if (body.type === 'view_submission' || body.type === 'view_closed') {
        return {
            type: IncomingEventType.ViewAction,
        };
    }
    return {};
}
exports.getTypeAndConversation = getTypeAndConversation;
/* istanbul ignore next */
/** Helper that should never be called, but is useful for exhaustiveness checking in conditional branches */
function assertNever(x) {
    throw new Error(`Unexpected object: ${x}`);
}
exports.assertNever = assertNever;
//# sourceMappingURL=helpers.js.map