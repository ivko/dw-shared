(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "knockout",
            "./BaseConditionProviderVM",
            "../SettingsService",
            "../ComponentApi"
        ], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {

    var SystemFunctions = DW.QueryBuilder.SettingsService.SystemFunctions,
        ConditionProviderType = "TextConditionProvider";

    var CustomValueTextConditionProvider = new Class({
        Extends: DW.QueryBuilder.ConditionProviders.BaseConditionProvider,
        type: "CustomValueTextConditionProvider",
        conditionProviderType: ConditionProviderType,
        validationMessageId: 'QueryBuilder_Err_TextField',
        value: null,
        systemFunctions: [],
        options: {
            Value: '',
            SystemFunction: SystemFunctions.None
        },
       
        initialize: function (options, api) {
            this.parent(options, api);
            this.initInternal();
            this.value = this.addDisposable(this.addDisposable(ko.observable(this.getValue())).extend({ isTextValue: true }));
        },
        initInternal: function () {

        },
        getValue: function () {
            return this.options.Value;
        },

        getSettings: function () {
            return this.api.createSetting(this.conditionProviderType, {
                Operation: this.getOperation(),
                Value: this.value(),
                SystemFunction: SystemFunctions.None
            });
        },

        dispose: function () {
            delete this.value;
            this.parent();
        }
    });

    var TextConditionProvider = new Class({
        Extends: CustomValueTextConditionProvider,
        type: ConditionProviderType,
        sysFunctionsFieldType: DW.QueryBuilder.ConditionProviders.SystemFunctionsFactory.fieldTypes.text,
        sysFunctionsData: [],
        initialize: function (options, api) {
            this.parent(options, api);

            this.systemFunctions = this.sysFunctionsData.map(function (obj) { return obj.displayName; });
            this.selectedFunction = this.addDisposable(ko.computed(function () {
                var value = this.value(),
                    selected = this.sysFunctionsData.find(function (obj) {
                        return obj.displayName == value;
                    });
                return selected ? selected.type : SystemFunctions.None;
            }, this));
        },

        initInternal: function () {
            this.parent();
            this.sysFunctionsData = DW.QueryBuilder.ConditionProviders.SystemFunctionsFactory.get(this.sysFunctionsFieldType);
        },

        getValue: function () {
            return this._findOptionValue();
        },

        _findOptionValue: function () {
            var value = this.options.Value,
                systemFunction = this.options.SystemFunction;

            if (value == '' && systemFunction !== SystemFunctions.None) {
                var selected = this.sysFunctionsData.find(function (obj) {
                    return obj.type == systemFunction;
                });
                value = selected ? selected.displayName : '';
            }
            return value;
        },
        
        getSettings: function () {
            return this.api.createSetting(this.conditionProviderType, {
                Operation: this.getOperation(),
                Value: this.selectedFunction() === SystemFunctions.None ? this.value() : '',
                SystemFunction: this.selectedFunction()
            });
        },

        dispose: function () {
            delete this.selectedFunction;
            delete this.systemFunctions;
            this.parent();
        }
    });


    $.extend(DW.QueryBuilder.ConditionProviders, {
        CustomValueTextConditionProvider: CustomValueTextConditionProvider,
        TextConditionProvider: TextConditionProvider
    });

}));
