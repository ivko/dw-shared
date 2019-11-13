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
    var RangeNumericConditionProvider = new Class({
        Extends: DW.QueryBuilder.ConditionProviders.BaseRangeConditionProvider,
        type: "RangeNumericConditionProvider",
        validationMessageId: 'QueryBuilder_Err_NumericRangeField',
        options: {
            rangeCustomValidator: 'isRangeNumeric'
        }
    });
    $.extend(DW.QueryBuilder.ConditionProviders, {
        RangeNumericConditionProvider: RangeNumericConditionProvider
    });
}));
