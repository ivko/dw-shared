(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "knockout",
            "../../../global",
            "../../../Commands/Scripts/Command"
        ], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {
    var ToggleItemCommand = new Class({
        Extends: DW.Command,

        initialize: function (prop) {
            this.prop = prop;
            this.parent();
        },

        execute: function (requires) {
            var item = requires.data;
            if (!item[this.prop]) return;

            $.isFunction(item[this.prop]) ? item[this.prop](!item[this.prop]()) : item[this.prop] = !item[this.prop];
        }
    });
    
    var SelectAllCommand = new Class({
        Extends: DW.Command,
        VM: null,
        initialize: function (options) {
            this.inUse = ko.observable(true);
            this.parent();
            this.list = options.list;
            this.prop = options.prop;
            
            var self = this;
            this.addDisposable(ko.computed(function () {
                self.inUse(self.list().length && self.list().every(function (item) {
                    return item[self.prop]();
                }));
            }).extend({ rateLimit: { timeout: 1, method: "notifyWhenChangesStop" } }));
        },

        execute: function () {
            var select = !this.inUse();
            this.list().forEach(function (item) {
                item[this.prop](select);
            }.bind(this));
            this.inUse(select);
        }
    });

    extend(ns('DW'), {
        ToggleItemCommand: ToggleItemCommand,
        SelectAllCommand: SelectAllCommand
    });
}));