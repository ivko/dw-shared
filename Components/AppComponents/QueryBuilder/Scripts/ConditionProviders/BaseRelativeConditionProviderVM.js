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

    var BaseRelativeConditionProvider = new Class({
        Extends: DW.QueryBuilder.ConditionProviders.BaseConditionProvider,
        options: {
            Operation: null,
            Period: null,
            Value: ''
        },
        numericValueOptions: {
            precision: 0,
            max: 1000000,
            min: 0
        },
        units: [],
        initialize: function (options, api) {
            this.parent(options, api);
            this.units = this.getUnits();     
            var period = this.units.find(function (obj) {
                return this.options.Period === obj.type;
            }.bind(this));
            this.selectedPeriod = this.addDisposable(ko.observable(period));
            this.value = this.addDisposable(ko.observable(this.options.Value).extend({
                relativeValidator: this.options.relativeValidator,
                validation: {
                    validator: function (val) {
                        return !isNaN(val) && parseFloat(val) >= parseFloat(this.selectedPeriod().min) && parseFloat(val) <= parseFloat(this.selectedPeriod().max);
                    }.bind(this)
                }
            }));
        },
        getUnits: function () {
            throw new TypeError("BaseRelativeConditionProvider: Method getUnits is not implemented");
        },
        buildUnit: function (options) {
            return $.extend({
                min: 0,
                max: 2147483647
            }, options);
        },
        getSettings: function () {
            return this.api.createSetting(this.type, {
                Operation: this.getOperation(),
                Value: this.value(),
                Period: this.selectedPeriod().type
            });
        },

        validate: function () {
            return { isValid: this.value.isValid(), errors: this.value.isValid() ? [] : [DW.QueryBuilder.localize(this.validationMessageId)] };
        }
    });
    $.extend(DW.QueryBuilder.ConditionProviders, {
        BaseRelativeConditionProvider: BaseRelativeConditionProvider
    });
}));
