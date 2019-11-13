(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "knockout",
            "./BaseRangeConditionProviderVM",
            "../../../../Widgets/DateTime/CommonDateTimeDefaults"
        ], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {
    var RangeDateConditionProvider = new Class({
        Extends: DW.QueryBuilder.ConditionProviders.BaseRangeConditionProvider,
        type: "RangeDateConditionProvider",
        validationMessageId: 'QueryBuilder_Err_RangeDateField',
        options: {
            rangeCustomValidator: 'isRangeDate'
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
        RangeDateConditionProvider: RangeDateConditionProvider
    });
}));
