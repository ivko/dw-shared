(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(['knockout'], factory);
    } else { // Global
        factory(ko);
    }
} (function (ko) {
    ko.components.register('combobox', {
        viewModel: function (params) {
            let viewModel = null;

            if (params.useFullObject) {
                params.valueSelector = <DWTS.Interfaces.Components.ComboboxComponent.IValueSelectorOptions<any>>{
                    getSelectedControllerItem: (initialSelected, valueProp) => {
                        return initialSelected ? initialSelected[valueProp] : null;
                    },
                    findItem: (itemValue, items, valueProp) => {
                        return items.find((item) => {
                            return item[valueProp] == itemValue;
                        });
                    },
                    getItemValue: (item, valueProp) => { return item ? item[valueProp] : ""; },
                    buildInaccessibleItem: (item, displayProp, invalidResource, valueProp) => {
                        return extend({}, item, { [displayProp]: invalidResource });
                    }
                }
               
                viewModel = new DWTS.ComboboxComponent.ComboboxVM<any>(params);
            
            }
            else {
                params.valueSelector = <DWTS.Interfaces.Components.ComboboxComponent.IValueSelectorOptions<string>>{
                    getSelectedControllerItem: (initialSelected, valueProp) => { return initialSelected; },
                    findItem: (itemValue, items, valueProp) => {
                        return itemValue || "";
                    },
                    getItemValue: (item, valueProp) => { return item || ""; },
                    buildInaccessibleItem: (item, displayProp, invalidResource, valueProp) => {
                        return {
                            [displayProp]: invalidResource,
                            [valueProp]: item
                        };
                    }
                }

                viewModel = new DWTS.ComboboxComponent.ComboboxVM<string>(params);
            }

            return viewModel;
        },
        template: { element: 'combobox-template' }
    });
}));