import { Option } from '@slack/types';
import { StringIndexed, XOR } from '../helpers';
import { AckFn } from '../utilities';
import { ViewOutput } from '../view/index';
/**
 * Arguments which listeners and middleware receive to process an options request from Slack
 */
export interface SlackOptionsMiddlewareArgs<Source extends OptionsSource = OptionsSource> {
    payload: OptionsPayloadFromType<Source>;
    body: this['payload'];
    options: this['payload'];
    ack: OptionsAckFn<Source>;
}
/**
 * All sources from which Slack sends options requests.
 */
export declare type OptionsSource = 'interactive_message' | 'dialog_suggestion' | 'block_suggestion';
export declare type SlackOptions = BlockSuggestion | InteractiveMessageSuggestion | DialogSuggestion;
export interface BasicOptionsPayload<Type extends string = string> {
    type: Type;
    value: string;
}
export declare type OptionsPayloadFromType<T extends string> = KnownOptionsPayloadFromType<T> extends never ? BasicOptionsPayload<T> : KnownOptionsPayloadFromType<T>;
export declare type KnownOptionsPayloadFromType<T extends string> = Extract<SlackOptions, {
    type: T;
}>;
/**
 * external data source in blocks
 */
export interface BlockSuggestion extends StringIndexed {
    type: 'block_suggestion';
    block_id: string;
    action_id: string;
    value: string;
    api_app_id: string;
    team: {
        id: string;
        domain: string;
        enterprise_id?: string;
        enterprise_name?: string;
    } | null;
    channel?: {
        id: string;
        name: string;
    };
    user: {
        id: string;
        name: string;
        team_id?: string;
    };
    token: string;
    container: StringIndexed;
    view?: ViewOutput;
    is_enterprise_install?: boolean;
    enterprise?: {
        id: string;
        name: string;
    };
}
/**
 * external data source in attachments
 */
export interface InteractiveMessageSuggestion extends StringIndexed {
    type: 'interactive_message';
    name: string;
    value: string;
    callback_id: string;
    action_ts: string;
    message_ts: string;
    attachment_id: string;
    team: {
        id: string;
        domain: string;
        enterprise_id?: string;
        enterprise_name?: string;
    } | null;
    channel?: {
        id: string;
        name: string;
    };
    user: {
        id: string;
        name: string;
        team_id?: string;
    };
    token: string;
    is_enterprise_install?: boolean;
    enterprise?: {
        id: string;
        name: string;
    };
}
/**
 * external data source in dialogs
 */
export interface DialogSuggestion extends StringIndexed {
    type: 'dialog_suggestion';
    name: string;
    value: string;
    callback_id: string;
    action_ts: string;
    team: {
        id: string;
        domain: string;
        enterprise_id?: string;
        enterprise_name?: string;
    } | null;
    channel?: {
        id: string;
        name: string;
    };
    user: {
        id: string;
        name: string;
        team_id?: string;
    };
    token: string;
    is_enterprise_install?: boolean;
    enterprise?: {
        id: string;
        name: string;
    };
}
/**
 * Type function which given an options source `Source` returns a corresponding type for the `ack()` function. The
 * function is used to fulfill the options request from a listener or middleware.
 */
declare type OptionsAckFn<Source extends OptionsSource> = Source extends 'block_suggestion' ? AckFn<XOR<BlockOptions, OptionGroups<BlockOptions>>> : Source extends 'interactive_message' ? AckFn<XOR<MessageOptions, OptionGroups<MessageOptions>>> : AckFn<XOR<DialogOptions, OptionGroups<DialogOptions>>>;
export interface BlockOptions {
    options: Option[];
}
export interface MessageOptions {
    options: {
        text: string;
        value: string;
    }[];
}
export interface DialogOptions {
    options: {
        label: string;
        value: string;
    }[];
}
export interface OptionGroups<Options> {
    option_groups: ({
        label: string;
    } & Options)[];
}
/**
 * A request for options for a select menu with an external data source, wrapped in the standard metadata. The menu
 * can have a source of Slack's Block Kit external select elements, dialogs, or legacy interactive components.
 *
 * This describes the entire JSON-encoded body of a request.
 * @deprecated You can use more specific types such as BlockSuggestionPayload
 */
export interface OptionsRequest<Source extends OptionsSource = OptionsSource> extends StringIndexed {
    value: string;
    type: Source;
    team: {
        id: string;
        domain: string;
        enterprise_id?: string;
        enterprise_name?: string;
    } | null;
    channel?: {
        id: string;
        name: string;
    };
    user: {
        id: string;
        name: string;
        team_id?: string;
    };
    token: string;
    name: Source extends 'interactive_message' | 'dialog_suggestion' ? string : never;
    callback_id: Source extends 'interactive_message' | 'dialog_suggestion' ? string : never;
    action_ts: Source extends 'interactive_message' | 'dialog_suggestion' ? string : never;
    message_ts: Source extends 'interactive_message' ? string : never;
    attachment_id: Source extends 'interactive_message' ? string : never;
    api_app_id: Source extends 'block_suggestion' ? string : never;
    action_id: Source extends 'block_suggestion' ? string : never;
    block_id: Source extends 'block_suggestion' ? string : never;
    container: Source extends 'block_suggestion' ? StringIndexed : never;
    app_unfurl?: any;
    is_enterprise_install?: boolean;
    enterprise?: {
        id: string;
        name: string;
    };
}
export {};
//# sourceMappingURL=index.d.ts.map