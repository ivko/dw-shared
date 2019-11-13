(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(["knockout", "jquery.resizableColumns", "../../../Bindings/koJquiBindingFactory"], factory);
    } else { // Global
        factory(ko);
    }
}(function (ko) {
    ko.jqui.bindingFactory.create({
        name: 'resizableColumns',
        options: [
            'selector',
            'store',
            'resizeFromBody',
            'maxWidth',
            'minWidth',
            'initialWidth',
            'resizeMode',
            '$resizableTableContainer',
            '$table',
            'columns'
        ],
        updateTriggersMapping: { 'refresh': 'dwResize' },
        events: [],
        hasRefresh: true
    });
}));
