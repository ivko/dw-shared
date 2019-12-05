import * as ko from "knockout";
import * as $ from "jquery";
import * as Utils from "../../utils";
import { ViewModel } from "../../model/viewModel";
import { CommandBindingAdapter } from "../../command/commandBindingAdapter.js";
import { Command } from "../../command/Command";

import {
    ISelectionComponentOptions,
    IToggleOptions,
    ISelectionComponentButtonOptions,
    ISelectionComponentLabelOptions,
    IButtonAttributes
} from "./Interfaces/SelectionComponentInterfaces";


export var SelectionComponentModes = {
    native: 'native',
    custom: 'custom',
    delegated: 'delegated'
}

export class SelectionComponentOptions implements ISelectionComponentOptions {
    mode = SelectionComponentModes.native;

    bindingContext = {};

    toggleOptions: IToggleOptions = {
        enable: null,
        toggleChecked: null,
        visible: null
    };
    selectCommand: Command;

    buttonOptions: ISelectionComponentButtonOptions = {
        buttonId: Utils.uniqueId(),
        checkedCSS: 'checked',
        indeterminateCSS: 'indeterminate',
        checked: null,
        isIndeterminate: null,
        tooltipContent: { content: '' }, //{ content: '', placement: 'auto'}
        buttonClass: '',
        value: null,
        checkedValue: null,
        name: '',
        checkedCondition: null
    };

    labelOptions: ISelectionComponentLabelOptions = {
        label: '',
        labelClass: '',
        disabledCSS: 'ui-state-disabled',
        hiddenCSS: 'ui-hidden'
    };
}

export class SelectionComponentVM extends ViewModel {
    public command: Command;
    public buttonId: string | KnockoutComputed<string>;
    public checked: KnockoutObservable<any> = ko.observable();
    public checkedValue: any;
    public buttonCSS: {};
    public buttonAttributes: IButtonAttributes;
    public tooltipObj: { content: any };

    public label: string;
    public labelClass: string;
    public labelCSS: {};

    private options: ISelectionComponentOptions;
    private predefinedAvailable = null;
    private predefinedEnabled = null;

    constructor(options: ISelectionComponentOptions) {
        super();

        this.options = $.extend(true, new SelectionComponentOptions(), options);

        this.initButton(this.options.buttonOptions);
        this.initSelectCommand(this.options.toggleOptions);
        this.initLabel(this.options.labelOptions);
    }

    private initButton(options: ISelectionComponentButtonOptions): void {
        //TODO: find better way
        this.buttonId = $.isFunction(options.buttonId) ? this.addDisposable(ko.computed(() => {
            return options.buttonId();
        })) : options.buttonId;

        if (options.checkedCondition)
            this.addDisposable(ko.computed(() => {
                this.checked(options.checkedCondition());
            }));
        else
            this.checked = options.checked;

        this.checkedValue = Utils.isRealObject(options.checkedValue) ? options.checkedValue : options.value;

        this.buttonCSS = {
            [options.checkedCSS]: this.checked,
            [options.buttonClass]: !!options.buttonClass
        };
      
        if (options.isIndeterminate) {
            this.buttonCSS[options.indeterminateCSS] = this.addDisposable(ko.computed(() => {
                return !this.checked() && options.isIndeterminate();
            }));
        }

        this.buttonAttributes = {
            id: this.buttonId,
            name: options.name,
            value: options.value
        };
        this.tooltipObj = options.tooltipContent;
    }

    private initSelectCommand(options: IToggleOptions): void {
        let enabled = options.enable,
            available = options.visible;

        if (this.getMode() != SelectionComponentModes.native) {

            let commandWrapper: Command, // = null,
                adapter: CommandBindingAdapter;// = null;

            if (this.options.selectCommand) {
                adapter = this.addDisposable<CommandBindingAdapter>(new CommandBindingAdapter(this.options.selectCommand, this.options.bindingContext));

                commandWrapper = new Command({
                    execute: (requires) => adapter.execute(),
                    canExecute: (isExecuting, requires) => adapter.canExecute(),
                    available: (requires) => adapter.available()
                });
            }
            else {
                commandWrapper = new Command({
                    canExecute: options.enable ? (isExecuting, requires) => options.enable() && !isExecuting : null,
                    execute: options.toggleChecked ? (requires) => options.toggleChecked() : (requires) => {
                        this.checked(!this.checked())
                    },
                    available: options.visible
                });

                adapter = this.addDisposable<CommandBindingAdapter>(new CommandBindingAdapter(commandWrapper, this.options.bindingContext));
            }

            this.command = this.addDisposable(commandWrapper);

            enabled = adapter.canExecute.bind(adapter);
            available = adapter.available.bind(adapter);
        }

        this.predefinedEnabled = enabled;
        this.predefinedAvailable = available;
    }

    public available(): boolean {
        return this.predefinedAvailable ? this.predefinedAvailable() : true;
    }

    public enabled(): boolean {
        return this.predefinedEnabled ? this.predefinedEnabled() : true;
    }

    private initLabel(options: ISelectionComponentLabelOptions): void {
        this.label = options.label;
        this.labelClass = options.labelClass;

        this.labelCSS = {
            [options.disabledCSS]: this.addDisposable(ko.computed(() => {
                return !this.enabled();
            })),
            [options.hiddenCSS]: this.addDisposable(ko.computed(() => {
                return !this.available();
            })),
            [options.labelClass]: !!this.label
        };
    }

    public getMode(): string {
        return this.options.mode;
    }
}