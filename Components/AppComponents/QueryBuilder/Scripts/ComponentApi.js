(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "knockout",
            "../../../global",
            "../../../utils",
            "../../../ViewModels/BaseComponentApi",
            "./ConditionVM",
            "./GroupConditionVM",
            "./QueryBuilderVM",
            "./qbAutocompleteMenu",
            "../../../knockout-jquery-ui-widget",
            "../../../Bindings/position",
            "../../../Widgets/menus/js/ko.bindingHandlers.baseMenu",
            "../../../Widgets/menus/js/ko.bindingHandlers.contextMenu",
            "../../../Bindings/jQueryUI/ko.bindingHandlers.spinner",
            "../../../Widgets/DateTime/dateEntry/ko.datePickerBinding",
            "../../../Widgets/numeric/js/ko.numericBinding"
        ], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {

    /* Define QueryBuilder template factories */
    var GroupTemplateFactory = {
        definitions: {
            'GroupVM': 'group-template',
            'ConditionVM': 'condition-template',
            'QueryBuilderVM': 'queryBuilder-template'
        },
        get: function (obj) {
            if (instanceOf(obj, DW.QueryBuilder.GroupConditionVM)) {
                return this.definitions.GroupVM;
            }
            else if (instanceOf(obj, DW.QueryBuilder.ConditionVM)) {
                return this.definitions.ConditionVM;
            }
            else if (instanceOf(obj, DW.QueryBuilder.QueryBuilderVM)) {
                return this.definitions.QueryBuilderVM;
            }
            else {
                throw new TypeError('GroupTemplateFactory: invalid type');
            }
        }
    };


    var ComponentApi = new Class({
        Extends: DW.BaseComponentApi,
        options: {
            maxNestingLevel: 0,
            fieldOperators: {},
            templateFactories: {
                'Group': GroupTemplateFactory,
                // to be implemented in subclassess
                'ConditionProvider': {
                    get: function (type, field, api) {

                    }
                }
            },
            getResources: function () {
                return DWResources.QueryBuilder;
            },
            conditionProviderFactory: function (options, field, api) {
                // to be implemented in subclassess
            },
            suggestionsProviderFactory: function () {
                // to be implemented
                return [];
            },
            createSetting: function (type, options) {
                // to be implemented in subclassess
            },
            getSelectListData: function () {
                // to be implemented
                return DW.Deferred(function (dfd) {
                    dfd.resolve([]);
                }).promise();
            },
            generateConditionProviderId: function (type, operation) {
                // to be implemented in subclassess
            }
        },
        getMaxNestingLevel: function () {
            return this.options.maxNestingLevel;
        },
        getDefaultInstances: function () {
            return DW.QueryBuilder.DefaultInstances;
        },
        initialize: function (options) {
            this.parent(options);
            this.set(DW.QueryBuilder);
        },
        createGroupConditionVM: function (options, parent) {
            return this.instances.createGroupConditionVM(options, parent, this);
        },
        createConditionVM: function (options, parent) {
            return this.instances.createConditionVM(options, parent, this);
        },
        createQueryBuilderVM: function (options) {
            return this.instances.createQueryBuilderVM(options, this);
        },
        templateFactory: function (name, obj) {
            return this.options.templateFactories[name].get(obj)
        },
        conditionProviderFactory: function (options, field) {
            return this.options.conditionProviderFactory.apply(this, arguments);
        },
        suggestionsProviderFactory: function (field) {
            return this.options.suggestionsProviderFactory.apply(this, arguments);
        },
        generateConditionProviderId: function (conditionProvider) {
            return this.options.generateConditionProviderId.apply(this, arguments);
        },
        getFieldOperators: function (filedType) {
            if (!this.options.fieldOperators[filedType]) {
                return []
            };
            return this.options.fieldOperators[filedType];
        },
        createSetting: function (type, options) {
            return this.options.createSetting.apply(this, arguments);
        },
        getSelectListData: function (fieldId, prefix) {
            return this.options
                .getSelectListData(fieldId, prefix)
                .fail(function (error) {
                    DW.Utils.handleError(error);
                });
        }
    });

    //Define default vms that would be used inside the component. 
    extend(ns('DW.QueryBuilder'), {
        ComponentApi: ComponentApi,
        DefaultInstances: {
            createGroupConditionVM: function (options, parent, api) {
                return new DW.QueryBuilder.GroupConditionVM(options, parent, api);
            },
            createConditionVM: function (options, parent, api) {
                return new DW.QueryBuilder.ConditionVM(options, parent, api);
            },
            createQueryBuilderVM: function (options, api) {
                return new DW.QueryBuilder.QueryBuilderVM(options, api);
            }
        },
        Templates: {},
        Resources: (DWResources && DWResources.QueryBuilder) ? DWResources.QueryBuilder : {},
        Operations: {},
        OperationOptions: {},
        localize: function (key, params) {
            var resources = DW.QueryBuilder.Resources;
            return DW.Utils.format((resources && resources[key]) || key || '', params);
        },
        allowedSystemFields: {
            'DWSTOREUSER': 'DWSTOREUSER', 'DWMODUSER': 'DWMODUSER', 'DWLASTACCESSUSER': 'DWLASTACCESSUSER',
            'DWDOCID': 'DWDOCID', 'DWEXTENSION': 'DWEXTENSION',
            'DWSTOREDATETIME': 'DWSTOREDATETIME', 'DWMODDATETIME': 'DWMODDATETIME', 'DWLASTACCESSDATETIME': 'DWLASTACCESSDATETIME'
        }, //fulltext field is also a system field, and it should not be allowed
        filterAndLocalizeSystemFields: function (fields) {

            var results = [];
            fields.forEach(function (field) {
                if (!field.UserDefined && DW.QueryBuilder.allowedSystemFields[field.DBName]) {
                    var newField = Object.clone(field);
                    newField.Name = DW.QueryBuilder.localize("QueryBuilder_SystemField_" + field.DBName);
                    results.push(newField);
                }
                else if (field.UserDefined && field.DWType !== dev.docuware.com.settings.interop.DWFieldType.Table)
                    results.push(Object.clone(field));
            });

            return results;
        },
        buildQueryBuilderField: function (field) {
            return {
                UserDefined: field.UserDefined,
                Guid: field.Guid,
                DBName: field.DBName,
                DWType: DW.Utils.getFieldTypeName(field.DWType),
                Name: field.Name,
                DigitsAfterDecimalPoint: field.DigitsAfterDecimalPoint
            };
        },
        buildInvalidQueryBuilderField: function (DBName) {
            return {
                DBName: DBName,
                DWType: 'Text',
                Name: DBName,
                DigitsAfterDecimalPoint: 0
            }
        },
        getGroupTemplateFactory: function (definitions) {
            var factory = Object.clone(GroupTemplateFactory);
            factory.definitions = $.extend({}, GroupTemplateFactory.definitions, definitions);
            return factory;
        }
    });
}));