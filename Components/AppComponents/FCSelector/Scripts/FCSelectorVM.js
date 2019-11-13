//(function(factory) {
//    if (typeof define === "function" && define.amd) { // AMD.
//        define([
//            "jquery",
//            "knockout",
//            "../../../global",
//            "../../../utils",
//            "../../../ViewModels/ViewModel",
//            "../../../ViewModels/BaseComponentApi",
//            "../../../knockout-jquery-ui-widget",
//            "../../../Bindings/position",
//            "../../../Widgets/menus/js/ko.bindingHandlers.baseMenu",
//            "../../../Widgets/menus/js/ko.bindingHandlers.contextMenu"
//        ], factory);
//    } else { // Global
//        factory(jQuery, ko);
//    }
//}(function ($, ko) {
(function () {
    var SourceTargetFileCabinetsVM = new Class({
        Extends: DW.ViewModel,
        Implements: [Options],
        options: {
            //loadSettings: function () {
            //    return {
            //        Operation: 0,
            //        Conditions: []
            //    };
            //},
            //loadFcFields: function () {
            //    throw new TypeError('SourceTargetFileCabinetsVM: loadFcFields is not implemented');
            //},
            fileCabinets: [],
            organizationName: null,
            userName: null,
            sourceFileCabinetInfo: null,
            targetFileCabinetInfo: null
        },

        initialize: function (options) {
            this.setOptions(options);
            //this.group = ko.observable();
            //DW.When(this.options.loadSettings(), this.options.loadFcFields())
            //    .then(this.init.bind(this));

            this.ready = ko.observable(true);
            this.syncType = ko.observable(0);
            this.finished = $.Deferred();

            this.selectedSourceFC = ko.observable();
            this.selectedTargetFC = ko.observable();
            this.fileCabinets = ko.observable();
            this.fieldsMapping = ko.observable();

            this.commands = new DW.FCSelector.CommandsBundle();

            this.sourceFileCabinetSelector = new DW.FCSelector.FileCabinetSelectorVM({
                fileCabinetInfo: this.options.sourceFileCabinetInfo,
                fileCabinets: this.options.fileCabinets,
                organizationName: options.organizationName,
                userName: options.userName,
                showVersionControlFileCabinet: options.showVersionControlFileCabinet,
                showOtherOrganizationVersionControlFileCabinet: this.options.showOtherOrganizationVersionControlFileCabinet,
                predefinedCloudSystems: options.predefinedCloudSystems,
                getRemoteFileCabinets: this.options.getRemoteFileCabinets,
                otherOrganization: this.options.isOtherOrganizationSource,
                settingsGuid: this.options.isOtherOrganizationSource ? this.options.settingsGuid : undefined,
                isTarget: false,
                dwActivityLeftOffset: this.options.dwActivityLeftOffset
            });

            this.targetFileCabinetSelector = new DW.FCSelector.FileCabinetSelectorVM({
                fileCabinetInfo: this.options.targetFileCabinetInfo,
                fileCabinets: this.options.fileCabinets,
                organizationName: this.options.organizationName,
                userName: this.options.userName,
                showVersionControlFileCabinet: this.options.showVersionControlFileCabinet,
                showOtherOrganizationVersionControlFileCabinet: this.options.showOtherOrganizationVersionControlFileCabinet,
                predefinedCloudSystems: this.options.predefinedCloudSystems,
                getRemoteFileCabinets: this.options.getRemoteFileCabinets,
                otherOrganization: this.options.isOtherOrganizationTarget,
                settingsGuid: this.options.isOtherOrganizationTarget ? this.options.settingsGuid : undefined,
                isTarget: true,
                dwActivityLeftOffset: this.options.dwActivityLeftOffset
            });

            //setting the finished deffered to resolved
            $.when(this.sourceFileCabinetSelector.finished, this.targetFileCabinetSelector.finished)
                .then(function () {
                    this.finished.resolve();
                }.bind(this));
        },
        //init: function (settings, fields) {
        //    var groupCondition = this.api.createGroupConditionVM({
        //        settings: settings,
        //        fcFields: this._prepareFcFieldsForGroup(fields)
        //    });
        //    this.group(groupCondition);
        //},
        getSelectedSourceFC: function () {
            return this.sourceFileCabinetSelector.selectedFileCabinet() ? this.sourceFileCabinetSelector.selectedFileCabinet() : null;
        },
        getSelectedTargetFC: function () {
            return this.targetFileCabinetSelector.selectedFileCabinet() ? this.targetFileCabinetSelector.selectedFileCabinet() : null;
        },
        //getIndexFieldAssignments: function () {
        //    return this.fieldsMapping() && this.fieldsMapping().length ? this.fieldsMapping() : [];
        //},
        //setIndexFieldAssignments: function (fieldsMapping) {
        //    if (fieldsMapping)
        //        this.options.fieldsMapping = fieldsMapping;
        //},
        getComponentViewModel: function () {
            return this;
        },
        loadSourceRemoteFileCabinets: function (settingsGuid) {
            settingsGuid ?
                this.sourceFileCabinetSelector._addConnectionToRemoteOrganization(settingsGuid, false) :
                this.sourceFileCabinetSelector.addConnectionToRemoteOrganization();
        },
        loadTargetRemoteFileCabinets: function (settingsGuid) {
            settingsGuid ?
                this.targetFileCabinetSelector._addConnectionToRemoteOrganization(settingsGuid, true) :
                this.targetFileCabinetSelector.addConnectionToRemoteOrganization();
        },
        setLocalFileCabinets: function (fileCabinets) {
            this.sourceFileCabinetSelector.changeLocalFileCabinets(fileCabinets);
            this.targetFileCabinetSelector.changeLocalFileCabinets(fileCabinets);
        },
        ///return value example: ['error 1','error 2'...]
        validate: function () {
            return this.fileCabinets().validate();
        },
        setSyncType: function (type) {
            this.syncType(type);
        },
        openConnectionDialog: function (isTarget) {
            if (isTarget) {
                this.targetFileCabinetSelector.addConnectionToRemoteOrganization();
            } else {
                this.sourceFileCabinetSelector.addConnectionToRemoteOrganization();
            }
        },
        dispose: function () {
            this.fileCabinets().dispose();
            Array.forEach([
                'options'], function (key) {
                    if (this.hasOwnProperty(key)) {
                        delete this[key];
                    }
                }.bind(this));
            this.parent();
        }
    });

    extend(ns('DW.FCSelector'), {
        SourceTargetFileCabinetsVM: SourceTargetFileCabinetsVM
    });
    //}));
})();
