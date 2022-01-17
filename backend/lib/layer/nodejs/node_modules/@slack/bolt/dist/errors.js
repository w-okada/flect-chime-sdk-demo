"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowStepInitializationError = exports.MultipleListenerError = exports.HTTPReceiverDeferredRequestError = exports.ReceiverInconsistentStateError = exports.ReceiverAuthenticityError = exports.ReceiverMultipleAckError = exports.CustomRouteInitializationError = exports.InvalidCustomPropertyError = exports.ContextMissingPropertyError = exports.AuthorizationError = exports.AppInitializationError = exports.asCodedError = exports.UnknownError = exports.ErrorCode = void 0;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["AppInitializationError"] = "slack_bolt_app_initialization_error";
    ErrorCode["AuthorizationError"] = "slack_bolt_authorization_error";
    ErrorCode["ContextMissingPropertyError"] = "slack_bolt_context_missing_property_error";
    ErrorCode["InvalidCustomPropertyError"] = "slack_bolt_context_invalid_custom_property_error";
    ErrorCode["CustomRouteInitializationError"] = "slack_bolt_custom_route_initialization_error";
    ErrorCode["ReceiverMultipleAckError"] = "slack_bolt_receiver_ack_multiple_error";
    ErrorCode["ReceiverAuthenticityError"] = "slack_bolt_receiver_authenticity_error";
    ErrorCode["ReceiverInconsistentStateError"] = "slack_bolt_receiver_inconsistent_state_error";
    ErrorCode["MultipleListenerError"] = "slack_bolt_multiple_listener_error";
    ErrorCode["HTTPReceiverDeferredRequestError"] = "slack_bolt_http_receiver_deferred_request_error";
    /**
     * This value is used to assign to errors that occur inside the framework but do not have a code, to keep interfaces
     * in terms of CodedError.
     */
    ErrorCode["UnknownError"] = "slack_bolt_unknown_error";
    ErrorCode["WorkflowStepInitializationError"] = "slack_bolt_workflow_step_initialization_error";
})(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
class UnknownError extends Error {
    constructor(original) {
        super(original.message);
        this.code = ErrorCode.UnknownError;
        this.original = original;
    }
}
exports.UnknownError = UnknownError;
function asCodedError(error) {
    if (error.code !== undefined) {
        return error;
    }
    return new UnknownError(error);
}
exports.asCodedError = asCodedError;
class AppInitializationError extends Error {
    constructor() {
        super(...arguments);
        this.code = ErrorCode.AppInitializationError;
    }
}
exports.AppInitializationError = AppInitializationError;
class AuthorizationError extends Error {
    constructor(message, original) {
        super(message);
        this.code = ErrorCode.AuthorizationError;
        this.original = original;
    }
}
exports.AuthorizationError = AuthorizationError;
class ContextMissingPropertyError extends Error {
    constructor(missingProperty, message) {
        super(message);
        this.code = ErrorCode.ContextMissingPropertyError;
        this.missingProperty = missingProperty;
    }
}
exports.ContextMissingPropertyError = ContextMissingPropertyError;
class InvalidCustomPropertyError extends Error {
    constructor() {
        super(...arguments);
        this.code = ErrorCode.AppInitializationError;
    }
}
exports.InvalidCustomPropertyError = InvalidCustomPropertyError;
class CustomRouteInitializationError extends Error {
    constructor() {
        super(...arguments);
        this.code = ErrorCode.CustomRouteInitializationError;
    }
}
exports.CustomRouteInitializationError = CustomRouteInitializationError;
class ReceiverMultipleAckError extends Error {
    constructor() {
        super("The receiver's `ack` function was called multiple times.");
        this.code = ErrorCode.ReceiverMultipleAckError;
    }
}
exports.ReceiverMultipleAckError = ReceiverMultipleAckError;
class ReceiverAuthenticityError extends Error {
    constructor() {
        super(...arguments);
        this.code = ErrorCode.ReceiverAuthenticityError;
    }
}
exports.ReceiverAuthenticityError = ReceiverAuthenticityError;
class ReceiverInconsistentStateError extends Error {
    constructor() {
        super(...arguments);
        this.code = ErrorCode.ReceiverInconsistentStateError;
    }
}
exports.ReceiverInconsistentStateError = ReceiverInconsistentStateError;
class HTTPReceiverDeferredRequestError extends Error {
    constructor(message, req, res) {
        super(message);
        this.code = ErrorCode.HTTPReceiverDeferredRequestError;
        this.req = req;
        this.res = res;
    }
}
exports.HTTPReceiverDeferredRequestError = HTTPReceiverDeferredRequestError;
class MultipleListenerError extends Error {
    constructor(originals) {
        super('Multiple errors occurred while handling several listeners. The `originals` property contains an array of each error.');
        this.code = ErrorCode.MultipleListenerError;
        this.originals = originals;
    }
}
exports.MultipleListenerError = MultipleListenerError;
class WorkflowStepInitializationError extends Error {
    constructor() {
        super(...arguments);
        this.code = ErrorCode.WorkflowStepInitializationError;
    }
}
exports.WorkflowStepInitializationError = WorkflowStepInitializationError;
//# sourceMappingURL=errors.js.map