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
    var DecimalConditionProvider = new Class({
        Extends: DW.QueryBuilder.ConditionProviders.BaseConditionProvider,
        type: "DecimalConditionProvider",
        validationMessageId: 'QueryBuilder_Err_DecimalField',
        options: {
            Operation: null,
            Value: ''
        },
        initialize: function (options, api) {
            this.parent(options, api);
            this.value = this.addDisposable(ko.observable(this.options.ValueAsString)).extend({ isInvariantDecimal: true });
        },
        getSettings: function () {
            return this.api.createSetting(this.type, {
                Operation: this.getOperation(),
                ValueAsString: this.value()
            });
        }
    });
    $.extend(DW.QueryBuilder.ConditionProviders, {
        DecimalConditionProvider: DecimalConditionProvider
    });
}));
