(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "knockout",
            "./BaseRangeConditionProviderVM"
        ], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {
    var RangeDecimalConditionProvider = new Class({
        Extends: DW.QueryBuilder.ConditionProviders.BaseRangeConditionProvider,
        type: "RangeDecimalConditionProvider",
        validationMessageId: 'QueryBuilder_Err_DecimalRangeField',
        options: {
            rangeCustomValidator: 'isRangeDecimal'
        },
        initialize: function (options, api) {
            this.parent($.extend({},options, {
                FromValue: options.FromValueAsString,
                ToValue: options.ToValueAsString
            }), api);
            //this.fromValue = this.addDisposable(ko.observable(this.options.FromValueAsString));
            //this.toValue = this.addDisposable(ko.observable(this.options.ToValueAsString));
        },

        getSettings: function () {
            return this.api.createSetting(this.type, {
                Operation: this.getOperation(),
                FromValueAsString: this.fromValue(),
                ToValueAsString: this.toValue()
            });
        }
    });
    $.extend(DW.QueryBuilder.ConditionProviders, {
        RangeDecimalConditionProvider: RangeDecimalConditionProvider
    });
}));