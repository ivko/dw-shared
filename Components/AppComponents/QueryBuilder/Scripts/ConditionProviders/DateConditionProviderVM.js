(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "knockout",
            "./BaseConditionProviderVM",
            "../../../../Widgets/DateTime/CommonDateTimeDefaults",
            "../../../../Bindings/knockoutCustomValidations",
            "../SettingsService",
            "../ComponentApi"
        ], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {
    var SystemFunctions = DW.QueryBuilder.SettingsService.SystemFunctions;

    var DateConditionProvider = new Class({
        Extends: DW.QueryBuilder.ConditionProviders.BaseConditionProvider,
        type: 'DateConditionProvider',
        conditionProviderType: 'DateConditionProvider',
        validationMessageId: 'QueryBuilder_Err_DateField',
        options: {
            Operation: null,
            SystemFunction: SystemFunctions.None,
            Value: ''
        },
        initialize: function (options, api) {
            this.parent(options, api);
            this.value = this.addDisposable(ko.observable(DW.DateTime.getDateFromSSDate(this.options.Value))).extend({ isDateValue: true });
        },
        getSettings: function () {
            return this.api.createSetting(this.conditionProviderType, {
                Operation: this.getOperation(),
                SystemFunction: SystemFunctions.None,
                Value: DW.DateTime.getDateForSS(this.value())
            });
        }
    });


    var DateTimeConditionProvider = new Class({
        Extends: DateConditionProvider,
        type: 'DateTimeConditionProvider',
        conditionProviderType: 'DateTimeConditionProvider'
    });

    $.extend(DW.QueryBuilder.ConditionProviders, {
        DateConditionProvider: DateConditionProvider,
        DateTimeConditionProvider: DateTimeConditionProvider
    });
}));