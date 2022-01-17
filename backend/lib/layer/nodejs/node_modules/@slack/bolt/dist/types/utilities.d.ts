import { ChatPostMessageArguments, ChatPostMessageResponse } from '@slack/web-api';
declare type ChatPostMessageArgumentsKnownKeys = 'token' | 'channel' | 'text' | 'as_user' | 'attachments' | 'blocks' | 'icon_emoji' | 'icon_url' | 'link_names' | 'mrkdwn' | 'parse' | 'reply_broadcast' | 'thread_ts' | 'unfurl_links' | 'unfurl_media' | 'username';
export declare type SayArguments = Pick<ChatPostMessageArguments, Exclude<ChatPostMessageArgumentsKnownKeys, 'channel'>> & {
    channel?: string;
};
export interface SayFn {
    (message: string | SayArguments): Promise<ChatPostMessageResponse>;
}
export declare type RespondArguments = Pick<ChatPostMessageArguments, Exclude<ChatPostMessageArgumentsKnownKeys, 'channel' | 'text'>> & {
    /** Response URLs can be used to send ephemeral messages or in-channel messages using this argument */
    response_type?: 'in_channel' | 'ephemeral';
    replace_original?: boolean;
    delete_original?: boolean;
    text?: string;
};
export interface RespondFn {
    (message: string | RespondArguments): Promise<any>;
}
export interface AckFn<Response> {
    (response?: Response): Promise<void>;
}
export {};
//# sourceMappingURL=utilities.d.ts.map