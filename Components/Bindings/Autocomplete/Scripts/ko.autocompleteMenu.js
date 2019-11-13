(function( factory ) {
    if ( typeof define === "function" && define.amd ) { // AMD.
        define(["jquery", "knockout", "jquery-ui", "../../BindingHandler", "./AutocompleteVM", "./AutocompleteListVM", "./AutocompleteBehavior", "./DataProvider/BaseDataProvider"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {
    
    var autocompleteMenu = new Class({
        Extends: BindingHandler,
        options: {
            enabled: true,
            data: {},
            viewModelOptions: {
                createDefaultList: false,
                lists: []
            },
            menuAppearanceDeterminingElement: undefined // determines width and position
        },
        components: {
            Behavior: DW.Autocomplete.AutocompleteBehavior,
            ViewModel: DW.Autocomplete.AutocompleteVM
        },
        viewModelOptions: function ($data, options) {
            if (options.createDefaultList) {
                options = this._createDefaultListOptions($data, options);
            }
            return options;
        },
        viewModelFactory: function ($data, params) {
            return new this.components.ViewModel(this.viewModelOptions($data, params));
        },
        createOptions: function (options) {
            options = $.extend(true, {}, this.options, options);

            if (typeof options.createViewModel !== 'function') {
                $.extend(options, {
                    createViewModel: this.viewModelFactory.bind(this, options.data, options.viewModelOptions)
                });
            }

            return options;
        },
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var options = this.createOptions(ko.unwrap(valueAccessor()));
            var behaviour = new this.components.Behavior(element, options);
            
            ko.computed({
                read: function () {
                    var enabled = !ko.isObservable(options.enabled) && !$.isFunction(options.enabled) ? options.enabled : options.enabled();  //ko.utils.unwrapObservable(options.enabled);
                    this[enabled ? 'activate' : 'deactivate']();
                },
                disposeWhenNodeIsRemoved: element,
                owner: behaviour
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {behaviour.dispose()});
        },
        _createDefaultListOptions: function (data, options) {

            options.lists.push({
                name: 'selectList',
                viewModel: {
                    onSelectItem: function (value, item) {
                        options.setSelectListValue(value);
                    },
                    textValue: function (v) {
                        return v.displayName;
                    }
                },
                dataProvider: new DW.Autocomplete.DataProvider.BaseDataProvider({
                    data: data,
                    filter: function (items, value) {
                        var filteredItems = [];
                        if (value.charAt(value.length - 1) === '*') value = value.slice(0, value.length - 1);
                        for (var i = 0; i < items.length; i++) {
                            var item = items[i];
                            var conditionLength = value.length;
                            if (!item || item.length < conditionLength) continue;
                            if (item.substring(0, conditionLength).toLowerCase() === value.toLowerCase()) {
                                filteredItems.push({ displayName: item });
                            }
                        }
                        return filteredItems;                        
                    }
                })
            });
            return options;
        }
    });
        
    $.extend(DW.Autocomplete.BindingHandler, {
        autocompleteMenu: autocompleteMenu
    });
        
    ko.bindingHandlers.autocompleteMenu = new autocompleteMenu();
}));