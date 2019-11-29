/*
 *http://wiki.docuware.ag/mediawiki/index.php/Reusable_Components#Commands
 */
(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "knockout",
            "jquery-ui",
            "./CommandBindingAdapter",
            "../../global",
            "../../Bindings/BindingHandler",
            "../../Bindings/koBindingHandlers",
            "../../Bindings/knockoutExtensions"
        ], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {

    var CommandBindingHandler = new Class({
        Extends: BindingHandler,

        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            /// <summary>
            ///     Command custom binding
            ///     Two options for valueAccessor: 
            ///         - command (a class that extends DW.Command), 
            ///         - an object that mapps specific event or custom binding handler to a command
            ///
            ///     Add *eventName*CommandKeyTrigger as part of the data-bind attributes:
            ///         - param types - false|[key codes]|key code
            /// </summary>
            /// <param name="valueAccessor" type="DW.Command or {event_1: DW.Command, event_2: DW.Command }"></param>

            var self = this,
                value = valueAccessor(),
                allBindings = ko.unwrap(allBindingsAccessor()),
                delegated = !!(allBindings && allBindings.delegated),
                commands = value.execute ? { click: value } : value, //wraps a valueAccesor of the simple type to {click: valueAccessor()}
                handledKeyboardKeys = {},
                disposables = [],
                addDisposable = function (disposable) {
                    disposables.push(disposable);
                    return disposable;
                },
                bindingAdapters = {},
                initBindingAdapters = function () {
                    /// <summary>
                    ///     Creates new binding adapter for that command and saves it in the element dom data
                    /// </summary>
                    var data = ko.utils.domData.get(element, 'command_data') || { bindingAdapters: {} },
                        customHandledKeys = {};
                    bindingAdapters = data.bindingAdapters;
                    Object.keys(commands).forEach(function (commanEvent) {
                        var commandEventTriggerKey = commanEvent + 'CommandKeyTrigger';
                        var commandEventTrigger = allBindings[commandEventTriggerKey];

                        if (typeof commandEventTrigger !== 'undefined') {
                            customHandledKeys[commanEvent] = Array.isArray(commandEventTrigger) ? commandEventTrigger : [commandEventTrigger];
                        }
                        var cmd = commands[commanEvent];
                        bindingAdapters[cmd.id] = addDisposable(new DW.CommandBindingAdapter(cmd, bindingContext));
                    });

                    handledKeyboardKeys = $.extend({ 'click': [$.ui.keyCode.ENTER, $.ui.keyCode.SPACE] }, customHandledKeys);

                    ko.utils.domData.set(element, 'command_data', {
                        bindingAdapters: bindingAdapters,
                        handledKeyboardKeys: handledKeyboardKeys
                    });
                },

                initBindingHandlers = function () {
                    /// <summary>
                    ///     For each registered binding handler call init with the command 'execute' function as valueAccessor
                    /// </summary>
                    Object.keys(commands).forEach(function (commandEvent) {
                        if (ko.utils.isBindingHandler(commandEvent)) {
                            var cmd = commands[commandEvent],
                                ba = bindingAdapters[cmd.id];
                            // Handle keyboard events to trigger click
                            if (handledKeyboardKeys[commandEvent]) {
                                ko.bindingHandlers.event.init(
                                    element,
                                    ko.utils.wrapAccessor({
                                        keydown: function (vm, event) {
                                            if (handledKeyboardKeys[commandEvent].some(function (key) {
                                                return key === event.keyCode;
                                            })) {
                                                event.stopPropagation();
                                                event.preventDefault();
                                                //in knockout, where we get the event from, we have -> Normally we want to prevent default action. Developer can override this be explicitly returning true.
                                                //so we return false if we want to prevent the event to continue
                                                $(event.target).trigger(commandEvent);
                                                return false;
                                            }
                                            return true;
                                        }
                                    }),
                                    allBindingsAccessor,
                                    viewModel,
                                    bindingContext);
                            }

                            self.initBindingHandler(element, commandEvent, ko.utils.wrapAccessor(ba.execute.bind(ba)), allBindingsAccessor, viewModel, bindingContext);
                        }
                    });
                },
                initEventHandlers = function () {
                    /// <summary>
                    ///      For each registered event call it's ko bindingHandler init with the command 'execute' function as valueAccessor
                    /// </summary>

                    var events = {};
                    Object.keys(commands).forEach(function (command) {
                        if (!ko.utils.isBindingHandler(command)) {
                            var cmd = commands[command],
                                ba = bindingAdapters[cmd.id];

                            events[command] = ba.execute.bind(ba);
                        }
                    });

                    if (Object.keys(events).length > 0) {

                        self.initEventHandler(element, events, allBindingsAccessor, viewModel, bindingContext);
                    }
                },
                initAvailableHandler = function () {
                    /// <summary>
                    ///     For each command, init ko visible binding
                    ///     The command visible function that can be a promise is handeled here
                    /// </summary>

                    var available = addDisposable(ko.computed(function () {
                        var availableCommands = Object.keys(commands).filter(function (commandKey) {
                            var cmd = commands[commandKey],
                                adapter = bindingAdapters[cmd.id];
                            return !!adapter.available();
                        });

                        return availableCommands.length > 0;
                    }));

                    addDisposable(ko.computed(function () {
                        ko.bindingHandlers.visible.update(
                            element,
                            available,
                            allBindingsAccessor,
                            viewModel,
                            bindingContext);
                    }));
                };

            if ($(element).attr('tabindex') === '0') {
                $(element).attr('tabbable-command', true);
            }

            initBindingAdapters();
            initBindingHandlers();
            initEventHandlers();
            initAvailableHandler();

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                disposables.forEach(function (disposable) {
                    disposable.dispose && disposable.dispose();
                });
                ko.utils.domData.clear(element); // clear the data set to the element

                // NOTE: Don't dispose commands here, they can be bind to other elements to
            });
        },

        initBindingHandler: function (element, command, wrappedCmdExecute, allBindingsAccessor, viewModel, bindingContext) {
            ko.bindingHandlers[command].init(
                element,
                wrappedCmdExecute,
                allBindingsAccessor,
                viewModel,
                bindingContext);
        },

        initEventHandler: function (element, events, allBindingsAccessor, viewModel, bindingContext) {
            ko.bindingHandlers.event.init(
                element,
                ko.utils.wrapAccessor(events),
                allBindingsAccessor,
                viewModel,
                bindingContext);
        },

        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            /// <summary>
            ///     Update enableEx binding when command canExecute changes
            /// </summary>
            var value = valueAccessor(),
                commands = value.execute ? { click: value } : value,
                data = ko.utils.domData.get(element, 'command_data') || { bindingAdapters: {} };

            var canExecute = Object.keys(commands).map(function (command) {
                var cmd = commands[command],
                    ba = data.bindingAdapters[cmd.id];
                return ba.canExecute();
            }).some(function (v) {
                return v === true;
            });

            if ($(element).attr('tabbable-command') === 'true') {
                $(element).attr('tabindex', canExecute ? 0 : -1);
            }

            ko.bindingHandlers.enableEx.update(
                element,
                ko.utils.wrapAccessor(canExecute),
                allBindingsAccessor,
                viewModel,
                bindingContext);
        }
    });

    ko.bindingHandlers.command = new CommandBindingHandler();

    extend(ns('DW'), {
        CommandBindingHandler: CommandBindingHandler
    });

}));
