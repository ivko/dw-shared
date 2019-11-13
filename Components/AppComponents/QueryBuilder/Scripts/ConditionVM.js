(function( factory ) {
    if ( typeof define === "function" && define.amd ) { // AMD.
        define(["jquery", "knockout", "../../../global", "../../../ViewModels/ViewModel"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {

    var ConditionVM = new Class({
        Extends: DW.ViewModel,

        options: {
            fcFields: [],
            selectedFieldDBName: null,
            selectedOperator: null,
            conditionProvider: null
        },

        fcFields: [],
        operators: [],

        initialize: function (options, parentGroup, api) {
            $.extend(this.options, options);
            this.api = api;
            this.parentGroup = parentGroup;
            /*declarations*/
            this.fieldMenuVisible = this.addDisposable(ko.observable(false));
            this.operators = this.addDisposable(ko.observable());
            this.selectedField = this.addDisposable(ko.observable());
            this.selectedOperator = this.addDisposable(ko.observable());
            this.conditionProvider = this.addDisposable(ko.observable());
            this.missingField = this.addDisposable(ko.observable(false));
            this.hideSystemFields = false;
            /*initializations*/
            /*set selectedField*/
            
            this.fcFields = this.options.fcFields;

            if (this.options.selectedFieldDBName) {
                var fieldVM = this.fcFields.find(function (field) {
                    return field.DBName === this.options.selectedFieldDBName;
                }.bind(this));

                if (fieldVM)
                    this.selectedField(fieldVM);
                else {
                    //creation of invalid field
                    this.missingField(true);
                    this.selectedField(DW.QueryBuilder.buildInvalidQueryBuilderField(this.options.selectedFieldDBName));
                }
            }

            if (this.fcFields.length > 0) {
                if (!this.selectedField()) {
                    this.selectedField(this.fcFields.find(function (field) {
                        return field.UserDefined;
                    }) || this.fcFields[0]);
                }

                this.hideSystemFields = !this.fcFields.some(function (field) {
                    return !field.UserDefined;
                });
            }
           
            /*set selectedOperator*/
            this._setAvailableOperatorsForField(this.selectedField());

            if (this.options.selectedOperator) {
                var opVM = this.operators().find(function (operator) {
                    return operator.Value === this.options.selectedOperator || operator.FieldValue === this.options.selectedOperator;
                }.bind(this));
                this.selectedOperator(opVM);
            }
            if (!this.selectedOperator() && this.operators().length > 0) this.selectedOperator(this.operators()[0]);

            /*set conditionProvider*/
            this.initConditionProvider(this.selectedField(), this.selectedOperator(), this.options.conditionProvider);

            /*start listening for changes*/
            this.addDisposable(this.selectedField.subscribe(function (field) {
                this.missingField(false);
                this._setAvailableOperatorsForField(field);
            }, this));

            this.addDisposable(this.selectedOperator.subscribe(function (operator) {
                this.initConditionProvider(this.selectedField(), operator, null);
            }, this));
        },

        initConditionProvider: function (field, operator, conditionProviderSettings) {                     
            if (conditionProviderSettings) {
                this.setAvailableConditionProvider(field, {
                    options: conditionProviderSettings
                });
            }
            else this.setAvailableConditionProvider(field, operator);
        },

        /// <summary>Sets valid operators from FieldOperators for the chosen FCField</summary>
        /// <param name="field" type="Object">FCField</param>
        _setAvailableOperatorsForField: function (field) {
            var operators = this.api.getFieldOperators(field.DWType);
            this.operators(operators);
            this.selectedOperator(this.operators()[0]);
        },

        /// <summary>Sets valid value provider and vpFactory creates new vpVM</summary>
        /// <param name="field" type="Object">FCField</param>
        /// <param name="operation" type="Object">operation name (string) and op (int)</param>
        setAvailableConditionProvider: function (field, operator) {
            this.conditionProvider((field && operator) ? this.api.conditionProviderFactory(operator.options, field, this.api) : null);
        },

        /// <summary>Prepares the data from Condition condition for sending to the backedn</summary>
        /// <returns>
        ///     {
        ///         DBName : field DBName
        ///         Type: Condition
        ///         ConditionProvider: Object with Type, Value and Operation (selected operation name) from the value provider 
        ///     }
        /// </returns>
        getSettings: function () {
            return this.api.createSetting('Condition', {
                DBName: this.selectedField().DBName,
                Provider: this.conditionProvider().getSettings()
            });
        },
        dispose: function () {
            Array.forEach([
                'options',
                'parentGroup',
                'fieldMenuVisible',
                'operators',
                'selectedField',
                'selectedOperator',
                'conditionProvider',
                'missingField',
                'fcFields'], function (key) {
                    if (this.hasOwnProperty(key)) {
                        delete this[key];
                    }
            }.bind(this));

            this.parent();
        },
        validate: function () {
            var res = {
                isValid: true,
                errors: []
            };
            if (this.missingField()) {
                res.isValid = false;
                res.errors = this.conditionProvider().validate().errors.concat([DW.QueryBuilder.localize("QueryBuilder_invalidField")]);
            }
            else
                res = this.conditionProvider().validate();

            return res;
        }
    });
    extend(ns('DW.QueryBuilder'), { ConditionVM: ConditionVM });
}));
