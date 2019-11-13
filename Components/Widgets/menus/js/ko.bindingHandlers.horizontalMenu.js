(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(["jquery", "knockout", "./jquery.ui.horizontalMenu", "../../../Bindings/koJquiBindingFactory"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {
    ko.jqui.bindingFactory.create({
        name: 'horizontalMenu',
        options: ['disabled', 'icons', 'menus', 'position', 'role',
            'selector', 'containerClass', 'responsive', 'contextMenuWrapper', 'dropdownText', 'dropdownClass', 'enableDwScrollbar'
        ],
        updateTriggersMapping: { 'refresh': 'dwResize' },
        events: ['blur', 'create', 'focus', 'select'],
        hasRefresh: true,
        prepareOptions: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var options = valueAccessor();
            if (typeof options.contextMenuBindings === 'object') {
                options.contextMenuWrapper = $('<ul class="contextMenu"></ul>').get(0);
                ko.applyBindingsToNode(options.contextMenuWrapper, options.contextMenuBindings, bindingContext);
                delete options.contextMenuBindings;
            }
            return options;
        },
        onDestroyed: function (element) {
            $(element).children().each(function () {
                ko.cleanNode(this);
            });
        }
    });
}));
