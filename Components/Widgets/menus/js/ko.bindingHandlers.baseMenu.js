(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(["jquery", "knockout", "./jquery.ui.baseMenu", "../../../Bindings/koJquiBindingFactory"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {
    ko.jqui.bindingFactory.create({
        name: 'baseMenu',
        options: ['disabled', 'icons', 'menus', 'position', 'role', 'enableDwScrollbar', 'autohideUnnesessaryItems', 'enableKeyboard', 'handlePropagationStopped'],
        events: ['blur', 'create', 'focus', 'select'],
        hasRefresh: true
    });
}));
