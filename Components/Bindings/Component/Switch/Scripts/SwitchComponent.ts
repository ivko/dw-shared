(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(['knockout'], factory);
    } else { // Global
        factory(ko);
    }
} (function (ko) {
    ko.components.register('switch', {
        viewModel: DWTS.SwitchVM,
        template: { element: 'switch-template' }
    });
}));