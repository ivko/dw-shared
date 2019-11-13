(function( factory ) {
    if ( typeof define === "function" && define.amd ) { // AMD.
        define(["jquery", "knockout", "../../../Bindings/Autocomplete/Scripts/ko.autocompleteMenu"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {

    var qbAutocompleteMenu = new Class({
        Extends: DW.Autocomplete.BindingHandler.autocompleteMenu,
        options: {
            templateName: 'qbuilder-autocomplete-menu',
            menuIndentLeft: 0
        },
        _filterCallback: function (items, value) {
            return items.map(function (item) {
                return { displayName: item };
            });
        },
        _isProvider: function (obj) {
            return !(!obj || ($.isArray(obj) && obj.length === 0));
        },
        createOptions: function (options) {
            options = this.parent(options);
            vmOptions = options.viewModelOptions;
            if (!this._isProvider(vmOptions.suggestionsProvider) && !this._isProvider(vmOptions.selectListProvider)) {
                options.enabled = false;
            }
            return options;
        },
        viewModelOptions: function ($data, params) {
            var options = this.parent($data, params);
            if (this._isProvider(options.suggestionsProvider)) {
                // Append suggestions provider
                options.lists.push(this._createSuggestionsOptions($data, options));
            }
            if (this._isProvider(options.selectListProvider)) {
                // Append selectlist provider
                options.lists.push(this._createSelectListOptions($data, options));
            }
            return options;
        },
        _createSuggestionsOptions: function ($data, options) {
            return {
                name: 'suggestions',
                dataProvider: new DW.Autocomplete.DataProvider.BaseDataProvider({
                    data: options.suggestionsProvider,
                    filter: this._filterCallback
                }),
                // DW.Autocomplete.AutocompleteListVM instance or options for it.
                viewModel: {
                    onSelectItem: function (value, item) {
                        options.setSelectListValue(value);
                    },
                    textValue: function (v) {
                        return v.displayName;
                    }
                }
            }
        },
        _createSelectListOptions: function ($data, options) {
            return {
                name: 'selectList',
                dataProvider: new DW.Autocomplete.DataProvider.BaseDataProvider({
                    data: options.selectListProvider,
                    filter: this._filterCallback
                }),
                viewModel: new DW.Autocomplete.AutocompleteListVM({
                    onSelectItem: function (value, item) {
                        options.setSelectListValue(value);
                    },
                    textValue: function (v) {
                        return v.displayName;
                    }
                })
            }
        }
    });
    $.extend(DW.Autocomplete.BindingHandler, {
        qbAutocompleteMenu: qbAutocompleteMenu
    });
    ko.bindingHandlers.qbAutocompleteMenu = new qbAutocompleteMenu();
}));