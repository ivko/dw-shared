/*
 *http://wiki.docuware.ag/mediawiki/index.php/Reusable_Components#Commands
 */
import "../global";
import * as ko from "knockout";
import * as $ from "jquery";
import { Disposable } from "../model/disposable";

let commandUniqueId = 0;

export interface CommandOptions {
    requires?: any;
    execute(requires: any, ...args): any;
    canExecute?:(isExecuting: boolean, requires: any)=> boolean;
    available?: (requires: any) => boolean;
}

export class Command extends Disposable {
    id: string;
    public isExecuting: KnockoutObservable<boolean>;

    options: CommandOptions = {
        requires: null,
        execute: null,
        canExecute: null,
        available: null
    };

    requires = {
        /// <summary> 
        ///     Defines a condition, that would be called first for the current context, then its parent (after that bubble to the top)
        ///     On first positive return value, the vm object is saved in the command adapter's required object
        /// </summary>
        data: function (vm) {
            /// <summary>
            ///     Default predicate that would set the command custom binding bindingContext in command's binding adapter requires.data
            /// </summary>
            /// <param name="vm">binding context</param>
            /// <returns type="boolean"></returns>
            return true;
        }
    };
  /**
    * Calls the class constructor.
    * Called when creating a nes instance of the class (var Command = new Command())
    * @return {void}
    */
    constructor (options?: CommandOptions) {
        super();
        this.options = options;

        this.id = 'dwcmd_' + commandUniqueId++;
        this.isExecuting = ko.observable(false);
        this.setRequires();
    };
  /**
    * Set required
    * @param requires The requres json
    * @return {void}
    */
    public setRequires (requires: any = null): void {
        this.requires = Object.merge.apply(null, [{}, (this.options && this.options.requires) || this.requires].append(arguments));
    };

  /**
    * At runtime executing can be suspended in a case of
    * currently running command or specific UI mode
    * @param isExecuting Shows if the command is executiong at the moment.
    * @param requires The requres json
    * @return {boolean}
    */
    public canExecute(isExecuting: boolean, requires: any): boolean {
        return !isExecuting && (this.options && $.isFunction(this.options.canExecute) ? this.options.canExecute(isExecuting, requires) : true);
    };

  /**
    * Global availability
    * for example user doesnt have right to execute the command
    * as user rights usualy dont change at runtime
    * @param requires The requres json
    * @return {boolean} value can be cached(this is left to the command)
    */
    public available (requires) {
        return this.options && $.isFunction(this.options.available) ? this.options.available(requires) : true;
    }
  /**
    * Actual command body function
    * can return promise for async
    * @param requires The requres json
    * @return {void}
    */
    public execute(requires) {
        if (this.options && $.isFunction(this.options.execute)) return this.options.execute(requires);
    }
};

export class Bundle extends Disposable {

    commands = {
        //command: {
        //    ctor: model.Commands.Command,
        //    args: [arg1, arg2]
        //}
    };
    
    isBusy: KnockoutComputedFunctions<boolean>;
  /**
    * Calls the class constructor.
    * Called when creating a nes instance of the class (var Bundle = new Bundle())
    * @return {void}
    */
    constructor() {
        super();

        this.setCommands();
        this.initCommands();

        this.isBusy = this.addDisposable(ko.computed(function () {
            /// <summary>
            ///     Used in html to activate/deactivate activity spinners
            /// </summary>
            /// <returns type="boolean"></returns>
            var commandDef, command, isBusy = false;
            for (var name in this.commands) {
                commandDef = this.commands[name];
                command = this[name]; // iterate all to keep observable subscription
                if(!commandDef.skipBusy)
                    isBusy = isBusy || command.isExecuting();
            }
            return isBusy;
        }, this).extend({ deferred: true }));
    };

    public initialize(): void {
        console.log('initialize command bundle');
    };

    // deprecated
    init () { };

  /**
    * Set commands
    * @param commands Array of commands
    * @return {void}
    */
    public setCommands(commands: Command[] = []): void {
        Object.append(this.commands, commands);
    };

  /**
    * Extend commands params
    * @param params 
    * @return {void}
    */
    public extendCommandsParams(...params: any[]): void {
        var args = Array.from(params);
        for (var name in this.commands) {
            var command = this.commands[name];
            if ($.isFunction(command)) {
                this.commands[name] = {
                    ctor: command,
                    args: args,
                    skipBusy: false
                };
            }
        }
    };
    
  /**
    * Init commands
    * @return {void}
    */
    public initCommands(): void {
        /// <summary>
        ///     Initialize all commands defined in the bundle
        /// </summary>
        for (var name in this.commands) {
            var command = this.commands[name];
            if ($.isFunction(command)) {
                command = {
                    ctor: command,
                    args: [],
                    skipBusy: false
                };
            }
            //this.command_x = new Command_X(args);
            this[name] = this.addDisposable(new (Function.prototype.bind.apply(command.ctor, [null].append(command.args || []))));
        }
    }
};  
