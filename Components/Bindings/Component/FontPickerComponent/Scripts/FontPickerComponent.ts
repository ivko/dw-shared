(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(['knockout'], factory);
    } else { // Global
        factory(ko);
    }
}(function (ko) {
    ko.components.register('fontpicker', {
        viewModel: (params: DWTS.FontPickerComponent.IFontPickerVMParams) =>
            new DWTS.FontPickerComponent.FontPickerVM(params),
        template: { element: 'font-picker-template' }
    });
}));