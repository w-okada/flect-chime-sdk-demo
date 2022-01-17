/**
 * Extend this interface to build a type that is treated as an open set of properties, where each key is a string.
 */
export declare type StringIndexed = Record<string, any>;
/**
 * @deprecated No longer works in TypeScript 4.3
 */
export declare type KnownKeys<_T> = never;
/**
 * Type function which allows either types `T` or `U`, but not both.
 */
export declare type XOR<T, U> = T | U extends Record<string, unknown> ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
declare type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};
export {};
//# sourceMappingURL=helpers.d.ts.map