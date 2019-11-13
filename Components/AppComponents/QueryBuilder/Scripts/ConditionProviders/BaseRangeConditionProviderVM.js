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
    var BaseRangeConditionProvider = new Class({
        Extends: DW.QueryBuilder.ConditionProviders.BaseConditionProvider,
        options: {
            Operation: null,
            FromValue: null,
            ToValue: null
        },
        initialize: function (options, api) {
            this.parent(options, api);
            // this.toValue is extended with knockpout validation, validating both fromValue and toValue range fields
            // takes param options.rangeCustomValidator from each child class
            this.fromValue = this.addDisposable(ko.observable());
            this.toValue = this.addDisposable(ko.observable()).extend((function (_self) {
                var validationOptions = {}; validationOptions[_self.options.rangeCustomValidator] = _self.fromValue;
                return validationOptions;
            })(this));

            this.setValues(this.options.FromValue, this.options.ToValue);
        },


        setValues: function (fromValue, toValue) {
            this.fromValue(fromValue);
            this.toValue(toValue);
        },

        getSettings: function () {
            return this.api.createSetting(this.type, {
                Operation: this.getOperation(),
                FromValue: this.getFromValue(),
                ToValue: this.getToValue()
            });
        },

        validate: function () {
            return { isValid: this.toValue.isValid(), errors: this.toValue.isValid() ? [] : [DW.QueryBuilder.localize(this.validationMessageId)] };
        },

        getFromValue: function () {
            return this.fromValue();
        },

        getToValue: function () {
            return this.toValue();
        }
    });

    $.extend(DW.QueryBuilder.ConditionProviders, {
        BaseRangeConditionProvider: BaseRangeConditionProvider
    });
}));