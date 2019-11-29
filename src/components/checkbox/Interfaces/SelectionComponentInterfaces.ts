import { Command } from "../../../command/Command.js";

//toggleOptions
export interface IToggleOptions {
    enable: () => boolean;
    toggleChecked: () => any;
    visible: () => boolean;
}

export interface ISelectionComponentButtonOptions {
    buttonId: any; //() => string | string;
    checkedCSS: string,
    indeterminateCSS: string,
    checked: KnockoutObservable<any>,
    isIndeterminate: KnockoutObservable<any>,
    tooltipContent: { content: any },
    buttonClass: string,
    value: any,
    checkedValue: any,
    name: string,
    checkedCondition: () => boolean
}

export interface ISelectionComponentLabelOptions {
    label: string,
    labelClass: string,
    disabledCSS: string,
    hiddenCSS: string
}

export interface ISelectionComponentOptions {
    mode: string; //native, custom, delegated
    bindingContext: any,
    toggleOptions: IToggleOptions;
    selectCommand: Command;
    buttonOptions: ISelectionComponentButtonOptions;
    labelOptions: ISelectionComponentLabelOptions;
}

export interface IButtonAttributes {
    id: string | KnockoutComputed<string>;
    name: string
    value: any
}