(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "knockout",
            "./BaseRelativeConditionProviderVM",
            "../SettingsService"
        ], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {
    var RelativeDatePeriod = DW.QueryBuilder.SettingsService.RelativeDatePeriod;

    var RelativeDateConditionProvider = new Class({
        Extends: DW.QueryBuilder.ConditionProviders.BaseRelativeConditionProvider,
        type: "RelativeDateConditionProvider",
        validationMessageId: 'QueryBuilder_Err_DateField',
        options: {
            Operation: null,
            Value: 0,
            Period: RelativeDatePeriod.Month,
            relativeValidator: 'date'
        },
        getUnits: function () {
            return [{
                name: DW.QueryBuilder.localize("QueryDate_Days"),
                type: RelativeDatePeriod.Day
            }, {
                name: DW.QueryBuilder.localize("QueryDate_Months"),
                type: RelativeDatePeriod.Month,
                max: 120000
            }, {
                name: DW.QueryBuilder.localize("QueryDate_Years"),
                type: RelativeDatePeriod.Year,
                max: 10000
            }
            ].map(this.buildUnit.bind(this));
        }
    });
    $.extend(DW.QueryBuilder.ConditionProviders, {
        RelativeDateConditionProvider: RelativeDateConditionProvider
    });
}));
