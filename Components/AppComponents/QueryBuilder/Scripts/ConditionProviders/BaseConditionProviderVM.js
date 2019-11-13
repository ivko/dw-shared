(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "../../../../global",
            "../../../../ViewModels/ViewModel",
            "../SettingsService"
        ], factory);
    } else {
        factory(jQuery);
    }
}(function ($) {

        var BaseConditionProvider = new Class({
            Extends: DW.ViewModel,
            Implements: [Options],
            type: null,
            options: {
                Operation: null
            },
            initialize: function (options, api) {
                this.setOptions(options);
                this.api = api;
                this.operation = this.options.Operation;
            },
            getOperation: function () {
                return this.operation;
            },
            setOperation: function (operation) {
                this.operation = operation;
            },
            getSettings: function () {
                return this.api.createSetting(this.type, {
                    Operation: this.getOperation()
                });
            },
            validate: function () {
                return { isValid: this.value.isValid(), errors: this.value.isValid() ? [] : [DW.QueryBuilder.localize(this.validationMessageId)] };
            },
            dispose: function () {
                delete this.api;
                delete this.operation;
                this.parent();
            }
        });

        var SystemFunctions = DW.QueryBuilder.SettingsService.SystemFunctions,
            SystemFunctionsFactory = {
                fieldTypes: {
                    text: 'text',
                    date: 'date',
                    datetime: 'datetime'
                },
                fieldsMap: {
                    text: ["CurrentUserLongName", "CurrentUserShortName", "CurrentUserEMail"],
                    date: ["CurrentDate"],
                    datetime: ["CurrentDate", "CurrentDateTime"]
                },
                definitions: {
                    CurrentUserLongName: {
                        name: 'CURRENTUSERLONGNAME()',
                        type: SystemFunctions.CurrentUserLongName,
                        displayName: "SystemFunction_CurrentUserLongName"
                    },
                    CurrentUserShortName: {
                        name: 'CURRENTUSERSHORTNAME()',
                        type: SystemFunctions.CurrentUserShortName,
                        displayName: "SystemFunction_CurrentUserShortName"
                    },
                    CurrentUserEMail: {
                        name: 'CURRENTUSEREMAIL()',
                        type: SystemFunctions.CurrentUserEMail,
                        displayName: "SystemFunction_CurrentUserEmail"
                    },
                    CurrentDate: {
                        name: 'CURRENTDATE()',
                        type: SystemFunctions.CurrentDate,
                        displayName: "SystemFunction_CurrentDate"
                    },
                    CurrentDateTime: {
                        name: 'CURRENTDATETIME()',
                        type: SystemFunctions.CurrentDateTime,
                        displayName: "SystemFunction_CurrentDateTime"
                    }
                },
                get: function (fieldType, localize) {
                    _localize = localize || DW.QueryBuilder.localize;

                    if (!fieldType || !SystemFunctionsFactory.fieldsMap[fieldType])
                        return [];

                    return SystemFunctionsFactory.fieldsMap[fieldType].map(function (sysFunctionType) {
                        var sysFunction = SystemFunctionsFactory.definitions[sysFunctionType];
                        sysFunction.displayName = _localize(sysFunction.displayName);
                        return sysFunction;
                    });
                }
            };
    
    $.extend(ns('DW.QueryBuilder.ConditionProviders'), {
        BaseConditionProvider: BaseConditionProvider,
        SystemFunctionsFactory: SystemFunctionsFactory
    });
}));
