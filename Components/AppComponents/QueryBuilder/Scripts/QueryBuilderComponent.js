(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "knockout",
            "./ComponentApi",
            "./SettingsService",

            //"./ConditionProviders/BaseConditionProviderVM",
            "./ConditionProviders/TextConditionProviderVM",
            "./ConditionProviders/KeywordConditionProviderVM",
            "./ConditionProviders/MemoConditionProviderVM",

            "./ConditionProviders/DateConditionProviderVM",
            "./ConditionProviders/DecimalConditionProviderVM",
            "./ConditionProviders/EmptyConditionProviderVM",
            "./ConditionProviders/NumericConditionProviderVM",

            //"./ConditionProviders/BaseRangeConditionProviderVM",
            "./ConditionProviders/RangeDateConditionProviderVM",
            "./ConditionProviders/RangeDateTimeConditionProviderVM",
            "./ConditionProviders/RangeDecimalConditionProviderVM",
            "./ConditionProviders/RangeNumericConditionProviderVM",

            //"./ConditionProviders/BaseRelativeConditionProviderVM",
            "./ConditionProviders/RelativeDateConditionProviderVM",
            "./ConditionProviders/RelativeDateTimeConditionProviderVM",
            "./ConditionProviders/SqlConditionProviderVM"

        ], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {
    var SettingsService = DW.QueryBuilder.SettingsService;

    //OperatorOptionModes.default is the 'least common multiple'. 
    //If additional operators are required, a new mode must be specified; for example: taskLists mode
    //If some new mode does not need an operator from the default ones, the default mode should be removed from that operator and replaced with a list of all previously existing specific modes
    var OperatorOptionModes = {
        'default': 0, //common operators
        'taskLists': 1, //specific for taskLists 
        'docLinks': 2, //specific for docLinks
        'autoindex': 3, //specific for aix
        'externalsource': 4 //specific for external sources (database or file connection)
    };

    var fieldOperatorsOptions = {
        'Text': [
            ["QueryBuilder_Contains", {
                simple: { operation: SettingsService.TextConditionOperation.Contains, provider: 'TextConditionProvider' },
                field: { operation: SettingsService.FieldTextConditionOperation.Contains, provider: 'FieldTextConditionProvider' }
            }, [OperatorOptionModes.default]],
            ["QueryBuilder_IsEqual", {
                simple: { operation: SettingsService.TextConditionOperation.Equal, provider: 'TextConditionProvider'},
                field: {operation: SettingsService.FieldTextConditionOperation.Equal, provider: 'FieldTextConditionProvider' }
            },[OperatorOptionModes.default]],
            ["QueryBuilder_IsNotEqual", {
                simple: { operation: SettingsService.TextConditionOperation.NotEqual, provider:'TextConditionProvider'},
                field: { operation: SettingsService.FieldTextConditionOperation.NotEqual, provider: 'FieldTextConditionProvider' }
            }, [OperatorOptionModes.default]],
            ["QueryBuilder_Begins", {
                simple: { operation: SettingsService.TextConditionOperation.Begins, provider:'TextConditionProvider'},
                field: { operation: SettingsService.FieldTextConditionOperation.Begins, provider: 'FieldTextConditionProvider' }
            }, [OperatorOptionModes.docLinks, OperatorOptionModes.autoindex, OperatorOptionModes.externalsource]],
            ["QueryBuilder_Ends", {
                simple: { operation: SettingsService.TextConditionOperation.Ends, provider:'TextConditionProvider'},
                field: { operation: SettingsService.FieldTextConditionOperation.Ends, provider: 'FieldTextConditionProvider' }
            }, [OperatorOptionModes.docLinks, OperatorOptionModes.autoindex, OperatorOptionModes.externalsource]],
            ["QueryBuilder_IsEmpty", {
                simple: { operation: SettingsService.EmptyConditionOperation.Empty,provider: 'EmptyConditionProvider'},
               // field: { operation: SettingsService.EmptyConditionOperation.Empty, provider: 'EmptyConditionProvider' }
            }, [OperatorOptionModes.default]],
            ["QueryBuilder_IsNotEmpty", {
                simple: { operation: SettingsService.EmptyConditionOperation.NotEmpty, provider:'EmptyConditionProvider'},
                //field: { operation: SettingsService.EmptyConditionOperation.Empty, provider: 'EmptyConditionProvider' }
            }, [OperatorOptionModes.default]],
            ["QueryBuilder_IsWhereClause", {
                simple: { operation: SettingsService.SqlConditionOperation.Is, provider:'SqlConditionProvider'},
                //field: null
            }, [OperatorOptionModes.default]]
        ],
        'Numeric': [
            ["QueryBuilder_IsEqual", {
                simple: { operation: SettingsService.NumericConditionOperation.Equal,provider: 'NumericConditionProvider'},
                field: { operation: SettingsService.FieldNumericConditionOperation.Equal, provider: 'FieldNumericConditionProvider' }
            }, [OperatorOptionModes.default]],
            ["QueryBuilder_IsNotEqual", {
                simple: { operation:  SettingsService.NumericConditionOperation.NotEqual, provider:'NumericConditionProvider'},
                field: { operation: SettingsService.FieldNumericConditionOperation.NotEqual, provider: 'FieldNumericConditionProvider' }
            }, [OperatorOptionModes.default]],
            ["QueryBuilder_IsEmpty", {
                simple: { operation: SettingsService.EmptyConditionOperation.Empty, provider:'EmptyConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.default]],
            ["QueryBuilder_IsNotEmpty", {
                simple: { operation: SettingsService.EmptyConditionOperation.NotEmpty,provider: 'EmptyConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.default]],
            ["QueryBuilder_IsBetween", {
                simple: { operation: SettingsService.RangeNumericConditionOperation.Range, provider:'RangeNumericConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.taskLists, OperatorOptionModes.autoindex]],
            ["QueryBuilder_IsWhereClause", {
                simple: { operation: SettingsService.SqlConditionOperation.Is, provider:'SqlConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.taskLists, OperatorOptionModes.autoindex]],
            ["QueryBuilder_More", {
                simple: { operation: SettingsService.NumericConditionOperation.More,provider: 'NumericConditionProvider'},
                field: { operation: SettingsService.FieldNumericConditionOperation.More, provider: 'FieldNumericConditionProvider' }
            }, [OperatorOptionModes.docLinks, OperatorOptionModes.externalsource]],
            ["QueryBuilder_MoreOrEqual", {
                simple: { operation: SettingsService.NumericConditionOperation.MoreEqual, provider:'NumericConditionProvider'},
                field: { operation: SettingsService.FieldNumericConditionOperation.MoreEqual, provider: 'FieldNumericConditionProvider' }
            }, [OperatorOptionModes.docLinks, OperatorOptionModes.externalsource]],
            ["QueryBuilder_Less", {
                simple: { operation: SettingsService.NumericConditionOperation.Less, provider:'NumericConditionProvider'},
                field: { operation: SettingsService.FieldNumericConditionOperation.Less, provider: 'FieldNumericConditionProvider' }
            }, [OperatorOptionModes.docLinks, OperatorOptionModes.externalsource]],
            ["QueryBuilder_LessOrEqual", {
                simple: { operation: SettingsService.NumericConditionOperation.LessEqual, provider:'NumericConditionProvider'},
                field: { operation: SettingsService.FieldNumericConditionOperation.LessEqual, provider: 'FieldNumericConditionProvider' }
            }, [OperatorOptionModes.docLinks, OperatorOptionModes.externalsource]]
        ],
        'Decimal': [
            ["QueryBuilder_IsEqual", {
                simple: { operation: SettingsService.DecimalConditionOperation.Equal, provider:'DecimalConditionProvider'},
                field: { operation: SettingsService.FieldDecimalConditionOperation.Equal, provider: 'FieldDecimalConditionProvider' }
            }, [OperatorOptionModes.default]],
            ["QueryBuilder_IsNotEqual", {
                simple: { operation: SettingsService.DecimalConditionOperation.NotEqual, provider:'DecimalConditionProvider'},
                field: { operation: SettingsService.FieldDecimalConditionOperation.NotEqual, provider: 'FieldDecimalConditionProvider' }
            }, [OperatorOptionModes.default]],
            ["QueryBuilder_IsEmpty", {
                simple: { operation: SettingsService.EmptyConditionOperation.Empty,provider: 'EmptyConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.default]],
            ["QueryBuilder_IsNotEmpty", {
                simple: { operation: SettingsService.EmptyConditionOperation.NotEmpty, provider:'EmptyConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.default]],
            ["QueryBuilder_IsBetween", {
                simple: { operation: SettingsService.RangeDecimalConditionOperation.Range, provider:'RangeDecimalConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.taskLists, OperatorOptionModes.autoindex]],
            ["QueryBuilder_IsWhereClause", {
                simple: { operation: SettingsService.SqlConditionOperation.Is,provider: 'SqlConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.taskLists, OperatorOptionModes.autoindex]],
            ["QueryBuilder_More", {
                simple: { operation: SettingsService.DecimalConditionOperation.More, provider:'DecimalConditionProvider'},
                field: { operation: SettingsService.FieldDecimalConditionOperation.More, provider: 'FieldDecimalConditionProvider' }
            }, [OperatorOptionModes.docLinks, OperatorOptionModes.externalsource]],
            ["QueryBuilder_MoreOrEqual", {
                simple: { operation: SettingsService.DecimalConditionOperation.MoreEqual, provider: 'DecimalConditionProvider' },
                field: { operation: SettingsService.FieldDecimalConditionOperation.MoreEqual, provider: 'FieldDecimalConditionProvider' }
            }, [OperatorOptionModes.docLinks, OperatorOptionModes.externalsource]],
            ["QueryBuilder_Less", {
                simple: { operation: SettingsService.DecimalConditionOperation.Less,provider: 'DecimalConditionProvider'},
                field: { operation: SettingsService.FieldDecimalConditionOperation.Less, provider: 'FieldDecimalConditionProvider' }
            }, [OperatorOptionModes.docLinks, OperatorOptionModes.externalsource]],
            ["QueryBuilder_LessOrEqual", {
                simple: { operation: SettingsService.DecimalConditionOperation.LessEqual, provider: 'DecimalConditionProvider' },
                field: { operation: SettingsService.FieldDecimalConditionOperation.LessEqual, provider: 'FieldDecimalConditionProvider' }
            }, [OperatorOptionModes.docLinks, OperatorOptionModes.externalsource]]
        ],
        'Date': [
            ["QueryBuilder_IsOn", {
                simple: { operation: SettingsService.DateConditionOperation.Equal, provider:'DateConditionProvider'},
                field: { operation: SettingsService.FieldDateConditionOperation.Equal, provider: 'FieldDateConditionProvider' }
            }, [OperatorOptionModes.default]],
            ["QueryBuilder_IsNotOn", {
                simple: { operation: SettingsService.DateConditionOperation.NotEqual, provider:'DateConditionProvider'},
                field: { operation: SettingsService.FieldDateConditionOperation.NotEqual, provider: 'FieldDateConditionProvider' }
            }, [OperatorOptionModes.default]],
            ["QueryBuilder_IsEmpty", {
                simple: { operation: SettingsService.EmptyConditionOperation.Empty,provider: 'EmptyConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.default]],
            ["QueryBuilder_IsNotEmpty", {
                simple: { operation: SettingsService.EmptyConditionOperation.NotEmpty, provider:'EmptyConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.default]],
            ["QueryBuilder_IsBetween", {
                simple: { operation: SettingsService.RangeDateConditionOperation.Range, provider: 'RangeDateConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.taskLists, OperatorOptionModes.autoindex]],
            ["QueryBuilder_WithinThePast", {
                simple: { operation: SettingsService.RelativeDateConditionOperation.WithinThePast, provider:'RelativeDateConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.taskLists, OperatorOptionModes.autoindex]],
            ["QueryBuilder_WithinTheNext", {
                simple: { operation: SettingsService.RelativeDateConditionOperation.WithinTheNext, provider:'RelativeDateConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.taskLists, OperatorOptionModes.autoindex]],
            ["QueryBuilder_AfterThePast", {
                simple: { operation: SettingsService.RelativeDateConditionOperation.AfterThePast,provider: 'RelativeDateConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.taskLists, OperatorOptionModes.autoindex]],
            ["QueryBuilder_AfterTheNext", {
                simple: { operation: SettingsService.RelativeDateConditionOperation.AfterTheNext, provider:'RelativeDateConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.taskLists, OperatorOptionModes.autoindex]], 
            ["QueryBuilder_BeforeThePast", {
                simple: { operation: SettingsService.RelativeDateConditionOperation.BeforeThePast,provider: 'RelativeDateConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.taskLists, OperatorOptionModes.autoindex]],
            ["QueryBuilder_BeforeTheNext", {
                simple: { operation: SettingsService.RelativeDateConditionOperation.BeforeTheNext, provider:'RelativeDateConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.taskLists, OperatorOptionModes.autoindex]],
            ["QueryBuilder_IsWhereClause", {
                simple: { operation: SettingsService.SqlConditionOperation.Is,provider: 'SqlConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.taskLists, OperatorOptionModes.autoindex, OperatorOptionModes.externalsource]],
            ["QueryBuilder_After", {
                simple: { operation: SettingsService.DateConditionOperation.More, provider:'DateConditionProvider'},
                field: { operation: SettingsService.FieldDateConditionOperation.More, provider: 'FieldDateConditionProvider' }
            }, [OperatorOptionModes.docLinks, OperatorOptionModes.externalsource]],
            ["QueryBuilder_Before", {
                simple: { operation: SettingsService.DateConditionOperation.Less, provider:'DateConditionProvider'},
                field: { operation: SettingsService.FieldDateConditionOperation.Less, provider: 'FieldDateConditionProvider' }
            }, [OperatorOptionModes.docLinks, OperatorOptionModes.externalsource]],
            ["QueryBuilder_OnOrAfter", {
                simple: { operation: SettingsService.DateConditionOperation.MoreEqual, provider: 'DateConditionProvider' },
                field: { operation: SettingsService.FieldDateConditionOperation.MoreEqual, provider: 'FieldDateConditionProvider' }
            }, [OperatorOptionModes.docLinks, OperatorOptionModes.externalsource]],
            ["QueryBuilder_BeforeOrOn", {
                simple: { operation: SettingsService.DateConditionOperation.LessEqual, provider: 'DateConditionProvider' },
                field: { operation: SettingsService.FieldDateConditionOperation.LessEqual, provider: 'FieldDateConditionProvider' }
            }, [OperatorOptionModes.docLinks, OperatorOptionModes.externalsource]]
        ],
        'DateTime': [
            ["QueryBuilder_IsEmpty", {
                simple: { operation: SettingsService.EmptyConditionOperation.Empty, provider:'EmptyConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.default]],
            ["QueryBuilder_IsNotEmpty", {
                simple: { operation: SettingsService.EmptyConditionOperation.NotEmpty, provider:'EmptyConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.default]],
            ["QueryBuilder_IsBetween", {
                simple: { operation: SettingsService.RangeDateTimeConditionOperation.Range, provider:'RangeDateTimeConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.taskLists, OperatorOptionModes.autoindex, OperatorOptionModes.externalsource]],
            ["QueryBuilder_WithinThePast", {
                simple: { operation: SettingsService.RelativeDateTimeConditionOperation.WithinThePast, provider:'RelativeDateTimeConditionProvider'},
               // field: {}
            }, [OperatorOptionModes.taskLists, OperatorOptionModes.autoindex]],
            ["QueryBuilder_WithinTheNext", {
                simple: { operation: SettingsService.RelativeDateTimeConditionOperation.WithinTheNext, provider:'RelativeDateTimeConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.taskLists, OperatorOptionModes.autoindex]],
            ["QueryBuilder_AfterThePast", {
                simple: { operation: SettingsService.RelativeDateTimeConditionOperation.AfterThePast, provider:'RelativeDateTimeConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.taskLists, OperatorOptionModes.autoindex]],
            ["QueryBuilder_AfterTheNext", {
                simple: { operation: SettingsService.RelativeDateTimeConditionOperation.AfterTheNext, provider:'RelativeDateTimeConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.taskLists, OperatorOptionModes.autoindex]],
            ["QueryBuilder_BeforeThePast", {
                simple: { operation: SettingsService.RelativeDateTimeConditionOperation.BeforeThePast,provider: 'RelativeDateTimeConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.taskLists, OperatorOptionModes.autoindex]],
            ["QueryBuilder_BeforeTheNext", {
                simple: { operation: SettingsService.RelativeDateTimeConditionOperation.BeforeTheNext, provider:'RelativeDateTimeConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.taskLists, OperatorOptionModes.autoindex]],
            ["QueryBuilder_IsWhereClause", {
                simple: { operation: SettingsService.SqlConditionOperation.Is, provider:'SqlConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.taskLists, OperatorOptionModes.autoindex, OperatorOptionModes.externalsource]],
            ["QueryBuilder_After", {
                simple: { operation: SettingsService.DateTimeConditionOperation.More, provider:'DateTimeConditionProvider'},
                field: { operation: SettingsService.FieldDateTimeConditionOperation.More, provider: 'FieldDateTimeConditionProvider' }
            }, [OperatorOptionModes.docLinks, OperatorOptionModes.externalsource]],
            ["QueryBuilder_Before", {
                simple: { operation: SettingsService.DateTimeConditionOperation.Less, provider:'DateTimeConditionProvider'},
                field: { operation: SettingsService.FieldDateTimeConditionOperation.Less, provider: 'FieldDateTimeConditionProvider' }
            }, [OperatorOptionModes.docLinks, OperatorOptionModes.externalsource]]
        ],
        'Keyword': [
            ["QueryBuilder_Contains", {
                simple: { operation: SettingsService.KeywordConditionOperation.Contains, provider:'KeywordConditionProvider'},
                field: { operation: SettingsService.FieldKeywordConditionOperation.Contains, provider: 'FieldKeywordConditionProvider' }
            }, [OperatorOptionModes.default]],
            ["QueryBuilder_IsEmpty", {
                simple: { operation: SettingsService.EmptyConditionOperation.Empty,provider: 'EmptyConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.default]],
            ["QueryBuilder_IsNotEmpty", {
                simple: { operation: SettingsService.EmptyConditionOperation.NotEmpty, provider:'EmptyConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.default]],
            ["QueryBuilder_IsWhereClause", {
                simple: { operation: SettingsService.SqlConditionOperation.Is, provider:'SqlConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.default]]
        ],
        'Memo': [
            ["QueryBuilder_Contains", {
                simple: { operation: SettingsService.MemoConditionOperation.Contains, provider:'MemoConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.taskLists, OperatorOptionModes.autoindex]],
            ["QueryBuilder_IsEmpty", {
                simple: { operation: SettingsService.EmptyConditionOperation.Empty,provider: 'EmptyConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.taskLists, OperatorOptionModes.autoindex]],
            ["QueryBuilder_IsNotEmpty", {
                simple: { operation: SettingsService.EmptyConditionOperation.NotEmpty, provider:'EmptyConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.taskLists, OperatorOptionModes.autoindex]],
            ["QueryBuilder_IsWhereClause", {
                simple: { operation: SettingsService.SqlConditionOperation.Is, provider:'SqlConditionProvider'},
                //field: {}
            }, [OperatorOptionModes.taskLists, OperatorOptionModes.autoindex]]
        ]
    };

    var ConditionProviderTemplateFactory = {
        definitions: {
            'EmptyConditionProvider': 'empty-provider-template',
            'SqlConditionProvider': 'sql-provider-template',
            'TextConditionProvider': 'text-provider-template',
            'DateConditionProvider': 'date-provider-template',
            'DateTimeConditionProvider': 'date-provider-template',

            'NumericConditionProvider': 'numeric-provider-template',
            'DecimalConditionProvider': 'decimal-provider-template',

            'RangeDateConditionProvider': 'date-range-provider-template',
            'RangeDateTimeConditionProvider': 'date-range-provider-template',

            'RangeNumericConditionProvider': 'numeric-range-provider-template',
            'RangeDecimalConditionProvider': 'decimal-range-provider-template',

            'RelativeDateConditionProvider': 'relative-date-provider-template',
            'RelativeDateTimeConditionProvider': 'relative-date-provider-template',

            'KeywordConditionProvider': 'text-provider-template',
            'MemoConditionProvider': 'memo-provider-template'
        },
        get: function (obj) {
            if (!obj.type) {
                throw new TypeError('ConditionProviderTemplateFactory: invalid object type');
            }
            if (!this.definitions[obj.type]) {
                throw new TypeError('ConditionProviderTemplateFactory: invalid type ' + obj.type);
            }
            return this.definitions[obj.type];
        }
    };


    var QueryBuilderComponent = new Class({
        Extends: DW.QueryBuilder.ComponentApi,
        options: {
            maxNestingLevel: 3,
            operatorsMode: OperatorOptionModes.taskLists,
            fieldOperators: {},
            templateFactories: {
                'ConditionProvider': ConditionProviderTemplateFactory
            },
            conditionProviderFactory: function (options, field, api) {
                // to be implemented in subclassess
                var type = DW.Utils.getShortTypeName(options);
                if (!DW.QueryBuilder.ConditionProviders[type]) {
                    throw new TypeError("Not supported provider " + type);
                }
                var conditionProvider = DW.QueryBuilder.ConditionProviders[type];
                return new conditionProvider(options, api);
            },
            createSetting: function (type, options) {
                // to be implemented in subclassess
                if (!DW.QueryBuilder.SettingsService[type]) {
                    throw new TypeError("api.createSetting: Type '" + type + "' is not registered");
                }
                return new DW.QueryBuilder.SettingsService[type](options);
            },
            generateConditionProviderId: function (type, operation) {
                // to be implemented in subclassess
                // if type is undefined
                if (type === void 0) {
                    return null;
                }
                // If type is setting object
                if (typeof type === 'object' && $.isNumeric(type.Operation)) {
                    operation = String(type.Operation);
                    type = DW.Utils.getShortTypeName(type);
                }
                // If there is no valid type
                if (typeof type !== 'string') {
                    return null;
                }

                return type + ':' + operation;
            }
        },
        initialize: function (options) {
            this.parent(options);
            // Build new settings
            for (var type in fieldOperatorsOptions) {
                this.options.fieldOperators[type] = fieldOperatorsOptions[type].filterMap(function (params) {
                    return this._isSpecificMode.apply(this, params);
                }.bind(this), function (params) {
                    return this._buildConditionOperationOptions.apply(this, params);
                }.bind(this));
            };
        },
        _isSpecificMode: function (name, operationData, modes) {          
            return (modes || []).some(function (mode) {
                return mode == OperatorOptionModes.default || mode == this.options.operatorsMode;
            }.bind(this));
        },
        _buildConditionOperationOptions: function (name, operationData, mode) {
            if (!DW.QueryBuilder.SettingsService[operationData.simple.provider]) {
                throw new TypeError("QueryBuilderApi: invalid type " + operationData.simple.provider);
            }

            var fieldValue = null,
                fieldOptions = null;

            if (operationData.field) {

                if (!DW.QueryBuilder.SettingsService[operationData.field.provider]) {
                    throw new TypeError("QueryBuilderApi: invalid type " + operationData.field.provider);
                }

                fieldValue = this.generateConditionProviderId(operationData.field.provider, operationData.field.operation);
                fieldOptions = this.createSetting(operationData.field.provider, {
                    Operation: operationData.field.operation
                });
            }

            return {
                Name: DW.QueryBuilder.localize(name),
                Value: this.generateConditionProviderId(operationData.simple.provider, operationData.simple.operation),
                options: this.createSetting(operationData.simple.provider, {
                    Operation: operationData.simple.operation
                }),
                FieldValue: fieldValue,
                fieldOptions: fieldOptions
            };
        }
    });

    extend(ns('DW.QueryBuilder'), {
        OperatorOptionModes: OperatorOptionModes,
        QueryBuilderComponent: QueryBuilderComponent,

        getConditionProviderTemplateFactory: function (definitions) {
            var factory = Object.clone(ConditionProviderTemplateFactory);
            factory.definitions = $.extend({}, ConditionProviderTemplateFactory.definitions, definitions);
            return factory;
        }
    });
}));