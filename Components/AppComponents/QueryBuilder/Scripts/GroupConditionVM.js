(function( factory ) {
    if ( typeof define === "function" && define.amd ) { // AMD.
        define([
            "jquery",
            "knockout",
            "./SettingsService",
            "../../../global",
            "../../../Commands/Scripts/CommandBindingHandler",
            "../../../ViewModels/ViewModel"
        ], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {

    var AddCondition = new Class({
        Extends: DW.Command,
        requires: {
            groupVM: function (vm) {
                return vm.addCondition;
            }
        },
        execute: function (requires) {
            return requires.groupVM.addCondition();
        },
        canExecute: function (isExecuting, requires) {
            var fcFields = requires.groupVM.options.fcFields;

            return fcFields && fcFields.length;
        }
    });

    var AddGroupCondition = new Class({
        Extends: DW.Command,
        requires: {
            groupVM: function (vm) {
                return vm.addGroupCondition;
            }
        },
        available: function (requires) {
            var group = requires.groupVM;
            return group.nestingLevel < group.api.getMaxNestingLevel();
        },
        execute: function (requires) {
            var group = requires.groupVM;
            return group.addGroupCondition({ settings: group.createEmptyGroupSettings() });
        },
        canExecute: function (isExecuting, requires) {
            var fcFields = requires.groupVM.options.fcFields;

            return fcFields && !!fcFields.length;
        }
    });

    var RemoveCondition = new Class({
        Extends: DW.Command,
        requires: {
            groupVM: function (vm) {
                return vm.removeCondition;
            }
        },
        execute: function (requires, vm) {
            return requires.groupVM.removeCondition(vm);
        }
    });

    var GroupCommands = new Class({
        Extends: DW.Commands.Bundle,
        initialize: function (bundle) {

            this.setCommands({
                addGroupCondition: { ctor: AddGroupCondition },
                addCondition: { ctor: AddCondition },
                removeCondition: { ctor: RemoveCondition }
            });

            this.parent(bundle);
        }
    });

    var GroupConditionVM = new Class({
        Extends: DW.ViewModel,
        Implements: [Options],
        options: {
            settings: {},
            fcFields: []
        },
        operations: [],
        createOperations: function () {
            return [{
                Name: DW.QueryBuilder.localize("QueryBuilder_And"),
                Value: DW.QueryBuilder.SettingsService.GroupConditionOperation.And
            }, {
                Name: DW.QueryBuilder.localize("QueryBuilder_Or"),
                Value: DW.QueryBuilder.SettingsService.GroupConditionOperation.Or
            }];
        },
        createEmptyGroupSettings: function () {
            return {
                Operation: DW.QueryBuilder.SettingsService.GroupConditionOperation.And,
                Conditions: [
                    new DW.QueryBuilder.SettingsService.Condition()
                ]
            }
        },
        initialize: function (options, parentGroup, api) {
            this.setOptions(options);
            this.api = api;
            this.parentGroup = parentGroup;
            this.operations = this.createOperations();
            this.commands = new GroupCommands();
            
            this.selectedOperation = this.addDisposable(ko.observable());

            this.selectedOperationText = this.addDisposable(ko.computed(function () {
                var operation = this.selectedOperation();
                if (operation === void 0) return '';
                for (var i = 0; i < this.operations.length; i++) {
                    if (this.operations[i].Value === operation) {
                        return this.operations[i].Name;
                    }
                }
            }, this));

            this.nestingLevel = this._getNestingLevel();
            this.conditions = this.addDisposable(ko.observableArray(/*GroupConditionVM or/and ConditionVM*/));
            this.init();
        },
        _getNestingLevel: function() {
            var level = 0;
            var parentGroup = this.parentGroup;
            while (parentGroup) {
                level++;
                parentGroup = parentGroup.parentGroup;
            }
            return level;
        },
        /// <summary>Creates query from settings or new (empty) query.</summary>
        init: function () {
            if (!this.options.settings || !this.options.settings.Conditions) {
                return;
            };

            this.selectedOperation(this.options.settings.Operation);

            this.options.settings.Conditions.forEach(function (c) {
                var type = DW.Utils.getShortTypeName(c);

                switch (type) {
                    case 'Condition':
                        this.addCondition({
                            fcFields: this.options.fcFields,
                            selectedFieldDBName: c.DBName,
                            selectedOperator: this.api.generateConditionProviderId(c.Provider),
                            conditionProvider: c.Provider
                        });
                        break;
                    case 'GroupCondition':
                        this.addGroupCondition({
                            settings: c,
                            fcFields: this.options.fcFields
                        });
                        break;
                    default: throw new TypeError("Not supported condition " + c.type);
                }
            }.bind(this));
        },

        /// <summary>Adds Condition to conditions ObservableArray.</summary>
        /// <param name="options" type="Object"> If loading settings -> Object
        ///     {
        ///         fcFields: Array
        ///         selectedFieldDBName: string
        ///         selectedOperator: string
        ///         conditionProvider: Object
        ///     }
        /// If adding manually - undefined.</param>
        /// <returns>
        ///     [
        ///         Array with the added condition.
        ///     ]
        /// </returns>
        addCondition: function (options) {
            var c = options;
            if (!instanceOf(c, DW.QueryBuilder.ConditionVM)) {
                c = this.api.createConditionVM($.extend({
                    fcFields: this.options.fcFields,
                }, options || {}), this);
            }
            this.conditions.push(c);
            return c;
        },

        /// <summary>Adds Group to conditions (ObservableArray).</summary>
        /// <param name="options" type="Object"> If loading settings -> Object
        ///     {
        ///         fcFields: Array
        ///         settings: Object
        ///     }
        /// If adding manually -> undefined.</param>
        /// <returns>
        ///     [
        ///         Array with the added group.
        ///     ]
        /// </returns>
        addGroupCondition: function (options) {
            var g = options;
            if (!instanceOf(options, DW.QueryBuilder.GroupConditionVM)) {
                g = this.api.createGroupConditionVM($.extend({
                    fcFields: this.options.fcFields,
                }, options || {}), this);
            }
            this.conditions.push(g);
            return g;
        },

        /// <summary>Removes Group/Condition from conditions (ObservableArray)</summary>
        /// <param name="value" type="Object">Group or Condition.</param>
        removeCondition: function (condition) {
            this.conditions.remove(condition);
            condition.dispose();
            if (this.parentGroup && this.conditions().length == 0) {
                this.parentGroup.removeCondition(this);
            }
        },

        /// <summary>Prepares the data from Group condition for sending to the backedn</summary>
        /// <returns>
        ///     {
        ///         Conditions: Array
        ///         Operation: AND/OR as a string
        ///     }
        /// </returns>
        getSettings: function () {
            return this.api.createSetting('GroupCondition', {
                Operation: this.selectedOperation(),
                Conditions: this.conditions().map(function (item) {
                    return item.getSettings();
                })
            });
        },

        isEmpty: function () {
            return !this.conditions().length;
        },

        validate: function () {
            var res = {
                isValid: true,
                errors: []
            };
            this.conditions().forEach(function (condition) {
                var conditionvalidation = condition.validate();
                if (!conditionvalidation.isValid) {
                    res.isValid = false;
                    res.errors = res.errors.concat(conditionvalidation.errors);
                }
            }.bind(this));

            return res;
        },
        dispose: function () {
            this.commands.dispose();
            this.conditions.remove(function (condition) {
                condition.dispose();
                return true;
            });
            Array.forEach([
                'api',
                'operations',
                'options',
                'conditions',
                'commands',
                'selectedOperation',
                'selectedOperationText',
                'parentGroup'], function (key) {
                    if (this.hasOwnProperty(key)) {
                        delete this[key];
                    }
                }.bind(this));
            this.parent();
        }
    });
    extend(ns('DW.QueryBuilder'), { GroupConditionVM: GroupConditionVM });
}));
