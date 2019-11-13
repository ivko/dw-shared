(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "knockout",
            "./BaseConditionProviderVM",
            "../../../../Bindings/knockoutCustomValidations"
        ], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {
    var NumericConditionProvider = new Class({
        Extends: DW.QueryBuilder.ConditionProviders.BaseConditionProvider,
        type: "NumericConditionProvider",
        validationMessageId: 'QueryBuilder_Err_NumericField',
        options: {
            Operation: null,
            Value: ''
        },
        initialize: function (options, api) {
            this.parent(options, api);
            this.value = this.addDisposable(ko.observable(this.options.Value)).extend({ isNumericValue: true });
        },
        getSettings: function () {
            return this.api.createSetting(this.type, {
                Operation: this.getOperation(),
                Value: this.value()
            });
        }
    });
    $.extend(DW.QueryBuilder.ConditionProviders, {
        NumericConditionProvider: NumericConditionProvider
    });
}));
