import { KnownBlock, Block, ViewsOpenResponse, WorkflowsUpdateStepResponse, WorkflowsStepCompletedResponse, WorkflowsStepFailedResponse } from '@slack/web-api';
import { Middleware, AllMiddlewareArgs, AnyMiddlewareArgs, SlackActionMiddlewareArgs, SlackViewMiddlewareArgs, WorkflowStepEdit, SlackEventMiddlewareArgs, ViewWorkflowStepSubmitAction, WorkflowStepExecuteEvent } from './types';
/** Interfaces */
export interface StepConfigureArguments {
    blocks: (KnownBlock | Block)[];
    private_metadata?: string;
    submit_disabled?: boolean;
    external_id?: string;
}
export interface StepUpdateArguments {
    inputs?: {
        [key: string]: {
            value: any;
            skip_variable_replacement?: boolean;
            variables?: {
                [key: string]: any;
            };
        };
    };
    outputs?: {
        name: string;
        type: string;
        label: string;
    }[];
    step_name?: string;
    step_image_url?: string;
}
export interface StepCompleteArguments {
    outputs?: {
        [key: string]: any;
    };
}
export interface StepFailArguments {
    error: {
        message: string;
    };
}
export interface StepConfigureFn {
    (params: StepConfigureArguments): Promise<ViewsOpenResponse>;
}
export interface StepUpdateFn {
    (params?: StepUpdateArguments): Promise<WorkflowsUpdateStepResponse>;
}
export interface StepCompleteFn {
    (params?: StepCompleteArguments): Promise<WorkflowsStepCompletedResponse>;
}
export interface StepFailFn {
    (params: StepFailArguments): Promise<WorkflowsStepFailedResponse>;
}
export interface WorkflowStepConfig {
    edit: WorkflowStepEditMiddleware | WorkflowStepEditMiddleware[];
    save: WorkflowStepSaveMiddleware | WorkflowStepSaveMiddleware[];
    execute: WorkflowStepExecuteMiddleware | WorkflowStepExecuteMiddleware[];
}
export interface WorkflowStepEditMiddlewareArgs extends SlackActionMiddlewareArgs<WorkflowStepEdit> {
    step: WorkflowStepEdit['workflow_step'];
    configure: StepConfigureFn;
}
export interface WorkflowStepSaveMiddlewareArgs extends SlackViewMiddlewareArgs<ViewWorkflowStepSubmitAction> {
    step: ViewWorkflowStepSubmitAction['workflow_step'];
    update: StepUpdateFn;
}
export interface WorkflowStepExecuteMiddlewareArgs extends SlackEventMiddlewareArgs<'workflow_step_execute'> {
    step: WorkflowStepExecuteEvent['workflow_step'];
    complete: StepCompleteFn;
    fail: StepFailFn;
}
/** Types */
export declare type SlackWorkflowStepMiddlewareArgs = WorkflowStepEditMiddlewareArgs | WorkflowStepSaveMiddlewareArgs | WorkflowStepExecuteMiddlewareArgs;
export declare type WorkflowStepEditMiddleware = Middleware<WorkflowStepEditMiddlewareArgs>;
export declare type WorkflowStepSaveMiddleware = Middleware<WorkflowStepSaveMiddlewareArgs>;
export declare type WorkflowStepExecuteMiddleware = Middleware<WorkflowStepExecuteMiddlewareArgs>;
export declare type WorkflowStepMiddleware = WorkflowStepEditMiddleware[] | WorkflowStepSaveMiddleware[] | WorkflowStepExecuteMiddleware[];
export declare type AllWorkflowStepMiddlewareArgs<T extends SlackWorkflowStepMiddlewareArgs = SlackWorkflowStepMiddlewareArgs> = T & AllMiddlewareArgs;
/** Class */
export declare class WorkflowStep {
    /** Step callback_id */
    private callbackId;
    /** Step Add/Edit :: 'workflow_step_edit' action */
    private edit;
    /** Step Config Save :: 'view_submission' */
    private save;
    /** Step Executed/Run :: 'workflow_step_execute' event */
    private execute;
    constructor(callbackId: string, config: WorkflowStepConfig);
    getMiddleware(): Middleware<AnyMiddlewareArgs>;
    private matchesConstraints;
    private processEvent;
    private getStepMiddleware;
}
/** Helper Functions */
export declare function validate(callbackId: string, config: WorkflowStepConfig): void;
/**
 * `processStepMiddleware()` invokes each callback for lifecycle event
 * @param args workflow_step_edit action
 */
export declare function processStepMiddleware(args: AllWorkflowStepMiddlewareArgs, middleware: WorkflowStepMiddleware): Promise<void>;
export declare function isStepEvent(args: AnyMiddlewareArgs): args is AllWorkflowStepMiddlewareArgs;
/**
 * `prepareStepArgs()` takes in a workflow step's args and:
 *  1. removes the next() passed in from App-level middleware processing
 *    - events will *not* continue down global middleware chain to subsequent listeners
 *  2. augments args with step lifecycle-specific properties/utilities
 * */
export declare function prepareStepArgs(args: any): AllWorkflowStepMiddlewareArgs;
//# sourceMappingURL=WorkflowStep.d.ts.map