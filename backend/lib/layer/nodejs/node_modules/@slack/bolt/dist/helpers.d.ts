/**
 * Internal data type for capturing the class of event processed in App#onIncomingEvent()
 */
export declare enum IncomingEventType {
    Event = 0,
    Action = 1,
    Command = 2,
    Options = 3,
    ViewAction = 4,
    Shortcut = 5
}
/**
 * Helper which finds the type and channel (if any) that any specific incoming event is related to.
 *
 * This is analogous to WhenEventHasChannelContext and the conditional type that checks SlackAction for a channel
 * context.
 */
export declare function getTypeAndConversation(body: any): {
    type?: IncomingEventType;
    conversationId?: string;
};
/** Helper that should never be called, but is useful for exhaustiveness checking in conditional branches */
export declare function assertNever(x?: never): never;
//# sourceMappingURL=helpers.d.ts.map