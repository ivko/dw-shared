(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(["jquery", "knockout", "../../../Bindings/koJquiBindingFactory", "./jquery.ui.dwActivity"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {
    ko.jqui.bindingFactory.create({
        name: 'dwActivity',
        options: [
            'active',
            'message',
            'messagePosition',
            'modal',
            'appendTo',
            'spinning',
            'lines',
            'length',
            'width',
            'radius',
            'corners',
            'rotate',
            'direction',
            'color',
            'speed',
            'trail',
            'shadow',
            'hwaccel',
            'className',
            'zIndex',
            'top',
            'left',
            'messageTop',
            'messageLeft'
        ],
        events: [],
        controlsDescendantBindings: false
    });
}));