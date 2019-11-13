declare module DW {
    export interface UIDialogOptions {
        title?: string;
        autoOpen?: boolean;
        modal?: boolean;
        resizable?: boolean;
        height?: any;
        width?: any;
        minHeight?: any;
        maxHeight?: any;
        closeText?: string;
        minWidth?: any;
        dialogClass?: any;
        autoResizable?: boolean;
        autoResizablePullChanges?: boolean;
        closeOnEscape?: boolean;
        position?: any;
        positionTopOffset?: number;
        showTitleBar?: boolean;
    }

    export interface DialogOptions {
        id?: string;
        element?: any;
        template: string;
        className?: string;
        cancelCommandName?: string;
        dontApplyBindings?: boolean;
        debounceUpdatePosition?: boolean;
        dialogExtraSpace?: any;
        options?: UIDialogOptions;
        modes?: Array<any>;
        getVM?(): any;
    }

    export class Dialog {
        constructor(options: DialogOptions);
        options: any;
        applyBindings(): void;
        setTitle(title: string): any;
        bind(vm: any): any;
        open(): any;
        close(): any;
        isOpen(): boolean;
        fullDestroy(): void;
        destroy(): void;
    }

    export enum DialogModes {
        disposableVM,
        customEscape,
        autoSize
    }
}
