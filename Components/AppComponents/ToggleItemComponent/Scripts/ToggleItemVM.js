(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "knockout",
            "../../../ViewModels/ViewModel",
            "../../../global",
            "../../../ViewModels/BusyTriggerVM"
        ], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {
    var ToggleItem = new Class({
        Extends: DW.BusyTriggerVM,
        data: null,
        inUse: null,
        initialize: function (data, inUse) {
            this.parent();
            this.inUse = ko.observable(!!inUse);//ako go nqma she e false
            this.data = data;
            //this.select = new DW.FileCabinet.
        }
    });

    extend(ns('DW'), { ToggleItem: ToggleItem });
}));