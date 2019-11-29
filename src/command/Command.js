/*
 *http://wiki.docuware.ag/mediawiki/index.php/Reusable_Components#Commands
 */
(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "knockout",
            "../model/disposable",
            "../global"
            ], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko, model) {
    var commandUniqueId = 0;
    var CommandOptions = {
        requires: null,
        execute: null,
        canExecute: null,
        available: null
    };

    var Command = new Class({
        Extends: model.Disposable,
        //Implements: [Options],
        options: {
            requires: null,
            execute: null,
            canExecute: null,
            available: null
        },
        requires: {
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
        },

        initialize: function (options) {
            $.extend(this.options, options || {});
            this.id = 'dwcmd_' + commandUniqueId++;
            this.isExecuting = ko.observable(false);
            this.setRequires();
        },

        setRequires: function (requires) {
            this.requires = Object.merge.apply(null, [{}, (this.options && this.options.requires) || this.requires].append(arguments));
        },

        /// virtual methods

        canExecute: function (isExecuting, requires) {
            /// <summary> 
            ///     At runtime executing can be suspended in a case of currently running command or specific UI mode
            ///     The html element that is bound with the comand recieves 'ui-state-disabled' class if return value is false, that disables that element
            /// </summary>
            /// <param name="isExecuting" type="boolean"> indicates is the command currently executing</param>
            /// <param name="requires">command adapter requires object {{key: bindingContext}, ..}</param>
            /// <returns type="boolean"></returns>
            
            return !isExecuting && (this.options && $.isFunction(this.options.canExecute) ? this.options.canExecute(isExecuting, requires) : true);
        },

        available: function (requires) {
            /// <summary> 
            ///     Global availability
            ///     For example user doesnt have right to execute the command return value can be cached(this is left to the command) as user rights usualy dont change at runtime
            ///     Shows/hides the html element that is bound with the command depending of the return value
            /// </summary>
            /// <param name="requires">command adapter requires object {{key: bindingContext}, ..}</param>
            /// <returns type=""></returns>
            return this.options && $.isFunction(this.options.available) ? this.options.available(requires) : true;
        },

        execute: function (requires) {
            if (this.options && $.isFunction(this.options.execute)) return this.options.execute(requires);
            /// <summary>
            ///     Actual command body function
            /// </summary>
            /// <param name="requires">command adapter requires object {{key: bindingContext}, ..}</param>
            /// [<returns type="promise for async"></returns> - not mandatory]
        }
    });

    var CommandsBundle = new Class({
        Extends: model.Disposable,

        commands: {
            //command: {
            //    ctor: model.Commands.Command,
            //    args: [arg1, arg2]
            //}
        },

        initialize: function () {
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
        },

        // deprecated
        init: function () { },

        setCommands: function (commands) {
            Object.append(this.commands, commands);
        },
        extendCommandsParams: function (params) {
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
        },
        initCommands: function () {
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
    });

    // exports
    return {
        Command: Command,
        Bundle: CommandsBundle
    };
}));
