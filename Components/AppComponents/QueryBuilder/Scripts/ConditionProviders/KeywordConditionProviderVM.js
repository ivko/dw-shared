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
    var KeywordConditionProvider = new Class({
        Extends: DW.QueryBuilder.ConditionProviders.TextConditionProvider,
        type: "KeywordConditionProvider",
        conditionProviderType: "KeywordConditionProvider",
        validationMessageId: 'QueryBuilder_Err_KeywordField'
    });

    var CustomValueKeywordConditionProvider = new Class({
        Extends: DW.QueryBuilder.ConditionProviders.CustomValueTextConditionProvider,
        type: "KeywordConditionProvider",
        conditionProviderType: "KeywordConditionProvider",
        validationMessageId: 'QueryBuilder_Err_KeywordField'
    });

    $.extend(DW.QueryBuilder.ConditionProviders, {
        KeywordConditionProvider: KeywordConditionProvider,
        CustomValueKeywordConditionProvider: CustomValueKeywordConditionProvider
    });
}));
