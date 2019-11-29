(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "knockout",
            "./CommandBindingAdapter",
            "../../global",
            "../../utils",
            "../../Bindings/BindingHandler",
            "../../Bindings/knockoutExtensions"
        ], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {

    //Command group binding handlers
    var CommandGroupBindingHandler = new Class({
        Extends: BindingHandler,
        adapterString: '',

        addDisposeCallback: function (element) {
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                var disposables = ko.utils.domData.get(element, this.adapterString).disposables || [];
                disposables.forEach(function (disposable) {
                    disposable.dispose();
                });
                ko.utils.domData.set(element, this.adapterString, null);
            }.bind(this));
        },
        initAvailableHandler: function (element, commands, bindingContext) {
            if (!$.isArray(commands)) {
                commands = [commands];
            }

            var data = commands.reduce(function (data, cmd) {
                var ba = new DW.CommandBindingAdapter(cmd, bindingContext);
                data.bindingAdapters[cmd.id] = ba;
                data.disposables.push(ba);
                return data;
            }, {
                bindingAdapters: {},
                disposables: []
            });
            ko.utils.domData.set(element, this.adapterString, data);

            return DW.Utils.addDisposable(ko.computed(function () {
                var availableCommands = commands.filter(function (cmd) {
                    adapter = data.bindingAdapters[cmd.id];
                    return adapter.available() === true;
                });

                return availableCommands.length > 0;
            }), data.disposables);
        }
    });

    var CommandGroupVisibile = new Class({
        /// <summary>
        ///     Group commands visibility binding. Controls element visibility, so if all the passed to the binding commands have false visible function return value, the element is hidden
        /// </summary>
        Extends: CommandGroupBindingHandler,
        adapterString: 'commandGroupVisible_bindingAdapters',
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            /// <summary> </summary>
            /// <param name="valueAccessor" type="Array">[command1, command2, command3, ...]</param>
            var available = this.initAvailableHandler(element, valueAccessor(), bindingContext),
                disposables = ko.utils.domData.get(element, this.adapterString).disposables;

            DW.Utils.addDisposable(ko.computed(function () {
                ko.bindingHandlers.visible.update(element, available, allBindingsAccessor, viewModel, bindingContext);
            }), disposables);

            this.addDisposeCallback(element);
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var commands = valueAccessor(),
                bindingAdapters = ko.utils.domData.get(element, this.adapterString).bindingAdapters;

            if (!$.isArray(commands)) {
                commands = [commands];
            }

            var canExecute = commands.map(function (cmd) {
                var ba = bindingAdapters[cmd.id];
                return ba.canExecute();
            }).some(function (v) {
                return v === true;
            });

            ko.bindingHandlers.enableEx.update(element, ko.utils.wrapAccessor(canExecute), allBindingsAccessor, viewModel, bindingContext);
        }
    });



    var CommandGroupEnable = new Class({
        /// <summary>
        ///     Group commands enable binding. Controls element enabled/disabled state, so if all the passed to the binding commands have false canExecute return value, the element is disabled
        /// </summary>
        Extends: CommandGroupBindingHandler,
        adapterString: 'commandGroupEnable_bindingAdapters',
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            /// <summary> </summary>
            /// <param name="valueAccessor" type="Array">[command1, command2, command3, ...]</param>
            var data = $.extend({
                commands: [],
                enable: function () {
                    return true;
                }
            }, valueAccessor());

            if ($.isArray(data.commands) && data.commands.length === 0) {
                return;
            }

            var available = this.initAvailableHandler(element, data.commands, bindingContext),
                disposables = ko.utils.domData.get(element, this.adapterString).disposables;

            DW.Utils.addDisposable(ko.computed(function () {
                ko.bindingHandlers.enableEx.update(element, ko.utils.wrapAccessor(available() && data.enable()), allBindingsAccessor, viewModel, bindingContext);
            }), disposables);

            this.addDisposeCallback(element);
        }
    });

    extend(ko.bindingHandlers, {
        commandGroupVisibile: new CommandGroupVisibile(),
        commandGroupEnable: new CommandGroupEnable()
    });

}));