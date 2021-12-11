export declare type Result<T, E> = Success<T, E> | Failure<T, E>;
export declare class Success<T, E> {
    readonly value: T;
    constructor(value: T);
    type: "success";
    isSuccess(): this is Success<T, E>;
    isFailure(): this is Failure<T, E>;
}
export declare class Failure<T, E> {
    readonly value: E;
    constructor(value: E);
    type: "failure";
    isSuccess(): this is Success<T, E>;
    isFailure(): this is Failure<T, E>;
}
export declare class NoSuchRoomError extends Error {
}
