declare module DW {

    export interface IBaseDialogResources {
        getConfirmTextTitle(): string;
        getConfirmText(): string;
        getConfirmOkText(): string;
        getConfirmCancelText(): string;
    }

    export interface IBaseDialogOptions {
        resources?: IBaseDialogResources,
        confirm?: CommandOptions;
        noConfirm?: CommandOptions;
        cancel?: CommandOptions;
    }

    export class BaseDialogVM extends DWTS.ViewModel {
        constructor(options?: IBaseDialogOptions);
        name(): any;
        hasChanges(): boolean;
        isDialogBusy(): boolean;
        saveDialog(): any;
        confirmClose(): any;
        discardChanges(): any;
        applyChanges(): any;
        validate(): boolean;
        finished: JQueryPromise<any>;
        options: IBaseDialogOptions;
        protected finishDfd: JQueryDeferred<any>;
    }
}