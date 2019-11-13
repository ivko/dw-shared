(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "knockout",
            "./Command",
            "../../global",
            "../../utils",
            "../../ViewModels/Disposable"
        ], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {

    var CommandBindingAdapter = new Class({
        Extends: DW.Disposable,

        initialize: function (command, bindingContext) {
            /// <summary>
            ///     Command binding adapter
            ///     Used as manager between the command intarface and the command custom binding
            ///     Wraps canExecute, available and visible in computed
            /// </summary>
            /// <param name="command">Class that extends DW.Command</param>
            /// <param name="bindingContext">bindingContext from the custom command binding</param>
            this.command = command;
            this.requires = ko.utils.resolveRequires(bindingContext, this.command.requires);

            this.canExecute = this.addDisposable(ko.computed(function () {
                if (!this.available()) return false;

                return !!this.command.canExecute(this.command.isExecuting(), this.requires);
            }, this).extend({ deferred: true }));
        },

        available: function () {
            /// <summary>
            ///     Calls the command available method with valued requires object as argument
            /// </summary>
            /// <returns type="boolean"></returns>
            return !!this.command.available(this.requires);
        },

        execute: function (/*...*/) {
            /// <summary>
            ///     Calls the command execute method with valued requires object as argument
            ///     Sets command isExecuting
            /// </summary>
            /// <returns type="boolean"></returns>
            if (!this.canExecute()) return DW.Utils.rejectedDeferred;

            var args = [this.requires].append(Array.prototype.slice.call(arguments));

            this.command.isExecuting(true);
            return DW.When(this.command.execute.apply(this.command, args)).always((function () {
                this.command.isExecuting(false);
            }).bind(this));
        }
    });

    extend(ns('DW'), {
        CommandBindingAdapter: CommandBindingAdapter
    });

}));