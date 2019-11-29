(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([ "jquery", "knockout", "./CommandBindingHandler" , "../../Bindings/knockout-delegatedEvents"], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {
    //var prefix = "ko_delegated_";

    var DelegatedCommandBindingHandler = new Class({
        Extends: DW.CommandBindingHandler,

        _initDelegatedHandler: function (element, evt, wrappedCmdExecute) {
            var delegateBindingName = "delegated" + evt.substr(0, 1).toUpperCase() + evt.slice(1); // 'delegatedClick'

            //ko.utils.domData.set(element, prefix + evt, wrappedCmdExecute());
            ko.bindingHandlers[delegateBindingName].init(element, wrappedCmdExecute);
        },

        initBindingHandler: function (element, evt, wrappedCmdExecute, allBindingsAccessor, viewModel, bindingContext) {
            this._initDelegatedHandler(element, evt, wrappedCmdExecute);
        },

        initEventHandler: function (element, events, allBindingsAccessor, viewModel, bindingContext) {
            Object.keys(events).forEach(function (evt) {
                this._initDelegatedHandler(element, evt, ko.utils.wrapAccessor(events[evt]));
            }.bind(this));
        }
    });

    ko.bindingHandlers.delegatedCommand = new DelegatedCommandBindingHandler();

}));