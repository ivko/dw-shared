(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery", "knockout", "../global", "./ViewModel", "./Disposable"], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {
    var BusyTriggerVM = new Class({
        Extends: DW.ViewModel,
        initialize: function (/*initialCondition*/) {
            this._triggers = ko.observableArray().extend({ deferred: true });
            this.parent();
            this.isBusy = ko.computed(function () {
                    
                return this._triggers().some(function (trigger) {
                    return ($.isFunction(trigger) ? trigger() : trigger);
                });
            }, this).extend({ deferred: true });
        },
        addBusyTrigger: function (trigger) {
            this._triggers.push(trigger);
            return trigger;
        },

        removeBusyTrigger: function(trigger){
            this._triggers.remove(trigger);
            return trigger;
        },

        addBusyPromise: function (promise) {
            var self = this;
            var promiseTrigger = this.addBusyTrigger(ko.observable(true));
            promise.always(function () {
                return self.removeBusyTrigger(promiseTrigger);
            });
            return promise;
        },

        dispose: function () {
            DW.Disposable.dispose(this.isBusy);//stop listen
            DW.Disposable.dispose(this._triggers());
            this._triggers.removeAll();//clear array
            this.parent();
        }
    });
    extend(ns('DW'), {
        BusyTriggerVM: BusyTriggerVM
    });
}));