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

    var RelativeDateTimePeriod = DW.QueryBuilder.SettingsService.RelativeDateTimePeriod;

    var RelativeDateTimeConditionProvider = new Class({
        Extends: DW.QueryBuilder.ConditionProviders.BaseRelativeConditionProvider,
        type: "RelativeDateTimeConditionProvider",
        validationMessageId: 'QueryBuilder_Err_DateTimeField',
        options: {
            Operation: null,
            Value: 0,
            Period: RelativeDateTimePeriod.Month,
            relativeValidator: 'datetime'
        },
        getUnits: function() {
            return [{
                    name: DW.QueryBuilder.localize("QueryDate_Hours"),
                    type: RelativeDateTimePeriod.Hour
                }, {
                    name: DW.QueryBuilder.localize("QueryDate_Days"),
                    type: RelativeDateTimePeriod.Day
                }, {
                    name: DW.QueryBuilder.localize("QueryDate_Months"),
                    type: RelativeDateTimePeriod.Month,
                    max: 120000
                }, {
                    name: DW.QueryBuilder.localize("QueryDate_Years"),
                    type: RelativeDateTimePeriod.Year,
                    max: 10000
                }
            ].map(this.buildUnit.bind(this));
        }
    });
    $.extend(DW.QueryBuilder.ConditionProviders, {
        RelativeDateTimeConditionProvider: RelativeDateTimeConditionProvider
    });
}));