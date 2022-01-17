import { Middleware, AnyMiddlewareArgs, SlackActionMiddlewareArgs, SlackCommandMiddlewareArgs, SlackEventMiddlewareArgs, SlackOptionsMiddlewareArgs, SlackViewMiddlewareArgs, SlackEvent, SlackAction, SlackShortcut, SlashCommand, SlackOptions, EventTypePattern, ViewOutput } from '../types';
import { ActionConstraints, ViewConstraints, ShortcutConstraints } from '../App';
/**
 * Middleware that filters out any event that isn't an action
 */
export declare const onlyActions: Middleware<AnyMiddlewareArgs & {
    action?: SlackAction;
}>;
/**
 * Middleware that filters out any event that isn't a shortcut
 */
export declare const onlyShortcuts: Middleware<AnyMiddlewareArgs & {
    shortcut?: SlackShortcut;
}>;
/**
 * Middleware that filters out any event that isn't a command
 */
export declare const onlyCommands: Middleware<AnyMiddlewareArgs & {
    command?: SlashCommand;
}>;
/**
 * Middleware that filters out any event that isn't an options
 */
export declare const onlyOptions: Middleware<AnyMiddlewareArgs & {
    options?: SlackOptions;
}>;
/**
 * Middleware that filters out any event that isn't an event
 */
export declare const onlyEvents: Middleware<AnyMiddlewareArgs & {
    event?: SlackEvent;
}>;
/**
 * Middleware that filters out any event that isn't a view_submission or view_closed event
 */
export declare const onlyViewActions: Middleware<AnyMiddlewareArgs & {
    view?: ViewOutput;
}>;
/**
 * Middleware that checks for matches given constraints
 */
export declare function matchConstraints(constraints: ActionConstraints | ViewConstraints | ShortcutConstraints): Middleware<SlackActionMiddlewareArgs | SlackOptionsMiddlewareArgs | SlackViewMiddlewareArgs>;
export declare function matchMessage(pattern: string | RegExp): Middleware<SlackEventMiddlewareArgs<'message' | 'app_mention'>>;
/**
 * Middleware that filters out any command that doesn't match the pattern
 */
export declare function matchCommandName(pattern: string | RegExp): Middleware<SlackCommandMiddlewareArgs>;
export declare function matchEventType(pattern: EventTypePattern): Middleware<SlackEventMiddlewareArgs>;
export declare function ignoreSelf(): Middleware<AnyMiddlewareArgs>;
export declare function subtype(subtype1: string): Middleware<SlackEventMiddlewareArgs<'message'>>;
export declare function directMention(): Middleware<SlackEventMiddlewareArgs<'message'>>;
//# sourceMappingURL=builtin.d.ts.map