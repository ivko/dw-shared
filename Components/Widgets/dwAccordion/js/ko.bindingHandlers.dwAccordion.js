(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(["jquery", "knockout", "./jquery.ui.dwAccordion", "../../../Bindings/koJquiBindingFactory", "../../../Bindings/knockoutExtensions"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {

    ko.jqui.bindingFactory.create({
        name: 'dwAccordion',

        options: ['active', 'animate', 'collapsible', 'disabled', 'event',
                    'header', 'heightStyle', 'icons'],
        events: ['activate', 'beforeActivate', 'create'],

        postInit: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var options = valueAccessor();
            var $element = $(element);

            if (ko.isWriteableObservable(options.active)) {
                $element.on('click', function (ev) {
                    options.active($element.dwAccordion('option', 'active'));
                });
            }
        },

        activate: function (event, ui) {
            var active = $(this).accordion("option", "active");

            if (onActivate) {

                onActivate(activeIndex);
            }
        },
        onDestroyed: function (element) {
            //$(element).children().each(function () {
            //    ko.cleanNode(this);
            //});
        },
        hasRefresh: true
    });
}));