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
    var RangeDateTimeConditionProvider = new Class({
        Extends: DW.QueryBuilder.ConditionProviders.BaseRangeConditionProvider,
        type: "RangeDateTimeConditionProvider",
        validationMessageId: 'QueryBuilder_Err_RangeDateField',
        options: {
            rangeCustomValidator: 'isRangeDateTime'
        },
        setValues: function (fromValue, toValue) {
            this.parent(DW.DateTime.getDateFromSSDate(fromValue), DW.DateTime.getDateFromSSDate(toValue));
        },

        getFromValue: function () {
            return DW.DateTime.getDateForSS(this.fromValue());
        },

        getToValue: function () {
            return DW.DateTime.getDateForSS(this.toValue());
        }
    });
    $.extend(DW.QueryBuilder.ConditionProviders, {
        RangeDateTimeConditionProvider: RangeDateTimeConditionProvider
    });
}));