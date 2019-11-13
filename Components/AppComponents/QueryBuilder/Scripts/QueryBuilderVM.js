(function( factory ) {
    if ( typeof define === "function" && define.amd ) { // AMD.
        define(["jquery", "knockout", "../../../global", "../../../ViewModels/ViewModel"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {

    var QueryBuilderVM = new Class({
        Extends: DW.ViewModel,
        Implements: [Options],
        options: {
            loadSettings: function () {
                return {
                    Operation: 0,
                    Conditions: []
                };
            },
            loadFcFields: function () {
                throw new TypeError('QueryBuilderVM: loadFcFields is not implemented');
            }
        },

        initialize: function (options, api) {
            this.setOptions(options);
            this.api = api;
            this.group = ko.observable();
            this.init(this.options.loadSettings(), this.options.loadFcFields());
            //this.loadData = DW.Utils.lazyDeferred(function (dfd) {
            //    return DW.When(this.options.loadSettings(), this.options.loadFcFields())
            //        .then(this.init.bind(this)).then(dfd.resolve, dfd.reject);
            //}.bind(this));
            //this.loadData();//TODO call from outside if necessary
        },
        init: function (settings, fields) {
            var groupCondition = this.api.createGroupConditionVM({
                settings: settings,
                fcFields: this._prepareFcFieldsForGroup(fields)
            });
            this.group(groupCondition);
        },
        /// <summary>Setting proper DWType as string to every FCField (received DWType is an integer)
        /// and give GroupCondition only the data it needs.</summary>
        /// <param name="fields" type="Array">FCFields to be altered</param>
        /// <returns>
        ///     [
        ///         FCFields objects
        ///     ]
        /// </returns>
        _prepareFcFieldsForGroup: function (fields) {
            return fields ? DW.Utils.sortBy(fields.map(function (field) {
                return DW.QueryBuilder.buildQueryBuilderField(field);
            }.bind(this)), 'Name') : [];
        },
        getSettings: function () {
            return this.group() ? this.group().getSettings() : null;
        },
        getConditions: function () {
            return this.group() ? this.group().conditions() : null;
        },
        isEmpty: function () {
            return this.group() ? this.group().isEmpty() : false;
        },
        ///return value example: ['error 1','error 2'...]
        validate: function () {
            return this.group().validate();
        },
        dispose: function () {

            this.group().dispose();
            Array.forEach([
                'api',
                'group',
                'options'], function (key) {
                    if (this.hasOwnProperty(key)) {
                        delete this[key];
                    }
                }.bind(this));
            this.parent();
        }
    });

    extend(ns('DW.QueryBuilder'), {
        QueryBuilderVM: QueryBuilderVM
    });
}));
