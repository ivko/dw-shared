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

    var SqlConditionProvider = new Class({
        Extends: DW.QueryBuilder.ConditionProviders.BaseConditionProvider,
        type: "SqlConditionProvider",
        validationMessageId: 'QueryBuilder_Err_SqlField',
        options: {
            AddWildcard: false,
            Operation: '',
            Value: ''
        },
        initialize: function (options, api) {
            this.parent(options, api);
            this.value = this.addDisposable(ko.observable(this.options.Value)).extend({ isTextValue: true });
        },
        getSettings: function () {
            return this.api.createSetting(this.type, {
                AddWildcard: this.options.AddWildcard,
                Operation: this.getOperation(),
                Value: this.value()
            });
        }
    });

    $.extend(DW.QueryBuilder.ConditionProviders, {
        SqlConditionProvider: SqlConditionProvider
    });
}));
