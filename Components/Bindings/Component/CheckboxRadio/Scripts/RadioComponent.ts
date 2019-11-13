(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(['knockout'], factory);
    } else { // Global
        factory(ko);
    }
} (function (ko) {
    ko.components.register('radio', {
        viewModel: (params) => new DWTS.CheckboxRadio.SelectionComponentVM(params),
        template: { element: 'radio-template' }
    });
}));