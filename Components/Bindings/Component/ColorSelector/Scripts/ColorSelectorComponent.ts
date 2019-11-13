(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(['knockout'], factory);
    } else { // Global
        factory(ko);
    }
}(function (ko) {
    ko.components.register('color-selector', {
        viewModel: (params) => new DWTS.ColorSelectorVM(params),
        template: { element: 'colorSelector-template' }
    });
}));