(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "SettingsService"
        ], factory);
    } else {
        factory(jQuery);
    }
}(function ($) {
    if (!ns('dev.docuware.com.settings.web.querybuilder').__typeName) {
        throw new TypeError("Query builder namespace is not registered");
    };

    $.extend(ns('DW.QueryBuilder'), {
        SettingsService: dev.docuware.com.settings.web.querybuilder
    });
}));