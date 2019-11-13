(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "knockout",
            "./TextConditionProviderVM"
        ], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {
    var MemoConditionProvider = new Class({
        Extends: DW.QueryBuilder.ConditionProviders.TextConditionProvider,
        type: "MemoConditionProvider",
        conditionProviderType: "MemoConditionProvider",
        validationMessageId: 'QueryBuilder_Err_MemoField'
    });
    $.extend(DW.QueryBuilder.ConditionProviders, {
        MemoConditionProvider: MemoConditionProvider
    });
}));
