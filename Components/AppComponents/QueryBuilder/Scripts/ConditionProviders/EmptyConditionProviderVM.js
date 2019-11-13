(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "./BaseConditionProviderVM"
        ], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {
    var EmptyConditionProvider = new Class({
        Extends: DW.QueryBuilder.ConditionProviders.BaseConditionProvider,
        type: "EmptyConditionProvider",
        validate: function () {
            return { isValid: true, errors: [] };
        }
    });
    $.extend(DW.QueryBuilder.ConditionProviders, {
        EmptyConditionProvider: EmptyConditionProvider
    });
}));
