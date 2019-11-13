(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(['knockout'], factory);
    } else { // Global
        factory(ko);
    }
}(function (ko) {
        ko.components.register('more-options', {
            viewModel: <T>(params: DWTS.MoreOptionsComponent.MoreOptionsVMParams<T>) =>
                new DWTS.MoreOptionsComponent.MoreOptionsVM(params),
        template: { element: 'more-options-component' }
    });
}));